require('dotenv').config();
const db = require('./config/db');

async function check() {
    try {
        // Select one booking (or empty set if none) to check fields
        const [rows, fields] = await db.query('SELECT * FROM bookings LIMIT 1');
        console.log('Fields:', fields.map(f => f.name));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

check();
