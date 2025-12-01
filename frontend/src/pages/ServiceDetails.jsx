import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllServices, createBooking, getServiceReviews } from '../utils/api';
import { useToast } from '../context/ToastContext';

const ServiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [service, setService] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBooking, setShowBooking] = useState(false);
    const [bookingData, setBookingData] = useState({
        booking_date: '',
        contact_info: '',
        location: ''
    });

    useEffect(() => {
        fetchServiceDetails();
    }, [id]);

    const fetchServiceDetails = async () => {
        try {
            const services = await getAllServices();
            const foundService = services.find(s => s.id === parseInt(id));
            setService(foundService);

            // Fetch reviews
            const reviewsData = await getServiceReviews(id);
            if (Array.isArray(reviewsData)) {
                setReviews(reviewsData);
            }
        } catch (error) {
            console.error('Error fetching service details:', error);
            showToast('Failed to load service details', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        if (!localStorage.getItem('token')) {
            showToast('Please login to book a service', 'info');
            navigate('/login');
            return;
        }

        try {
            const res = await createBooking({
                service_id: service.id,
                ...bookingData
            });
            if (res.bookingId) {
                showToast('Booking request sent successfully!', 'success');
                setShowBooking(false);
                navigate('/customer-dashboard');
            } else {
                showToast('Failed to book service', 'error');
            }
        } catch (error) {
            console.error('Error booking service:', error);
            showToast('Error booking service', 'error');
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: '2rem' }}>Loading...</div>;
    if (!service) return <div className="container" style={{ paddingTop: '2rem' }}>Service not found</div>;

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 'New';

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '1rem' }}>&larr; Back</button>

            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ height: '400px', background: 'var(--muted)', position: 'relative' }}>
                    {service.images && service.images.length > 0 ? (
                        <img src={service.images[0]} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <img src={service.image_url || 'https://via.placeholder.com/600x400'} alt={service.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                                <span style={{ background: '#fbbf24', color: 'black', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontWeight: 'bold', marginLeft: '1rem' }}>
                                    ★ {averageRating} ({reviews.length} reviews)
                                </span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>৳{service.price}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>per event</div>
                            {(() => {
                                const userStr = localStorage.getItem('user');
                                const user = userStr ? JSON.parse(userStr) : null;
                                if (user && user.role === 'seller') {
                                    return null;
                                }
                                return <button onClick={() => navigate('/messages', { state: { sellerId: service.seller_id, sellerName: service.seller_name, sellerImage: service.seller_image } })} className="btn btn-outline" style={{ marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}>Message Seller</button>;
                            })()}
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
                                    <div key={index} style={{ position: 'relative', flexShrink: 0 }}>
                                        <img src={img} alt={`Portfolio ${index}`} style={{ height: '200px', borderRadius: '0.5rem', objectFit: 'cover' }} />
                                        {(() => {
                                            const userStr = localStorage.getItem('user');
                                            const user = userStr ? JSON.parse(userStr) : null;
                                            if (user && user.id === service.seller_id) {
                                                return (
                                                    <button
                                                        onClick={async () => {
                                                            if (window.confirm('Are you sure you want to delete this image?')) {
                                                                try {
                                                                    const { deleteServiceImage } = await import('../utils/api');
                                                                    await deleteServiceImage(service.id, img);
                                                                    showToast('Image deleted successfully', 'success');
                                                                    // Refresh details
                                                                    fetchServiceDetails();
                                                                } catch (error) {
                                                                    console.error('Error deleting image:', error);
                                                                    showToast(error.message || 'Failed to delete image', 'error');
                                                                }
                                                            }
                                                        }}
                                                        style={{
                                                            position: 'absolute',
                                                            top: '0.5rem',
                                                            right: '0.5rem',
                                                            background: 'rgba(255, 0, 0, 0.8)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '50%',
                                                            width: '24px',
                                                            height: '24px',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '14px'
                                                        }}
                                                    >
                                                        ×
                                                    </button>
                                                );
                                            }
                                            return null;
                                        })()}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {(() => {
                        const userStr = localStorage.getItem('user');
                        const user = userStr ? JSON.parse(userStr) : null;
                        if (user && user.role === 'seller') {
                            return <div style={{ padding: '1rem', background: 'var(--muted)', textAlign: 'center', borderRadius: '0.5rem' }}>Sellers cannot book services</div>;
                        }
                        return <button onClick={() => setShowBooking(true)} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}>Book Now</button>;
                    })()}
                </div>
            </div>

            <div style={{ marginTop: '3rem' }}>
                <h3>Reviews</h3>
                {reviews.length > 0 ? (
                    <div className="grid" style={{ marginTop: '1rem' }}>
                        {reviews.map((review) => (
                            <div key={review.id} className="card">
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            {review.user?.profile_picture ? (
                                                <img src={review.user.profile_picture} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span>{review.user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                                            )}
                                        </div>
                                        <span style={{ fontWeight: 'bold' }}>{review.user?.username || 'Anonymous'}</span>
                                    </div>
                                    <span style={{ color: '#fbbf24' }}>{'★'.repeat(review.rating)}</span>
                                </div>
                                <p>{review.comment}</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                                    {new Date(review.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: 'var(--muted-foreground)', marginTop: '1rem' }}>No reviews yet.</p>
                )}
            </div>

            {showBooking && (
                <div className="modal-overlay" onClick={() => setShowBooking(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Book Service</h2>
                            <button onClick={() => setShowBooking(false)} style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>
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
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
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
