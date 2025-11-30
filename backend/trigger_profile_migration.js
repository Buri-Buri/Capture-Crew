const fetch = require('node-fetch');

async function triggerMigration() {
    try {
        const res = await fetch('http://localhost:5000/migrate-profile-pic');
        const text = await res.text();
        console.log('Migration Result:', text);
    } catch (error) {
        console.error('Migration Trigger Error:', error);
    }
}

triggerMigration();
