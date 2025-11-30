const express = require('express');
const dotenv = require('dotenv');
const db = require('./config/db');

dotenv.config();

const app = express();
const PORT = 5001;

app.get('/migrate', async (req, res) => {
    try {
        await db.query(`ALTER TABLE users ADD COLUMN profile_picture TEXT`);
        console.log('Migration success');
        res.send('Migration success');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists');
            res.send('Column already exists');
            process.exit(0);
        }
        console.error('Migration Error:', error);
        res.status(500).send('Migration failed: ' + error.message);
        process.exit(1);
    }
});

app.listen(PORT, async () => {
    console.log(`Migration Server running on port ${PORT}`);
    // Self-trigger
    const fetch = require('node-fetch');
    try {
        await fetch(`http://localhost:${PORT}/migrate`);
    } catch (e) {
        console.log('Trigger error', e);
    }
});
