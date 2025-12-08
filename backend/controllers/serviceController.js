const supabase = require('../config/supabase');
const { uploadFileToSupabase } = require('../utils/storage');

const createService = async (req, res) => {
    try {
        const { title, description, price, category, location, image_links } = req.body;
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
                category,
                location
            }])
            .select()
            .single();

        if (serviceError) throw serviceError;
        const serviceId = serviceData.id;

        // Collect all image URLs
        let imageUrls = [];

        // Handle uploaded files
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => uploadFileToSupabase(file, 'CaptureCrew', 'services'));
            const uploadedUrls = await Promise.all(uploadPromises);
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
                ),
                bookings (
                    reviews (
                        rating
                    )
                )
            `)
            .order('created_at', { ascending: false });

        if (req.query.search) {
            const searchTerm = req.query.search;
            query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
        }

        if (req.query.category) {
            query = query.eq('category', req.query.category);
        }

        if (req.query.location) {
            // Using ilike for case-insensitive partial match on location
            query = query.ilike('location', `%${req.query.location}%`);
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

            // Calculate ratings
            let totalRating = 0;
            let reviewCount = 0;

            if (service.bookings) {
                service.bookings.forEach(booking => {
                    if (booking.reviews && booking.reviews.length > 0) {
                        booking.reviews.forEach(review => {
                            totalRating += review.rating;
                            reviewCount++;
                        });
                    }
                });
            }

            const averageRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : 0;

            const serviceObj = {
                ...service,
                seller_name: service.users?.username,
                seller_image: service.users?.profile_picture,
                images: images ? images.map(img => img.image_url) : [],
                average_rating: averageRating,
                total_reviews: reviewCount
            };

            if (!serviceObj.image_url && serviceObj.images.length > 0) {
                serviceObj.image_url = serviceObj.images[0];
            }

            // Remove the nested users and bookings objects
            delete serviceObj.users;
            delete serviceObj.bookings;
            formattedServices.push(serviceObj);
        }

        res.json(formattedServices);
    } catch (error) {
        console.error('Get All Services Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteServiceImage = async (req, res) => {
    try {
        const { serviceId } = req.params;
        const { imageUrl } = req.body;
        const seller_id = req.user.id;

        // Verify ownership
        const { data: service, error: serviceError } = await supabase
            .from('services')
            .select('id, seller_id, image_url')
            .eq('id', serviceId)
            .single();

        if (serviceError || !service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        if (service.seller_id !== seller_id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Delete from service_images
        const { error: deleteError } = await supabase
            .from('service_images')
            .delete()
            .eq('service_id', serviceId)
            .eq('image_url', imageUrl);

        if (deleteError) throw deleteError;

        // If it was the main image, update it
        if (service.image_url === imageUrl) {
            // Find another image to set as main
            const { data: remainingImages } = await supabase
                .from('service_images')
                .select('image_url')
                .eq('service_id', serviceId)
                .limit(1);

            const newMainImage = remainingImages && remainingImages.length > 0 ? remainingImages[0].image_url : null;

            await supabase
                .from('services')
                .update({ image_url: newMainImage })
                .eq('id', serviceId);
        }

        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Delete Image Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, category, location, image_links } = req.body;
        const seller_id = req.user.id;

        // Verify ownership
        const { data: service, error: serviceError } = await supabase
            .from('services')
            .select('seller_id')
            .eq('id', id)
            .single();

        if (serviceError || !service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        if (service.seller_id !== seller_id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Update service details
        const { error: updateError } = await supabase
            .from('services')
            .update({
                title,
                description,
                price,
                category,
                location
            })
            .eq('id', id);

        if (updateError) throw updateError;

        // Collect new image URLs
        let imageUrls = [];

        // Handle uploaded files
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => uploadFileToSupabase(file, 'CaptureCrew', 'services'));
            const uploadedUrls = await Promise.all(uploadPromises);
            imageUrls = [...imageUrls, ...uploadedUrls];
        }

        // Handle image links
        if (image_links) {
            const links = image_links.split(',').map(link => link.trim()).filter(link => link);
            imageUrls = [...imageUrls, ...links];
        }

        // Insert new images into service_images
        if (imageUrls.length > 0) {
            const imageRecords = imageUrls.map(url => ({ service_id: id, image_url: url }));
            const { error: imagesError } = await supabase
                .from('service_images')
                .insert(imageRecords);

            if (imagesError) throw imagesError;

            // If main image is missing, update it
            const { data: currentService } = await supabase
                .from('services')
                .select('image_url')
                .eq('id', id)
                .single();

            if (!currentService.image_url) {
                await supabase
                    .from('services')
                    .update({ image_url: imageUrls[0] })
                    .eq('id', id);
            }
        }

        res.json({ message: 'Service updated successfully' });
    } catch (error) {
        console.error('Update Service Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const seller_id = req.user.id;

        // Verify ownership
        const { data: service, error: serviceError } = await supabase
            .from('services')
            .select('seller_id')
            .eq('id', id)
            .single();

        if (serviceError || !service) {
            return res.status(404).json({ message: 'Service not found' });
        }

        if (service.seller_id !== seller_id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Delete service (Cascade will handle images and bookings)
        const { error: deleteError } = await supabase
            .from('services')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        res.json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Delete Service Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { createService, getMyServices, getAllServices, deleteServiceImage, updateService, deleteService };
