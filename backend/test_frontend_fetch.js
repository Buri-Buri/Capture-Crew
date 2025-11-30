const fetch = require('node-fetch');

async function testFetch() {
    try {
        console.log('Fetching services...');
        const response = await fetch('http://localhost:5000/api/services', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        console.log('Status:', response.status);
        const data = await response.json();
        console.log('Is Array:', Array.isArray(data));
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Fetch Error:', error);
    }
}

testFetch();
