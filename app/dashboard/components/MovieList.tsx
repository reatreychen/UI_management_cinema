"use client";

import { Clock, ChevronRight, Loader2, Plus, Film } from "lucide-react";
import { useMovie } from "../movies/MovieContext";

export default function MovieList() {
    const { movies, selectedMovie, setSelectedMovie, loading } = useMovie();

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-zinc-800/50 shrink-0 bg-zinc-950/20">
                <div>
                    <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">COLLECTION</h2>
                    <p className="text-[10px] text-zinc-600 mt-1 font-bold">{movies.length} MASTERPIECES ARCHIVED</p>
                </div>
                <button
                    onClick={() => setSelectedMovie(null)}
                    className="w-9 h-9 flex items-center justify-center bg-zinc-900 border border-zinc-800 text-zinc-400 hover:border-primary/50 hover:text-primary rounded-xl transition-all duration-300 shadow-lg hover:shadow-primary/5 group"
                    title="Add New Movie"
                >
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
                        <span className="text-[11px] text-zinc-600 font-medium">Loading records...</span>
                    </div>
                ) : movies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
                            <Film className="w-5 h-5 text-zinc-700" />
                        </div>
                        <p className="text-[11px] text-zinc-600 font-medium">No records found</p>
                    </div>
                ) : (
                    movies.map((movie) => {
                        const isActive = selectedMovie?._id === movie._id;
                        return (
                            <button
                                key={movie._id}
                                onClick={() => setSelectedMovie(movie)}
                                className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 text-left group relative overflow-hidden ${isActive
                                    ? "bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black"
                                    : "hover:bg-zinc-900/50 border border-transparent text-zinc-400"
                                    }`}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full shadow-[0_0_15px_rgba(209,31,38,0.5)]" />
                                )}

                                {/* Poster thumbnail */}
                                <div className={`ml-1 w-12 h-16 rounded-xl bg-zinc-950 overflow-hidden border-2 transition-all duration-500 shrink-0 shadow-lg ${isActive ? "border-primary/40 scale-105" : "border-zinc-800 group-hover:border-zinc-700"}`}>
                                    {movie.poster_url ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={movie.poster_url} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                                            <Film className="w-5 h-5 text-zinc-800" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-[13px] font-bold truncate tracking-tight transition-colors ${isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                                        {movie.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md tracking-tighter transition-all ${isActive ? "bg-primary text-white shadow-lg shadow-red-900/20" : "bg-zinc-800 text-zinc-500 group-hover:text-zinc-400"}`}>
                                            {movie.rating}
                                        </span>
                                        <div className="flex items-center gap-1 text-[10px] text-zinc-600 font-bold uppercase tracking-widest opacity-60">
                                            <Clock className="w-3 h-3" />
                                            {movie.duration_minutes}m
                                        </div>
                                    </div>
                                </div>

                                <ChevronRight className={`w-4 h-4 shrink-0 transition-all duration-300 ${isActive ? "text-primary translate-x-1" : "text-zinc-800 group-hover:text-zinc-600"
                                    }`} />
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
