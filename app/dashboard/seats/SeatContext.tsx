"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Seat, SeatService } from "@/services/seat.service";

interface SeatContextType {
    seats: Seat[];
    loading: boolean;
    fetchSeats: (theaterId: string) => Promise<void>;
    toggleSeatStatus: (id: string) => Promise<void>;
    bulkCreateSeats: (data: any) => Promise<void>;
    updateSeat: (id: string, data: any) => Promise<void>;
    bulkUpdateSeats: (theaterId: string, rows: string[], updateData: any) => Promise<void>;
    deleteSeat: (id: string) => Promise<void>;
}

const SeatContext = createContext<SeatContextType | undefined>(undefined);

export function SeatProvider({ children }: { children: React.ReactNode }) {
    const [seats, setSeats] = useState<Seat[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchSeats = async (theaterId: string) => {
        setLoading(true);
        try {
            const data = await SeatService.getByTheater(theaterId);
            // The backend returns { theater_id, totalSeats, seatsByRow, rows }
            // We need to flatten seatsByRow into a single array
            if (data && data.seatsByRow) {
                const allSeats = Object.values(data.seatsByRow).flat() as Seat[];
                setSeats(allSeats);
            } else {
                setSeats(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Failed to fetch seats:", error);
            setSeats([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleSeatStatus = async (id: string) => {
        try {
            await SeatService.toggleStatus(id);
            setSeats((prev) => prev.map(s => s._id === id ? { ...s, is_active: !s.is_active } : s));
        } catch (error) {
            console.error("Failed to toggle seat status:", error);
        }
    };

    const bulkCreateSeats = async (data: any) => {
        try {
            await SeatService.bulkCreate(data);
            if (data.theater_id) await fetchSeats(data.theater_id);
        } catch (error) {
            console.error("Failed to bulk create seats:", error);
            throw error;
        }
    };

    const updateSeat = async (id: string, data: any) => {
        try {
            const result = await SeatService.update(id, data);
            setSeats((prev) => prev.map(s => s._id === id ? { ...s, ...result.seat } : s));
        } catch (error) {
            console.error("Failed to update seat:", error);
            throw error;
        }
    };

    const bulkUpdateSeats = async (theaterId: string, rows: string[], updateData: any) => {
        try {
            await SeatService.bulkUpdate(theaterId, rows, updateData);
            await fetchSeats(theaterId);
        } catch (error) {
            console.error("Failed to bulk update seats:", error);
            throw error;
        }
    };

    const deleteSeat = async (id: string) => {
        try {
            await SeatService.delete(id);
            setSeats((prev) => prev.filter(s => s._id !== id));
        } catch (error) {
            console.error("Failed to delete seat:", error);
        }
    };

    return (
        <SeatContext.Provider
            value={{
                seats,
                loading,
                fetchSeats,
                toggleSeatStatus,
                bulkCreateSeats,
                updateSeat,
                bulkUpdateSeats,
                deleteSeat,
            }}
        >
            {children}
        </SeatContext.Provider>
    );
}

export function useSeat() {
    const context = useContext(SeatContext);
    if (context === undefined) {
        throw new Error("useSeat must be used within a SeatProvider");
    }
    return context;
}
