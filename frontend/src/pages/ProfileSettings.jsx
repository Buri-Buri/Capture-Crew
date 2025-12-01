import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../utils/api';

const ProfileSettings = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        username: '',
        bio: '',
        experience: '',
        profile_picture: ''
    });
    const [role, setRole] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await getUserProfile();
            setUser({
                username: data.username || '',
                bio: data.bio || '',
                experience: data.experience || '',
                profile_picture: data.profile_picture || ''
            });
            setRole(data.role);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('username', user.username);
        formData.append('bio', user.bio);
        if (role === 'seller') {
            formData.append('experience', user.experience);
        }
        if (selectedFile) {
            formData.append('profile_picture', selectedFile);
        }

        try {
            const res = await updateUserProfile(formData);
            if (res.user) {
                alert('Profile updated successfully!');
                // Update local storage user data if needed
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({ ...currentUser, ...res.user }));
                navigate(role === 'seller' ? '/dashboard' : '/customer-dashboard');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    };

    if (loading) return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Loading...</div>;

    return (
        <div className="container" style={{ paddingTop: '100px', maxWidth: '600px' }}>
            <div className="card">
                <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Profile Settings</h2>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                    <div style={{ position: 'relative', width: '120px', height: '120px' }}>
                        <img
                            src={preview || user.profile_picture || 'https://via.placeholder.com/150'}
                            alt="Profile"
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                        />
                        <label htmlFor="file-upload" style={{
                            position: 'absolute', bottom: '0', right: '0',
                            background: 'var(--primary)', color: 'white',
                            padding: '0.5rem', borderRadius: '50%', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px'
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                        </label>
                        <input id="file-upload" type="file" onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Username</label>
                        <input
                            type="text"
                            value={user.username}
                            onChange={(e) => setUser({ ...user, username: e.target.value })}
                            required
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Bio</label>
                        <textarea
                            value={user.bio}
                            onChange={(e) => setUser({ ...user, bio: e.target.value })}
                            rows="4"
                            placeholder="Tell us about yourself..."
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', resize: 'vertical' }}
                        />
                    </div>

                    {role === 'seller' && (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Experience</label>
                            <textarea
                                value={user.experience}
                                onChange={(e) => setUser({ ...user, experience: e.target.value })}
                                rows="3"
                                placeholder="Describe your professional experience..."
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', resize: 'vertical' }}
                            />
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                        <button type="button" onClick={() => navigate(-1)} className="btn btn-outline" style={{ flex: 1 }}>Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileSettings;
