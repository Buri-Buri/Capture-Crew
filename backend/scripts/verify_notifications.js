const supabase = require('../config/supabase');

async function testNotifications() {
    console.log('Testing Notifications Table...');

    const testUserId = 1; // Assuming a user with ID 1 exists, or use a known ID if possible.
    // If we don't know a user ID, we might fail on foreign key constraint. 
    // Let's first fetch a real user.

    try {
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .limit(1)
            .single();

        if (userError || !user) {
            console.error('❌ Could not fetch a valid user to test with. Setup a user first.');
            console.error(userError);
            return;
        }

        console.log(`Using User ID: ${user.id} for test.`);

        // 1. Try to create a notification
        const { data: insertData, error: insertError } = await supabase
            .from('notifications')
            .insert([
                {
                    user_id: user.id,
                    type: 'message',
                    content: 'Test notification from script',
                    is_read: false
                }
            ])
            .select();

        if (insertError) {
            console.error('❌ Failed to insert notification. Table might be missing or RLS blocking.');
            console.error(insertError);
        } else {
            console.log('✅ Successfully inserted notification:', insertData);
        }

        // 2. Try to fetch notifications
        const { data: fetchData, error: fetchError } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id);

        if (fetchError) {
            console.error('❌ Failed to fetch notifications.');
            console.error(fetchError);
        } else {
            console.log(`✅ Successfully fetched ${fetchData.length} notifications.`);
            console.log(fetchData);
        }

        // 3. Clean up test notification
        if (insertData && insertData.length > 0) {
            const { error: deleteError } = await supabase
                .from('notifications')
                .delete()
                .eq('id', insertData[0].id);

            if (deleteError) {
                console.error('⚠️ Failed to clean up test notification.');
            } else {
                console.log('✅ Cleaned up test notification.');
            }
        }

    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

testNotifications();
