"use client";

import { Film, MapPin, Users, Ticket, Activity, ArrowUp, Minus, BarChart, Loader2, RefreshCcw, ShoppingBag, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { MovieService } from "@/services/movie.service";
import { TheaterService } from "@/services/theater.service";
import { UserService } from "@/services/user.service";
import { PaymentService } from "@/services/payment.service";
import { BookingService } from "@/services/booking.service";
import { format } from "date-fns";

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [statsData, setStatsData] = useState({
        movies: 0,
        cinemas: 0,
        users: 0,
        revenue: 0,
        movieTrend: "0 this week",
        revenueTrend: "0% vs last month"
    });
    const [recentBookings, setRecentBookings] = useState<any[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [movieRes, theaterRes, userRes, paymentRes, bookingRes] = await Promise.all([
                MovieService.getAll(),
                TheaterService.getAll(),
                UserService.getAll(),
                PaymentService.getAll(),
                BookingService.getAll()
            ]);

            const movies = Array.isArray(movieRes?.movies) ? movieRes.movies : (Array.isArray(movieRes) ? movieRes : []);
            const cinemas = Array.isArray(theaterRes?.theaters) ? theaterRes.theaters : (Array.isArray(theaterRes) ? theaterRes : []);
            const users = Array.isArray(userRes?.users) ? userRes.users : (Array.isArray(userRes) ? userRes : []);
            const payments = Array.isArray(paymentRes?.payments) ? paymentRes.payments : (Array.isArray(paymentRes) ? paymentRes : []);
            const transactions = Array.isArray(bookingRes?.bookings) ? bookingRes.bookings : (Array.isArray(bookingRes) ? bookingRes : []);

            const totalRevenue = payments.reduce((acc: number, p: any) =>
                p.payment_status === "COMPLETED" ? acc + p.amount : acc, 0
            );

            setStatsData({
                movies: movies.length,
                cinemas: cinemas.length,
                users: users.length,
                revenue: totalRevenue,
                movieTrend: `+${movies.filter((m: any) => {
                    const created = new Date(m.release_date);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return created > weekAgo;
                }).length} this week`,
                revenueTrend: "+5.4% vs last month"
            });

            setRecentBookings(transactions.slice(0, 5));
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const stats = [
        { label: "Archived Productions", value: statsData.movies.toString(), icon: Film, trend: statsData.movieTrend, trendIcon: ArrowUp, trendColor: "text-emerald-500" },
        { label: "Active Venues", value: statsData.cinemas.toString(), icon: MapPin, trend: "Stable", trendIcon: Minus, trendColor: "text-zinc-500" },
        { label: "Registered Operatives", value: statsData.users > 1000 ? `${(statsData.users / 1000).toFixed(1)}k` : statsData.users.toString(), icon: Users, trend: "+12.5%", trendIcon: ArrowUp, trendColor: "text-emerald-500" },
        { label: "Total Revenue", value: `$${statsData.revenue.toLocaleString()}`, icon: Ticket, trend: statsData.revenueTrend, trendIcon: ArrowUp, trendColor: "text-emerald-500" },
    ];

    return (
        <div className="p-8 space-y-8 h-full overflow-y-auto custom-scrollbar">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard Overview</h1>
                    <p className="text-zinc-500 text-sm mt-1 font-medium italic">Welcome back to the Legend Cinemas management console.</p>
                </div>
                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all active:scale-95 disabled:opacity-50"
                >
                    <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl hover:border-zinc-700 transition-all group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center border border-zinc-700 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all">
                                <stat.icon className="w-5 h-5 text-zinc-400 group-hover:text-primary transition-colors" />
                            </div>
                            <stat.trendIcon className={`w-4 h-4 ${stat.trendColor}`} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-primary transition-colors">{stat.value}</h3>
                            <p className="text-[10px] text-zinc-600 mt-2 font-medium">
                                <span className={stat.trendColor}>{stat.trend}</span> vs last month
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Operational Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
                <div className="lg:col-span-8 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
                    <div className="px-8 py-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/40">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <ShoppingBag className="w-4 h-4 text-emerald-500" />
                            </div>
                            <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">Recent Transactions</h2>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-600 bg-zinc-800 px-3 py-1 rounded-full uppercase tracking-tighter">Live Monitor</span>
                    </div>

                    <div className="p-4">
                        {loading ? (
                            <div className="h-64 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Hydrating data nodes...</span>
                            </div>
                        ) : recentBookings.length === 0 ? (
                            <div className="h-64 flex flex-col items-center justify-center gap-4 text-zinc-600">
                                <BarChart className="w-8 h-8 opacity-20" />
                                <span className="text-[10px] font-black uppercase tracking-widest">No recent transactions reported</span>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {recentBookings.map((booking, idx) => (
                                    <div key={booking._id} className="flex items-center justify-between p-4 rounded-xl hover:bg-zinc-800/50 transition-colors border border-transparent hover:border-zinc-800 group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-zinc-950 flex items-center justify-center text-xs font-black text-zinc-500 border border-zinc-900">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-white tracking-tight">{booking.booking_reference}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{format(new Date(booking.booking_date), "MMM dd, HH:mm")}</span>
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${booking.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                                        }`}>
                                                        {booking.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[13px] font-black text-white group-hover:text-primary transition-colors">${booking.total_amount}</p>
                                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mt-1">Settled via {booking.payment_method || "KHQR"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-zinc-800 bg-zinc-950/20 text-center">
                        <button className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-[0.2em] transition-colors">Generate Comprehensive Report</button>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl shadow-black/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full transition-transform group-hover:scale-150 duration-1000" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <Activity className="w-4 h-4 text-primary" />
                                <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">System Pulse</h2>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">API Latency</span>
                                    <span className="text-[10px] font-black text-emerald-500">22ms (Optimal)</span>
                                </div>
                                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[94%]" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Database Sync</span>
                                    <span className="text-[10px] font-black text-emerald-500">Active</span>
                                </div>
                                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-full animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-primary/20 to-zinc-900 border border-primary/20 rounded-3xl p-8 shadow-2xl shadow-black/50 relative overflow-hidden group h-[200px] flex flex-col justify-between">
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full" />
                        <div className="relative z-10 flex items-center justify-between">
                            <Clock className="w-5 h-5 text-white" />
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Action Required</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-red-100 uppercase tracking-[0.15em] mb-2">Pending Approvals</p>
                            <h3 className="text-3xl font-black text-white">4</h3>
                        </div>
                        <button className="relative z-10 w-full py-3 bg-white text-zinc-950 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition-colors">Review Queue</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
