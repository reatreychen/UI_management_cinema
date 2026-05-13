import api from "@/lib/api";

export interface Seat {
    _id: string;
    theater_id: string;
    row_letter: string;
    seat_number: number;
    seat_type: "standard" | "premium" | "vip" | "recliner";
    is_active: boolean;
}

export const SeatService = {
    getAll: async (params?: any) => {
        const response = await api.get("/seats/get-all", { params });
        return response.data;
    },

    getByTheater: async (theaterId: string) => {
        const response = await api.get(`/seats/theater/${theaterId}`);
        return response.data;
    },

    getStatistics: async (theaterId: string) => {
        const response = await api.get(`/seats/statistics/${theaterId}`);
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/seats/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post("/seats/create", data);
        return response.data;
    },

    bulkCreate: async (data: any) => {
        const response = await api.post("/seats/bulk", data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.patch(`/seats/${id}`, data);
        return response.data;
    },

    toggleStatus: async (id: string) => {
        const response = await api.patch(`/seats/${id}/toggle`);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/seats/${id}`);
        return response.data;
    },

    bulkDelete: async (theaterId: string, rows?: string[]) => {
        const response = await api.delete(`/seats/bulk/${theaterId}`, { data: { rows } });
        return response.data;
    },

    bulkUpdate: async (theaterId: string, rows: string[], updateData: any) => {
        const response = await api.patch(`/seats/bulk/update/${theaterId}`, { rows, updateData });
        return response.data;
    }
};
