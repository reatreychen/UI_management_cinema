"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Image as ImageIcon, Trash2, Loader2, Save, Upload,
    MapPin, Users, Monitor, ShieldCheck, X, AlertCircle, CheckCircle2, ChevronDown
} from "lucide-react";
import { TheaterService, Theater } from "@/services/theater.service";
import { useCinema } from "../cinemas/CinemaContext";

export default function CinemaForm() {
    const { selectedCinema, setSelectedCinema, fetchCinemas, deleteCinema } = useCinema();
    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState<string | null>(null);
    const [isTypeOpen, setIsTypeOpen] = useState(false);
    const typeDropdownRef = useRef<HTMLDivElement>(null);

    const theaterTypes = ["Standard", "IMAX", "3D", "4DX", "Premium"];

    const [formData, setFormData] = useState<{
        name: string;
        location: string;
        description: string;
        capacity: number | "";
        type: string;
        isActive: boolean;
    }>({
        name: "",
        location: "",
        description: "",
        capacity: 0,
        type: "Standard",
        isActive: true,
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (selectedCinema) {
            setFormData({
                name: selectedCinema.name || "",
                location: selectedCinema.location || "",
                description: selectedCinema.description || "",
                capacity: selectedCinema.capacity || 0,
                type: selectedCinema.type || "Standard",
                isActive: selectedCinema.isActive ?? true,
            });
            setImagePreview(selectedCinema.image || null);
        } else {
            resetForm();
        }
        setImageFile(null);
    }, [selectedCinema]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
                setIsTypeOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const resetForm = () => {
        setFormData({
            name: "",
            location: "",
            description: "",
            capacity: 0,
            type: "Standard",
            isActive: true,
        });
        setImagePreview(null);
        setImageFile(null);
        setSelectedCinema(null);
        setFieldErrors({});
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type, checked } = e.target as HTMLInputElement;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : (name === "capacity" ? (value === "" ? "" : parseInt(value)) : value)
        }));

        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            if (fieldErrors.image) {
                setFieldErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.image;
                    return newErrors;
                });
            }
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) errors.name = "Cinema name is required";
        else if (formData.name.length < 3) errors.name = "Name must be at least 3 characters";

        if (!formData.location.trim()) errors.location = "Location address is required";

        if (formData.capacity === "" || formData.capacity <= 0) {
            errors.capacity = "A valid positive capacity is required";
        } else if (formData.capacity > 1000) {
            errors.capacity = "Maximum capacity is 1000 seats";
        }

        if (!selectedCinema && !imageFile) {
            errors.image = "A banner image is required for registration";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            setError("Validation failed. Please review the highlighted fields.");
            setTimeout(() => setError(null), 5000);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("location", formData.location);
            data.append("description", formData.description);
            data.append("capacity", formData.capacity.toString());
            data.append("type", formData.type);
            data.append("isActive", formData.isActive.toString());

            if (imageFile) {
                data.append("image", imageFile);
            }

            if (selectedCinema) {
                await TheaterService.update(selectedCinema._id, data);
            } else {
                await TheaterService.create(data);
            }
            
            await fetchCinemas();
            setSuccess(selectedCinema ? "Cinema details updated." : "New cinema added.");
            setTimeout(() => setSuccess(null), 5000);
            resetForm();
        } catch (err: any) {
            console.error("Error saving cinema:", err);
            setError(err.response?.data?.message || "Failed to save cinema details.");
            setTimeout(() => setError(null), 6000);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedCinema) return;
        if (!window.confirm("Are you sure you want to delete this cinema?")) return;
        setIsDeleting(true);
        try {
            await TheaterService.delete(selectedCinema._id);
            await fetchCinemas();
            setSuccess("Cinema removed from records.");
            setTimeout(() => setSuccess(null), 5000);
            setSelectedCinema(null);
        } catch (err: any) {
            setError("Failed to delete cinema.");
            setTimeout(() => setError(null), 5000);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-800 shrink-0 bg-zinc-950/20">
                <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-3">
                        {selectedCinema ? "Edit Cinema" : "Add New Cinema"}
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1">Manage cinema locations and details</p>
                </div>
                {selectedCinema && (
                    <button
                        onClick={resetForm}
                        className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <X className="w-4 h-4" /> Cancel Edition
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="space-y-8 flex-1 overflow-y-auto px-8 py-6 custom-scrollbar pb-10">

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

                    {/* Cinema Banner */}
                    <div className="space-y-4">
                        <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1">Venue Image (Banner) <span className="text-red-500">*</span></label>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className={`relative w-full aspect-21/9 rounded-2xl bg-zinc-900 overflow-hidden border ${fieldErrors.image ? 'border-red-500/50' : 'border-zinc-800'} group cursor-pointer hover:border-primary/50 transition-all duration-300 shadow-xl`}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-zinc-600">
                                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                        <Upload className="w-5 h-5 group-hover:text-primary transition-colors" />
                                    </div>
                                    <p className="text-[10px] font-medium">Upload Banner Image <span className="text-red-500">*</span></p>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent flex flex-col justify-end p-8 pointer-events-none">
                                <h3 className="text-white font-bold text-2xl tracking-tight">
                                    {formData.name || "Cinema Name"}
                                </h3>
                                <p className="text-zinc-300 text-xs mt-1 flex items-center gap-2">
                                    <MapPin className="w-3.5 h-3.5 text-primary" />
                                    {formData.location || "Location City"}
                                </p>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        </div>
                        {fieldErrors.image && (
                            <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1 uppercase italic">
                                <AlertCircle className="w-3 h-3" /> {fieldErrors.image}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1">Cinema Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className={`w-full px-5 py-3 rounded-xl bg-zinc-900 border ${fieldErrors.name ? 'border-red-500/50' : 'border-zinc-800'} text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-zinc-700`}
                                placeholder="e.g., Legend Cinema 271..."
                            />
                            {fieldErrors.name && (
                                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1 uppercase italic">
                                    <AlertCircle className="w-3 h-3" /> {fieldErrors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1">Location Address <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                required
                                className={`w-full px-5 py-3 rounded-xl bg-zinc-900 border ${fieldErrors.location ? 'border-red-500/50' : 'border-zinc-800'} text-white focus:outline-none focus:border-primary/50 transition-all placeholder:text-zinc-700`}
                                placeholder="e.g., 271 Mega Mall, 4th Floor..."
                            />
                            {fieldErrors.location && (
                                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1 uppercase italic">
                                    <AlertCircle className="w-3 h-3" /> {fieldErrors.location}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Cinema Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-3">
                            <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1">Capacity (Seats) <span className="text-red-500">*</span></label>
                            <input
                                type="number"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleInputChange}
                                required
                                className={`w-full px-5 py-3 no-spinner rounded-xl bg-zinc-900 border ${fieldErrors.capacity ? 'border-red-500/50' : 'border-zinc-800'} text-white focus:outline-none focus:border-primary/50 transition-all`}
                            />
                            {fieldErrors.capacity && (
                                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1 uppercase italic">
                                    <AlertCircle className="w-3 h-3" /> {fieldErrors.capacity}
                                </p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1">Theater Experience</label>
                            <div className="relative" ref={typeDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => setIsTypeOpen(!isTypeOpen)}
                                    className="w-full px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-primary/50 transition-all flex items-center justify-between group"
                                >
                                    <span className="font-semibold text-sm">
                                        {formData.type}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-zinc-500 group-hover:text-primary transition-transform duration-500 ${isTypeOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isTypeOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-3 p-2 bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 backdrop-blur-2xl">
                                        <div className="grid gap-1">
                                            {theaterTypes.map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, type }));
                                                        setIsTypeOpen(false);
                                                    }}
                                                    className={`w-full px-4 py-3 rounded-xl text-left text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between group/item ${formData.type === type
                                                        ? 'bg-primary text-white shadow-lg shadow-red-900/40'
                                                        : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'
                                                        }`}
                                                >
                                                    {type}
                                                    {formData.type === type && <CheckCircle2 className="w-4 h-4" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1">Operational Status</label>
                            <button
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, isActive: !p.isActive }))}
                                className={`w-full px-5 py-3 rounded-xl border transition-all flex items-center justify-between group h-[46px] ${formData.isActive
                                        ? "bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10"
                                        : "bg-red-500/5 border-red-500/20 hover:bg-red-500/10"
                                    }`}
                            >
                                <span className={`text-xs font-black uppercase tracking-widest ${formData.isActive ? "text-emerald-500" : "text-red-500"}`}>
                                    {formData.isActive ? "Operational" : "Under Maintenance"}
                                </span>
                                <div className={`w-10 h-5 rounded-full p-1 transition-all duration-500 ${formData.isActive ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "bg-zinc-700"}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-500 ease-spring ${formData.isActive ? "translate-x-5" : "translate-x-0"}`} />
                                </div>
                            </button>
                        </div>
                    </div>
                    
                    
                    <div className="space-y-3">
                        <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-primary/50 transition-all resize-none shadow-inner"
                            placeholder="Describe the cinema atmosphere and amenities..."
                        />
                    </div>
                </div>
                
                 {/*  action button */}
                <div className="mt-auto px-8 py-6 border-t border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-950/60 backdrop-blur-xl sticky bottom-0 z-30">
                    <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-3 cursor-pointer rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all font-bold text-[10px] uppercase tracking-[0.2em]"
                    >
                        Reset Form
                    </button>

                    <div className="flex items-center gap-6">
                        {selectedCinema && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-6 py-3 cursor-pointer rounded-xl border border-red-900/30 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold text-[10px] uppercase tracking-[0.2em]"
                            >
                                {isDeleting ? "Deleting..." : "Delete Cinema"}
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-12 py-3 cursor-pointer rounded-xl bg-primary text-white font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-red-700 hover:shadow-[0_0_30px_rgba(209,31,38,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xl shadow-red-900/20 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:transform-none"
                        >
                            {loading ? "Saving..." : selectedCinema ? "Update Cinema" : "Add Cinema"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
