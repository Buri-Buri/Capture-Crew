import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPublicProfile } from '../utils/api';

const PublicProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getPublicProfile(id);
                setUser(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching profile:', error);
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    if (loading) return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Loading...</div>;
    if (!user) return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>User not found</div>;

    return (
        <div className="container" style={{ paddingTop: '100px', maxWidth: '800px' }}>
            <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '1rem' }}>&larr; Back</button>

            <div className="card">
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', border: '4px solid var(--muted)', flexShrink: 0, margin: '0 auto' }}>
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
                            <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>{user.username}</h2>
                            <div style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '1rem', background: 'var(--muted)', fontSize: '0.9rem', textTransform: 'capitalize' }}>
                                {user.role}
                            </div>
                        </div>

                        {user.bio ? (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', display: 'block', marginBottom: '0.25rem' }}>About Me</label>
                                <p style={{ lineHeight: '1.6' }}>{user.bio}</p>
                            </div>
                        ) : (
                            <div style={{ marginBottom: '1.5rem', fontStyle: 'italic', color: 'var(--muted-foreground)' }}>
                                No bio available.
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

export default PublicProfile;
