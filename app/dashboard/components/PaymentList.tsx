"use client";

import React, { useState } from "react";
import {
    CreditCard, Search, Download, Filter,
    ArrowUpRight, ArrowDownLeft, Loader2, DollarSign,
    Calendar, User, Tag, Hash, RefreshCcw, MoreHorizontal, Activity
} from "lucide-react";
import { usePayment } from "../payments/PaymentContext";
import { format } from "date-fns";

export default function PaymentList() {
    const { payments, loading, fetchPayments } = usePayment();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredPayments = payments.filter(p =>
        p.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.booking_id?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const completedPayments = payments.filter(p => p.payment_status === "COMPLETED");
    const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    const avgRevenue = completedPayments.length > 0 ? totalRevenue / completedPayments.length : 0;

    const exportToCSV = () => {
        if (payments.length === 0) return;

        const headers = ["Date", "Time", "Transaction ID", "Booking ID", "Method", "Status", "Amount"];
        const rows = payments.map(p => [
            format(new Date(p.payment_date), "yyyy-MM-dd"),
            format(new Date(p.payment_date), "HH:mm:ss"),
            p.transaction_id || `TRN-${p._id.slice(-8).toUpperCase()}`,
            p.booking_id,
            p.payment_method,
            p.payment_status,
            p.amount.toFixed(2)
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `payments_report_${format(new Date(), "yyyyMMdd_HHmm")}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-zinc-950">
            {/* Header / Stats Bar */}
            <div className="px-8 py-6 border-b border-zinc-800 bg-zinc-950/20 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-primary" />
                        Transaction Ledger
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1 italic font-medium">Audit logs for all financial operations</p>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Average Ticket</p>
                        <p className="text-lg font-black text-emerald-500 mt-0.5 flex items-center justify-end gap-1.5">
                            <span className="text-xs">$</span>
                            {avgRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </div>

                    <div className="h-10 w-px bg-zinc-800" />

                    <div className="text-right">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Aggregate Revenue</p>
                        <p className="text-2xl font-black text-white mt-1 flex items-center justify-end gap-2">
                            <span className="text-primary">$</span>
                            {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <button
                        onClick={fetchPayments}
                        className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-primary transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                        <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="px-8 py-4 border-b border-zinc-800/50 bg-zinc-900/10 flex items-center justify-between shrink-0">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 text-zinc-600 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Scan transaction ID or booking ref..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-sm text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-zinc-700"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 text-xs font-bold text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all">
                        <Filter className="w-3.5 h-3.5" /> Filter
                    </button>
                    <button
                        onClick={exportToCSV}
                        disabled={payments.length === 0}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-100 text-zinc-950 text-xs font-black hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/5 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                    >
                        <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        <p className="text-zinc-600 text-sm font-medium">Syncing with payment gateway...</p>
                    </div>
                ) : filteredPayments.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center border border-zinc-800 opacity-50">
                            <CreditCard className="w-8 h-8 text-zinc-700" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">No Records Found</h3>
                            <p className="text-zinc-600 text-sm mt-2">No matching transactions were found in the database.</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Table Header */}
                        <div className="grid grid-cols-6 px-6 py-3 bg-zinc-900/30 rounded-t-xl border-x border-t border-zinc-800/50 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                            <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> Timestamp</div>
                            <div className="flex items-center gap-2 col-span-2"><Hash className="w-3 h-3" /> Transaction / Booking</div>
                            <div className="flex items-center gap-2"><Tag className="w-3 h-3" /> Method</div>
                            <div className="flex items-center gap-2"><Activity className="w-3 h-3" /> Status</div>
                            <div className="flex items-center gap-2 justify-end text-right"><DollarSign className="w-3 h-3" /> Amount</div>
                        </div>

                        {/* Table Rows */}
                        <div className="border border-zinc-800/50 rounded-b-xl overflow-hidden divide-y divide-zinc-800/30">
                            {filteredPayments.map((payment) => (
                                <div
                                    key={payment._id}
                                    className="grid grid-cols-6 px-6 py-5 bg-zinc-950/20 hover:bg-zinc-900/40 transition-colors group cursor-default"
                                >
                                    {/* Date */}
                                    <div className="flex flex-col justify-center">
                                        <p className="text-xs font-bold text-zinc-300">
                                            {format(new Date(payment.payment_date), "MMM dd, yyyy")}
                                        </p>
                                        <p className="text-[10px] text-zinc-600 font-medium mt-1 uppercase">
                                            {format(new Date(payment.payment_date), "HH:mm:ss")}
                                        </p>
                                    </div>

                                    {/* ID / Booking */}
                                    <div className="col-span-2 flex flex-col justify-center">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-mono text-zinc-400 font-bold group-hover:text-primary transition-colors">
                                                {payment.transaction_id || "TRN-" + payment._id.slice(-8).toUpperCase()}
                                            </p>
                                            <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-zinc-800 transition-all">
                                                <MoreHorizontal className="w-3 h-3 text-zinc-500" />
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-zinc-600 font-bold mt-1 uppercase flex items-center gap-1.5">
                                            REF: <span className="text-zinc-500">{payment.booking_id}</span>
                                        </p>
                                    </div>

                                    {/* Method */}
                                    <div className="flex items-center">
                                        <div className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                                            {payment.payment_method}
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="flex items-center">
                                        <div className={`
                                            flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                                            ${payment.payment_status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                                payment.payment_status === "PENDING" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                                    "bg-red-500/10 text-red-500 border border-red-500/20"}
                                        `}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${payment.payment_status === "COMPLETED" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                                                payment.payment_status === "PENDING" ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" :
                                                    "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                                                }`} />
                                            {payment.payment_status}
                                        </div>
                                    </div>

                                    {/* Amount */}
                                    <div className="flex items-center justify-end text-right">
                                        <p className="text-lg font-black text-white flex items-center gap-1.5">
                                            {payment.amount > 0 ? (
                                                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                                            ) : (
                                                <ArrowDownLeft className="w-3.5 h-3.5 text-red-500" />
                                            )}
                                            ${payment.amount.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
