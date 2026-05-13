"use client";

import { ChevronRight, Loader2, Plus, MapPin } from "lucide-react";
import { useCinema } from "../cinemas/CinemaContext";

export default function CinemaList() {
    const { cinemas, selectedCinema, setSelectedCinema, loading } = useCinema();

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-800 shrink-0">
                <div>
                    <h2 className="text-sm font-semibold text-white">Cinemas</h2>
                    <p className="text-[11px] text-zinc-500 mt-1">{cinemas.length} active locations</p>
                </div>
                <button
                    onClick={() => setSelectedCinema(null)}
                    className="w-8 h-8 flex items-center justify-center bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white rounded-lg transition-all duration-200"
                    title="Add New Venue"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1 custom-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-5 h-5 animate-spin text-zinc-600" />
                        <span className="text-[11px] text-zinc-600 font-medium">Scanning grid...</span>
                    </div>
                ) : cinemas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800">
                            <MapPin className="w-5 h-5 text-zinc-700" />
                        </div>
                        <p className="text-[11px] text-zinc-600 font-medium">No venues registered</p>
                    </div>
                ) : (
                    cinemas.map((cinema) => {
                        const isActive = selectedCinema?._id === cinema._id;
                        return (
                            <button
                                key={cinema._id}
                                onClick={() => setSelectedCinema(cinema)}
                                className={`w-full flex items-center gap-4 p-2.5 rounded-xl transition-all duration-200 text-left group ${isActive
                                    ? "bg-zinc-800 text-white"
                                    : "hover:bg-zinc-900 text-zinc-400"
                                    }`}
                            >
                                {/* Image thumbnail */}
                                <div className={`w-12 h-10 rounded-lg bg-zinc-900 overflow-hidden border transition-colors shrink-0 ${isActive ? "border-primary/50" : "border-zinc-800"}`}>
                                    {cinema.image ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img src={cinema.image} alt={cinema.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <MapPin className="w-4 h-4 text-zinc-800" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${isActive ? "text-white" : "text-zinc-300 group-hover:text-white"}`}>
                                        {cinema.name}
                                    </p>
                                    <p className="text-[10px] text-zinc-600 truncate mt-1 flex items-center gap-1.5">
                                        <MapPin className="w-3 h-3 shrink-0" />
                                        {cinema.location}
                                    </p>
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
