const fetch = require('node-fetch');

async function runMigration() {
    try {
        const res = await fetch('http://localhost:5000/api/bookings/migrate');
        const text = await res.text();
        console.log('Migration Result:', text);
    } catch (error) {
        console.error('Error:', error);
    }
}

runMigration();
