import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getAllServices, createBooking } from '../utils/api';
import BookingModal from '../components/BookingModal';

const Services = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [selectedServiceId, setSelectedServiceId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const searchTerm = searchParams.get('search');

    useEffect(() => {
        fetchServices(searchTerm);
    }, [searchTerm]);

    const fetchServices = async (search = '') => {
        try {
            const data = await getAllServices(search);
            if (Array.isArray(data)) {
                setServices(data);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const openBookingModal = (serviceId) => {
        setSelectedServiceId(serviceId);
        setIsModalOpen(true);
    };

    const handleBookingConfirm = async (date, contactInfo, location) => {
        if (selectedServiceId && date && contactInfo && location) {
            try {
                const res = await createBooking({
                    service_id: selectedServiceId,
                    booking_date: date,
                    contact_info: contactInfo,
                    location: location
                });
                if (res.bookingId) {
                    alert('Booking successful!');
                    setIsModalOpen(false);
                    setSelectedServiceId(null);
                } else {
                    alert('Booking failed: ' + (res.message || 'Unknown error'));
                }
            } catch (error) {
                console.error('Error booking service:', error);
                alert('Error booking service');
            }
        }
    };

    return (
        <div className="container" style={{ paddingTop: '100px' }}>
            <h2 className="section-title">Find Professionals</h2>
            <div className="grid">
                {services.map((service) => (
                    <div
                        key={service.id}
                        className="card"
                        onClick={() => navigate(`/service/${service.id}`)}
                        style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        {service.images && service.images.length > 0 ? (
                            <div style={{ display: 'flex', overflowX: 'auto', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.5rem' }}>
                                {service.images.map((img, index) => (
                                    <img key={index} src={img} alt={`${service.title} ${index + 1}`} style={{ height: '200px', objectFit: 'contain', borderRadius: '0.5rem' }} />
                                ))}
                            </div>
                        ) : (
                            service.image_url && <img src={service.image_url} alt={service.title} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '1rem' }} />
                        )}
                        <h3>{service.title}</h3>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{service.category} • by {service.seller_name}</p>
                        <p style={{ marginTop: '0.5rem' }}>{service.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                            <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#6366f1' }}>${service.price}</span>
                            <button
                                className="btn btn-primary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    openBookingModal(service.id);
                                }}
                            >
                                Book Now
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {services.length === 0 && (
                <p style={{ textAlign: 'center', color: '#94a3b8', marginTop: '2rem' }}>No services found. Check back later!</p>
            )}

            <BookingModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleBookingConfirm}
            />
        </div>
    );
};

export default Services;
