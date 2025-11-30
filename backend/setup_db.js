const mysql = require('mysql2/promise');
require('dotenv').config();

const setupDatabase = async () => {
    try {
        // Connect to MySQL server (no specific DB)
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || ''
        });

        console.log('Connected to MySQL server');

        // Create new database
        await connection.query('CREATE DATABASE IF NOT EXISTS capturecrew_v2');
        console.log('Database capturecrew_v2 created');

        // Use the new database
        await connection.query('USE capturecrew_v2');

        // Create users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255),
                role ENUM('customer', 'seller', 'admin') DEFAULT 'customer',
                profile_picture VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Users table created');

        // Create services table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS services (
                id INT AUTO_INCREMENT PRIMARY KEY,
                seller_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10, 2) NOT NULL,
                category VARCHAR(100),
                location VARCHAR(255),
                image_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('Services table created');

        // Create service_images table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS service_images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                service_id INT NOT NULL,
                image_url VARCHAR(255) NOT NULL,
                FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
            )
        `);
        console.log('Service Images table created');

        // Create bookings table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_id INT NOT NULL,
                service_id INT NOT NULL,
                booking_date DATE NOT NULL,
                contact_info VARCHAR(255),
                location VARCHAR(255),
                status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
                payment_status ENUM('pending', 'paid') DEFAULT 'pending',
                is_completed BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
            )
        `);
        console.log('Bookings table created');

        // Create messages table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT NOT NULL,
                receiver_id INT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                booking_id INT,
                FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('Messages table created');

        console.log('Database setup completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Setup failed:', error);
        process.exit(1);
    }
};

setupDatabase();
