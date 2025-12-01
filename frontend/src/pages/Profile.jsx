import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../utils/api';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await getUserProfile();
            setUser(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setLoading(false);
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Loading...</div>;
    if (!user) return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>User not found</div>;

    return (
        <div className="container" style={{ paddingTop: '100px', maxWidth: '800px' }}>
            <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h2 style={{ margin: 0 }}>My Profile</h2>
                    <button onClick={() => navigate('/profile/settings')} className="btn btn-outline">
                        Edit Profile
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', border: '4px solid var(--muted)', flexShrink: 0 }}>
                        {user.profile_picture ? (
                            <img src={user.profile_picture} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: 'var(--muted-foreground)' }}>
                                {user.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', display: 'block', marginBottom: '0.25rem' }}>Username</label>
                            <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{user.username}</div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', display: 'block', marginBottom: '0.25rem' }}>Email</label>
                            <div style={{ fontSize: '1.1rem' }}>{user.email}</div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', display: 'block', marginBottom: '0.25rem' }}>Role</label>
                            <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '1rem', background: 'var(--muted)', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                                {user.role}
                            </div>
                        </div>

                        {user.bio && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', display: 'block', marginBottom: '0.25rem' }}>Bio</label>
                                <p style={{ lineHeight: '1.6' }}>{user.bio}</p>
                            </div>
                        )}

                        {user.role === 'seller' && user.experience && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', display: 'block', marginBottom: '0.25rem' }}>Experience</label>
                                <p style={{ lineHeight: '1.6' }}>{user.experience}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
