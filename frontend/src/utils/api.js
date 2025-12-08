export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const registerUser = async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    return response.json();
};

export const loginUser = async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    return response.json();
};

export const createService = async (serviceData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/services`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: serviceData,
    });
    return response.json();
};

export const getMyServices = async () => {
    const response = await fetch(`${API_URL}/services/my-services`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return response.json();
};

export const getAllServices = async (options = {}) => {
    const queryParams = new URLSearchParams();

    if (options.search) queryParams.append('search', options.search);
    if (options.category) queryParams.append('category', options.category);
    if (options.location) queryParams.append('location', options.location);

    const url = `${API_URL}/services?${queryParams.toString()}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
};

export const createBooking = async (bookingData) => {
    const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(bookingData),
    });
    return response.json();
};

export const getMyBookings = async () => {
    const response = await fetch(`${API_URL}/bookings/my-bookings`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return response.json();
};

export const updateService = async (id, formData) => {
    const response = await fetch(`${API_URL}/services/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
    });
    return response.json();
};

export const deleteService = async (id) => {
    const response = await fetch(`${API_URL}/services/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.json();
};

export const getSellerBookings = async () => {
    const response = await fetch(`${API_URL}/bookings/seller-bookings`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return response.json();
};

export const updateBookingStatus = async (bookingId, status) => {
    const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
    });
    return response.json();
};

export const sendMessage = async (data) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return res.json();
};

export const getConversations = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/messages/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
};

export const getMessages = async (userId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/messages/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    return res.json();
};

export const updatePaymentStatus = async (bookingId, status) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/bookings/${bookingId}/payment`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ payment_status: status })
    });
    return res.json();
};

export const completeBooking = async (bookingId) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/bookings/${bookingId}/complete`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return res.json();
};

export const getUserProfile = async () => {
    const response = await fetch(`${API_URL}/users/profile`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return response.json();
};

export const updateUserProfile = async (userData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: userData // FormData
    });
    return response.json();
};

export const addReview = async (reviewData) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/reviews`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
    });

    if (!res.ok) {
        const text = await res.text();
        try {
            const json = JSON.parse(text);
            return json; // Return error object from backend
        } catch (e) {
            throw new Error(`Server error: ${res.status} ${res.statusText}`);
        }
    }
    return res.json();
};

export const getServiceReviews = async (serviceId) => {
    const res = await fetch(`${API_URL}/reviews/service/${serviceId}`);
    return res.json();
};

export const deleteServiceImage = async (serviceId, imageUrl) => {
    const token = localStorage.getItem('token');
    const url = `${API_URL}/services/${serviceId}/images`;
    console.log('Deleting image at URL:', url);

    const res = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ imageUrl })
    });

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Failed to delete image');
        }
        return data;
    } else {
        const text = await res.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned unexpected response (likely 404). Please restart the backend server.');
    }
};


export const uploadProfilePicture = async (formData) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/users/profile-picture`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
    return res.json();
};
