const supabase = require('./config/supabase');

async function testNotifications() {
    try {
        console.log('Starting Notification System Test...');

        // 1. Create a test notification directly (to verify table exists and works)
        // We need a valid user ID. Let's fetch one.
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('id')
            .limit(1);

        if (userError || !users || users.length === 0) {
            console.error('No users found to test with.');
            return;
        }

        const userId = users[0].id;
        console.log(`Using user ID: ${userId}`);

        const { data: notif, error: insertError } = await supabase
            .from('notifications')
            .insert([
                {
                    user_id: userId,
                    type: 'test',
                    content: 'This is a test notification',
                    is_read: false
                }
            ])
            .select()
            .single();

        if (insertError) {
            console.error('Error creating notification:', insertError);
            console.log('Make sure the notifications table exists!');
            return;
        }

        console.log('Notification created successfully:', notif);

        // 2. Fetch notifications for the user
        const { data: fetchedNotifs, error: fetchError } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (fetchError) {
            console.error('Error fetching notifications:', fetchError);
            return;
        }

        console.log(`Fetched ${fetchedNotifs.length} notifications.`);
        const found = fetchedNotifs.find(n => n.id === notif.id);
        if (found) {
            console.log('Test notification found in fetch results.');
        } else {
            console.error('Test notification NOT found in fetch results.');
        }

        // 3. Mark as read
        const { data: updatedNotif, error: updateError } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notif.id)
            .select()
            .single();

        if (updateError) {
            console.error('Error marking as read:', updateError);
            return;
        }

        if (updatedNotif.is_read) {
            console.log('Notification marked as read successfully.');
        } else {
            console.error('Failed to mark notification as read.');
        }

        // 4. Clean up (optional, but good for tests)
        await supabase.from('notifications').delete().eq('id', notif.id);
        console.log('Test notification cleaned up.');

        console.log('Notification System Test Completed Successfully!');

    } catch (error) {
        console.error('Unexpected error during test:', error);
    }
}

testNotifications();
