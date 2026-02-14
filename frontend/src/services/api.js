import config from '../config';

export const API_BASE_URL = config.API_BASE_URL;
const API_URL = config.API_BASE_URL;



export const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// Helper for timeout
const fetchWithTimeout = async (resource, options = {}) => {
    const { timeout = 8000 } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        if (error.name === 'AbortError') {
            throw new Error('Request timed out. Server is taking too long to respond.');
        }
        throw error;
    }
};

export const calculateRate = async (data) => {
    const response = await fetchWithTimeout(`${API_URL}/calculate-rates`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return response.json();
};




export const bookConsignment = async (data) => {
    const response = await fetchWithTimeout(`${API_URL}/book`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
    });
    return response.json();
};

export const trackConsignment = async (id) => {
    const response = await fetchWithTimeout(`${API_URL}/track/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' } // Public route, no token needed
    });
    return response.json();
};

export const getDashboardStats = async (branch) => {
    const url = branch ? `${API_URL}/admin/stats?branch=${encodeURIComponent(branch)}` : `${API_URL}/admin/stats`;
    const response = await fetchWithTimeout(url, {
        headers: getHeaders()
    });
    return response.json();
};

export const exportReport = async (branch) => {
    const url = branch ? `${API_URL}/admin/export-excel?branch=${encodeURIComponent(branch)}` : `${API_URL}/admin/export-excel`;
    const response = await fetchWithTimeout(url, {
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
    const response = await fetchWithTimeout(url, { headers: getHeaders() });
    return response.json();
};

export const createEmployee = async (data) => {
    const response = await fetchWithTimeout(`${API_URL}/admin/employees`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return response.json();
};

export const getRates = async () => {
    const response = await fetchWithTimeout(`${API_URL}/admin/rates`, { headers: getHeaders() });
    return response.json();
};

export const updateRate = async (data) => {
    const response = await fetchWithTimeout(`${API_URL}/admin/rates`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
    return response.json();
};


export const sendDailyReport = async () => {
    const response = await fetchWithTimeout(`${API_URL}/admin/daily-report`, {
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
    const response = await fetchWithTimeout(`${API_URL}/label/${consignmentId}`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to generate label');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
};

export const downloadInvoice = async (consignmentId) => {
    const response = await fetchWithTimeout(`${API_URL}/invoice/${consignmentId}`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to generate invoice');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${consignmentId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};
