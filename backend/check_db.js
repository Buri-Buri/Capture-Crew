const db = require('./config/db');

async function check() {
    try {
        console.log('Checking DB connection...');
        const [rows] = await db.query('SELECT 1');
        console.log('DB Connected:', rows);

        console.log('Checking users table...');
        const [users] = await db.query('DESCRIBE users');
        console.log('Users Table:', users.map(c => c.Field));

        console.log('Checking bookings table...');
        const [bookings] = await db.query('DESCRIBE bookings');
        console.log('Bookings Table:', bookings.map(c => c.Field));

        process.exit(0);
    } catch (error) {
        console.error('DB Error:', error);
        process.exit(1);
    }
}

check();
