import api from "@/lib/api";

export interface User {
    _id: string;
    username: string;
    email: string;
    role: "ADMIN" | "USER";
    image?: string;
}

export const UserService = {
    getAll: async () => {
        const response = await api.get("/user");
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/user/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post("/user/create", data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.patch(`/user/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/user/${id}`);
        return response.data;
    }
};
