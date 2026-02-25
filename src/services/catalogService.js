import apiClient from './axiosClient';

const catalogService = {
    // Products
    getProducts: async () => {
        const response = await apiClient.get('/catalog/products');
        return response.data;
    },
    createProduct: async (data) => {
        const response = await apiClient.post('/catalog/products', data);
        return response.data;
    },
    updateProduct: async (data) => {
        const response = await apiClient.put('/catalog/products', data);
        return response.data;
    },
    deleteProduct: async (id) => {
        const response = await apiClient.delete(`/catalog/products?id=${id}`);
        return response.data;
    },

    // Services
    getServices: async () => {
        const response = await apiClient.get('/catalog/services');
        return response.data;
    },
    createService: async (data) => {
        const response = await apiClient.post('/catalog/services', data);
        return response.data;
    },
    updateService: async (data) => {
        const response = await apiClient.put('/catalog/services', data);
        return response.data;
    },
    deleteService: async (id) => {
        const response = await apiClient.delete(`/catalog/services?id=${id}`);
        return response.data;
    },

    // Categories
    getCategories: async () => {
        const response = await apiClient.get('/catalog/categories');
        return response.data;
    },
    createCategory: async (data) => {
        const response = await apiClient.post('/catalog/categories', data);
        return response.data;
    },
    updateCategory: async (data) => {
        const response = await apiClient.put('/catalog/categories', data);
        return response.data;
    },
    deleteCategory: async (id) => {
        const response = await apiClient.delete(`/catalog/categories?id=${id}`);
        return response.data;
    },

    // Banners
    getBanners: async () => {
        const response = await apiClient.get('/catalog/banners');
        return response.data;
    },
    createBanner: async (data) => {
        const response = await apiClient.post('/catalog/banners', data);
        return response.data;
    },
    deleteBanner: async (id) => {
        const response = await apiClient.delete(`/catalog/banners?id=${id}`);
        return response.data;
    }
};

export default catalogService;
