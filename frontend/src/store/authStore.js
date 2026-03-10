import { create } from 'zustand';
import api from '../api';

const useAuthStore = create((set) => ({
    user: null,
    token: localStorage.getItem('jwt_token') || null,
    isAuthenticated: !!localStorage.getItem('jwt_token'),

    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token } = response.data;

            localStorage.setItem('jwt_token', token);
            set({ token, isAuthenticated: true, user: { email } });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || 'Login failed' };
        }
    },

    register: async (email, password) => {
        try {
            await api.post('/auth/register', { email, password });
            return { success: true };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || 'Registration failed' };
        }
    },

    logout: () => {
        localStorage.removeItem('jwt_token');
        set({ user: null, token: null, isAuthenticated: false });
    }
}));

export default useAuthStore;
