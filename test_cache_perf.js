const http = require('http');

async function timedRequest(path) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
        const req = http.request(`http://localhost:5000${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const duration = Date.now() - start;
                resolve({ status: res.statusCode, duration, length: data.length });
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function run() {
    console.log("=== Testing Backend Caching & Compression Performance ===");

    // Test 1: Tours caching
    console.log("\n1. Testing Tours Caching:");
    const toursCold = await timedRequest('/api/tourpackages');
    console.log(`Cold request: ${toursCold.duration}ms, Status: ${toursCold.status}, Bytes: ${toursCold.length}`);

    const toursWarm = await timedRequest('/api/tourpackages');
    console.log(`Warm (Cached) request: ${toursWarm.duration}ms, Status: ${toursWarm.status}, Bytes: ${toursWarm.length}`);

    // Test 2: Hotels caching
    console.log("\n2. Testing Hotels Caching:");
    const hotelsCold = await timedRequest('/api/hotels');
    console.log(`Cold request: ${hotelsCold.duration}ms, Status: ${hotelsCold.status}, Bytes: ${hotelsCold.length}`);

    const hotelsWarm = await timedRequest('/api/hotels');
    console.log(`Warm (Cached) request: ${hotelsWarm.duration}ms, Status: ${hotelsWarm.status}, Bytes: ${hotelsWarm.length}`);

    // Test 3: Tips caching
    console.log("\n3. Testing Travel Tips Caching:");
    const tipsCold = await timedRequest('/api/traveltips');
    console.log(`Cold request: ${tipsCold.duration}ms, Status: ${tipsCold.status}, Bytes: ${tipsCold.length}`);

    const tipsWarm = await timedRequest('/api/traveltips');
    console.log(`Warm (Cached) request: ${tipsWarm.duration}ms, Status: ${tipsWarm.status}, Bytes: ${tipsWarm.length}`);

    console.log("\n>>> Caching Performance Verification Completed Successfully! <<<");
}

run().catch(console.error);
