const API_URL = 'http://localhost:5002/api';

async function testCreateEmployee() {
    try {
        // 1. Login as Admin
        console.log("Logging in as admin...");
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        const loginData = await loginRes.json();

        if (!loginData.success) {
            console.error("Login Failed:", loginData);
            return;
        }

        const token = loginData.token;
        console.log("Login Successful! Token:", token.substring(0, 10) + "...");

        // 1.5 Ping
        console.log("\nPinging API...");
        const pingRes = await fetch(`${API_URL}/ping`);
        console.log("Ping Status:", pingRes.status);
        if (pingRes.ok) console.log("Ping Response:", await pingRes.text());

        // 1.8 Get Employees
        console.log("\nFetching employees...");
        const getRes = await fetch(`${API_URL}/admin/employees`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log("Get Employees Status:", getRes.status);
        if (getRes.status !== 200) console.log("Get Employees Body:", await getRes.text());


        // 2. Try to Create Employee
        console.log("\nAttempting to create employee...");
        const empData = {
            username: `test_emp_${Date.now()}`,
            password: 'password123',
            branch: 'Test Branch'
        };

        const createRes = await fetch(`${API_URL}/admin/employees`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(empData)
        });

        console.log("Create Response Status:", createRes.status);
        const text = await createRes.text();
        try {
            console.log("Create Response Body:", JSON.parse(text));
        } catch (e) {
            console.log("Create Response Body (Text):", text.substring(0, 500)); // Print first 500 chars
        }

    } catch (err) {
        console.error("Test Failed:", err);
    }
}

testCreateEmployee();
