import apiClient from './axiosClient';

const customerService = {
    getAllCustomers: async (page = 1, limit = 10) => {
        const response = await apiClient.get(`/customers?page=${page}&limit=${limit}`);
        return response.data;
    },
    getCustomerOrders: async (userId) => {
        const response = await apiClient.get(`/orders?user_id=${userId}`);
        return response.data;
    }
};

export default customerService;
