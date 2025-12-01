const supabase = require('./config/supabase');

async function checkSchema() {
    try {
        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Error fetching bookings:', error);
            return;
        }

        if (data && data.length > 0) {
            console.log('Booking keys:', JSON.stringify(Object.keys(data[0])));
        } else {
            console.log('No bookings found to inspect.');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

checkSchema();
