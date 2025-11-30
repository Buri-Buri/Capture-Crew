const db = require('./config/db');

async function listServices() {
    try {
        console.log('Listing services...');
        const [rows] = await db.query('SELECT services.*, users.username as seller_name FROM services JOIN users ON services.seller_id = users.id');
        console.log('Services found:', rows.length);
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('DB Error:', error);
        process.exit(1);
    }
}

listServices();
