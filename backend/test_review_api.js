const http = require('http');

const testEndpoints = [
    { path: '/', method: 'GET' },
    { path: '/api/reviews', method: 'POST', body: { test: 'data' } }
];

const makeRequest = (options, body) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, data }));
        });

        req.on('error', (e) => reject(e));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
};

const runTests = async () => {
    console.log('Starting API Tests...');

    for (const endpoint of testEndpoints) {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: endpoint.path,
            method: endpoint.method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        try {
            console.log(`Testing ${endpoint.method} ${endpoint.path}...`);
            const result = await makeRequest(options, endpoint.body);
            console.log(`Status: ${result.statusCode}`);
            console.log(`Response: ${result.data.substring(0, 100)}...`); // Truncate response
        } catch (error) {
            console.error(`Error testing ${endpoint.path}:`, error.message);
        }
        console.log('---');
    }
};

runTests();
