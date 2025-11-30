import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/api';

import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

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
                navigate('/register', { state: { googleData: data.googleData } });
            }
        } catch (error) {
            console.error('Google Auth Error', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = await loginUser(formData);
            if (data.token) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                alert('Login successful!');
                // Redirect based on role
                if (data.user.role === 'seller') {
                    navigate('/dashboard');
                } else {
                    navigate('/customer-dashboard');
                }
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login.');
        }
    };

    return (
        <div className="container" style={{ paddingTop: '100px', maxWidth: '500px' }}>
            <div className="card">
                <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome Back</h2>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log('Login Failed')} />
                </div>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#94a3b8' }}>OR</div>
                <form onSubmit={handleSubmit}>
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
                    <div style={{ marginBottom: '2rem' }}>
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
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Login
                    </button>
                </form>
                <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#94a3b8' }}>
                    Don't have an account? <Link to="/register" style={{ color: '#6366f1' }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
