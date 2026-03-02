import axiosClient from "./axiosClient";

const notificationService = {
    sendNotification: async (notificationData) => {
        try {
            const response = await axiosClient.post("/notifications/send", notificationData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default notificationService;
