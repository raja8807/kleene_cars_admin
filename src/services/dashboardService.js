import apiClient from './axiosClient';

const dashboardService = {
    getStats: async () => {
        const response = await apiClient.get('/dashboard');
        return response.data;
    }
};

export default dashboardService;
