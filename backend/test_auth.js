const http = require('http');

const postRequest = (path, data) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                resolve({ status: res.statusCode, body: JSON.parse(body) });
            });
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
};

const testAuth = async () => {
    try {
        console.log('Testing Registration...');
        const regData = JSON.stringify({
            username: 'testuser_' + Date.now(),
            email: 'test_' + Date.now() + '@example.com',
            password: 'password123',
            role: 'customer'
        });

        const regRes = await postRequest('/api/auth/register', regData);
        console.log('Registration Status:', regRes.status);
        console.log('Registration Body:', regRes.body);

        if (regRes.status === 201) {
            console.log('Testing Login...');
            const loginData = JSON.stringify({
                email: JSON.parse(regData).email,
                password: 'password123'
            });

            const loginRes = await postRequest('/api/auth/login', loginData);
            console.log('Login Status:', loginRes.status);
            console.log('Login Body:', loginRes.body);
        }
    } catch (error) {
        console.error('Test failed:', error);
    }
};

// Wait for server to start
setTimeout(testAuth, 2000);
