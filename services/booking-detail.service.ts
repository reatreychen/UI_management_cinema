import api from "@/lib/api";

export interface BookingDetail {
    _id: string;
    booking_id: string;
    seat_id: string;
    price: number;
}

export const BookingDetailService = {
    getAll: async () => {
        const response = await api.get("/booking-details");
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/booking-details/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post("/booking-details", data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.patch(`/booking-details/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/booking-details/${id}`);
        return response.data;
    }
};
