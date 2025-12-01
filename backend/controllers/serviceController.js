const supabase = require('../config/supabase');

const createService = async (req, res) => {
    try {
        const { title, description, price, category, image_links } = req.body;
        const seller_id = req.user.id;

        if (!title || !description || !price || !category) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Insert service
        const { data: serviceData, error: serviceError } = await supabase
            .from('services')
            .insert([{
                seller_id,
                title,
                description,
                price,
                category
            }])
            .select()
            .single();

        if (serviceError) throw serviceError;
        const serviceId = serviceData.id;

        // Collect all image URLs
        let imageUrls = [];

        // Handle uploaded files
        if (req.files && req.files.length > 0) {
            const uploadedUrls = req.files.map(file => `http://localhost:5000/uploads/${file.filename}`);
            imageUrls = [...imageUrls, ...uploadedUrls];
        }

        // Handle image links
        if (image_links) {
            const links = image_links.split(',').map(link => link.trim()).filter(link => link);
            imageUrls = [...imageUrls, ...links];
        }

        // Insert images into service_images
        if (imageUrls.length > 0) {
            const imageRecords = imageUrls.map(url => ({ service_id: serviceId, image_url: url }));
            const { error: imagesError } = await supabase
                .from('service_images')
                .insert(imageRecords);

            if (imagesError) throw imagesError;

            // Update main image_url
            const firstImage = imageUrls[0];
            await supabase
                .from('services')
                .update({ image_url: firstImage })
                .eq('id', serviceId);
        }

        res.status(201).json({ message: 'Service created successfully', serviceId });
    } catch (error) {
        console.error('Create Service Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMyServices = async (req, res) => {
    try {
        const seller_id = req.user.id;

        // Fetch services
        const { data: services, error: servicesError } = await supabase
            .from('services')
            .select('*')
            .eq('seller_id', seller_id)
            .order('created_at', { ascending: false });

        if (servicesError) throw servicesError;

        // Fetch images for each service
        for (let service of services) {
            const { data: images } = await supabase
                .from('service_images')
                .select('image_url')
                .eq('service_id', service.id);

            service.images = images ? images.map(img => img.image_url) : [];
            if (!service.image_url && service.images.length > 0) {
                service.image_url = service.images[0];
            }
        }

        res.json(services);
    } catch (error) {
        console.error('Get My Services Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getAllServices = async (req, res) => {
    try {
        // Fetch services with seller details
        // Note: Assuming 'users' table is public or accessible via RLS
        let query = supabase
            .from('services')
            .select(`
                *,
                users (
                    username,
                    profile_picture
                )
            `)
            .order('created_at', { ascending: false });

        if (req.query.search) {
            const searchTerm = req.query.search;
            query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
        }

        const { data: services, error: servicesError } = await query;

        if (servicesError) throw servicesError;

        // Format response to match frontend expectation (flatten users object)
        const formattedServices = [];
        for (let service of services) {
            const { data: images } = await supabase
                .from('service_images')
                .select('image_url')
                .eq('service_id', service.id);

            const serviceObj = {
                ...service,
                seller_name: service.users?.username,
                seller_image: service.users?.profile_picture,
                images: images ? images.map(img => img.image_url) : []
            };

            if (!serviceObj.image_url && serviceObj.images.length > 0) {
                serviceObj.image_url = serviceObj.images[0];
            }

            // Remove the nested users object
            delete serviceObj.users;
            formattedServices.push(serviceObj);
        }

        res.json(formattedServices);
    } catch (error) {
        console.error('Get All Services Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createService, getMyServices, getAllServices };
