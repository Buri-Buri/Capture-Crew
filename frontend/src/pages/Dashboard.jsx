import React, { useState, useEffect } from 'react';
import { createService, getMyServices, getSellerBookings, updateBookingStatus, completeBooking, updatePaymentStatus } from '../utils/api';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    const [showModal, setShowModal] = useState(false);
    const [services, setServices] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: 'Photography'
    });
    const [imageFiles, setImageFiles] = useState([]);
    const [imageLinks, setImageLinks] = useState('');

    useEffect(() => {
        fetchServices();
        fetchBookings();
    }, []);

    const fetchServices = async () => {
        try {
            const data = await getMyServices();
            if (Array.isArray(data)) {
                setServices(data);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const fetchBookings = async () => {
        try {
            const data = await getSellerBookings();
            if (Array.isArray(data)) {
                setBookings(data);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const handleStatusUpdate = async (bookingId, status) => {
        try {
            const res = await updateBookingStatus(bookingId, status);
            if (res.message === 'Booking status updated') {
                alert(`Booking ${status} successfully!`);
                fetchBookings();
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating status');
        }
    };

    const handleComplete = async (bookingId) => {
        if (!window.confirm('Are you sure you want to mark this booking as completed?')) return;
        try {
            const res = await completeBooking(bookingId);
            if (res.message === 'Booking marked as completed') {
                alert('Booking completed!');
                fetchBookings();
            } else {
                alert('Failed to complete booking: ' + (res.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error completing booking:', error);
        }
    };

    const handlePayment = async (bookingId, status) => {
        if (!window.confirm(`Mark this booking as ${status}?`)) return;
        try {
            const res = await updatePaymentStatus(bookingId, status);
            if (res.message) {
                alert('Payment status updated!');
                fetchBookings();
            }
        } catch (error) {
            console.error('Error updating payment:', error);
        }
    };

    const scrollToBookings = () => {
        const element = document.getElementById('recent-bookings');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setImageFiles(Array.from(e.target.files));
    };

    const handleProfilePicUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profile_picture', file);

        try {
            const res = await fetch('http://localhost:5000/api/users/profile-picture', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                alert('Profile picture updated!');
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedUser = { ...currentUser, profile_picture: data.profile_picture };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                window.location.reload();
            } else {
                alert('Failed to update profile picture');
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('category', formData.category);
            data.append('image_links', imageLinks);

            imageFiles.forEach((file) => {
                data.append('images', file);
            });

            const res = await createService(data);
            if (res.serviceId) {
                alert('Service created successfully!');
                setShowModal(false);
                setFormData({ title: '', description: '', price: '', category: 'Photography' });
                setImageFiles([]);
                setImageLinks('');
                fetchServices();
            } else {
                alert('Failed to create service');
            }
        } catch (error) {
            console.error('Error creating service:', error);
            alert('Error creating service');
        }
    };

    return (
        <div className="dashboard container" style={{ paddingTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Seller Dashboard</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ position: 'relative', width: '50px', height: '50px', borderRadius: '50%', overflow: 'hidden', background: 'var(--muted)', cursor: 'pointer' }}>
                        {user.profile_picture ? (
                            <img src={user.profile_picture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📷</div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePicUpload}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                            title="Upload Profile Picture"
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Service</button>
                </div>
            </div>

            <div className="grid">
                <div className="card">
                    <h3>My Services</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#6366f1' }}>{services.length}</p>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>+ Add Service</button>
                </div>
                <div className="card">
                    <h3>Active Bookings</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ec4899' }}>
                        {bookings.filter(b => b.status === 'accepted' && !b.is_completed).length}
                    </p>
                    <button onClick={scrollToBookings} className="btn btn-outline" style={{ marginTop: '1rem', width: '100%' }}>View All</button>
                </div>
                <div className="card">
                    <h3>Total Earnings</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                        ${bookings
                            .filter(b => b.payment_status === 'paid')
                            .reduce((sum, b) => sum + (parseFloat(b.service_price) || 0), 0)
                            .toFixed(2)}
                    </p>
                    <button onClick={() => navigate('/reports')} className="btn btn-outline" style={{ marginTop: '1rem', width: '100%' }}>View Reports</button>
                </div>
            </div>

            <div id="recent-bookings" style={{ marginTop: '3rem' }}>
                <h3>Recent Bookings</h3>
                {bookings.length > 0 ? (
                    <div className="grid" style={{ marginTop: '1rem' }}>
                        {bookings.map((booking) => (
                            <div key={booking.id} className="card">
                                <h4>{booking.service_title}</h4>
                                <p style={{ color: '#94a3b8' }}>Booked by: {booking.customer_name}</p>
                                <p>Date: {new Date(booking.booking_date).toLocaleDateString()}</p>
                                <p>Contact: {booking.contact_info || 'N/A'}</p>
                                <p>Location: {booking.location || 'N/A'}</p>
                                <p>Price: ${booking.service_price}</p>
                                <p>Status:
                                    <span style={{
                                        color: booking.is_completed ? '#10b981' :
                                            booking.payment_status === 'paid' ? '#f59e0b' :
                                                booking.status === 'accepted' ? '#10b981' :
                                                    booking.status === 'rejected' ? '#ef4444' : '#fbbf24',
                                        fontWeight: 'bold',
                                        marginLeft: '0.5rem'
                                    }}>
                                        {booking.is_completed ? 'Completed' :
                                            booking.payment_status === 'paid' ? 'Paid' :
                                                booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                    </span>
                                </p>

                                {booking.status === 'pending' && (
                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <button onClick={() => handleStatusUpdate(booking.id, 'accepted')} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Accept</button>
                                        <button onClick={() => handleStatusUpdate(booking.id, 'rejected')} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', borderColor: '#ef4444', color: '#ef4444' }}>Reject</button>
                                        <button onClick={() => navigate('/messages', { state: { sellerId: booking.customer_id, sellerName: booking.customer_name } })} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Message Buyer</button>
                                    </div>
                                )}

                                {booking.status === 'accepted' && (
                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {!booking.is_completed && (
                                            <button onClick={() => handleComplete(booking.id)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: '#10b981', borderColor: '#10b981' }}>Complete Booking</button>
                                        )}
                                        {booking.is_completed && booking.payment_status === 'pending' && (
                                            <button onClick={() => handlePayment(booking.id, 'paid')} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', background: '#f59e0b', borderColor: '#f59e0b' }}>Mark Paid</button>
                                        )}
                                        <button onClick={() => navigate('/messages', { state: { sellerId: booking.customer_id, sellerName: booking.customer_name } })} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Message Buyer</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card" style={{ marginTop: '1rem', textAlign: 'center', color: '#94a3b8' }}>
                        No bookings yet.
                    </div>
                )}
            </div>

            <div style={{ marginTop: '3rem' }}>
                <h3>My Service Listings</h3>
                {services.length === 0 ? (
                    <div className="card" style={{ marginTop: '1rem', textAlign: 'center', color: '#94a3b8' }}>
                        No services added yet. Click "+ Add Service" to get started.
                    </div>
                ) : (
                    <div className="grid" style={{ marginTop: '1rem' }}>
                        {services.map((service) => (
                            <div key={service.id} className="card">
                                {service.images && service.images.length > 0 ? (
                                    <div style={{ display: 'flex', overflowX: 'auto', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.5rem' }}>
                                        {service.images.map((img, index) => (
                                            <img key={index} src={img} alt={`${service.title} ${index + 1}`} style={{ height: '150px', objectFit: 'contain', borderRadius: '0.5rem' }} />
                                        ))}
                                    </div>
                                ) : (
                                    service.image_url && <img src={service.image_url} alt={service.title} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '1rem' }} />
                                )}
                                <h4>{service.title}</h4>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{service.category}</p>
                                <p style={{ fontWeight: 'bold', marginTop: '0.5rem' }}>${service.price}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {
                showModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
                    }}>
                        <div className="card" style={{ width: '100%', maxWidth: '500px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
                            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                            <h3 style={{ marginBottom: '1.5rem' }}>Add New Service</h3>
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Service Title</label>
                                    <input type="text" name="title" value={formData.title} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #334155', background: '#0f172a', color: 'white' }} />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #334155', background: '#0f172a', color: 'white' }}>
                                        <option>Photography</option>
                                        <option>Videography</option>
                                        <option>Event Planning</option>
                                        <option>Decoration</option>
                                    </select>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Price ($)</label>
                                    <input type="number" name="price" value={formData.price} onChange={handleChange} required style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #334155', background: '#0f172a', color: 'white' }} />
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} rows="3" style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #334155', background: '#0f172a', color: 'white' }}></textarea>
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Portfolio Images (Upload)</label>
                                    <input type="file" accept="image/*" multiple onChange={handleFileChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #334155', background: '#0f172a', color: 'white' }} />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Image Links (Comma separated)</label>
                                    <input type="text" value={imageLinks} onChange={(e) => setImageLinks(e.target.value)} placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #334155', background: '#0f172a', color: 'white' }} />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Service</button>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Dashboard;
