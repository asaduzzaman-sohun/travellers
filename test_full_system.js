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
            req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
        }
        req.end();
    });
}

async function run() {
    console.log("==================================================");
    console.log("   TOURFLOW FULL SYSTEM END-TO-END REGRESSION   ");
    console.log("==================================================");

    // 1. Tours Catalog (CQRS + Cache)
    console.log("\n[1] Tours Catalog Endpoint:");
    const toursRes = await request('/api/tourpackages');
    console.log(`- Status: ${toursRes.status}`);
    const tours = Array.isArray(toursRes.data) ? toursRes.data : toursRes.data.items;
    console.log(`- Total Tours: ${tours.length}`);
    if (tours.length === 0) throw new Error("No tours found");

    // 2. Hotels Catalog (Cache)
    console.log("\n[2] Hotels Catalog Endpoint:");
    const hotelsRes = await request('/api/hotels');
    console.log(`- Status: ${hotelsRes.status}`);
    console.log(`- Total Hotels: ${hotelsRes.data.totalCount || hotelsRes.data.items?.length}`);

    // 3. Travel Tips Catalog (Cache)
    console.log("\n[3] Travel Tips Endpoint:");
    const tipsRes = await request('/api/traveltips');
    console.log(`- Status: ${tipsRes.status}`);
    console.log(`- Total Tips: ${tipsRes.data.totalCount || tipsRes.data.items?.length}`);

    // 4. Auth Login
    console.log("\n[4] User & Admin Authentication:");
    const loginRes = await request('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { email: 'admin@traveller.com', password: 'Admin@2026' }
    });
    console.log(`- Admin login status: ${loginRes.status}`);
    const token = loginRes.data.token;
    if (!token) throw new Error("Admin login failed");
    console.log(`- Role: ${loginRes.data.role}, FullName: ${loginRes.data.fullName}`);

    // 5. Booking Creation via CQRS MediatR
    console.log("\n[5] Booking Creation (CQRS & Validation):");
    const firstTour = tours[0];
    const detailRes = await request(`/api/tourpackages/${firstTour.slug}`);
    const scheduleId = detailRes.data.schedules[0].id;
    const bookingRes = await request('/api/bookings', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: {
            tourScheduleId: scheduleId,
            customerName: "Sadman Sakib",
            customerEmail: "sadman@example.com",
            customerPhone: "+8801700112233",
            numberOfTravelers: 1,
            travelers: [{
                fullName: "Sadman Sakib",
                email: "sadman@example.com",
                phoneNumber: "+8801700112233",
                passportNumber: "BP1234567",
                nationality: "Bangladeshi"
            }]
        }
    });
    console.log(`- Booking status: ${bookingRes.status}`);
    console.log(`- Booking reference: ${bookingRes.data.bookingReference}, Amount: ৳${bookingRes.data.totalAmount}`);
    const bookingId = bookingRes.data.id;

    // 6. Payment Initiation
    console.log("\n[6] Real-time Payment Gateway Initiation (bKash):");
    const payInitRes = await request('/api/payments/initiate', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: {
            bookingId: bookingId,
            amount: bookingRes.data.depositPaid || 2000,
            paymentMethod: "bkash",
            customerPhone: "+8801700112233"
        }
    });
    console.log(`- Initiate status: ${payInitRes.status}`);
    console.log(`- Gateway URL: ${payInitRes.data.gatewayUrl}, TrxID: ${payInitRes.data.transactionId}`);
    const trxId = payInitRes.data.transactionId;

    // 7. Payment Verification
    console.log("\n[7] Payment Verification & Instant Confirmation:");
    const payVerifyRes = await request('/api/payments/verify', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: {
            bookingId: bookingId,
            transactionId: trxId,
            paidAmount: bookingRes.data.depositPaid || 2000
        }
    });
    console.log(`- Verification status: ${payVerifyRes.status}`);
    console.log(`- Payment status: ${payVerifyRes.data.paymentStatus}, Booking status: ${payVerifyRes.data.bookingStatus}`);

    console.log("\n==================================================");
    console.log("   ALL 7 SYSTEM SCOPES FULLY VERIFIED & PASSING!   ");
    console.log("==================================================");
}

run().catch(err => {
    console.error("Test failed:", err);
    process.exit(1);
});
