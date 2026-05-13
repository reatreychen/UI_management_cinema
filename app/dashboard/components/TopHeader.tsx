"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Bell, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function TopHeader() {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const { user, logout } = useAuth();
    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return (
        <header className="h-16 bg-zinc-950/50 backdrop-blur-xl border-b border-zinc-800 flex items-center justify-between px-8 shrink-0 relative z-10">
            {/* Search */}
            <div className="relative group w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                <input
                    type="text"
                    placeholder="Search movies, cinemas..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-2 pl-11 pr-4 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-all shadow-sm"
                />
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-6">
                {/* Notification */}
                <button className="relative p-2 rounded-xl hover:bg-zinc-900 transition-colors group text-zinc-400 hover:text-white">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-zinc-950 animate-pulse"></span>
                </button>

                <div className="h-6 w-px bg-zinc-800" />

                {/* Profile */}
                <div className="relative" ref={profileRef}>
                    <div 
                        className="flex items-center gap-4 group cursor-pointer"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <div className="text-right">
                            <p className="text-sm font-semibold text-white leading-none">
                                {user?.name || "Admin User"}
                            </p>
                            <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">
                                {user?.email || "admin@cinema.com"}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-red-900/20 group-hover:scale-105 transition-transform duration-200">
                            <User className="w-5 h-5 text-white" />
                        </div>
                        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </div>

                    {/* Profile Dropdown Menu */}
                    {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50">
                            <div className="p-3 border-b border-zinc-800">
                                <p className="text-sm font-semibold text-white">{user?.name || "Admin User"}</p>
                                <p className="text-xs text-zinc-500">{user?.email || "admin@cinema.com"}</p>
                            </div>
                            <button
                                onClick={() => {
                                    logout();
                                    setShowProfileMenu(false);
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors rounded-b-xl"
                            >
                                <LogOut className="w-4 h-4" />
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
