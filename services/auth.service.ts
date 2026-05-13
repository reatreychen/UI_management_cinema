import api from "@/lib/api";

export interface LoginResponse {
    message: string;
    data: any;
    accessToken: string;
    refreshToken: string;
    success: boolean;
    error: boolean;
}

export const AuthService = {
    login: async (credentials: any): Promise<LoginResponse> => {
        const response = await api.post("/auth/login", credentials);
        return response.data;
    },

    register: async (data: any) => {
        const response = await api.post("/auth/register", data);
        return response.data;
    },

    logout: async () => {
        const response = await api.post("/auth/logout");
        return response.data;
    }
};
