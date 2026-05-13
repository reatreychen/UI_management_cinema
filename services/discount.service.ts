import api from "@/lib/api";

export interface Discount {
    _id: string;
    code: string;
    description: string;
    discount_type: "PERCENTAGE" | "FIXED_AMOUNT";
    value: number;
    start_date: string;
    end_date: string;
    is_active: boolean;
}

export const DiscountService = {
    getAll: async () => {
        const response = await api.get("/discounts");
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/discounts/${id}`);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post("/discounts", data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.patch(`/discounts/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await api.delete(`/discounts/${id}`);
        return response.data;
    }
};
