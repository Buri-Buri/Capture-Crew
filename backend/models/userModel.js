const db = require('../config/db');

const User = {
    findByEmail: async (email) => {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    },

    create: async (userData) => {
        const { username, email, password_hash, role } = userData;
        const [result] = await db.query(
            'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [username, email, password_hash, role || 'customer']
        );
        return result.insertId;
    },

    findById: async (id) => {
        const [rows] = await db.query('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [id]);
        return rows[0];
    }
};

module.exports = User;
