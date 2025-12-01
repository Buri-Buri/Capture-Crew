const supabase = require('./config/supabase');

const checkBucket = async () => {
    try {
        const { data, error } = await supabase.storage.listBuckets();
        if (error) throw error;
        console.log('Buckets:', data);
    } catch (error) {
        console.error('Error listing buckets:', error);
    }
};

checkBucket();
