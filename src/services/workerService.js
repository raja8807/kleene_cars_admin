import apiClient from './axiosClient';

const workerService = {
    getAllWorkers: async () => {
        const response = await apiClient.get('/workers');
        return response.data;
    },
    createWorker: async (workerData) => {
        const response = await apiClient.post('/workers/create', workerData);
        return response.data;
    }
};

export default workerService;