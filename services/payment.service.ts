import api from "@/lib/api";

export interface Payment {
    _id: string;
    booking_id: string;
    amount: number;
    payment_method: "CASH" | "CARD" | "KHQR";
    payment_status: "PENDING" | "COMPLETED" | "FAILED";
    transaction_id: string;
    payment_date: string;
}

export const PaymentService = {
    getAll: async () => {
        const response = await api.get("/payments");
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/payments/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post("/payments", data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.patch(`/payments/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/payments/${id}`);
        return response.data;
    }
};
