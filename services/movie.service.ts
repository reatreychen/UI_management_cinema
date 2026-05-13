import api from "@/lib/api";

export interface Movie {
    _id: string;
    title: string;
    description: string;
    duration_minutes: number;
    rating: string;
    genre: string[];
    language: string;
    release_date: string;
    poster_url?: string;
    trailer_url?: string;
    images?: string[];
    videos?: string[];
    is_active: boolean;
}

export const MovieService = {
    getAll: async (params?: any) => {
        const response = await api.get("/movies/get-all", { params });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/movies/${id}`);
        return response.data;
    },

    create: async (data: FormData) => {
        const response = await api.post("/movies/create", data, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    update: async (id: string, data: FormData) => {
        const response = await api.patch(`/movies/${id}`, data, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/movies/${id}`);
        return response.data;
    },

    removeImage: async (id: string, imageUrl: string) => {
        const response = await api.delete(`/movies/${id}/image`, { data: { imageUrl } });
        return response.data;
    },

    removeVideo: async (id: string, videoUrl: string) => {
        const response = await api.delete(`/movies/${id}/video`, { data: { videoUrl } });
        return response.data;
    },

    removePoster: async (id: string) => {
        const response = await api.delete(`/movies/${id}/poster`);
        return response.data;
    },

    removeTrailer: async (id: string) => {
        const response = await api.delete(`/movies/${id}/trailer`);
        return response.data;
    }
};
