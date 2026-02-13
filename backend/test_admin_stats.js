
async function testAdminStats() {
    try {
        // 1. Login
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login Status:', loginRes.status);
        if (!token) {
            console.error('Login Failed:', loginData);
            return;
        }
        console.log('Token Received');

        // 2. Fetch Stats
        const statsRes = await fetch('http://localhost:5001/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Stats Response Status:', statsRes.status);
        const statsData = await statsRes.json();
        console.log('Stats Data:', JSON.stringify(statsData, null, 2));

    } catch (error) {
        console.error('Test Failed:', error);
    }
}

testAdminStats();
