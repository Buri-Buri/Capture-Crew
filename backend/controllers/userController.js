const supabase = require('../config/supabase');
const { uploadFileToSupabase } = require('../utils/storage');

const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userId = req.user.id;
        const profile_picture = await uploadFileToSupabase(req.file, 'CaptureCrew', 'profiles');

        const { data, error } = await supabase
            .from('users')
            .update({ profile_picture })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'Profile picture updated', profile_picture: data.profile_picture });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: user, error } = await supabase
            .from('users')
            .select('id, username, email, role, profile_picture, bio, experience')
            .eq('id', userId)
            .single();

        if (error || !user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, bio, experience } = req.body;
        let profile_picture = null;

        if (req.file) {
            profile_picture = await uploadFileToSupabase(req.file, 'CaptureCrew', 'profiles');
        }

        const updates = {
            username,
            bio,
            ...(profile_picture && { profile_picture })
        };

        // Only update experience if user is a seller
        if (req.user.role === 'seller' && experience !== undefined) {
            updates.experience = experience;
        }

        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'Profile updated successfully', user: data });
    } catch (error) {
        console.error('Error updating profile:', error);
        const fs = require('fs');
        const errorLog = {
            message: error.message,
            stack: error.stack,
            details: error
        };
        fs.appendFileSync('debug_profile_error.txt', JSON.stringify(errorLog, null, 2) + '\n');
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { uploadProfilePicture, getUserProfile, updateUserProfile };
