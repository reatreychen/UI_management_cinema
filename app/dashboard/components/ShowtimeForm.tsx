"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Calendar, Clock, Ticket, Save, Trash2, X, AlertCircle, CheckCircle2,
    Film, MapPin, DollarSign, Activity, Loader2, ChevronRight, ChevronDown
} from "lucide-react";
import { ShowtimeService } from "@/services/showtime.service";
import { useShowtime } from "../showtimes/ShowtimeContext";
import { useMovie } from "../movies/MovieContext";
import { useCinema } from "../cinemas/CinemaContext";
import { format } from "date-fns";

export default function ShowtimeForm() {
    const { selectedShowtime, setSelectedShowtime, fetchShowtimes, deleteShowtime } = useShowtime();
    const { movies } = useMovie();
    const { cinemas } = useCinema();

    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState<string | null>(null);
    const [isMovieOpen, setIsMovieOpen] = useState(false);
    const [isTheaterOpen, setIsTheaterOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const movieDropdownRef = useRef<HTMLDivElement>(null);
    const theaterDropdownRef = useRef<HTMLDivElement>(null);
    const statusDropdownRef = useRef<HTMLDivElement>(null);

    const [formData, setFormData] = useState<{
        movie_id: string;
        theater_id: string;
        show_date: string;
        show_time: string;
        end_time: string;
        price_standard: number | "";
        price_premium: number | "";
        status: string;
    }>({
        movie_id: "",
        theater_id: "",
        show_date: "",
        show_time: "",
        end_time: "",
        price_standard: 0,
        price_premium: 0,
        status: "scheduled",
    });

    const isNotEditable = !!(selectedShowtime && (
        selectedShowtime.status === "completed" ||
        selectedShowtime.status === "cancelled" ||
        (new Date(selectedShowtime.show_date) < (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })())
    ));

    useEffect(() => {
        if (selectedShowtime) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const showDate = new Date(selectedShowtime.show_date);
            const isPast = showDate < today;
            const initialStatus = (selectedShowtime.status === 'scheduled' && isPast) ? 'completed' : (selectedShowtime.status || "scheduled");

            setFormData({
                movie_id: (selectedShowtime.movie_id && typeof selectedShowtime.movie_id === 'object') ? selectedShowtime.movie_id._id : (selectedShowtime.movie_id || ""),
                theater_id: (selectedShowtime.theater_id && typeof selectedShowtime.theater_id === 'object') ? selectedShowtime.theater_id._id : (selectedShowtime.theater_id || ""),
                show_date: selectedShowtime.show_date || "",
                show_time: selectedShowtime.show_time || "",
                end_time: selectedShowtime.end_time || "",
                price_standard: selectedShowtime.price_standard || 0,
                price_premium: selectedShowtime.price_premium || 0,
                status: initialStatus,
            });
        } else {
            resetForm();
        }
    }, [selectedShowtime]);

    useEffect(() => {
        if (formData.movie_id && formData.show_time && !isNotEditable) {
            const movie = movies.find(m => m._id === formData.movie_id);
            if (movie && movie.duration_minutes) {
                const [hours, minutes] = formData.show_time.split(':').map(Number);
                const date = new Date();
                date.setHours(hours, minutes, 0);
                date.setMinutes(date.getMinutes() + movie.duration_minutes);

                const calculatedEnd = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

                setFormData(prev => ({
                    ...prev,
                    end_time: calculatedEnd
                }));
            }
        }
    }, [formData.movie_id, formData.show_time, movies, isNotEditable]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (movieDropdownRef.current && !movieDropdownRef.current.contains(event.target as Node)) {
                setIsMovieOpen(false);
            }
            if (theaterDropdownRef.current && !theaterDropdownRef.current.contains(event.target as Node)) {
                setIsTheaterOpen(false);
            }
            if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
                setIsStatusOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const resetForm = () => {
        setFormData({
            movie_id: "",
            theater_id: "",
            show_date: "",
            show_time: "",
            end_time: "",
            price_standard: 0,
            price_premium: 0,
            status: "scheduled",
        });
        setSelectedShowtime(null);
        setFieldErrors({});
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "number" ? (value === "" ? "" : parseFloat(value)) : value
        }));

        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.movie_id) errors.movie_id = "Please select a movie";
        if (!formData.theater_id) errors.theater_id = "Please select a theater";
        if (!formData.show_date) errors.show_date = "Show date is required";
        if (!formData.show_time) errors.show_time = "Start time is required";
        if (!formData.end_time) errors.end_time = "End time is required";

        if (formData.show_time && formData.end_time) {
            if (formData.end_time <= formData.show_time) {
                errors.end_time = "End time must be after the start time";
            } else {
                const movie = movies.find(m => m._id === formData.movie_id);
                if (movie && movie.duration_minutes) {
                    const [sH, sM] = formData.show_time.split(':').map(Number);
                    const [eH, eM] = formData.end_time.split(':').map(Number);

                    const startTotal = sH * 60 + sM;
                    const endTotal = eH * 60 + eM;
                    const duration = endTotal - startTotal;

                    if (duration < movie.duration_minutes) {
                        errors.end_time = `End time is too early (Movie runtime is ${movie.duration_minutes}m)`;
                    }
                }
            }
        }

        if (formData.price_standard === "" || formData.price_standard < 0) {
            errors.price_standard = "Valid standard price is required";
        }
        if (formData.price_premium === "" || formData.price_premium < 0) {
            errors.price_premium = "Valid premium price is required";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isNotEditable) return;

        if (!validateForm()) {
            setError("Please correct the errors in the schedule configuration.");
            setTimeout(() => setError(null), 5000);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            if (selectedShowtime) {
                await ShowtimeService.update(selectedShowtime._id, formData);
                setSuccess("Showtime updated successfully.");
            } else {
                await ShowtimeService.create(formData);
                setSuccess("New showtime scheduled.");
            }

            await fetchShowtimes();
            setTimeout(() => setSuccess(null), 5000);
            if (!selectedShowtime) resetForm();
        } catch (err: any) {
            console.error("Error saving showtime:", err);
            setError(err.message || (err.response?.data?.message?.[0]) || "Failed to save showtime.");
            setTimeout(() => setError(null), 6000);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedShowtime) return;
        if (!window.confirm("Are you sure you want to cancel this showtime?")) return;

        setIsDeleting(true);
        try {
            await deleteShowtime(selectedShowtime._id);
            setSuccess("Showtime removed from schedule.");
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError("Failed to delete showtime.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden text-zinc-300">
            <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-800 shrink-0 bg-zinc-950/20">
                <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-3">
                        {selectedShowtime ? (isNotEditable ? "View Showtime Archive" : "Edit Showtime") : "Schedule Showtime"}
                        {isNotEditable && (
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tighter ${selectedShowtime.status === "completed" ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30" : "bg-red-500/20 text-red-500 border border-red-500/30"
                                }`}>
                                ARCHIVED RECORD
                            </span>
                        )}
                    </h2>
                    <p className="text-xs text-zinc-500 mt-1">
                        {isNotEditable ? "This record is finalized and cannot be modified." : "Configure movie slot, pricing and venue"}
                    </p>
                </div>
                {selectedShowtime && (
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Movie Selection */}
                        <div className="group space-y-3">
                            <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                                <Film className="w-3.5 h-3.5 transition-transform group-focus-within:scale-110" /> Select Movie
                            </label>
                            <div className="relative" ref={movieDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => !isNotEditable && setIsMovieOpen(!isMovieOpen)}
                                    disabled={isNotEditable}
                                    className={`w-full px-5 py-3.5 rounded-2xl bg-zinc-900/50 border ${fieldErrors.movie_id ? 'border-red-500/50' : 'border-zinc-800'} text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-zinc-900 transition-all flex items-center justify-between group ${isNotEditable ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} hover:border-zinc-700`}
                                >
                                    <div className="flex items-center gap-3 truncate">
                                        <Film className={`w-4 h-4 shrink-0 transition-colors ${formData.movie_id ? 'text-primary' : 'text-zinc-600'}`} />
                                        <span className="font-semibold truncate">
                                            {movies.find(m => m._id === formData.movie_id)?.title || "Select a Movie..."}
                                        </span>
                                    </div>
                                    {!isNotEditable && <ChevronDown className={`w-4 h-4 text-zinc-600 group-hover:text-primary transition-transform duration-500 ${isMovieOpen ? 'rotate-180' : ''}`} />}
                                </button>

                                {isMovieOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-3 p-2 bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 backdrop-blur-2xl max-h-64 overflow-y-auto custom-scrollbar">
                                        <div className="grid gap-1">
                                            {movies.map((movie) => (
                                                <button
                                                    key={movie._id}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, movie_id: movie._id }));
                                                        setIsMovieOpen(false);
                                                        if (fieldErrors.movie_id) {
                                                            setFieldErrors(prev => {
                                                                const newErrors = { ...prev };
                                                                delete newErrors.movie_id;
                                                                return newErrors;
                                                            });
                                                        }
                                                    }}
                                                    className={`w-full px-4 py-3 rounded-xl text-left text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-between group/item ${formData.movie_id === movie._id
                                                        ? 'bg-primary text-white shadow-lg shadow-red-900/40'
                                                        : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'
                                                        }`}
                                                >
                                                    <span className="truncate">{movie.title}</span>
                                                    {formData.movie_id === movie._id && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {fieldErrors.movie_id && (
                                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1 uppercase italic">
                                    <AlertCircle className="w-3 h-3" /> {fieldErrors.movie_id}
                                </p>
                            )}
                        </div>

                        {/* Theater Selection */}
                        <div className="group space-y-3">
                            <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                                <MapPin className="w-3.5 h-3.5 transition-transform group-focus-within:scale-110" /> Select Venue
                            </label>
                            <div className="relative" ref={theaterDropdownRef}>
                                <button
                                    type="button"
                                    onClick={() => !isNotEditable && setIsTheaterOpen(!isTheaterOpen)}
                                    disabled={isNotEditable}
                                    className={`w-full px-5 py-3.5 rounded-2xl bg-zinc-900/50 border ${fieldErrors.theater_id ? 'border-red-500/50' : 'border-zinc-800'} text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-zinc-900 transition-all flex items-center justify-between group ${isNotEditable ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} hover:border-zinc-700`}
                                >
                                    <div className="flex items-center gap-3 truncate">
                                        <MapPin className={`w-4 h-4 shrink-0 transition-colors ${formData.theater_id ? 'text-primary' : 'text-zinc-600'}`} />
                                        <span className="font-semibold truncate">
                                            {cinemas.find(c => c._id === formData.theater_id)?.name || "Select a Cinema Venue..."}
                                        </span>
                                    </div>
                                    {!isNotEditable && <ChevronDown className={`w-4 h-4 text-zinc-600 group-hover:text-primary transition-transform duration-500 ${isTheaterOpen ? 'rotate-180' : ''}`} />}
                                </button>

                                {isTheaterOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-3 p-2 bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 backdrop-blur-2xl max-h-64 overflow-y-auto custom-scrollbar">
                                        <div className="grid gap-1">
                                            {cinemas.map((cinema) => (
                                                <button
                                                    key={cinema._id}
                                                    type="button"
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, theater_id: cinema._id }));
                                                        setIsTheaterOpen(false);
                                                        if (fieldErrors.theater_id) {
                                                            setFieldErrors(prev => {
                                                                const newErrors = { ...prev };
                                                                delete newErrors.theater_id;
                                                                return newErrors;
                                                            });
                                                        }
                                                    }}
                                                    className={`w-full px-4 py-3 rounded-xl text-left text-[11px] font-black uppercase tracking-wider transition-all flex items-center justify-between group/item ${formData.theater_id === cinema._id
                                                        ? 'bg-primary text-white shadow-lg shadow-red-900/40'
                                                        : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'
                                                        }`}
                                                >
                                                    <span className="truncate">{cinema.name}</span>
                                                    {formData.theater_id === cinema._id && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            {fieldErrors.theater_id && (
                                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1 uppercase italic">
                                    <AlertCircle className="w-3 h-3" /> {fieldErrors.theater_id}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Show Date */}
                        <div className="group space-y-3">
                            <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                                <Calendar className="w-3 h-3 transition-transform group-focus-within:scale-110" /> Show Date
                            </label>
                            <div className="relative group/input">
                                <input
                                    type="date"
                                    name="show_date"
                                    value={formData.show_date}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-5 py-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-zinc-900 transition-all cursor-pointer scheme-dark"
                                />
                            </div>
                        </div>

                        {/* Show Time */}
                        <div className="group space-y-3">
                            <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                                <Clock className="w-3 h-3 transition-transform group-focus-within:scale-110" /> Start Time
                            </label>
                            <div className="relative group/input">
                                <input
                                    type="time"
                                    name="show_time"
                                    value={formData.show_time}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-5 py-3.5 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-zinc-900 transition-all cursor-pointer scheme-dark"
                                />
                            </div>
                        </div>

                        {/* End Time */}
                        <div className="group space-y-3">
                            <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1 flex items-center gap-2 group-focus-within:text-red-500 transition-colors">
                                <Clock className="w-3 h-3 text-red-500 transition-transform group-focus-within:scale-110" /> End Time
                            </label>
                            <div className="relative group/input">
                                <input
                                    type="time"
                                    name="end_time"
                                    value={formData.end_time}
                                    onChange={handleInputChange}
                                    required
                                    className={`w-full px-5 py-3.5 rounded-2xl bg-zinc-900/50 border ${fieldErrors.end_time ? 'border-red-500/50' : 'border-zinc-800'} text-sm text-white focus:outline-none focus:border-red-500/30 focus:bg-zinc-900 transition-all cursor-pointer scheme-dark`}
                                />
                            </div>
                            {fieldErrors.end_time && (
                                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1 uppercase italic">
                                    <AlertCircle className="w-3 h-3" /> {fieldErrors.end_time}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        {/* Price Standard */}
                        <div className="group space-y-3">
                            <label className="text-zinc-500 text-[11px] font-black uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-emerald-500 transition-colors">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-500 transition-transform group-focus-within:scale-110" /> Standard Price
                            </label>
                            <div className="relative group/price">
                                <div className="absolute left-1.5 top-1.5 bottom-1.5 w-14 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-center text-zinc-600 font-black text-[9px] tracking-widest group-focus-within/price:border-emerald-500/30 group-focus-within/price:text-emerald-500 transition-all">
                                    USD
                                </div>
                                <input
                                    type="number"
                                    name="price_standard"
                                    value={formData.price_standard}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    required
                                    className={`w-full pl-20 pr-6 py-4 rounded-2xl bg-zinc-900/30 border ${fieldErrors.price_standard ? 'border-red-500/50' : 'border-zinc-800'} text-base font-black text-white focus:outline-none focus:border-emerald-500/40 focus:bg-zinc-900/50 transition-all placeholder:text-zinc-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-inner`}
                                    placeholder="0.00"
                                />
                            </div>
                            {fieldErrors.price_standard && (
                                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1 uppercase italic">
                                    <AlertCircle className="w-3 h-3" /> {fieldErrors.price_standard}
                                </p>
                            )}
                        </div>

                        {/* Price Premium */}
                        <div className="group space-y-3">
                            <label className="text-zinc-500 text-[11px] font-black uppercase tracking-widest ml-1 flex items-center gap-2 group-focus-within:text-primary transition-colors">
                                <DollarSign className="w-3.5 h-3.5 text-primary transition-transform group-focus-within:scale-110" /> Premium Price
                            </label>
                            <div className="relative group/price">
                                <div className="absolute left-1.5 top-1.5 bottom-1.5 w-14 rounded-xl bg-zinc-950 border border-zinc-900 flex items-center justify-center text-zinc-600 font-black text-[9px] tracking-widest group-focus-within/price:border-primary/30 group-focus-within/price:text-primary transition-all">
                                    USD
                                </div>
                                <input
                                    type="number"
                                    name="price_premium"
                                    value={formData.price_premium}
                                    onChange={handleInputChange}
                                    step="0.01"
                                    required
                                    className={`w-full pl-20 pr-6 py-4 rounded-2xl bg-zinc-900/30 border ${fieldErrors.price_premium ? 'border-red-500/50' : 'border-zinc-800'} text-base font-black text-white focus:outline-none focus:border-primary/40 focus:bg-zinc-900/50 transition-all placeholder:text-zinc-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none shadow-inner`}
                                    placeholder="0.00"
                                />
                            </div>
                            {fieldErrors.price_premium && (
                                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1 uppercase italic">
                                    <AlertCircle className="w-3 h-3" /> {fieldErrors.price_premium}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1 flex items-center justify-between">
                            <span>Status</span>
                            {isNotEditable && <span className="text-[10px] text-zinc-600 italic lowercase font-normal">status locked</span>}
                        </label>
                        <div className="relative" ref={statusDropdownRef}>
                            <button
                                type="button"
                                onClick={() => !isNotEditable && setIsStatusOpen(!isStatusOpen)}
                                disabled={isNotEditable}
                                className={`w-full px-5 py-3.5 rounded-2xl border transition-all flex items-center justify-between group h-[52px] ${isNotEditable
                                    ? "bg-zinc-950/50 border-zinc-900 opacity-60 grayscale cursor-not-allowed"
                                    : "bg-zinc-900 border-zinc-800 text-white hover:border-zinc-700 cursor-pointer"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${formData.status === 'completed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                        formData.status === 'cancelled' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                            formData.status === 'ongoing' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                                                'bg-primary shadow-[0_0_8px_rgba(209,31,38,0.5)]'
                                        }`} />
                                    <span className="text-xs font-black uppercase tracking-widest">
                                        {formData.status}
                                    </span>
                                </div>
                                {!isNotEditable && <ChevronDown className={`w-4 h-4 text-zinc-600 group-hover:text-primary transition-transform duration-500 ${isStatusOpen ? 'rotate-180' : ''}`} />}
                            </button>

                            {isStatusOpen && (
                                <div className="absolute top-full left-0 right-0 mt-3 p-2 bg-zinc-900/95 border border-zinc-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 backdrop-blur-2xl overflow-hidden">
                                    <div className="grid gap-1">
                                        {['scheduled', 'ongoing', 'completed', 'cancelled'].map((status) => (
                                            <button
                                                key={status}
                                                type="button"
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, status }));
                                                    setIsStatusOpen(false);
                                                }}
                                                className={`w-full px-4 py-3 rounded-xl text-left text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-between group/item ${formData.status === status
                                                    ? 'bg-primary text-white shadow-lg shadow-red-900/40'
                                                    : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'completed' ? 'bg-emerald-500' :
                                                        status === 'cancelled' ? 'bg-red-500' :
                                                            status === 'ongoing' ? 'bg-amber-500' :
                                                                'bg-white'
                                                        }`} />
                                                    {status}
                                                </div>
                                                {formData.status === status && <CheckCircle2 className="w-3.5 h-3.5" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {selectedShowtime && (
                        <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 space-y-4">
                            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-3.5 h-3.5" /> Runtime Statistics
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900">
                                    <p className="text-[10px] font-semibold text-zinc-600 uppercase">Available Tickets</p>
                                    <p className="text-xl font-bold text-white mt-1">{selectedShowtime.ticket_count_available}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-900">
                                    <p className="text-[10px] font-semibold text-zinc-600 uppercase">Current Status</p>
                                    <div className="mt-2 flex">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors ${selectedShowtime.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
                                            selectedShowtime.status === 'cancelled' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                                                selectedShowtime.status === 'ongoing' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 animate-pulse' :
                                                    'bg-primary/10 border-primary/30 text-primary'
                                            }`}>
                                            {selectedShowtime.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Fixed Footer Actions */}
                <div className="mt-auto px-8 py-6 border-t border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-950/40 backdrop-blur-md">
                    <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-3 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all font-bold text-[10px] uppercase tracking-widest border border-transparent hover:border-zinc-800"
                    >
                        Reset Form
                    </button>

                    <div className="flex items-center gap-4">
                        {selectedShowtime && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting || isNotEditable}
                                className={`px-6 py-3 rounded-xl border font-bold text-[10px] uppercase tracking-widest transition-all ${isNotEditable
                                    ? "border-zinc-800 text-zinc-700 cursor-not-allowed bg-zinc-900/40"
                                    : "border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white shadow-lg shadow-red-900/10"
                                    }`}
                            >
                                {isDeleting ? "Cancelling..." : isNotEditable ? "Status Locked" : "Cancel Showtime"}
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading || isNotEditable}
                            className={`px-10 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 shadow-2xl ${isNotEditable
                                ? "bg-zinc-800 text-zinc-600 cursor-not-allowed shadow-none"
                                : "bg-primary text-white hover:bg-red-600 hover:scale-[1.02] active:scale-[0.98] shadow-red-900/40"
                                } disabled:opacity-50`}
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isNotEditable ? <Activity className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                            {loading ? "Processing..." : isNotEditable ? "Slot Finalized" : selectedShowtime ? "Update Schedule" : "Confirm Schedule"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
