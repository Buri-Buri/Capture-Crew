require('dotenv').config();
const db = require('./config/db');

async function alterTable() {
    try {
        await db.query(`
            ALTER TABLE bookings 
            ADD COLUMN contact_info TEXT,
            ADD COLUMN location TEXT
        `);
        console.log('Table bookings altered successfully');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist');
            process.exit(0);
        }
        console.error('Error altering table:', error);
        process.exit(1);
    }
}

alterTable();
