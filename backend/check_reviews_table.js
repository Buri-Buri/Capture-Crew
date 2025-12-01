const supabase = require('./config/supabase');

async function checkReviewsTable() {
    console.log('Checking if reviews table exists...');
    const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error accessing reviews table:', error);
        if (error.code === '42P01') {
            console.log('Table "reviews" does not exist.');
        }
    } else {
        console.log('Reviews table exists. Data:', data);
    }
}

checkReviewsTable();
