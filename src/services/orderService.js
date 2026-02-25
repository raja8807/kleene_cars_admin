import apiClient from './axiosClient';

const orderService = {
    getAllOrders: async () => {
        const response = await apiClient.get('/orders');
        return response.data;
    },
    getOrderById: async (id) => {
        const response = await apiClient.get(`/orders/${id}`);
        return response.data;
    },
    updateOrder: async (id, data) => {
        const response = await apiClient.put(`/orders/${id}`, data);
        return response.data;
    }
};

export default orderService;
