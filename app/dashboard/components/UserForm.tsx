"use client";

import React, { useState, useEffect } from "react";
import { User as UserIcon, Shield, Mail, Lock, Loader2, Save, Trash2, Key, AlertCircle, CheckCircle2 } from "lucide-react";
import { UserService, User } from "@/services/user.service";
import { useUser } from "../users/UserContext";

export default function UserForm() {
    const { selectedUser, setSelectedUser, fetchUsers, deleteUser } = useUser();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        role: "USER" as "ADMIN" | "USER",
    });

    useEffect(() => {
        if (selectedUser) {
            setFormData({
                username: selectedUser.username || "",
                email: selectedUser.email || "",
                password: "", // Don't show password
                role: selectedUser.role || "USER",
            });
        } else {
            setFormData({ username: "", email: "", password: "", role: "USER" });
        }
        setError(null);
        setSuccess(null);
    }, [selectedUser]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (selectedUser) {
                const { password, ...updateData } = formData;
                const payload = formData.password ? formData : updateData;
                await UserService.update(selectedUser._id, payload);
                setSuccess("User updated successfully.");
            } else {
                await UserService.create(formData);
                setSuccess("New administrator created.");
                setFormData({ username: "", email: "", password: "", role: "USER" });
            }

            await fetchUsers();
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            console.error("Error saving user:", err);
            setError(err.response?.data?.message || "Failed to save user details.");
            setTimeout(() => setError(null), 6000);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        setLoading(true);
        try {
            await UserService.delete(selectedUser._id);
            await fetchUsers();
            setSuccess("User removed from the system.");
            setSelectedUser(null);
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError("Failed to delete user.");
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full pl-8 border-l border-zinc-800">
            <h2 className="text-white text-lg font-bold mb-8">
                {selectedUser ? "User Settings" : "Create New Admin"}
            </h2>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col max-w-2xl">
                <div className="space-y-8 flex-1">
                    {/* Status Alerts */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-300">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-300">
                            <CheckCircle2 className="w-4 h-4" /> {success}
                        </div>
                    )}

                    {/* Avatar Placeholder */}
                    <div className="flex items-center gap-6 mb-10">
                        <div className="w-24 h-24 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center relative group overflow-hidden">
                            {selectedUser?.image ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={selectedUser.image} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="w-10 h-10 text-zinc-700" />
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <span className="text-[10px] text-white font-bold uppercase tracking-widest text-center">Change Photo</span>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-xl">{formData.username || "New User"}</h3>
                            <p className="text-zinc-500 text-sm mt-1">{formData.email || "user@example.com"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1 flex items-center gap-2">
                                <UserIcon className="w-3.5 h-3.5" /> Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-zinc-700"
                                placeholder="e.g., john_doe"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1 flex items-center gap-2">
                                <Shield className="w-3.5 h-3.5" /> User Role
                            </label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                            >
                                <option value="USER">Standard User</option>
                                <option value="ADMIN">System Admin</option>
                            </select>
                        </div>

                        <div className="col-span-2 space-y-3">
                            <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1 flex items-center gap-2">
                                <Mail className="w-3.5 h-3.5" /> Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-zinc-700"
                                placeholder="e.g., john@legendcinemas.com"
                            />
                        </div>

                        <div className="col-span-2 space-y-3">
                            <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1 flex items-center gap-2">
                                <Lock className="w-3.5 h-3.5" /> {selectedUser ? "Change Password (Optional)" : "Password"}
                            </label>
                            <div className="relative">
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required={!selectedUser}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary/50 transition-all placeholder:text-zinc-700"
                                    placeholder="••••••••"
                                />
                                <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-10 flex items-center gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 px-6 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center justify-center gap-3"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {selectedUser ? "Update User" : "Create Admin User"}
                    </button>

                    {selectedUser && (
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading}
                            className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-600/30 transition-all"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
