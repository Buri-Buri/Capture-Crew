const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        console.log('Verifying token:', token);
        const tokenString = token.replace('Bearer ', '');
        const decoded = jwt.verify(tokenString, process.env.JWT_SECRET || 'secret_key_change_this');
        req.user = decoded;
        req.token = tokenString; // Attach raw token for Supabase calls
        console.log('Token verified, user:', decoded);
        next();
    } catch (error) {
        console.error('Token verification failed:', error.message);
        res.status(400).json({ message: 'Invalid token' });
    }
};

module.exports = verifyToken;
