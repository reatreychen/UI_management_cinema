"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

interface Movie {
    _id: string;
    title: string;
    genre: string[];
    description: string;
    duration_minutes: number;
    rating: string;
    language: string;
    release_date: string;
    poster_url?: string;
    trailer_url?: string;
    images: string[];
    videos: string[];
}

interface MovieContextType {
    movies: Movie[];
    selectedMovie: Movie | null;
    loading: boolean;
    fetchMovies: () => Promise<void>;
    setSelectedMovie: (movie: Movie | null) => void;
    deleteMovie: (id: string) => Promise<void>;
}

const MovieContext = createContext<MovieContextType | undefined>(undefined);

export function MovieProvider({ children }: { children: React.ReactNode }) {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchMovies = async () => {
        try {
            const response = await api.get("/movies/get-all");
            // Backend returns { movies: [...], pagination: {...} }
            setMovies(Array.isArray(response.data.movies) ? response.data.movies : []);
        } catch (error) {
            console.error("Failed to fetch movies:", error);
            setMovies([]);
        } finally {
            setLoading(false);
        }
    };

    const deleteMovie = async (id: string) => {
        try {
            await api.delete(`/movies/${id}`);
            setMovies((prev) => prev.filter((m) => m._id !== id));
            if (selectedMovie?._id === id) setSelectedMovie(null);
        } catch (error) {
            console.error("Failed to delete movie:", error);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, []);

    return (
        <MovieContext.Provider
            value={{
                movies,
                selectedMovie,
                loading,
                fetchMovies,
                setSelectedMovie,
                deleteMovie,
            }}
        >
            {children}
        </MovieContext.Provider>
    );
}

export function useMovie() {
    const context = useContext(MovieContext);
    if (context === undefined) {
        throw new Error("useMovie must be used within a MovieProvider");
    }
    return context;
}
