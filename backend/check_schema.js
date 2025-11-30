const db = require('./config/db');

async function checkSchema() {
    try {
        const [columns] = await db.query('SHOW COLUMNS FROM bookings');
        console.log('Columns:', columns.map(c => c.Field));
        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkSchema();
