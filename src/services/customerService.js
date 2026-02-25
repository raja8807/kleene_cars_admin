import apiClient from './axiosClient';

const customerService = {
    getAllCustomers: async () => {
        const response = await apiClient.get('/customers');
        return response.data;
    }
};

export default customerService;
