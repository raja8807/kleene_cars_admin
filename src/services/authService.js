import apiClient from './axiosClient';

const authService = {
    getProfile: async () => {
        const response = await apiClient.get('/auth/profile');
        return response.data;
    }
};

export default authService;
