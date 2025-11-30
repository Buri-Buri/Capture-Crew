const API_URL = 'http://localhost:5000/api';

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
    console.log('Response status:', response.status);
    const text = await response.text();
    console.log('Response text:', text);
    return JSON.parse(text);
};

export const getMyServices = async () => {
    const response = await fetch(`${API_URL}/services/my-services`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });
    return response.json();
};

export const getAllServices = async () => {
    console.log('Fetching services from:', `${API_URL}/services`);
    const response = await fetch(`${API_URL}/services`, {
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
