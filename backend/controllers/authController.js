const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const register = async (req, res) => {
    try {
        console.log('Registering user:', req.body);
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' });
        }

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const userId = await User.create({ username, email, password_hash, role });

        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
        console.error(error);
        require('fs').writeFileSync('error.log', 'Register Error: ' + error.toString() + '\n' + error.stack);
        res.status(500).json({ message: 'Server error' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret_key_change_this',
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleAuth = async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email, picture } = ticket.getPayload();

        const user = await User.findByEmail(email);

        if (user) {
            // User exists, login
            const jwtToken = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET || 'secret_key_change_this',
                { expiresIn: '1d' }
            );

            res.json({
                message: 'Login successful',
                token: jwtToken,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    profile_picture: user.profile_picture
                }
            });
        } else {
            // User does not exist, return info for registration
            res.status(202).json({
                message: 'User not found, please register',
                googleData: {
                    username: name,
                    email: email,
                    profile_picture: picture
                }
            });
        }
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(400).json({ message: 'Invalid Google Token' });
    }
};

module.exports = { register, login, googleAuth };
