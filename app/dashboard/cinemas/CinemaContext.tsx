"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";
import { Theater } from "@/services/theater.service";

interface CinemaContextType {
    cinemas: Theater[];
    selectedCinema: Theater | null;
    loading: boolean;
    fetchCinemas: () => Promise<void>;
    setSelectedCinema: (cinema: Theater | null) => void;
    deleteCinema: (id: string) => Promise<void>;
}

const CinemaContext = createContext<CinemaContextType | undefined>(undefined);

export function CinemaProvider({ children }: { children: React.ReactNode }) {
    const [cinemas, setCinemas] = useState<Theater[]>([]);
    const [selectedCinema, setSelectedCinema] = useState<Theater | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCinemas = async () => {
        try {
            const response = await api.get("/theaters/get-all");
            setCinemas(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Failed to fetch cinemas:", error);
            setCinemas([]);
        } finally {
            setLoading(false);
        }
    };

    const deleteCinema = async (id: string) => {
        try {
            await api.delete(`/theaters/${id}`);
            setCinemas((prev) => prev.filter((c) => c._id !== id));
            if (selectedCinema?._id === id) setSelectedCinema(null);
        } catch (error) {
            console.error("Failed to delete cinema:", error);
        }
    };

    useEffect(() => {
        fetchCinemas();
    }, []);

    return (
        <CinemaContext.Provider
            value={{
                cinemas,
                selectedCinema,
                loading,
                fetchCinemas,
                setSelectedCinema,
                deleteCinema,
            }}
        >
            {children}
        </CinemaContext.Provider>
    );
}

export function useCinema() {
    const context = useContext(CinemaContext);
    if (context === undefined) {
        throw new Error("useCinema must be used within a CinemaProvider");
    }
    return context;
}
