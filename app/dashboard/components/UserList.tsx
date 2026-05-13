"use client";

import { User as UserIcon, Shield, Mail, ChevronRight, Loader2, UserPlus } from "lucide-react";
import { useUser } from "../users/UserContext";

export default function UserList() {
    const { users, selectedUser, setSelectedUser, loading } = useUser();

    return (
        <div className="flex-1 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-lg font-bold">Admin Users</h2>
                <button
                    onClick={() => setSelectedUser(null)}
                    className="p-2 rounded-xl bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                >
                    <UserPlus className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-20 text-zinc-600 border border-white/5 rounded-3xl bg-white/2">
                        No users found.
                    </div>
                ) : (
                    users.map((user) => (
                        <button
                            key={user._id}
                            onClick={() => setSelectedUser(user)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 text-left group border ${selectedUser?._id === user._id
                                    ? "bg-red-600/10 border-red-600/30"
                                    : "bg-white/5 border-white/5 hover:border-white/10"
                                }`}
                        >
                            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-all">
                                {user.image ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={user.image} alt={user.username} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-6 h-6 text-zinc-700" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={`font-bold text-sm truncate ${selectedUser?._id === user._id ? "text-red-500" : "text-zinc-200 group-hover:text-white"
                                        }`}>
                                        {user.username}
                                    </span>
                                    {user.role === "ADMIN" && (
                                        <Shield className="w-3 h-3 text-red-500" />
                                    )}
                                </div>
                                <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-1 truncate">
                                    <Mail className="w-3 h-3" />
                                    {user.email}
                                </span>
                            </div>
                            <ChevronRight className={`w-4 h-4 ${selectedUser?._id === user._id ? "text-red-500 translate-x-1" : "text-zinc-700 group-hover:text-zinc-400"
                                } transition-all`} />
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
