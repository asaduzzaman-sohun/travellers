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
    console.log("=== Testing Scope 2: CQRS & FluentValidation ===");

    // 1. Test GetToursQuery via MediatR
    console.log("\n1. Testing GetToursQuery via MediatR (GET /api/tourpackages)...");
    const toursRes = await request('/api/tourpackages?pageSize=3');
    console.log(`Status: ${toursRes.status}`);
    const toursList = Array.isArray(toursRes.data) ? toursRes.data : toursRes.data.items;
    if (toursRes.status === 200 && toursList && toursList.length > 0) {
        console.log(`SUCCESS: Fetched ${toursList.length} tours through MediatR query pipeline.`);
    } else {
        console.error("FAILED GetToursQuery", toursRes);
        process.exit(1);
    }

    const firstTour = toursList[0];
    console.log(`Fetching tour detail for slug: ${firstTour.slug}...`);
    const detailRes = await request(`/api/tourpackages/${firstTour.slug}`);
    const scheduleId = detailRes.data.schedules && detailRes.data.schedules.length > 0 ? detailRes.data.schedules[0].id : null;
    console.log(`Using tour: ${detailRes.data.title}, scheduleId: ${scheduleId}`);

    if (!scheduleId) {
        console.error("No schedule found to test booking!");
        process.exit(1);
    }

    // 2. Test FluentValidation Failure (ValidationExceptionMiddleware)
    console.log("\n2. Testing FluentValidation failure on CreateBookingCommand (POST /api/bookings)...");
    const invalidBookingPayload = {
        tourScheduleId: scheduleId,
        customerName: "", // Invalid: empty
        customerEmail: "not-an-email", // Invalid
        customerPhone: "",
        numberOfTravelers: 0 // Invalid: must be at least 1
    };

    const invalidRes = await request('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: invalidBookingPayload
    });

    console.log(`Invalid booking status: ${invalidRes.status}`);
    console.log("Response body:", JSON.stringify(invalidRes.data, null, 2));

    if (invalidRes.status === 400 && invalidRes.data.errors) {
        console.log("SUCCESS: ValidationException caught and returned 400 with formatted validation errors:", Object.keys(invalidRes.data.errors));
    } else {
        console.error("FAILED to trigger FluentValidation properly", invalidRes);
        process.exit(1);
    }

    // 3. Test Valid CreateBookingCommand via MediatR
    console.log("\n3. Testing Valid CreateBookingCommand via MediatR (POST /api/bookings)...");
    const validBookingPayload = {
        tourScheduleId: scheduleId,
        customerName: "Rahim Chowdhury",
        customerEmail: "rahim.chowdhury@testcqrs.com",
        customerPhone: "+8801712345678",
        numberOfTravelers: 1,
        dietaryRequirements: "Halal",
        specialRequests: "Window seat if available",
        emergencyContactName: "Karim Chowdhury",
        emergencyContactPhone: "+8801812345678",
        travelers: [
            {
                fullName: "Rahim Chowdhury",
                email: "rahim.chowdhury@testcqrs.com",
                phoneNumber: "+8801712345678",
                passportNumber: "A01928374",
                nationality: "Bangladeshi"
            }
        ]
    };

    const validRes = await request('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: validBookingPayload
    });

    console.log(`Valid booking status: ${validRes.status}`);
    console.log("Response body:", JSON.stringify(validRes.data, null, 2));

    if (validRes.status === 201 && validRes.data.bookingReference) {
        console.log(`SUCCESS: Booking created with reference ${validRes.data.bookingReference} and total price ${validRes.data.totalPrice}`);
    } else {
        console.error("FAILED Valid CreateBookingCommand", validRes);
        process.exit(1);
    }

    console.log("\n>>> ALL SCOPE 2 CQRS & FLUENTVALIDATION TESTS PASSED SUCCESSFULLY! <<<");
}

run().catch(err => {
    console.error("Error running test:", err);
    process.exit(1);
});
