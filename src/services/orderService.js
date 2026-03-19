import apiClient from './axiosClient';

const orderService = {
    getAllOrders: async (page = 1, limit = 10, status = "All Orders") => {
        const response = await apiClient.get(`/orders?page=${page}&limit=${limit}&status=${status}`);
        return response.data;
    },
    getOrderById: async (id) => {
        const response = await apiClient.get(`/orders/${id}`);
        return response.data;
    },
    updateOrder: async (id, data) => {
        const response = await apiClient.put(`/orders/${id}`, data);
        return response.data;
    },

    assignWorker: async (id, data) => {
        const response = await apiClient.put(`/orders/${id}/assign-worker`, data);
        return response.data;
    },

    updateWorkerAssignmentStatus: async (id, data) => {
        const response = await apiClient.put(`/orders/${id}/worker/status`, data);
        return response.data;
    }
};

export default orderService;
