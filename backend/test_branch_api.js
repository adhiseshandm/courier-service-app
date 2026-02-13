const API_URL = 'http://localhost:5001/api';

async function testBranchFilters() {
    try {
        console.log('1. Logging in as Admin...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        const loginData = await loginRes.json();

        if (!loginData.success) {
            throw new Error(`Login failed: ${loginData.error}`);
        }

        const token = loginData.token;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        console.log('   Success! Token received.');

        console.log('\n2. Fetching Stats (All Branches)...');
        const statsAllRes = await fetch(`${API_URL}/admin/stats`, { headers });
        const statsAll = await statsAllRes.json();
        console.log(`   Total Bookings: ${statsAll.totalBookings}`);
        console.log(`   Total Revenue: ${statsAll.totalRevenue}`);

        console.log('\n3. Fetching Stats (Mettupalayam)...');
        const statsMetRes = await fetch(`${API_URL}/admin/stats?branch=Mettupalayam`, { headers });
        const statsMet = await statsMetRes.json();
        console.log(`   Total Bookings: ${statsMet.totalBookings}`);
        console.log(`   Total Revenue: ${statsMet.totalRevenue}`);

        console.log('\n4. Fetching Employees (Mettupalayam)...');
        const empsMetRes = await fetch(`${API_URL}/admin/employees?branch=Mettupalayam`, { headers });
        const empsMet = await empsMetRes.json();
        console.log(`   Employees Found: ${empsMet.length}`);
        empsMet.forEach(e => console.log(`   - ${e.username} (${e.branch})`));

        console.log('\n5. Fetching Employees (All Branches)...');
        const empsAllRes = await fetch(`${API_URL}/admin/employees`, { headers });
        const empsAll = await empsAllRes.json();
        console.log(`   Employees Found: ${empsAll.length}`);

    } catch (error) {
        console.error('Test Failed:', error.message);
    }
}

testBranchFilters();
