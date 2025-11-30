const db = require('./config/db');

async function checkColumns() {
    try {
        const [rows] = await db.query("SHOW COLUMNS FROM users LIKE 'profile_picture'");
        if (rows.length > 0) {
            console.log('Column profile_picture EXISTS');
        } else {
            console.log('Column profile_picture MISSING');
        }
        process.exit(0);
    } catch (error) {
        console.error('Check Error:', error);
        process.exit(1);
    }
}

checkColumns();
