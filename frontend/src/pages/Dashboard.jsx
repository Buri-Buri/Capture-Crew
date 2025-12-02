import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSellerBookings, updateBookingStatus, createService, getMyServices, updatePaymentStatus, uploadProfilePicture, completeBooking, updateService, deleteService, deleteServiceImage } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { user, updateUser } = useAuth();

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    if (!user) return null; // Prevent rendering until redirect
    const [bookings, setBookings] = useState([]);
    const [services, setServices] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        category: 'Photography',
        location: ''
    });
    const [imageLinks, setImageLinks] = useState('');
    const [imageFiles, setImageFiles] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchBookings();
        fetchServices();
    }, []);

    const fetchBookings = async () => {
        try {
            const data = await getSellerBookings();
            if (Array.isArray(data)) {
                setBookings(data);
            } else {
                setBookings([]);
                console.error('Invalid bookings data:', data);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            showToast('Failed to load bookings', 'error');
        }
    };

    const fetchServices = async () => {
        try {
            const data = await getMyServices();
            if (Array.isArray(data)) {
                setServices(data);
            } else {
                setServices([]);
                console.error('Invalid services data:', data);
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            showToast('Failed to load services', 'error');
        }
    };

    const handleStatusUpdate = async (bookingId, status) => {
        try {
            const res = await updateBookingStatus(bookingId, status);
            if (res.booking) {
                showToast(`Booking ${status} successfully!`, 'success');
                fetchBookings();
            } else {
                showToast('Failed to update booking status', 'error');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            showToast('Error updating booking status', 'error');
        }
    };

    const handleComplete = async (bookingId) => {
        if (!window.confirm('Are you sure you want to mark this booking as completed?')) return;
        try {
            const res = await completeBooking(bookingId);
            if (res.booking) {
                showToast('Booking marked as completed!', 'success');
                fetchBookings();
            } else {
                showToast('Failed to complete booking', 'error');
            }
        } catch (error) {
            console.error('Error completing booking:', error);
            showToast('Error completing booking', 'error');
        }
    };

    const handlePayment = async (bookingId, status) => {
        if (!window.confirm(`Mark this booking as ${status}?`)) return;
        try {
            const res = await updatePaymentStatus(bookingId, status);
            if (res.message) {
                showToast('Payment status updated!', 'success');
                fetchBookings();
            }
        } catch (error) {
            console.error('Error updating payment:', error);
            showToast('Error updating payment status', 'error');
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
            const data = await uploadProfilePicture(formData);
            if (data.profile_picture) {
                showToast('Profile picture updated!', 'success');
                updateUser({ profile_picture: data.profile_picture });
            } else {
                showToast('Failed to update profile picture', 'error');
            }
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            showToast('Error uploading profile picture', 'error');
        }
    };

    const openModal = (service = null) => {
        if (service) {
            setEditingService(service);
            setFormData({
                title: service.title,
                description: service.description,
                price: service.price,
                category: service.category,
                location: service.location || ''
            });
            setImageLinks('');
        } else {
            setEditingService(null);
            setFormData({
                title: '',
                description: '',
                price: '',
                category: 'Photography',
                location: ''
            });
            setImageLinks('');
        }
        setImageFiles([]);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
                                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Current Images</label>
                                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            {editingService.images.map((img, idx) => (
                                                <div key={idx} style={{ position: 'relative' }}>
                                                    <img src={img} alt="Service" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.25rem' }} />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteImage(img)}
                                                        style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', width: '20px', height: '20px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div >
                                )}

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>{editingService ? 'Add More Images' : 'Portfolio Images (Upload)'}</label>
                                    <input type="file" accept="image/*" multiple onChange={handleFileChange} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #334155', background: '#0f172a', color: 'white' }} />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Image Links (Comma separated)</label>
                                    <input type="text" value={imageLinks} onChange={(e) => setImageLinks(e.target.value)} placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg" style={{ width: '100%', padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #334155', background: '#0f172a', color: 'white' }} />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{editingService ? 'Update Service' : 'Create Service'}</button>
                            </form >
                        </div >
                    </div >
                )
            }
        </div >
    );
};

export default Dashboard;
