"use client";

import React, { useState, useEffect } from "react";
import {
    Grid3X3, Plus, Trash2, MapPin, Loader2, Save,
    Layers, Hash, Type, CheckCircle2, AlertCircle, RefreshCcw, Info, Armchair
} from "lucide-react";
import { useCinema } from "../cinemas/CinemaContext";
import { useSeat } from "../seats/SeatContext";

export default function SeatManagement() {
    const { cinemas, loading: cinemasLoading } = useCinema();
    const { seats, loading: seatsLoading, fetchSeats, bulkCreateSeats, toggleSeatStatus, updateSeat, bulkUpdateSeats, deleteSeat } = useSeat();

    const [selectedCinemaId, setSelectedCinemaId] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Generator state
    const [genData, setGenData] = useState({
        rows: "A,B,C,D",
        seatsPerRow: 10,
        seatType: "standard" as "standard" | "premium" | "vip" | "recliner"
    });

    useEffect(() => {
        if (selectedCinemaId) {
            fetchSeats(selectedCinemaId);
        }
    }, [selectedCinemaId]);

    const currentCinema = cinemas.find(c => c._id === selectedCinemaId);

    const handleBulkGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCinemaId || !currentCinema) return;

        const rowsArray = genData.rows.split(",").map(r => r.trim()).filter(r => r);
        const totalToGenerate = rowsArray.length * genData.seatsPerRow;
        const totalAfterGeneration = seats.length + totalToGenerate;

        if (currentCinema.capacity && totalAfterGeneration > currentCinema.capacity) {
            setError(`Capacity Exceeded! The cinema capacity is ${currentCinema.capacity}, but you are trying to have ${totalAfterGeneration} seats total (${seats.length} existing + ${totalToGenerate} new).`);
            return;
        }

        setIsGenerating(true);
        setError(null);
        try {
            await bulkCreateSeats({
                theater_id: selectedCinemaId,
                rows: rowsArray,
                seats_per_row: genData.seatsPerRow,
                seat_type: genData.seatType
            });
            setSuccess(`Successfully generated seats for ${rowsArray.length} rows.`);
            setTimeout(() => setSuccess(null), 5000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to generate seats.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Group seats by row
    const groupedSeats = seats.reduce((acc, seat) => {
        if (!acc[seat.row_letter]) acc[seat.row_letter] = [];
        acc[seat.row_letter].push(seat);
        return acc;
    }, {} as Record<string, typeof seats>);

    // Sort rows and seats
    const sortedRows = Object.keys(groupedSeats).sort();
    sortedRows.forEach(row => {
        groupedSeats[row].sort((a, b) => a.seat_number - b.seat_number);
    });

    const handleUpdateRowType = async (rowLetter: string, newType: string) => {
        if (!selectedCinemaId) return;
        setLoading(true);
        try {
            await bulkUpdateSeats(selectedCinemaId, [rowLetter], { seat_type: newType });
            setSuccess(`Updated row ${rowLetter} to ${newType.toUpperCase()}`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError("Failed to update row type.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSeat = async (seatId: string, seatLabel: string, type: string) => {
        try {
            await updateSeat(seatId, { seat_type: type });
            setSuccess(`Seat ${seatLabel} updated to ${type.toUpperCase()}`);
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            setError(`Failed to update seat ${seatLabel}`);
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleDeleteSeat = async (seatId: string, seatLabel: string) => {
        if (!window.confirm(`Are you sure you want to delete seat ${seatLabel}?`)) return;
        try {
            await deleteSeat(seatId);
            setSuccess(`Seat ${seatLabel} removed from layout`);
            setTimeout(() => setSuccess(null), 2000);
        } catch (err) {
            setError(`Failed to delete seat ${seatLabel}`);
            setTimeout(() => setError(null), 3000);
        }
    };

    const [loading, setLoading] = useState(false);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="px-8 py-6 border-b border-zinc-800 bg-zinc-950/20 flex flex-col md:flex-row md:items-center justify-between gap-6 shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <Grid3X3 className="w-6 h-6 text-primary" />
                        Seat Management
                    </h2>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <select
                            value={selectedCinemaId}
                            onChange={(e) => setSelectedCinemaId(e.target.value)}
                            className="pl-10 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer min-w-[240px]"
                        >
                            <option value="">Select a Cinema</option>
                            {cinemas.map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                        <MapPin className="w-4 h-4 text-zinc-600 absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>
                    {selectedCinemaId && (
                        <button
                            onClick={() => fetchSeats(selectedCinemaId)}
                            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-primary transition-colors"
                        >
                            <RefreshCcw className={`w-4 h-4 ${seatsLoading ? 'animate-spin' : ''}`} />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                {/* Left Side: Generator & Stats */}
                <div className="w-full lg:w-80 border-r border-zinc-800 bg-zinc-950/40 p-8 space-y-8 overflow-y-auto custom-scrollbar shrink-0">

                    {/* Bulk Generator */}
                    <div className="space-y-6">
                        <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5" /> Bulk Generator
                        </h3>

                        <form onSubmit={handleBulkGenerate} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                                    <Hash className="w-3 h-3" /> Rows
                                </label>
                                <input
                                    type="text"
                                    value={genData.rows}
                                    onChange={e => setGenData({ ...genData, rows: e.target.value })}
                                    placeholder="A,B,C..."
                                    className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                                    <Hash className="w-3 h-3" /> Seats Per Row
                                </label>
                                <input
                                    type="number"
                                    value={genData.seatsPerRow}
                                    onChange={e => setGenData({ ...genData, seatsPerRow: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                                    <Type className="w-3 h-3" /> Default Seat Type
                                </label>
                                <select
                                    value={genData.seatType}
                                    onChange={e => setGenData({ ...genData, seatType: e.target.value as any })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="standard">Standard</option>
                                    <option value="premium">Premium</option>
                                    <option value="vip">VIP</option>
                                    <option value="recliner">Recliner</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isGenerating || !selectedCinemaId}
                                className="w-full py-3 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 disabled:bg-zinc-800 disabled:text-zinc-600 flex items-center justify-center gap-2"
                            >
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {isGenerating ? "Generating..." : "Upload Seat"}
                            </button>
                        </form>
                    </div>

                    {/* Stats Summary */}
                    {selectedCinemaId && (
                        <div className="space-y-6 pt-8 border-t border-zinc-900">
                            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                <Info className="w-3.5 h-3.5" /> Seat List
                            </h3>

                            {/* Capacity Check Warning */}
                            {currentCinema?.capacity && seats.length > currentCinema.capacity && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-500 font-bold uppercase flex items-center gap-2 animate-pulse">
                                    <AlertCircle className="w-3.5 h-3.5" /> Over Capacity Plan
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-4 rounded-xl bg-zinc-900/50 border transition-all ${currentCinema?.capacity && seats.length > currentCinema.capacity ? "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.1)]" : "border-zinc-800"}`}>
                                    <p className="text-[10px] font-medium text-zinc-600 uppercase">Total Unit</p>
                                    <div className="flex items-baseline gap-1">
                                        <p className={`text-xl font-bold mt-1 ${currentCinema?.capacity && seats.length > currentCinema.capacity ? "text-red-500" : "text-white"}`}>
                                            {seats.length}
                                        </p>
                                        {currentCinema?.capacity && (
                                            <span className="text-[10px] text-zinc-700 font-black">/ {currentCinema.capacity} MAX</span>
                                        )}
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                                    <p className="text-[10px] font-medium text-zinc-600 uppercase">Rows</p>
                                    <p className="text-xl font-bold text-white mt-1">{sortedRows.length}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                                    <p className="text-[10px] font-medium text-zinc-600 uppercase">Active</p>
                                    <p className="text-xl font-bold text-emerald-500 mt-1">{seats.filter(s => s.is_active).length}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                                    <p className="text-[10px] font-medium text-zinc-600 uppercase">Disabled</p>
                                    <p className="text-xl font-bold text-red-500 mt-1">{seats.filter(s => !s.is_active).length}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Matrix Display */}
                <div className="flex-1 bg-zinc-950 p-8 overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold">
                            <AlertCircle className="w-4 h-4" /> {error}
                        </div>
                    )}
                    {success && (
                        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4" /> {success}
                        </div>
                    )}

                    {!selectedCinemaId ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center border border-zinc-800 shadow-2xl">
                                <MapPin className="w-8 h-8 text-zinc-700" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">No Venue Selected</h3>
                                <p className="text-zinc-500 text-sm mt-2 max-w-xs mx-auto">Please select a cinema venue from the dropdown above to view or configure its seat layout.</p>
                            </div>
                        </div>
                    ) : seatsLoading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-zinc-500 text-sm font-medium animate-pulse">Decrypting layout ...</p>
                        </div>
                    ) : seats.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-20 h-20 rounded-3xl bg-zinc-900 flex items-center justify-center border border-zinc-800 shadow-2xl">
                                <Plus className="w-8 h-8 text-zinc-700" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Empty Seat</h3>
                                <p className="text-zinc-500 text-sm mt-2 max-w-xs mx-auto">This theater has no seats registered.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-12 pb-20">
                            {/* Screen Indicator */}
                            <div className="flex flex-col items-center space-y-4">
                                <div className="w-full max-w-xl h-2 bg-linear-to-r from-zinc-900 via-primary/40 to-zinc-900 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.2)]" />
                                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em]">Cinema Screen</span>
                            </div>

                            {/* Seat Grid */}
                            <div className="space-y-4 flex flex-col items-center">
                                {sortedRows.map(rowLetter => (
                                    <div key={rowLetter} className="flex items-center gap-4">
                                        <div className="flex flex-col items-center gap-1">
                                            <span className="w-8 h-8 flex items-center justify-center text-[11px] font-bold text-zinc-600 border border-zinc-900 rounded bg-zinc-950">
                                                {rowLetter}
                                            </span>
                                            <select
                                                onChange={(e) => handleUpdateRowType(rowLetter, e.target.value)}
                                                className="text-[8px] bg-transparent border-none text-zinc-700 hover:text-primary cursor-pointer focus:outline-none uppercase font-bold"
                                                value={groupedSeats[rowLetter][0].seat_type}
                                            >
                                                <option value="standard">STD</option>
                                                <option value="premium">PRM</option>
                                                <option value="vip">VIP</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2 cursor-pointer">
                                            {groupedSeats[rowLetter].map(seat => {
                                                const typeColor =
                                                    seat.seat_type === "vip" ? "text-amber-500/80 group-hover/seat:text-amber-400" :
                                                        seat.seat_type === "premium" ? "text-indigo-500/80 group-hover/seat:text-indigo-400" :
                                                            seat.seat_type === "recliner" ? "text-pink-500/80 group-hover/seat:text-pink-400" :
                                                                "text-zinc-500 group-hover/seat:text-zinc-300";
                                                const borderType =
                                                    seat.seat_type === "vip" ? "border-amber-500/30 shadow-amber-900/10" :
                                                        seat.seat_type === "premium" ? "border-indigo-500/30 shadow-indigo-900/10" :
                                                            seat.seat_type === "recliner" ? "border-pink-500/30 shadow-pink-900/10" :
                                                                "border-zinc-800/50 shadow-black/10";

                                                return (
                                                    <div key={seat._id} className="group/seat relative">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); toggleSeatStatus(seat._id); }}
                                                            className={`
                                                                relative w-10 h-11 transition-all duration-300 flex flex-col items-center justify-center group/btn
                                                                ${!seat.is_active ? "opacity-30 grayscale saturate-0" : "hover:scale-110 active:scale-95"}
                                                            `}
                                                        >
                                                            {/* Seat Icon Styling */}
                                                            <div className={`
                                                                absolute inset-0 rounded-t-xl rounded-b-md border bg-zinc-900/40 backdrop-blur-sm transition-all duration-300
                                                                ${seat.is_active ? `group-hover/btn:border-primary/50 group-hover/btn:bg-zinc-800/60 ${borderType}` : "border-red-500/30 bg-red-500/5"}
                                                            `} />

                                                            <Armchair className={`w-5 h-5 mb-0.5 relative z-10 transition-colors duration-300 ${seat.is_active ? typeColor : "text-red-500/50"}`} />

                                                            <span className={`
                                                                text-[9px] font-black relative z-10 
                                                                ${seat.is_active ? "text-white/40 group-hover/btn:text-white" : "text-red-500/40"}
                                                            `}>
                                                                {seat.seat_number}
                                                            </span>

                                                            {/* Status Indicators */}
                                                            {!seat.is_active && (
                                                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-zinc-950 z-20" />
                                                            )}
                                                        </button>

                                                        {/* Context Actions Hover Tooltip */}
                                                        {/* Bridge to prevent losing hover on mb-2 gap */}
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/seat:flex flex-col items-center z-50 animate-in fade-in slide-in-from-bottom-2">
                                                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-1.5 min-w-[120px] flex flex-col gap-1.5">
                                                                <div className="grid grid-cols-2 gap-1.5 p-1 border-b border-zinc-800/50">
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); handleUpdateSeat(seat._id, `${seat.row_letter}${seat.seat_number}`, 'standard'); }}
                                                                        className="px-2 py-1.5 text-[9px] font-bold uppercase rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-500 transition-colors"
                                                                    >
                                                                        Std
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); handleUpdateSeat(seat._id, `${seat.row_letter}${seat.seat_number}`, 'premium'); }}
                                                                        className="px-2 py-1.5 text-[9px] font-bold uppercase rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 transition-colors"
                                                                    >
                                                                        Prm
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); handleUpdateSeat(seat._id, `${seat.row_letter}${seat.seat_number}`, 'vip'); }}
                                                                        className="px-2 py-1.5 text-[9px] font-bold uppercase rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 transition-colors"
                                                                    >
                                                                        Vip
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => { e.stopPropagation(); handleUpdateSeat(seat._id, `${seat.row_letter}${seat.seat_number}`, 'recliner'); }}
                                                                        className="px-2 py-1.5 text-[9px] font-bold uppercase rounded-lg bg-pink-500/10 hover:bg-pink-500/20 text-pink-500 transition-colors"
                                                                    >
                                                                        Rec
                                                                    </button>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteSeat(seat._id, `${seat.row_letter}${seat.seat_number}`); }}
                                                                    className="w-full py-2 rounded-lg bg-red-900/20 hover:bg-red-600 group/del text-red-500 hover:text-white transition-all duration-200 flex items-center justify-center gap-2 text-[10px] font-bold uppercase"
                                                                >
                                                                    <Trash2 className="w-4 h-4 text-red-500 group-hover/del:text-white" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                            <div className="absolute top-full w-full h-3 bg-transparent" />
                                                            <div className="w-2.5 h-2.5 bg-zinc-900 border-r border-b border-zinc-800 rotate-45 -mt-1.5 shadow-xl" />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Legend */}
                            <div className="flex flex-wrap items-center justify-center gap-8 pt-10 border-t border-zinc-900">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded bg-zinc-900 border border-zinc-800" />
                                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Standard</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded bg-zinc-900 border border-indigo-500/50" />
                                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Premium</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded bg-zinc-900 border border-amber-500/50" />
                                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">VIP Unit</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded bg-zinc-900 border border-pink-500/50" />
                                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Recliner</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
