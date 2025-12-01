const supabase = require('./config/supabase');

async function checkUserColumns() {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .limit(1);

        if (error) {
            console.error('Error fetching users:', error);
            return;
        }

        if (data && data.length > 0) {
            console.log('User columns:', JSON.stringify(Object.keys(data[0])));
        } else {
            console.log('No users found, cannot determine columns.');
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

checkUserColumns();
