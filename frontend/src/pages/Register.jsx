import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { registerUser } from '../utils/api';

import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'customer'
    });

    useEffect(() => {
        if (location.state && location.state.googleData) {
            setFormData(prev => ({
                ...prev,
                username: location.state.googleData.username,
                email: location.state.googleData.email
            }));
            alert('Please complete your registration (Role & Password).');
        }
    }, [location.state]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const res = await fetch('http://localhost:5000/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential })
            });
            const data = await res.json();
            if (res.status === 200) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                alert('Login successful!');
                if (data.user.role === 'seller') navigate('/dashboard');
                else navigate('/customer-dashboard');
            } else if (res.status === 202) {
                setFormData({
                    ...formData,
                    username: data.googleData.username,
                    email: data.googleData.email
                });
                alert('Please complete your registration (Role & Password).');
            }
        } catch (error) {
            console.error('Google Auth Error', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await registerUser(formData);
            if (data.userId) {
                alert('Registration successful! Please login.');
                navigate('/login');
            } else {
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('An error occurred during registration.');
        }
    };

    return (
        <div className="container" style={{ paddingTop: '100px', maxWidth: '500px' }}>
            <div className="card">
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h2>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log('Login Failed')} />
                </div>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#94a3b8' }}>OR</div>
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #334155',
                                backgroundColor: '#0f172a',
                                color: 'white'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #334155',
                                backgroundColor: '#0f172a',
                                color: 'white'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #334155',
                                backgroundColor: '#0f172a',
                                color: 'white'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>I want to...</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #334155',
                                backgroundColor: '#0f172a',
                                color: 'white'
                            }}
                        >
                            <option value="customer">Hire Professionals</option>
                            <option value="seller">Offer Services</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Sign Up
                    </button>
                </form>
                <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>
                    Already have an account? <Link to="/login" style={{ color: '#6366f1' }}>Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
