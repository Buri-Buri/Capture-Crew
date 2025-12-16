import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../utils/api';
import logo from '../assets/logo.png';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check system preference or saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        } else {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [toast, setToast] = useState(null);
    const [lastNotificationId, setLastNotificationId] = useState(null);

    useEffect(() => {
        if (user) {
            fetchNotifications(true); // First fetch
            const interval = setInterval(() => fetchNotifications(false), 5000); // Poll every 5 seconds
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async (isFirstLoad = false) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_URL}/notifications`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
                setUnreadCount(data.filter(n => !n.is_read).length);

                if (data.length > 0) {
                    const latest = data[0];
                    // On first load, just set the ID. On subsequent polls, check if ID changed.
                    if (!isFirstLoad && lastNotificationId && latest.id !== lastNotificationId && !latest.is_read) {
                        setToast({
                            message: latest.content,
                            type: 'info', // You can map 'booking_request' -> 'success' etc if desired
                            id: latest.id // Pass ID to handle click
                        });

                        // Optional: Play a sound
                        const audio = new Audio('/notification.mp3'); // Ensure this file exists or remove
                        audio.play().catch(e => console.log('Audio play failed', e)); // Catch interaction errors
                    }
                    setLastNotificationId(latest.id);
                }
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        try {
            const token = localStorage.getItem('token');
            if (!notification.is_read) {
                await fetch(`${API_URL}/notifications/${notification.id}/read`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                // Update local state
                setNotifications(prev => prev.map(n =>
                    n.id === notification.id ? { ...n, is_read: true } : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }

            setShowNotifications(false);
            setToast(null); // Close toast if clicked

            // Navigate based on type
            if (notification.type === 'message') {
                navigate('/messages');
            } else if (notification.type === 'booking_request' || notification.type === 'booking_update') {
                if (user.role === 'seller') {
                    navigate('/dashboard');
                } else {
                    navigate('/customer-dashboard');
                }
            }
        } catch (error) {
            console.error('Error handling notification click:', error);
        }
    };

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            {toast && (
                <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 10000 }}>
                    <div
                        onClick={() => {
                            // Find the full notification object for the toast
                            const notification = notifications.find(n => n.id === toast.id);
                            if (notification) handleNotificationClick(notification);
                            else setToast(null);
                        }}
                        style={{
                            background: isDark ? '#1f2937' : 'white',
                            color: isDark ? 'white' : 'black',
                            padding: '16px',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            borderLeft: '4px solid #3B82F6',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            minWidth: '300px',
                            animation: 'slideIn 0.3s ease-out'
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>New Notification</div>
                            <div style={{ fontSize: '0.9rem' }}>{toast.message}</div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); setToast(null); }}
                            style={{ background: 'none', border: 'none', marginLeft: '10px', cursor: 'pointer', fontSize: '1.2rem', color: 'inherit', opacity: 0.7 }}
                        >
                            &times;
                        </button>
                    </div>
                </div>
            )}
            <div className="container nav-content">
                <Link to="/" className="logo">
                    <img src={logo} alt="CaptureCrew" style={{ height: '40px', width: 'auto' }} />
                    CaptureCrew
                </Link>
                <div className="nav-links">
                    <Link to="/services">Services</Link>
                    <Link to="/">How It Works</Link>

                    <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Dark Mode">
                        {isDark ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                        )}
                    </button>

                    {user ? (
                        <>
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '5px' }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                    {unreadCount > 0 && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '0',
                                            right: '0',
                                            background: 'red',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: '16px',
                                            height: '16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '10px',
                                            fontWeight: 'bold'
                                        }}>
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        right: '0',
                                        width: '300px',
                                        background: isDark ? '#1f2937' : 'white',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        zIndex: 1000,
                                        maxHeight: '400px',
                                        overflowY: 'auto'
                                    }}>
                                        <div style={{ padding: '10px', borderBottom: '1px solid var(--border)', fontWeight: 'bold' }}>
                                            Notifications
                                        </div>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)' }}>
                                                No notifications
                                            </div>
                                        ) : (
                                            notifications.map(notification => (
                                                <div
                                                    key={notification.id}
                                                    onClick={() => handleNotificationClick(notification)}
                                                    style={{
                                                        padding: '10px',
                                                        borderBottom: '1px solid var(--border)',
                                                        cursor: 'pointer',
                                                        background: notification.is_read ? 'transparent' : (isDark ? '#374151' : '#f3f4f6'),
                                                        transition: 'background 0.2s'
                                                    }}
                                                >
                                                    <div style={{ fontSize: '0.9rem' }}>{notification.content}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '4px' }}>
                                                        {new Date(notification.created_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>

                            <Link to={user.role === 'seller' ? "/dashboard" : "/customer-dashboard"} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                {user.profile_picture ? (
                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                                        <img src={user.profile_picture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
                                    </div>
                                ) : (
                                    <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0 }}>
                                        {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                )}
                                Dashboard
                            </Link>
                            <Link to="/profile" className="btn btn-outline" style={{ border: 'none', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                Profile
                            </Link>
                            <button onClick={handleLogout} className="btn btn-outline">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{ fontWeight: 600 }}>Login</Link>
                            <Link to="/register" className="btn btn-primary">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
