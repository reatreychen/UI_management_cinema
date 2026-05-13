"use client";

import { ChevronRight, Loader2, Plus, Calendar, Clock } from "lucide-react";
import { useShowtime } from "../showtimes/ShowtimeContext";
import { format } from "date-fns";

export default function ShowtimeList() {
    const { showtimes, selectedShowtime, setSelectedShowtime, loading } = useShowtime();

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 shrink-0">
                <div>
                    <h2 className="text-sm font-semibold text-white">Showtimes</h2>
                    <p className="text-[11px] text-zinc-500 mt-1">{showtimes.length} scheduled slots</p>
                </div>
                <button
                    onClick={() => setSelectedShowtime(null)}
                    className="w-8 h-8 flex items-center justify-center bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white rounded-lg transition-all duration-200"
                    title="Add New Showtime"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
                        <span className="text-[11px] text-zinc-600 font-medium">Loading schedule...</span>
                    </div>
                ) : showtimes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
                            <Calendar className="w-5 h-5 text-zinc-700" />
                        </div>
                        <p className="text-[11px] text-zinc-600 font-medium">No showtimes found</p>
                    </div>
                ) : (
                    showtimes.map((showtime) => {
                        const isActive = selectedShowtime?._id === showtime._id;
                        // movie_id and theater_id are populated (nested objects)
                        const movieTitle = (showtime.movie_id && typeof showtime.movie_id === 'object') ? showtime.movie_id.title : 'Unknown Movie';
                        const theaterName = (showtime.theater_id && typeof showtime.theater_id === 'object') ? showtime.theater_id.name : 'Unknown Theater';

                        // Calculate if showtime is in the past
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const showDate = new Date(showtime.show_date);
                        const isPast = showDate < today;
                        const displayStatus = (showtime.status === 'scheduled' && isPast) ? 'completed' : showtime.status;

                        return (
                            <button
                                key={showtime._id}
                                onClick={() => setSelectedShowtime(showtime)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left group ${isActive
                                    ? "bg-zinc-800 text-white"
                                    : "hover:bg-zinc-900 text-zinc-400"
                                    }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold truncate ${isActive ? "text-white" : "text-zinc-300 group-hover:text-white"}`}>
                                        {movieTitle}
                                    </p>
                                    <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                                        {theaterName}
                                    </p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                                            <Calendar className="w-3 h-3" />
                                            {showtime.show_date}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                                            <Clock className="w-3 h-3 text-primary" />
                                            {showtime.show_time}
                                        </div>
                                        <span className={`ml-auto px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${displayStatus === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                            displayStatus === 'cancelled' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                                displayStatus === 'ongoing' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 animate-pulse' :
                                                    'bg-zinc-800 border-zinc-700 text-zinc-500'
                                            }`}>
                                            {displayStatus}
                                        </span>
                                    </div>
                                </div>

                                <ChevronRight className={`w-4 h-4 shrink-0 transition-all ${isActive ? "text-primary translate-x-0.5" : "text-zinc-800 group-hover:text-zinc-600"
                                    }`} />
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
