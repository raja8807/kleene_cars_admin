import apiClient from './axiosClient';

const adminService = {
    getAllSubAdmins: async () => {
        const response = await apiClient.get('/admins');
        return response.data;
    },
    createSubAdmin: async (adminData) => {
        const response = await apiClient.post('/admins', adminData);
        return response.data;
    },
    updateSubAdmin: async (id, adminData) => {
        const response = await apiClient.put(`/admins/${id}`, adminData);
        return response.data;
    },
    deleteSubAdmin: async (id) => {
        const response = await apiClient.delete(`/admins/${id}`);
        return response.data;
    }
};

export default adminService;
