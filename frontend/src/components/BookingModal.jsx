import React, { useState } from 'react';

const BookingModal = ({ isOpen, onClose, onConfirm }) => {
    const [date, setDate] = useState('');
    const [contactInfo, setContactInfo] = useState('');
    const [location, setLocation] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (date && contactInfo && location) {
            onConfirm(date, contactInfo, location);
            setDate('');
            setContactInfo('');
            setLocation('');
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#1e293b',
                padding: '2rem',
                borderRadius: '0.5rem',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                position: 'relative'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                    &times;
                </button>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>Book Service</h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Select Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.25rem',
                                border: '1px solid #334155',
                                backgroundColor: '#0f172a',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Contact Information</label>
                        <input
                            type="text"
                            value={contactInfo}
                            onChange={(e) => setContactInfo(e.target.value)}
                            required
                            placeholder="Phone or Email"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.25rem',
                                border: '1px solid #334155',
                                backgroundColor: '#0f172a',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8' }}>Event Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                            placeholder="Address or Venue"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.25rem',
                                border: '1px solid #334155',
                                backgroundColor: '#0f172a',
                                color: 'white',
                                outline: 'none'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-outline"
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ padding: '0.5rem 1rem' }}
                        >
                            Confirm Booking
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;
