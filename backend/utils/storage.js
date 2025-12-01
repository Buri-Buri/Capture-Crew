const supabase = require('../config/supabase');
const path = require('path');

const { createClient } = require('@supabase/supabase-js');

const uploadFileToSupabase = async (file, bucket, folder = '', token = null) => {
    try {
        const fileExt = path.extname(file.originalname);
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}${fileExt}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        // Use authenticated client if token is provided, otherwise default client
        const client = token
            ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
                global: { headers: { Authorization: `Bearer ${token}` } }
            })
            : supabase;

        const { data, error } = await client.storage
            .from(bucket)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (error) throw error;

        const { data: publicUrlData } = client.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    } catch (error) {
        console.error('Supabase Upload Error:', error);
        throw error;
    }
};

module.exports = { uploadFileToSupabase };
