const supabase = require('../config/supabase');

const sendMessage = async (req, res) => {
    try {
        const { receiver_id, content, booking_id } = req.body;
        const sender_id = req.user.id;

        if (!receiver_id || !content) {
            return res.status(400).json({ message: 'Receiver and content are required' });
        }

        const { error } = await supabase
            .from('messages')
            .insert([
                { sender_id, receiver_id, content, booking_id: booking_id || null }
            ]);

        if (error) throw error;

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
                receiver:users!receiver_id(id, username, profile_picture)
            `)
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Process messages to find unique conversations and latest message
        const conversationsMap = new Map();

        messages.forEach(msg => {
            // Handle potential nulls if users are deleted
            if (!msg.sender || !msg.receiver) return;

            const otherUser = msg.sender_id === userId ? msg.receiver : msg.sender;
            const otherUserId = otherUser.id;

            if (!conversationsMap.has(otherUserId)) {
                conversationsMap.set(otherUserId, {
                    id: otherUser.id,
                    username: otherUser.username,
                    profile_picture: otherUser.profile_picture,
                    last_message: msg.content,
                    created_at: msg.created_at
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

        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
            .order('created_at', { ascending: true });

        if (error) throw error;

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { sendMessage, getConversations, getMessages };
