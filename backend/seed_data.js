const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function seedData() {
    try {
        console.log('Seeding database...');

        // 1. Create Users (Service Providers)
        const password = await bcrypt.hash('password123', 10);
        const providers = [
            { username: 'Rahim Photography', email: 'rahim@example.com', role: 'seller' },
            { username: 'Karim Events', email: 'karim@example.com', role: 'seller' },
            { username: 'Fatema Clicks', email: 'fatema@example.com', role: 'seller' },
            { username: 'Dhaka Decorators', email: 'dhaka@example.com', role: 'seller' }
        ];

        for (const provider of providers) {
            // Check if user exists
            const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [provider.email]);
            if (existing.length === 0) {
                await db.query('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
                    [provider.username, provider.email, password, provider.role]);
                console.log(`Created user: ${provider.username}`);
            } else {
                console.log(`User already exists: ${provider.username}`);
            }
        }

        // Get User IDs
        const [users] = await db.query('SELECT id, email FROM users WHERE role = "seller"');
        const userMap = {};
        users.forEach(u => userMap[u.email] = u.id);

        // 2. Create Services
        const services = [
            {
                seller_email: 'rahim@example.com',
                title: 'Premium Wedding Photography',
                description: 'Capture your special day with our premium wedding photography package. Includes full day coverage and edited photos.',
                price: 25000,
                category: 'Photography',
                location: 'Dhaka',
                image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            },
            {
                seller_email: 'karim@example.com',
                title: 'Corporate Event Management',
                description: 'Complete event management for corporate seminars, conferences, and parties.',
                price: 50000,
                category: 'Event Planning',
                location: 'Chittagong',
                image_url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            },
            {
                seller_email: 'fatema@example.com',
                title: 'Portrait & Fashion Shoot',
                description: 'Professional portrait and fashion photography sessions.',
                price: 10000,
                category: 'Photography',
                location: 'Sylhet',
                image_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            },
            {
                seller_email: 'dhaka@example.com',
                title: 'Birthday Party Decoration',
                description: 'Colorful and themed decorations for birthday parties.',
                price: 15000,
                category: 'Decoration',
                location: 'Dhaka',
                image_url: 'https://images.unsplash.com/photo-1530103862676-de3c9a59af57?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
            }
        ];

        for (const service of services) {
            const sellerId = userMap[service.seller_email];
            if (sellerId) {
                // Check if service exists (by title and seller)
                const [existing] = await db.query('SELECT * FROM services WHERE title = ? AND seller_id = ?', [service.title, sellerId]);
                if (existing.length === 0) {
                    const [result] = await db.query(
                        'INSERT INTO services (seller_id, title, description, price, category, location, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [sellerId, service.title, service.description, service.price, service.category, service.location, service.image_url]
                    );

                    // Add to service_images as well
                    await db.query('INSERT INTO service_images (service_id, image_url) VALUES (?, ?)', [result.insertId, service.image_url]);

                    console.log(`Created service: ${service.title}`);
                } else {
                    console.log(`Service already exists: ${service.title}`);
                }
            }
        }

        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedData();
