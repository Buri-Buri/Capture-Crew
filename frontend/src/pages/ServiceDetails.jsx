import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllServices, createBooking } from '../utils/api';

const ServiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [service, setService] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showBooking, setShowBooking] = useState(false);
    const [bookingData, setBookingData] = useState({
        booking_date: '',
        contact_info: '',
        location: ''
    });

    useEffect(() => {
        const fetchService = async () => {
            try {
                const services = await getAllServices();
                const found = services.find(s => s.id === parseInt(id));
                setService(found);
            } catch (error) {
                console.error('Error fetching service:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [id]);

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        try {
            await createBooking({
                service_id: service.id,
                ...bookingData
            });
            alert('Booking request sent successfully!');
            setShowBooking(false);
        } catch (error) {
            console.error('Booking failed:', error);
            alert('Failed to book service. Please try again.');
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: '2rem' }}>Loading...</div>;
    if (!service) return <div className="container" style={{ paddingTop: '2rem' }}>Service not found</div>;

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '1rem' }}>&larr; Back</button>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ height: '400px', background: 'var(--muted)', position: 'relative' }}>
                    {service.image_url ? (
                        <img src={service.image_url} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted-foreground)' }}>No Image</div>
                    )}
                </div>

                <div style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{service.title}</h1>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--muted-foreground)' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: 'var(--muted)' }}>
                                    {service.seller_image ? (
                                        <img src={service.seller_image} alt={service.seller_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                                            {service.seller_name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <span>{service.seller_name}</span>
                                <span>•</span>
                                <span>{service.category}</span>
                                <span>•</span>
                                <span>{service.location}</span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>${service.price}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>per event</div>
                            <button onClick={() => navigate('/messages', { state: { sellerId: service.seller_id, sellerName: service.seller_name, sellerImage: service.seller_image } })} className="btn btn-outline" style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>Message Seller</button>
                        </div>
                    </div>

                    <hr style={{ margin: '1.5rem 0', borderColor: 'var(--border)' }} />

                    <h3>About This Service</h3>
                    <p style={{ lineHeight: '1.6', color: 'var(--foreground)', marginBottom: '2rem' }}>{service.description}</p>

                    {service.images && service.images.length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                            <h3>Portfolio</h3>
                            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                                {service.images.map((img, index) => (
                                    <img key={index} src={img} alt={`Portfolio ${index}`} style={{ height: '200px', borderRadius: '0.5rem', objectFit: 'cover' }} />
                                ))}
                            </div>
                        </div>
                    )}

                    <button onClick={() => setShowBooking(true)} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}>Book Now</button>
                </div>
            </div>

            {showBooking && (
                <div className="modal-overlay" onClick={() => setShowBooking(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2>Book Service</h2>
                        <form onSubmit={handleBookingSubmit}>
                            <div className="form-group">
                                <label>Date</label>
                                <input
                                    type="date"
                                    required
                                    value={bookingData.booking_date}
                                    onChange={e => setBookingData({ ...bookingData, booking_date: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Contact Info</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Phone number or email"
                                    value={bookingData.contact_info}
                                    onChange={e => setBookingData({ ...bookingData, contact_info: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Event Location</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Address or venue"
                                    value={bookingData.location}
                                    onChange={e => setBookingData({ ...bookingData, location: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" onClick={() => setShowBooking(false)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Confirm Booking</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ServiceDetails;
