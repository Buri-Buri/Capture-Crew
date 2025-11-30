import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings } from '../utils/api';

const CustomerDashboard = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [bookings, setBookings] = useState([]);

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
                                <p>Status: <span style={{ color: booking.status === 'pending' ? '#fbbf24' : '#10b981' }}>{booking.status}</span></p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card" style={{ marginTop: '1rem', textAlign: 'center', color: '#94a3b8' }}>
                        No bookings yet. Start exploring!
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerDashboard;
