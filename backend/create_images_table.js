const db = require('./config/db');

async function createTable() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS service_images (
                id INT AUTO_INCREMENT PRIMARY KEY,
                service_id INT NOT NULL,
                image_url TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
            )
        `);
        console.log('Table service_images created successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error creating table:', error);
        process.exit(1);
    }
}

createTable();
