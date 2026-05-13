import api from "@/lib/api";

export interface SeatAvailability {
    _id: string;
    showtime_id: string;
    seat_id: string;
    is_available: boolean;
}

export const SeatAvailabilityService = {
    getAll: async () => {
        const response = await api.get("/seat-availabilities");
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/seat-availabilities/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post("/seat-availabilities", data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.patch(`/seat-availabilities/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/seat-availabilities/${id}`);
        return response.data;
    }
};
