const supabase = require('../config/supabase');

const User = {
    findByEmail: async (email) => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows found"
            console.error('Supabase findByEmail error:', error);
        }
        return data;
    },

    create: async (userData) => {
        const { username, email, password_hash, role } = userData;
        const { data, error } = await supabase
            .from('users')
            .insert([{ username, email, password_hash, role: role || 'customer' }])
            .select()
            .single();

        if (error) {
            console.error('Supabase create user error:', error);
            throw error;
        }
        return data.id;
    },

    findById: async (id) => {
        const { data, error } = await supabase
            .from('users')
            .select('id, username, email, role, created_at')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Supabase findById error:', error);
        }
        return data;
    }
};

module.exports = User;
