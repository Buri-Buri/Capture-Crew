const db = require('./config/db');

const migrate = async () => {
    try {
        // Create messages table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                sender_id INT NOT NULL,
                receiver_id INT NOT NULL,
                content TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                booking_id INT
            )
        `);
        console.log('Messages table created');

        // Alter bookings table
        try {
            await db.execute(`ALTER TABLE bookings ADD COLUMN payment_status ENUM('pending', 'paid') DEFAULT 'pending'`);
            console.log('Added payment_status column');
        } catch (e) {
            console.log('payment_status column might already exist:', e.message);
        }

        try {
            await db.execute(`ALTER TABLE bookings ADD COLUMN is_completed BOOLEAN DEFAULT FALSE`);
            console.log('Added is_completed column');
        } catch (e) {
            console.log('is_completed column might already exist:', e.message);
        }

        process.exit();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
