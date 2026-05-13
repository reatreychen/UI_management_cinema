"use client";

import { LayoutGrid, Film, MapPin, Users, Settings, LogOut, Calendar, Grid3X3, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
    { icon: LayoutGrid, label: "Overview", href: "/dashboard" },
    { icon: Film, label: "Movies", href: "/dashboard/movies" },
    { icon: MapPin, label: "Cinemas", href: "/dashboard/cinemas" },
    { icon: Calendar, label: "Showtimes", href: "/dashboard/showtimes" },
    { icon: Grid3X3, label: "Seats", href: "/dashboard/seats" },
    { icon: CreditCard, label: "Payments", href: "/dashboard/payments" },
    { icon: Users, label: "Users", href: "/dashboard/users" },
    { icon: Settings, label: "Settings", href: "/dashboard/setup" },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-zinc-950 border-r border-zinc-800/50 flex flex-col h-screen shrink-0 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 -left-20 w-40 h-40 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-20 -right-20 w-40 h-40 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

            {/* Logo Section */}
            <div className="h-24 flex items-center px-8 shrink-0 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(209,31,38,0.4)] rotate-3">
                        <Film className="text-white w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-sm font-black tracking-[0.2em] text-white leading-none">LEGEND</h1>
                        <p className="text-[9px] font-black text-zinc-600 mt-1.5 leading-none uppercase tracking-[0.3em]">Cinemas</p>
                    </div>
                </div>
            </div>

            {/* Nav Section */}
            <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto relative z-10 custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group relative ${isActive
                                ? "bg-zinc-900 border border-zinc-800/50 shadow-xl shadow-black/50"
                                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40"
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon className={`w-4.5 h-4.5 shrink-0 transition-all duration-300 ${isActive ? "text-primary scale-110 drop-shadow-[0_0_8px_rgba(209,31,38,0.5)]" : "text-zinc-700 group-hover:text-zinc-400"}`} />
                                <span className={`text-[13px] font-bold tracking-tight transition-colors ${isActive ? "text-white" : "group-hover:text-zinc-200"}`}>{item.label}</span>
                            </div>
                            {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary/50" />}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="p-6 border-t border-zinc-800/50 relative z-10 bg-zinc-950/40 backdrop-blur-md">
                <button className="flex items-center gap-4 px-4 py-3 w-full rounded-2xl text-zinc-500 hover:text-red-500 hover:bg-red-500/5 transition-all duration-300 group">
                    <LogOut className="w-4.5 h-4.5 shrink-0 text-zinc-700 group-hover:text-red-500 transition-colors" />
                    <span className="text-[13px] font-bold tracking-tight">Log Out</span>
                </button>
            </div>
        </aside>
    );
}
