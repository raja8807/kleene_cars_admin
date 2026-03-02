import apiClient from './axiosClient';

const workerService = {
    getAllWorkers: async (params = {}) => {
        const queryParams = new URLSearchParams(params).toString();
        const response = await apiClient.get(`/workers?${queryParams}`);
        return response.data;
    },
    createWorker: async (workerData) => {
        const response = await apiClient.post('/workers/create', workerData);
        return response.data;
    },
    updateWorker: async (id, workerData) => {
        const response = await apiClient.put(`/workers/update/${id}`, workerData);
        return response.data;
    }
};

export default workerService;