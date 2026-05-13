"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Star, Clock, Upload,
    Globe, Tag, PlayCircle, Image as ImageIcon, X, AlertCircle, CheckCircle2, Plus, Video,
    ChevronDown
} from "lucide-react";
import { MovieService } from "@/services/movie.service";
import { useMovie } from "../movies/MovieContext";

export default function MovieForm() {
    const { selectedMovie, setSelectedMovie, fetchMovies, deleteMovie } = useMovie();
    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState<string | null>(null);

    const posterInputRef = useRef<HTMLInputElement>(null);
    const trailerInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const videoInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        duration_minutes: 120,
        rating: "G",
        genre: [] as string[],
        language: "English",
        release_date: new Date().toISOString().split("T")[0],
    });

    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [posterPreview, setPosterPreview] = useState<string | null>(null);
    const [trailerFile, setTrailerFile] = useState<File | null>(null);
    const [trailerPreview, setTrailerPreview] = useState<string | null>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [videoFiles, setVideoFiles] = useState<File[]>([]);
    const [videoPreviews, setVideoPreviews] = useState<string[]>([]);

    useEffect(() => {
        if (selectedMovie) {
            setFormData({
                title: selectedMovie.title || "",
                description: selectedMovie.description || "",
                duration_minutes: selectedMovie.duration_minutes || 120,
                rating: selectedMovie.rating || "G",
                genre: selectedMovie.genre || [],
                language: selectedMovie.language || "English",
                release_date: selectedMovie.release_date ? new Date(selectedMovie.release_date).toISOString().split("T")[0] : "",
            });
            setPosterPreview(selectedMovie.poster_url || null);
            setTrailerPreview(selectedMovie.trailer_url || null);
            setImagePreviews(selectedMovie.images || []);
            setVideoPreviews(selectedMovie.videos || []);
        } else {
            resetForm();
        }
    }, [selectedMovie]);

    const resetForm = () => {
        setFormData({
            title: "",
            description: "",
            duration_minutes: 120,
            rating: "G",
            genre: [],
            language: "English",
            release_date: new Date().toISOString().split("T")[0],
        });
        setPosterFile(null);
        setPosterPreview(null);
        setTrailerFile(null);
        setTrailerPreview(null);
        setImageFiles([]);
        setImagePreviews([]);
        setVideoFiles([]);
        setVideoPreviews([]);
        setFieldErrors({});
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleGenreToggle = (g: string) => {
        setFormData(prev => ({
            ...prev,
            genre: prev.genre.includes(g)
                ? prev.genre.filter(item => item !== g)
                : [...prev.genre, g]
        }));

        if (fieldErrors.genre) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.genre;
                return newErrors;
            });
        }
    };

    // File Handlers
    const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPosterFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setPosterPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleTrailerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setTrailerFile(file);
            setTrailerPreview(URL.createObjectURL(file));

            if (fieldErrors.trailer) {
                setFieldErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.trailer;
                    return newErrors;
                });
            }
        }
    };

    const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setImageFiles(prev => [...prev, ...files]);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreviews(prev => [...prev, reader.result as string]);
            reader.readAsDataURL(file);
        });
    };

    const removeImagePreview = (index: number) => {
        const previewToRemove = imagePreviews[index];
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        if (previewToRemove.startsWith('data:') || previewToRemove.startsWith('blob:')) {
            setByLabelImageFiles(index);
        }
    };

    const setByLabelImageFiles = (previewIndex: number) => {
        const existingImagesCount = selectedMovie?.images?.length || 0;
        const fileIndex = previewIndex - existingImagesCount;
        if (fileIndex >= 0) {
            setImageFiles(prev => prev.filter((_, i) => i !== fileIndex));
        }
    };

    const handleVideosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setVideoFiles(prev => [...prev, ...files]);

        files.forEach(file => {
            setVideoPreviews(prev => [...prev, URL.createObjectURL(file)]);
        });
    };

    const removeVideoPreview = (index: number) => {
        const previewToRemove = videoPreviews[index];
        setVideoPreviews(prev => prev.filter((_, i) => i !== index));

        const existingVideosCount = selectedMovie?.videos?.length || 0;
        const fileIndex = index - existingVideosCount;
        if (fileIndex >= 0) {
            setVideoFiles(prev => prev.filter((_, i) => i !== fileIndex));
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.title.trim()) errors.title = "Title is required";
        else if (formData.title.length < 2) errors.title = "Title must be at least 2 characters";

        if (!formData.duration_minutes || formData.duration_minutes <= 0) {
            errors.duration_minutes = "Valid duration is required";
        }

        if (formData.genre.length === 0) {
            errors.genre = "Select at least one genre";
        }

        if (!formData.language.trim()) errors.language = "Language is required";

        if (!formData.release_date) {
            errors.release_date = "Release date is required";
        }

        if (!selectedMovie && !posterFile) {
            errors.poster = "Cinematic poster is required";
        }

        if (!selectedMovie && !trailerFile) {
            errors.trailer = "Production trailer is required";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const [isRatingOpen, setIsRatingOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const ratingOptions = [
        { value: "G", label: "G - General" },
        { value: "PG", label: "PG - Parental Guidance" },
        { value: "PG-13", label: "PG-13" },
        { value: "R", label: "R - Restricted" },
        { value: "NC15", label: "NC15" },
        { value: "NC-17", label: "NC-17" },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsRatingOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            setError("Please correct the errors in the form.");
            setTimeout(() => setError(null), 5000);
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("duration_minutes", (parseInt(String(formData.duration_minutes)) || 0).toString());
            data.append("rating", formData.rating);
            data.append("language", formData.language);
            data.append("release_date", formData.release_date);

            formData.genre.forEach(g => data.append("genre", g));

            if (posterFile) data.append("poster", posterFile);
            if (trailerFile) data.append("trailer", trailerFile);

            imageFiles.forEach(file => data.append("images", file));
            videoFiles.forEach(file => data.append("videos", file));

            if (selectedMovie) {
                await MovieService.update(selectedMovie._id, data);
            } else {
                await MovieService.create(data);
            }

            await fetchMovies();
            setSuccess(selectedMovie ? "Production record synchronized." : "New masterpiece archived.");
            setTimeout(() => setSuccess(null), 5000);
            resetForm();
        } catch (err: any) {
            console.error("Error saving movie:", err);
            setError(err.response?.data?.message || "A production failure occurred during archiving.");
            setTimeout(() => setError(null), 6000);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedMovie) return;
        if (!window.confirm("Are you sure you want to delete this movie?")) return;
        setIsDeleting(true);
        try {
            await MovieService.delete(selectedMovie._id);
            await fetchMovies();
            setSuccess("Masterpiece decommissioned from archives.");
            setTimeout(() => setSuccess(null), 5000);
            setSelectedMovie(null);
        } catch (err: any) {
            setError("Failed to decommission architectural record.");
            setTimeout(() => setError(null), 5000);
        } finally {
            setIsDeleting(false);
        }
    };

    const genres = ["Action", "Drama", "Horror", "Thriller", "Science", "Fantasy", "Animation", "Documentary", "Adventure"];

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-800/50 shrink-0 bg-zinc-950/40 backdrop-blur-md sticky top-0 z-30">
                <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-3 tracking-tight">
                        {selectedMovie ? "EDIT MASTERPIECE" : "NEW ARCHIVE ENTRY"}
                    </h2>
                    <p className="text-[10px] text-zinc-500 mt-1 font-bold uppercase tracking-widest opacity-70">Archive cinematic assets and manage availability.</p>
                </div>
                {selectedMovie && (
                    <button
                        onClick={() => setSelectedMovie(null)}
                        className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <X className="w-4 h-4" /> Cancel Edition
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="space-y-10 flex-1 overflow-y-auto px-8 py-8 custom-scrollbar pb-12">
                    {/* Status Alerts */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-300 mb-6">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-300 mb-6">
                            <CheckCircle2 className="w-4 h-4" /> {success}
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                        {/* Poster Upload Section */}
                        <div className="lg:col-span-4 space-y-4">
                            <label className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest ml-1 opacity-80">Poster Image</label>
                            <div
                                onClick={() => posterInputRef.current?.click()}
                                className="relative w-48 aspect-2/3 rounded-2xl bg-zinc-900 overflow-hidden border border-zinc-800 group cursor-pointer hover:border-primary/50 transition-all duration-500 shadow-2xl hover:shadow-primary/5 active:scale-98"
                            >
                                {posterPreview ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <div className="w-full h-full relative overflow-hidden">
                                        <img src={posterPreview} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-4">
                                            <p className="text-[10px] text-white font-bold uppercase tracking-widest">Change Poster</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-zinc-600">
                                        <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:rotate-12 transition-all duration-500">
                                            <Upload className="w-6 h-6 group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="text-center">
                                            <span className="text-[10px] font-bold uppercase tracking-widest block">Upload</span>
                                            <span className="text-[9px] text-zinc-700 mt-1 block">2:3 Aspect Ratio</span>
                                        </div>
                                    </div>
                                )}
                                <input type="file" ref={posterInputRef} onChange={handlePosterChange} className="hidden" accept="image/*" />
                            </div>
                            {fieldErrors.poster && (
                                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1 uppercase">
                                    <AlertCircle className="w-3 h-3" /> {fieldErrors.poster}
                                </p>
                            )}
                        </div>

                        {/* Basic Info Section */}
                        <div className="lg:col-span-8 space-y-8">
                            <div className="space-y-4">
                                <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1">Movie Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className={`w-full px-5 py-4 rounded-xl bg-zinc-900/50 border ${fieldErrors.title ? 'border-red-500/50' : 'border-zinc-800'} text-white focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-zinc-700 font-medium`}
                                    placeholder="Enter production title..."
                                />
                                {fieldErrors.title && (
                                    <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1 uppercase italic">
                                        <AlertCircle className="w-3 h-3" /> {fieldErrors.title}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1 flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5" /> Runtime (min) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="duration_minutes"
                                        value={formData.duration_minutes}
                                        onChange={handleInputChange}
                                        className={`w-full px-5 py-3 rounded-xl bg-zinc-900 border ${fieldErrors.duration_minutes ? 'border-red-500/50' : 'border-zinc-800'} text-white focus:outline-none focus:border-primary/50 transition-all`}
                                    />
                                    {fieldErrors.duration_minutes && (
                                        <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1 uppercase italic">
                                            <AlertCircle className="w-3 h-3" /> {fieldErrors.duration_minutes}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1 flex items-center gap-2">
                                        <Star className="w-3.5 h-3.5" /> Rating <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            type="button"
                                            onClick={() => setIsRatingOpen(!isRatingOpen)}
                                            className="w-full px-5 py-4 rounded-xl bg-zinc-900/50 border border-zinc-800 text-white focus:outline-none focus:border-primary/50 transition-all flex items-center justify-between group"
                                        >
                                            <span className="font-semibold text-sm">
                                                {ratingOptions.find(opt => opt.value === formData.rating)?.label || "Select Rating"}
                                            </span>
                                            <ChevronDown className={`w-4 h-4 text-zinc-500 group-hover:text-primary transition-transform duration-500 ${isRatingOpen ? 'rotate-180' : ''}`} />
                                        </button>

                                        {isRatingOpen && (
                                            <div className="absolute top-full left-0 right-0 mt-3 p-2 bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 backdrop-blur-2xl">
                                                <div className="grid gap-1">
                                                    {ratingOptions.map((opt) => (
                                                        <button
                                                            key={opt.value}
                                                            type="button"
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, rating: opt.value }));
                                                                setIsRatingOpen(false);
                                                            }}
                                                            className={`w-full px-4 py-3 rounded-xl text-left text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between group/item ${formData.rating === opt.value
                                                                ? 'bg-primary text-white shadow-lg shadow-red-900/40'
                                                                : 'text-zinc-500 hover:bg-zinc-800 hover:text-white'
                                                                }`}
                                                        >
                                                            {opt.label}
                                                            {formData.rating === opt.value && <CheckCircle2 className="w-4 h-4" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Genre Selection */}
                    <div className="space-y-4">
                        <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1 flex items-center gap-2">
                            <Tag className="w-3.5 h-3.5" /> Genre <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {genres.map(g => (
                                <button
                                    key={g}
                                    type="button"
                                    onClick={() => handleGenreToggle(g)}
                                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${formData.genre.includes(g)
                                        ? "bg-primary border-primary text-white shadow-[0_0_20px_rgba(209,31,38,0.3)] scale-105"
                                        : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                                        }`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                        {fieldErrors.genre && (
                            <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1 uppercase italic">
                                <AlertCircle className="w-3 h-3" /> {fieldErrors.genre}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1 flex items-center gap-2">
                                <Globe className="w-3.5 h-3.5" /> Language <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="language"
                                value={formData.language}
                                onChange={handleInputChange}
                                className={`w-full px-5 py-3 rounded-xl bg-zinc-900 border ${fieldErrors.language ? 'border-red-500/50' : 'border-zinc-800'} text-white focus:outline-none focus:border-primary/50 transition-all`}
                                placeholder="Main track language..."
                            />
                            {fieldErrors.language && (
                                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1 uppercase italic">
                                    <AlertCircle className="w-3 h-3" /> {fieldErrors.language}
                                </p>
                            )}
                        </div>
                        <div className="space-y-4">
                            <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1 flex items-center gap-2">
                                <ImageIcon className="w-3.5 h-3.5" /> Release Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="release_date"
                                value={formData.release_date}
                                onChange={handleInputChange}
                                className={`w-full px-5 py-3 rounded-xl bg-zinc-900 border ${fieldErrors.release_date ? 'border-red-500/50' : 'border-zinc-800'} text-white focus:outline-none focus:border-primary/50 transition-all scheme-dark`}
                            />
                            {fieldErrors.release_date && (
                                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1 uppercase italic">
                                    <AlertCircle className="w-3 h-3" /> {fieldErrors.release_date}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1">
                            Description <span className="text-[9px] text-zinc-600 normal-case ml-1 font-normal opacity-70">(Optional)</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-5 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm focus:outline-none focus:border-primary/50 transition-all resize-none leading-relaxed shadow-inner"
                            placeholder="Describe the production plot and artistic vision..."
                        />
                    </div>

                    {/* Media Assets Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Trailer Upload */}
                        <div className="space-y-4">
                            <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1 flex items-center gap-2">
                                <PlayCircle className="w-3.5 h-3.5" /> Primary Trailer <span className="text-red-500">*</span>
                            </label>
                            <div
                                onClick={() => trailerInputRef.current?.click()}
                                className={`aspect-video rounded-2xl bg-zinc-900 border ${fieldErrors.trailer ? 'border-red-500/50' : 'border-zinc-800'} flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 transition-all overflow-hidden relative group shadow-lg`}
                            >
                                {trailerPreview ? (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black">
                                        <video
                                            src={trailerPreview}
                                            className="w-full h-full object-contain"
                                            controls={false}
                                            muted
                                        />
                                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex flex-col items-center justify-center gap-2">
                                            <Video className="w-8 h-8 text-white opacity-80" />
                                            <span className="text-[10px] text-white/90 font-bold uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                                                Trailer Linked
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                            <Video className="w-5 h-5 text-zinc-600 group-hover:text-primary transition-colors" />
                                        </div>
                                        <span className="text-[10px] font-medium text-zinc-600">Upload Trailer Video</span>
                                    </>
                                )}
                                <input type="file" ref={trailerInputRef} onChange={handleTrailerChange} className="hidden" accept="video/*" />
                            </div>
                            {fieldErrors.trailer && (
                                <p className="text-[10px] text-red-500 font-bold mt-1 ml-1 flex items-center gap-1 uppercase italic">
                                    <AlertCircle className="w-3 h-3" /> {fieldErrors.trailer}
                                </p>
                            )}
                        </div>

                        {/* Gallery Upload */}
                        <div className="space-y-4">
                            <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1 flex items-center gap-2">
                                <ImageIcon className="w-3.5 h-3.5" /> Production Stills <span className="text-[9px] text-zinc-600 normal-case ml-1 font-normal opacity-70">(Optional)</span>
                            </label>
                            <div className="grid grid-cols-4 gap-3">
                                {imagePreviews.map((preview, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden group">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={preview} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                        <button
                                            type="button"
                                            onClick={() => removeImagePreview(idx)}
                                            className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => galleryInputRef.current?.click()}
                                    className="aspect-square rounded-xl bg-zinc-900 border border-zinc-800 border-dashed flex items-center justify-center hover:bg-zinc-800 hover:border-zinc-700 transition-all group"
                                >
                                    <Plus className="w-5 h-5 text-zinc-700 group-hover:text-zinc-500" />
                                </button>
                                <input type="file" ref={galleryInputRef} onChange={handleImagesChange} className="hidden" multiple accept="image/*" />
                            </div>
                        </div>

                        {/* Production Videos */}
                        <div className="space-y-4">
                            <label className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider ml-1 flex items-center gap-2">
                                <Video className="w-3.5 h-3.5" /> Production Clips <span className="text-[9px] text-zinc-600 normal-case ml-1 font-normal opacity-70">(optional)</span>
                            </label>
                            <div className="grid grid-cols-4 gap-3">
                                {videoPreviews.map((preview, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden group">
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-800/50">
                                            <PlayCircle className="w-6 h-6 text-zinc-600" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeVideoPreview(idx)}
                                            className="absolute top-1 cursor-pointer right-1 p-1 bg-black/60 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        <div className="absolute bottom-0 inset-x-0 h-1 bg-primary/30" />
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => videoInputRef.current?.click()}
                                    className="aspect-square cursor-pointer rounded-xl bg-zinc-900 border border-zinc-800 border-dashed flex items-center justify-center hover:bg-zinc-800 hover:border-zinc-700 transition-all group"
                                >
                                    <Plus className="w-5 h-5 text-zinc-700 group-hover:text-zinc-500" />
                                </button>
                                <input type="file" ref={videoInputRef} onChange={handleVideosChange} className="hidden" multiple accept="video/*" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fixed Footer Actions */}
                <div className="mt-auto px-8 py-6 border-t border-zinc-800/50 flex items-center justify-between shrink-0 bg-zinc-950/60 backdrop-blur-xl sticky bottom-0 z-30">
                    <button
                        type="button"
                        onClick={resetForm}
                        className="px-6 py-3 cursor-pointer rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all font-bold text-[10px] uppercase tracking-[0.2em]"
                    >
                        Reset Form
                    </button>

                    <div className="flex items-center gap-6">
                        {selectedMovie && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-6 py-3 cursor-pointer rounded-xl border border-red-900/30 text-red-500 hover:bg-red-500 hover:text-white transition-all font-bold text-[10px] uppercase tracking-[0.2em]"
                            >
                                {isDeleting ? "Deleting..." : "Delete Movie"}
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-12 py-3 cursor-pointer rounded-xl bg-primary text-white font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-red-700 hover:shadow-[0_0_30px_rgba(209,31,38,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-xl shadow-red-900/20 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:transform-none"
                        >
                            {loading ? "Uploading..." : selectedMovie ? "Update Movie" : "Upload Movie"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
