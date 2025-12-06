const supabase = require('./config/supabase');

const checkNotifications = async () => {
    try {
        console.log('Checking recent notifications...');
        const { data: notifications, error } = await supabase
            .from('notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;
        console.log('Recent Notifications:', notifications);

        console.log('Checking users...');
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('id, email, username, role')
            .limit(10);

        if (userError) throw userError;
        console.log('Users:', users);

    } catch (error) {
        console.error('Error:', error);
    }
};

checkNotifications();
