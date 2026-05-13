import api from "@/lib/api";

export interface Showtime {
    _id: string;
    movie_id: any;
    theater_id: any;
    show_date: string;
    show_time: string;
    end_time: string;
    price_standard: number;
    price_premium: number;
    ticket_count_available: number;
    status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}


export const ShowtimeService = {
    getAll: async (params?: any) => {
        const response = await api.get("/showtimes", { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/showtimes/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post("/showtimes", data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.patch(`/showtimes/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/showtimes/${id}`);
        return response.data;
    }
};
