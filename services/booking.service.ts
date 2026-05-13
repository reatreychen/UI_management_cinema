import api from "@/lib/api";

export interface Booking {
    _id: string;
    user_id: string;
    showtime_id: string;
    booking_reference: string;
    total_amount: number;
    status: "PENDING" | "CONFIRMED" | "CANCELLED";
    payment_status: "UNPAID" | "PAID";
    booking_date: string;
    ticket_count: number;
}

export const BookingService = {
    getAll: async () => {
        const response = await api.get("/bookings");
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/bookings/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post("/bookings", data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.patch(`/bookings/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/bookings/${id}`);
        return response.data;
    }
};
