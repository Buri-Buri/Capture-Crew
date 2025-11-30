const db = require('../config/db');

const createService = async (req, res) => {
    try {
        const { title, description, price, category, image_links } = req.body;
        const seller_id = req.user.id;

        if (!title || !description || !price || !category) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Insert service
        const [result] = await db.query(
            'INSERT INTO services (seller_id, title, description, price, category) VALUES (?, ?, ?, ?, ?)',
            [seller_id, title, description, price, category]
        );
        const serviceId = result.insertId;

        // Handle uploaded files
        if (req.files && req.files.length > 0) {
            const imageValues = req.files.map(file => [serviceId, `http://localhost:5000/uploads/${file.filename}`]);
            await db.query('INSERT INTO service_images (service_id, image_url) VALUES ?', [imageValues]);
        }

        // Handle image links
        if (image_links) {
            const links = image_links.split(',').map(link => link.trim()).filter(link => link);
            if (links.length > 0) {
                const linkValues = links.map(link => [serviceId, link]);
                await db.query('INSERT INTO service_images (service_id, image_url) VALUES ?', [linkValues]);
            }
        }

        // Update main image_url for backward compatibility
        let firstImage = null;
        if (req.files && req.files.length > 0) {
            firstImage = `http://localhost:5000/uploads/${req.files[0].filename}`;
        } else if (image_links) {
            const links = image_links.split(',').map(link => link.trim()).filter(link => link);
            if (links.length > 0) firstImage = links[0];
        }

        if (firstImage) {
            await db.query('UPDATE services SET image_url = ? WHERE id = ?', [firstImage, serviceId]);
        }

        res.status(201).json({ message: 'Service created successfully', serviceId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMyServices = async (req, res) => {
    try {
        const seller_id = req.user.id;
        const [services] = await db.query('SELECT * FROM services WHERE seller_id = ? ORDER BY created_at DESC', [seller_id]);

        for (let service of services) {
            const [images] = await db.query('SELECT image_url FROM service_images WHERE service_id = ?', [service.id]);
            service.images = images.map(img => img.image_url);
            if (!service.image_url && service.images.length > 0) {
                service.image_url = service.images[0];
            }
        }

        res.json(services);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createService, getMyServices, getAllServices };
