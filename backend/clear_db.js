const mysql = require('mysql2/promise');
require('dotenv').config();

const clearDatabase = async () => {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'capturecrew_v2'
        });

        console.log('Connected to database');

        // Disable foreign key checks to allow dropping tables in any order
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // Drop tables
        await connection.query('DROP TABLE IF EXISTS messages');
        await connection.query('DROP TABLE IF EXISTS bookings');
        await connection.query('DROP TABLE IF EXISTS service_images');
        await connection.query('DROP TABLE IF EXISTS services');
        await connection.query('DROP TABLE IF EXISTS users');

        console.log('All tables dropped successfully');

        // Re-enable foreign key checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log('Database cleared.');
        process.exit(0);
    } catch (error) {
        console.error('Clear failed:', error);
        process.exit(1);
    }
};

clearDatabase();
