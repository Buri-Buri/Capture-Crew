import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyBookings, addReview } from '../utils/api';
import { useToast } from '../context/ToastContext';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const [user, setUser] = useState({});

    // Review Modal State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const data = await getMyBookings();
            if (Array.isArray(data)) {
                setBookings(data);
            } else {
                setBookings([]);
                console.error('Invalid bookings data:', data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            showToast('Failed to load bookings', 'error');
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#f59e0b'; // amber
            case 'confirmed': return '#10b981'; // green
            case 'accepted': return '#10b981'; // green
            case 'completed': return '#3b82f6'; // blue
            case 'cancelled': return '#ef4444'; // red
            case 'rejected': return '#ef4444'; // red
            default: return 'var(--muted-foreground)';
        }
    };

    const openReviewModal = (booking) => {
        setSelectedBooking(booking);
        setRating(5);
        setComment('');
        setShowReviewModal(true);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!selectedBooking) return;

        try {
            const response = await addReview({
                bookingId: selectedBooking.id, // Corrected from service_id to bookingId
                rating: parseInt(rating),
                comment
            });

            if (response.review) {
                showToast('Review submitted successfully!', 'success');
                setShowReviewModal(false);
                // Optionally refresh bookings to hide the "Leave a Review" button or mark as reviewed
            } else {
                showToast(response.message || 'Failed to submit review', 'error');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            showToast(error.message || 'Failed to submit review', 'error');
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Loading...</div>;

    const activeBookings = bookings.filter(b => (b.status === 'accepted' || b.status === 'pending') && !b.is_completed).length;
    const completedBookings = bookings.filter(b => b.status === 'completed' || b.is_completed).length;

    return (
        <div className="container" style={{ paddingTop: '100px', paddingBottom: '4rem' }}>
            <div style={{ marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--foreground)' }}>
                    Welcome back, {user.username || 'Customer'}!
                </h1>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem' }}>Manage your bookings and reviews.</p>
            </div>

            <div className="grid" style={{ marginBottom: '3rem' }}>
                <div className="card">
                    <h3>Active Bookings</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{activeBookings}</p>
                </div>
                <div className="card">
                    <h3>Completed Services</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{completedBookings}</p>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--muted)' }}>
                    <Link to="/services" className="btn btn-primary" style={{ width: '100%', fontSize: '1.1rem' }}>
                        + Book New Service
                    </Link>
                </div>
            </div>

            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.8rem', fontWeight: '700', color: 'var(--foreground)' }}>My Bookings</h2>

            {bookings.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', borderStyle: 'dashed' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--foreground)' }}>No bookings yet</h3>
                    <p style={{ marginBottom: '2rem', color: 'var(--muted-foreground)' }}>Explore our talented professionals and book your first service today!</p>
                    <Link to="/services" className="btn btn-primary">Browse Services</Link>
                </div>
            ) : (
                <div className="grid">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="card" style={{ position: 'relative' }}>
                            <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                                <span style={{
                                    backgroundColor: getStatusColor(booking.is_completed ? 'completed' : booking.status),
                                    color: 'white',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '9999px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    textTransform: 'capitalize'
                                }}>
                                    {booking.is_completed ? 'completed' : booking.status}
                                </span>
                            </div>
                            <h3 style={{ paddingRight: '4rem' }}>{booking.service_title}</h3>
                            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <p><strong>Date:</strong> {new Date(booking.booking_date).toLocaleDateString()}</p>
                                <p><strong>Price:</strong> ৳{booking.total_price}</p>
                                <p><strong>Provider:</strong> {booking.seller_name || 'Service Provider'}</p>
                            </div>

                            <button
                                className="btn btn-outline"
                                style={{ marginTop: '1rem', width: '100%' }}
                                onClick={() => navigate('/messages', { state: { sellerId: booking.seller_id, sellerName: booking.seller_name } })}
                            >
                                Message Provider
                            </button>

                            {(booking.status === 'completed' || booking.is_completed) && (
                                <button
                                    className="btn btn-outline"
                                    style={{ marginTop: '1.5rem', width: '100%' }}
                                    onClick={() => openReviewModal(booking)}
                                >
                                    Leave a Review
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && (
                <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Write a Review</h3>
                        <form onSubmit={handleReviewSubmit}>
                            <div className="form-group">
                                <label>Rating</label>
                                <select
                                    value={rating}
                                    onChange={(e) => setRating(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--input)', color: 'var(--foreground)' }}
                                >
                                    <option value="5">5 - Excellent</option>
                                    <option value="4">4 - Very Good</option>
                                    <option value="3">3 - Good</option>
                                    <option value="2">2 - Fair</option>
                                    <option value="1">1 - Poor</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Comment</label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    rows="4"
                                    required
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', background: 'var(--input)', color: 'var(--foreground)' }}
                                    placeholder="Share your experience..."
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() => setShowReviewModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Submit Review
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDashboard;
