const API_URL = 'https://courier-backend-0ord.onrender.com/api';



const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

export const calculateRate = async (data) => {
    const response = await fetch(`${API_URL}/calculate-rates`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return response.json();
};

export const sendOtp = async (data) => {
    // Determine if data is object or just phone string (backward compatibility)
    const payload = typeof data === 'object' ? data : { phone: data };

    const response = await fetch(`${API_URL}/send-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    });
    return response.json();
};


export const bookConsignment = async (data) => {
    const response = await fetch(`${API_URL}/book`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return response.json();
};

export const getDashboardStats = async (branch) => {
    const url = branch ? `${API_URL}/admin/stats?branch=${encodeURIComponent(branch)}` : `${API_URL}/admin/stats`;
    const response = await fetch(url, {
        headers: getHeaders()
    });
    return response.json();
};

export const exportReport = async (branch) => {
    const url = branch ? `${API_URL}/admin/export-excel?branch=${encodeURIComponent(branch)}` : `${API_URL}/admin/export-excel`;
    const response = await fetch(url, {
        headers: getHeaders()
    });
    const blob = await response.blob();
    const urlBlob = window.URL.createObjectURL(blob); // Renamed to avoid conflict
    const a = document.createElement('a');
    a.href = urlBlob;
    a.download = `monthly-report-${branch || 'all'}.xlsx`;
    a.click();
};

export const getEmployees = async (branch) => {
    const url = branch ? `${API_URL}/admin/employees?branch=${encodeURIComponent(branch)}` : `${API_URL}/admin/employees`;
    const response = await fetch(url, { headers: getHeaders() });
    return response.json();
};

export const createEmployee = async (data) => {
    const response = await fetch(`${API_URL}/admin/employees`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return response.json();
};

export const getRates = async () => {
    const response = await fetch(`${API_URL}/admin/rates`, { headers: getHeaders() });
    return response.json();
};

export const updateRate = async (data) => {
    const response = await fetch(`${API_URL}/admin/rates`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return response.json();
};


export const sendDailyReport = async () => {
    const response = await fetch(`${API_URL}/admin/daily-report`, {
        method: 'POST',
        headers: getHeaders(),
    });
    return response.json();
};

export const getLabelUrl = (consignmentId) => {
    const token = localStorage.getItem('token');
    return `${API_URL}/label/${consignmentId}?token=${token}`; // Assuming backend can handle token in query or we use fetch with headers for blob
};

export const downloadLabel = async (consignmentId) => {
    const response = await fetch(`${API_URL}/label/${consignmentId}`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to generate label');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
};
