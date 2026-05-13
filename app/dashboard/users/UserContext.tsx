"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

interface User {
    _id: string;
    username: string;
    email: string;
    role: "ADMIN" | "USER";
    image?: string;
}

interface UserContextType {
    users: User[];
    selectedUser: User | null;
    loading: boolean;
    fetchUsers: () => Promise<void>;
    setSelectedUser: (user: User | null) => void;
    deleteUser: (id: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUsers = async () => {
        try {
            const response = await api.get("/user");
            // Backend returns { message: ..., data: [...], success: true }
            setUsers(Array.isArray(response.data.data) ? response.data.data : []);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id: string) => {
        try {
            await api.delete(`/user/${id}`);
            setUsers((prev) => prev.filter((u) => u._id !== id));
            if (selectedUser?._id === id) setSelectedUser(null);
        } catch (error) {
            console.error("Failed to delete user:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <UserContext.Provider
            value={{
                users,
                selectedUser,
                loading,
                fetchUsers,
                setSelectedUser,
                deleteUser,
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
