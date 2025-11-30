const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

async function test() {
    try {
        const email = `test${Date.now()}@example.com`;
        const username = `user${Date.now()}`;
        const password = 'password123';

        // 0. Register
        console.log('Registering...');
        const regRes = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, role: 'seller' })
        });
        const regData = await regRes.json();
        console.log('Register Status:', regRes.status, regData);

        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status);

        if (!loginData.token) {
            console.error('Login failed:', loginData);
            return;
        }
        const token = loginData.token;

        // 2. Create Service with Image
        console.log('Creating Service...');
        const form = new FormData();
        form.append('title', 'Test Service');
        form.append('description', 'Test Description');
        form.append('price', '100');
        form.append('category', 'Photography');

        fs.writeFileSync('test.jpg', 'dummy content');
        form.append('image', fs.createReadStream('test.jpg'));

        const res = await fetch('http://localhost:5000/api/services', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                ...form.getHeaders()
            },
            body: form
        });

        console.log('Create Service Status:', res.status);
        const text = await res.text();
        console.log('Create Service Response:', text);

    } catch (error) {
        console.error('Test Error:', error);
    }
}

test();
