import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllServices } from '../utils/api';

const Home = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const data = await getAllServices();
                if (Array.isArray(data)) {
                    setServices(data.slice(0, 3));
                } else {
                    console.error('Expected array from getAllServices, got:', data);
                    setServices([]);
                }
            } catch (error) {
                console.error('Error fetching services:', error);
                setServices([]);
            }
        };
        fetchServices();
    }, []);

    const handleSearch = () => {
        navigate(`/services?search=${encodeURIComponent(searchTerm)}`);
    };

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'var(--secondary)', color: 'var(--secondary-foreground)', borderRadius: '999px', fontSize: '0.875rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                        🎉 Your Event, Our Professionals
                    </div>
                    <h1>Find Perfect <br /> Photographers & Event Planners</h1>
                    <p>Connect with trusted professionals for your weddings, birthdays, corporate events, and more. Browse portfolios, compare prices, and book with confidence.</p>

                    <div className="search-bar" style={{ margin: '0 auto' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0.75rem', color: 'var(--muted-foreground)' }}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        <input
                            type="text"
                            placeholder="Search for photographers, event planners, or services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button onClick={handleSearch} className="btn btn-primary">Search</button>
                    </div>

                    <div className="stats">
                        <div className="stat-item">
                            <h3>500+</h3>
                            <p>Professional Photographers</p>
                        </div>
                        <div className="stat-item">
                            <h3>200+</h3>
                            <p>Event Planners</p>
                        </div>
                        <div className="stat-item">
                            <h3>10,000+</h3>
                            <p>Events Covered</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="section" style={{ background: 'var(--background)' }}>
                <div className="container">
                    <h2 className="section-title">Our Services</h2>
                    <p className="section-subtitle">Professional services tailored to make your events unforgettable</p>

                    <div className="grid">
                        <div className="card">
                            <div style={{ width: '48px', height: '48px', background: 'var(--muted)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                            </div>
                            <h3>Professional Photography</h3>
                            <p style={{ marginBottom: '1.5rem' }}>Capture your precious moments with expert photographers</p>
                            <ul style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--primary)' }}>✓</span> Wedding Photography</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--primary)' }}>✓</span> Corporate Events</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--primary)' }}>✓</span> Birthday Parties</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--primary)' }}>✓</span> Portrait Sessions</li>
                            </ul>
                        </div>
                        <div className="card">
                            <div style={{ width: '48px', height: '48px', background: 'var(--muted)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            </div>
                            <h3>Event Planning</h3>
                            <p style={{ marginBottom: '1.5rem' }}>Let experts handle every detail of your special event</p>
                            <ul style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--primary)' }}>✓</span> Full Event Coordination</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--primary)' }}>✓</span> Vendor Management</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--primary)' }}>✓</span> Budget Planning</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ color: 'var(--primary)' }}>✓</span> Day-of Coordination</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="section">
                <div className="container">
                    <h2 className="section-title">How It Works</h2>
                    <p className="section-subtitle">Book professionals in 4 simple steps</p>

                    <div className="steps">
                        <div className="step-item">
                            <div className="step-number">1</div>
                            <h4>Search & Browse</h4>
                            <p>Find professionals by location, budget, and event type</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">2</div>
                            <h4>Review Portfolios</h4>
                            <p>Check their work, read reviews, and compare prices</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">3</div>
                            <h4>Book & Confirm</h4>
                            <p>Send booking requests and receive confirmations</p>
                        </div>
                        <div className="step-item">
                            <div className="step-number">4</div>
                            <h4>Enjoy Your Event</h4>
                            <p>Relax while professionals handle everything</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Professionals */}
            <section className="section" style={{ background: 'var(--muted)', backgroundOpacity: 0.3 }}>
                <div className="container">
                    <h2 className="section-title">Featured Professionals</h2>
                    <p className="section-subtitle">Top-rated photographers and event planners in your area</p>

                    <div className="grid">
                        {services.length > 0 ? services.map((service) => (
                            <Link to={`/service/${service.id}`} className="pro-card" key={service.id} style={{ textDecoration: 'none', display: 'block' }}>
                                <div className="pro-avatar">
                                    {service.seller_image ? (
                                        <img src={service.seller_image} alt={service.seller_name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                    ) : (
                                        <div style={{ width: '100%', height: '100%', background: 'var(--muted)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--muted-foreground)' }}>
                                            {service.seller_name?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <h3>{service.title}</h3>
                                <div className="pro-rating">★ 4.8 (24 reviews)</div>
                                <div className="pro-details">
                                    <div className="pro-detail-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                                        {service.category}
                                    </div>
                                    <div className="pro-detail-item">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                                        {service.location}
                                    </div>
                                    <div style={{ marginTop: '1rem', fontWeight: '700', color: 'var(--foreground)' }}>
                                        ${service.price} <span style={{ fontWeight: '400', fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>per event</span>
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <p style={{ textAlign: 'center', gridColumn: '1 / -1', color: 'var(--muted-foreground)' }}>Loading professionals...</p>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
