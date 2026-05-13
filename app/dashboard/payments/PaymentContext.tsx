"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Payment, PaymentService } from "@/services/payment.service";

interface PaymentContextType {
    payments: Payment[];
    loading: boolean;
    fetchPayments: () => Promise<void>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: React.ReactNode }) {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const data = await PaymentService.getAll();
            setPayments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch payments:", error);
            setPayments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    return (
        <PaymentContext.Provider
            value={{
                payments,
                loading,
                fetchPayments,
            }}
        >
            {children}
        </PaymentContext.Provider>
    );
}

export function usePayment() {
    const context = useContext(PaymentContext);
    if (context === undefined) {
        throw new Error("usePayment must be used within a PaymentProvider");
    }
    return context;
}
