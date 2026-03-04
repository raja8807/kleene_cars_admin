const EXPO_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const paymentService = {
    getAllPayments: async () => {
        try {
            const response = await fetch(`${EXPO_PUBLIC_API_URL}/payments`);
            if (!response.ok) throw new Error("Failed to fetch payments");
            return await response.json();
        } catch (error) {
            console.error("Error in getAllPayments:", error);
            throw error;
        }
    },

    getPaymentByOrderId: async (orderId) => {
        try {
            const response = await fetch(`${EXPO_PUBLIC_API_URL}/payments/order/${orderId}`);
            if (response.status === 404) return null;
            if (!response.ok) throw new Error("Failed to fetch payment details");
            return await response.json();
        } catch (error) {
            console.error("Error in getPaymentByOrderId:", error);
            throw error;
        }
    },
};

export default paymentService;
