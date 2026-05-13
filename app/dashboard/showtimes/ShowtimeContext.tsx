"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Showtime, ShowtimeService } from "@/services/showtime.service";

interface ShowtimeContextType {
    showtimes: Showtime[];
    selectedShowtime: Showtime | null;
    loading: boolean;
    fetchShowtimes: () => Promise<void>;
    setSelectedShowtime: (showtime: Showtime | null) => void;
    deleteShowtime: (id: string) => Promise<void>;
}

const ShowtimeContext = createContext<ShowtimeContextType | undefined>(undefined);

export function ShowtimeProvider({ children }: { children: React.ReactNode }) {
    const [showtimes, setShowtimes] = useState<Showtime[]>([]);
    const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchShowtimes = async () => {
        setLoading(true);
        try {
            const data = await ShowtimeService.getAll();
            setShowtimes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch showtimes:", error);
            setShowtimes([]);
        } finally {
            setLoading(false);
        }
    };

    const deleteShowtime = async (id: string) => {
        try {
            await ShowtimeService.delete(id);
            setShowtimes((prev) => prev.filter((s) => s._id !== id));
            if (selectedShowtime?._id === id) setSelectedShowtime(null);
        } catch (error) {
            console.error("Failed to delete showtime:", error);
            throw error;
        }
    };

    useEffect(() => {
        fetchShowtimes();
    }, []);

    return (
        <ShowtimeContext.Provider
            value={{
                showtimes,
                selectedShowtime,
                loading,
                fetchShowtimes,
                setSelectedShowtime,
                deleteShowtime,
            }}
        >
            {children}
        </ShowtimeContext.Provider>
    );
}

export function useShowtime() {
    const context = useContext(ShowtimeContext);
    if (context === undefined) {
        throw new Error("useShowtime must be used within a ShowtimeProvider");
    }
    return context;
}
