const supabase = require('../config/supabase');

const sendMessage = async (req, res) => {
    try {
        const { receiver_id, content, booking_id } = req.body;
        const sender_id = req.user.id;

        if (!receiver_id || !content) {
            return res.status(400).json({ message: 'Receiver and content are required' });
        }

        // Check if sender is a seller and receiver is also a seller
        if (req.user.role === 'seller') {
            const { data: receiver, error: userError } = await supabase
                .from('users')
                .select('role')
                .eq('id', receiver_id)
                .single();

            if (userError || !receiver) {
                return res.status(404).json({ message: 'Receiver not found' });
            }

            if (receiver.role === 'seller') {
                return res.status(403).json({ message: 'Sellers cannot message other sellers' });
            }
        }

        const { error } = await supabase
            .from('messages')
            .insert([
                { sender_id, receiver_id, content, booking_id: booking_id || null }
            ]);

        if (error) throw error;

        // Create notification for receiver
        const { data: senderProfile } = await supabase
            .from('users')
            .select('username')
            .eq('id', sender_id)
            .single();

        const senderName = senderProfile ? senderProfile.username : 'someone';

        await supabase
            .from('notifications')
            .insert([
                {
                    user_id: receiver_id,
                    type: 'message',
                    content: `New message from ${senderName}`,
                    related_id: sender_id, // Link to sender so we can navigate to conversation
                    is_read: false
                }
            ]);

        res.status(201).json({ message: 'Message sent' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getConversations = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('Fetching conversations for user:', userId);

        // Fetch all messages where user is sender or receiver
        const { data: messages, error } = await supabase
            .from('messages')
            .select(`
                *,
                sender:users!sender_id(id, username, profile_picture),
                receiver:users!receiver_id(id, username, profile_picture),
                bookings:booking_id(id, services(title))
            `)
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Process messages to find unique conversations (User + Booking)
        const conversationsMap = new Map();

        messages.forEach(msg => {
            // Handle potential nulls if users are deleted
            if (!msg.sender || !msg.receiver) return;

            const otherUser = msg.sender_id === userId ? msg.receiver : msg.sender;
            const bookingId = msg.booking_id;
            const bookingTitle = msg.bookings?.services?.title || 'General Inquiry';

            // Unique key: UserID_BookingID (or just UserID if no booking)
            const key = `${otherUser.id}_${bookingId || 'general'}`;

            if (!conversationsMap.has(key)) {
                conversationsMap.set(key, {
                    key: key,
                    other_user_id: otherUser.id,
                    username: otherUser.username,
                    profile_picture: otherUser.profile_picture,
                    last_message: msg.content,
                    created_at: msg.created_at,
                    booking_id: bookingId,
                    booking_title: bookingTitle
                });
            }
        });

        const conversations = Array.from(conversationsMap.values());

        res.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const otherUserId = req.params.userId;
        const bookingId = req.query.bookingId;

        let query = supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
            .order('created_at', { ascending: true });

        if (bookingId && bookingId !== 'undefined' && bookingId !== 'null') {
            query = query.eq('booking_id', bookingId);
        } else {
            // If no booking ID, maybe we only want general messages? 
            // Or maybe we want all messages between users?
            // For now, if booking_id is null in DB, it matches.
            // But existing logic was "all messages". 
            // To separate strict "General" vs "Booking", we should enforce it.
            // Let's assume if bookingId is NOT provided, we filter for booking_id IS NULL to keep them separate.
            query = query.is('booking_id', null);
        }

        const { data: messages, error } = await query;

        if (error) throw error;

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { sendMessage, getConversations, getMessages };
