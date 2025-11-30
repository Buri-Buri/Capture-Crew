const db = require('../config/db');

exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const userId = req.user.id;
        const profilePictureUrl = `http://localhost:5000/uploads/${req.file.filename}`;

        await db.query('UPDATE users SET profile_picture = ? WHERE id = ?', [profilePictureUrl, userId]);

        res.json({ message: 'Profile picture updated', profile_picture: profilePictureUrl });
    } catch (error) {
        console.error('Error uploading profile picture:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const [users] = await db.query('SELECT id, username, email, role, profile_picture FROM users WHERE id = ?', [userId]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
