const supabase = require('./config/supabase');

async function debugConversations() {
    console.log('--- Debugging Conversations ---');

    // 1. List all users
    const { data: users, error: userError } = await supabase.from('users').select('id, username, email');
    if (userError) {
        console.error('Error fetching users:', userError);
        return;
    }
    console.log('Users:', users);

    // 2. List all messages
    const { data: messages, error: msgError } = await supabase.from('messages').select('*');
    if (msgError) {
        console.error('Error fetching messages:', msgError);
        return;
    }
    console.log('Total Messages:', messages.length);
    if (messages.length > 0) {
        console.log('Sample Message:', messages[0]);
    }

    // 3. Test getConversations logic for the first user found
    if (users.length > 0) {
        const userId = users[0].id;
        console.log(`\nTesting getConversations for User ID: ${userId} (${users[0].username})`);

        const { data: convMessages, error: convError } = await supabase
            .from('messages')
            .select(`
                *,
                sender:users!sender_id(id, username, profile_picture),
                receiver:users!receiver_id(id, username, profile_picture)
            `)
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false });

        if (convError) {
            console.error('Error in getConversations query:', convError);
        } else {
            console.log('Raw Conversation Messages:', convMessages.length);
            if (convMessages.length > 0) {
                console.log('First Raw Message:', JSON.stringify(convMessages[0], null, 2));
            }
        }
    }
}

debugConversations();
