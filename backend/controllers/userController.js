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
            .select('id, username, email, role, profile_picture')
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
