const fetch = require('node-fetch');
const FormData = require('form-data');

async function seedDataApi() {
    const baseUrl = 'http://localhost:5000/api';
    console.log('Seeding via API...');

    const providers = [
        { username: 'Rahim Photography', email: 'rahim@example.com', password: 'password123', role: 'seller' },
        { username: 'Karim Events', email: 'karim@example.com', password: 'password123', role: 'seller' },
        { username: 'Fatema Clicks', email: 'fatema@example.com', password: 'password123', role: 'seller' },
        { username: 'Dhaka Decorators', email: 'dhaka@example.com', password: 'password123', role: 'seller' }
    ];

    const services = [
        {
            seller_email: 'rahim@example.com',
            title: 'Premium Wedding Photography',
            description: 'Capture your special day with our premium wedding photography package. Includes full day coverage and edited photos.',
            price: '25000',
            category: 'Photography',
            location: 'Dhaka',
            image_links: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            seller_email: 'karim@example.com',
            title: 'Corporate Event Management',
            description: 'Complete event management for corporate seminars, conferences, and parties.',
            price: '50000',
            category: 'Event Planning',
            location: 'Chittagong',
            image_links: 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            seller_email: 'fatema@example.com',
            title: 'Portrait & Fashion Shoot',
            description: 'Professional portrait and fashion photography sessions.',
            price: '10000',
            category: 'Photography',
            location: 'Sylhet',
            image_links: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
            seller_email: 'dhaka@example.com',
            title: 'Birthday Party Decoration',
            description: 'Colorful and themed decorations for birthday parties.',
            price: '15000',
            category: 'Decoration',
            location: 'Dhaka',
            image_links: 'https://images.unsplash.com/photo-1530103862676-de3c9a59af57?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        }
    ];

    try {
        const tokenMap = {};

        // 1. Register/Login Users
        for (const provider of providers) {
            console.log(`Processing user: ${provider.username}`);

            // Try Register
            let res = await fetch(`${baseUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(provider)
            });

            // If register fails (e.g. exists), try login
            if (!res.ok) {
                console.log('User might exist, trying login...');
            }

            // Login
            res = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: provider.email, password: provider.password })
            });

            if (res.ok) {
                const data = await res.json();
                tokenMap[provider.email] = data.token;
                console.log(`Logged in: ${provider.username}`);
            } else {
                console.error(`Failed to login ${provider.username}`);
            }
        }

        // 2. Create Services
        for (const service of services) {
            const token = tokenMap[service.seller_email];
            if (!token) {
                console.log(`Skipping service for ${service.seller_email} (no token)`);
                continue;
            }

            console.log(`Creating service: ${service.title}`);

            // Use FormData for file upload (even if no file, backend might expect it or we use image_links)
            // My backend logic: if (req.files) ... if (req.body.image_links) ...
            // So I can just send JSON if I modified it to accept JSON for everything?
            // No, createService uses `upload.array`. So it expects multipart/form-data.

            const form = new FormData();
            form.append('title', service.title);
            form.append('description', service.description);
            form.append('price', service.price);
            form.append('category', service.category);
            form.append('location', service.location);
            form.append('image_links', service.image_links);

            // We need to append at least one file if backend requires it?
            // Backend: const files = req.files; if (!files || files.length === 0) ...
            // Wait, let me check serviceController.js.
            // It says: if ((!files || files.length === 0) && !image_links) return res.status(400)...
            // So if I provide image_links, I don't need files.

            const res = await fetch(`${baseUrl}/services`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // FormData headers are handled automatically by form-data package
                },
                body: form
            });

            if (res.ok) {
                console.log(`Created service: ${service.title}`);
            } else {
                const err = await res.text();
                console.error(`Failed to create service: ${service.title}`, err);
            }
        }

        console.log('Seeding completed.');

    } catch (error) {
        console.error('Seeding error:', error);
    }
}

seedDataApi();
