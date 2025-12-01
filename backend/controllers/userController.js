const supabase = require('../config/supabase');

exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userId = req.user.id;
        const profilePictureUrl = `http://localhost:5000/uploads/${req.file.filename}`;

        const { error } = await supabase
            .from('users')
            .update({ profile_picture: profilePictureUrl })
            .eq('id', userId);

        if (error) throw error;

        res.json({ message: 'Profile picture updated', profile_picture: profilePictureUrl });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserProfile = async (req, res) => {
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

exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { username, bio, experience } = req.body;
        let updateData = { username, bio };

        // Only sellers can update experience
        if (req.user.role === 'seller') {
            updateData.experience = experience;
        }

        if (req.file) {
            updateData.profile_picture = `http://localhost:5000/uploads/${req.file.filename}`;
        }

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'Profile updated successfully', user: data });
    } catch (error) {
        console.error('Error updating profile:', error);
        const fs = require('fs');
        fs.appendFileSync('debug_profile_error.txt', JSON.stringify(error, null, 2) + '\n');
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
