import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (error) {
            console.error("Failed to parse user from local storage", error);
            return null;
        }
    });
    const [token, setToken] = useState(localStorage.getItem('token'));
    // Loading is still useful for validating token with backend, but less critical for initial render now
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Optional: Validate token with backend here if needed
    }, [token]);

    const login = async (username, password) => {
        try {
            const response = await fetch('http://localhost:5001/api/auth/login', {
                method: 'POST',

                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (data.success) {
                setToken(data.token);
                setUser(data.user);
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                return { success: true, user: data.user };
            } else {
                return { success: false, error: data.error };
            }
        } catch (err) {
            console.error("Login API Error:", err);
            return { success: false, error: 'Network error: ' + err.message };
        }

    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
