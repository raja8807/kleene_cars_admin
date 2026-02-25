import axios from 'axios';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/components/auth/AuthContext';

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the auth token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Response interceptor for generic error handling (optional but good practice)
apiClient.interceptors.response.use((response) => {
    return response;
}, (error) => {
    // You can handle global errors here, like 401 redirects
    return Promise.reject(error);
});

export default apiClient;
