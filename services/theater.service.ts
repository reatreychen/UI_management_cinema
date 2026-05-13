import api from "@/lib/api";

export interface Theater {
    _id: string;
    name: string;
    location: string;
    capacity?: number;
    type?: string;
    description?: string;
    image?: string;
    isActive: boolean;
}

export const TheaterService = {
    getAll: async () => {
        const response = await api.get("/theaters/get-all");
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/theaters/${id}`);
        return response.data;
    },

    create: async (data: FormData) => {
        const response = await api.post("/theaters/create", data, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    update: async (id: string, data: FormData) => {
        const response = await api.patch(`/theaters/${id}`, data, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/theaters/${id}`);
        return response.data;
    }
}; 
