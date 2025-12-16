const supabase = require('../config/supabase');

async function debugNotificationFlow() {
    console.log('Debugging Notification Flow...');

    try {
        // 1. Get a valid service
        const { data: services, error: serviceError } = await supabase
            .from('services')
            .select('id, seller_id, title')
            .limit(1);

        if (serviceError || !services || services.length === 0) {
            console.error('❌ No services found to test with.');
            return;
        }

        const service = services[0];
        console.log(`Using Service: ID=${service.id}, SellerID=${service.seller_id}, Title=${service.title}`);

        // 2. Simulate logic from bookingController.js
        console.log('Simulating notification creation logic...');

        // This query is exactly what is in bookingController.js
        const { data: serviceData, error: fetchError } = await supabase
            .from('services')
            .select('seller_id, title')
            .eq('id', service.id)
            .single();

        if (fetchError) {
            console.error('❌ Failed to fetch service details for notification.');
            console.error(fetchError);
            return;
        }

        if (serviceData) {
            console.log('✅ Service data fetched:', serviceData);

            const { data: notifData, error: notifyError } = await supabase
                .from('notifications')
                .insert([
                    {
                        user_id: serviceData.seller_id,
                        type: 'booking_request',
                        content: `DEBUG: New booking request for ${serviceData.title}`,
                        related_id: 99999, // Dummy booking ID
                        is_read: false
                    }
                ])
                .select();

            if (notifyError) {
                console.error('❌ Error creating notification:', notifyError);
            } else {
                console.log('✅ Notification created successfully:', notifData);

                // Cleanup
                await supabase.from('notifications').delete().eq('id', notifData[0].id);
            }
        } else {
            console.error('❌ Service data is null despite no error?');
        }

    } catch (err) {
        console.error('❌ Unexpected error:', err);
    }
}

debugNotificationFlow();
