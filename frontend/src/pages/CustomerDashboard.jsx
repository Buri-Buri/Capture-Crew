import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyBookings, addReview } from '../utils/api';

const CustomerDashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [bookings, setBookings] = useState([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const data = await getMyBookings();
            if (Array.isArray(data)) {
                setBookings(data);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const openReviewModal = (bookingId) => {
        setSelectedBookingId(bookingId);
        setReviewData({ rating: 5, comment: '' });
        setShowReviewModal(true);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await addReview({ ...reviewData, bookingId: selectedBookingId });
            if (res.message === 'Review added successfully') {
                alert('Review submitted!');
                setShowReviewModal(false);
                // Optionally refresh bookings or mark as reviewed locally if you track that
            } else {
                alert(res.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert(`Error submitting review: ${error.message}`);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '100px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2>My Account</h2>
                <span className="btn btn-outline">Welcome, {user.username || 'User'}</span>
            </div>

            <div className="grid">
                <div className="card">
                    <h3>My Bookings</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6366f1' }}>{bookings.length}</p>
                    <Link to="/services" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%', display: 'block', textAlign: 'center' }}>Find Professionals</Link>
                </div>
                <div className="card">
                    <h3>Saved Services</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ec4899' }}>0</p>
                    <button className="btn btn-outline" style={{ marginTop: '1rem', width: '100%' }}>View Saved</button>
                </div>
            </div>

            <div style={{ marginTop: '3rem' }}>
                <h3>Recent Activity</h3>
                {bookings.length > 0 ? (
                    <div className="grid">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="card">
                                <h4>{booking.service_title}</h4>
                                <p>Date: {new Date(booking.booking_date).toLocaleDateString()}</p>
                                <p>Status: <span style={{
                                    color: booking.is_completed ? '#10b981' :
                                        booking.status === 'rejected' ? '#ef4444' :
                                            booking.status === 'accepted' ? '#10b981' : '#fbbf24',
                                    fontWeight: 'bold'
                                }}>
                                    {booking.is_completed ? 'Completed' : booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span></p>
                                <button onClick={() => navigate('/messages', { state: { sellerId: booking.seller_id, sellerName: booking.seller_name } })} className="btn btn-outline" style={{ marginTop: '0.5rem', width: '100%' }}>Message Seller</button>

                                {booking.is_completed && (
                                    <button onClick={() => openReviewModal(booking.id)} className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%', background: '#f59e0b', borderColor: '#f59e0b' }}>Write a Review</button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card" style={{ marginTop: '1rem', textAlign: 'center', color: '#94a3b8' }}>
                        No bookings yet. Start exploring!
                    </div>
                )}
            </div>

            {showReviewModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
                }}>
                    <div className="card" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
                        <button onClick={() => setShowReviewModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        <h3 style={{ marginBottom: '1.5rem' }}>Write a Review</h3>
                        <form onSubmit={handleReviewSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Rating</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                            key={star}
                                            onClick={() => setReviewData({ ...reviewData, rating: star })}
                                            style={{
                                                fontSize: '2rem',
                                                cursor: 'pointer',
                                                color: star <= reviewData.rating ? '#fbbf24' : '#4b5563'
                                            }}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Comment</label>
                                <textarea
                                    value={reviewData.comment}
                                    onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                                    rows="4"
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #334155', background: '#0f172a', color: 'white' }}
                                    placeholder="Share your experience..."
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Submit Review</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerDashboard;
