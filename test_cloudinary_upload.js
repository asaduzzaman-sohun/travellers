const http = require('http');

async function request(path, options = {}) {
    return new Promise((resolve, reject) => {
        const req = http.request(`http://localhost:5000${path}`, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = data;
                try { parsed = JSON.parse(data); } catch(e) {}
                resolve({ status: res.statusCode, data: parsed });
            });
        });
        req.on('error', reject);
        if (options.body) {
            req.write(options.body);
        }
        req.end();
    });
}

async function run() {
    console.log("=== Testing Cloudinary Image Upload Integration ===");

    // 1. Login to get token
    console.log("\n1. Logging in as admin...");
    const loginRes = await request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@traveller.com', password: 'Admin@2026' })
    });

    if (loginRes.status !== 200 || !loginRes.data.token) {
        console.error("Login failed:", loginRes);
        process.exit(1);
    }
    const token = loginRes.data.token;
    console.log("Authenticated successfully.");

    // 2. Prepare a valid 1x1 PNG image buffer
    // Valid PNG signature: 89 50 4E 47 0D 0A 1A 0A
    const validPngBuffer = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG Header
        0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
        0x49, 0x48, 0x44, 0x52, // "IHDR"
        0x00, 0x00, 0x00, 0x01, // width: 1
        0x00, 0x00, 0x00, 0x01, // height: 1
        0x08, 0x06, 0x00, 0x00, 0x00, // bit depth, colortype, etc.
        0x1F, 0x15, 0xC4, 0x89, // CRC
        0x00, 0x00, 0x00, 0x0A, // IDAT chunk length
        0x49, 0x44, 0x41, 0x54, // "IDAT"
        0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00, 0x05, 0x00, 0x01, // compressed data
        0x0D, 0x0A, 0x2D, 0xB4, // CRC
        0x00, 0x00, 0x00, 0x00, // IEND chunk length
        0x49, 0x45, 0x4E, 0x44, // "IEND"
        0xAE, 0x42, 0x60, 0x82  // CRC
    ]);

    // 3. Construct multipart/form-data body
    const boundary = '---------------------------CloudinaryTestBoundary' + Date.now();
    const preamble = Buffer.from(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="file"; filename="test_avatar.png"\r\n` +
        `Content-Type: image/png\r\n\r\n`
    );
    const postamble = Buffer.from(`\r\n--${boundary}--\r\n`);
    const fullBody = Buffer.concat([preamble, validPngBuffer, postamble]);

    console.log("\n2. Uploading image to POST /api/blogposts/upload-image...");
    const uploadRes = await request('/api/blogposts/upload-image', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': fullBody.length
        },
        body: fullBody
    });

    console.log(`Upload status: ${uploadRes.status}`);
    console.log("Response payload:", JSON.stringify(uploadRes.data, null, 2));

    if (uploadRes.status === 200 && uploadRes.data.url) {
        console.log("\n>>> SUCCESS! Image uploaded to Cloudinary: <<<");
        console.log(`Provider: ${uploadRes.data.provider}`);
        console.log(`Public ID: ${uploadRes.data.publicId}`);
        console.log(`Cloudinary CDN URL: ${uploadRes.data.url}`);

        if (uploadRes.data.url.includes("cloudinary.com")) {
            console.log("\nVERIFIED: Image hosted on Cloudinary CDN for cloud 'dcrun2n7j'.");
        }
    } else {
        console.error("Upload failed!", uploadRes);
        process.exit(1);
    }
}

run().catch(err => {
    console.error("Error:", err);
    process.exit(1);
});
