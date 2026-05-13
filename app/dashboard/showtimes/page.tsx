"use client";

import ShowtimeList from "../components/ShowtimeList";
import ShowtimeForm from "../components/ShowtimeForm";
import { ShowtimeProvider } from "./ShowtimeContext";
import { MovieProvider } from "../movies/MovieContext";
import { CinemaProvider } from "../cinemas/CinemaContext";

export default function ShowtimesPage() {
    return (
        <CinemaProvider>
            <MovieProvider>
                <ShowtimeProvider>
                    <div className="flex h-full overflow-hidden">
                        {/* List - Left Side */}
                        <div className="w-80 border-r border-zinc-800 bg-zinc-950/40 shrink-0">
                            <ShowtimeList />
                        </div>

                        {/* Form - Right Side */}
                        <div className="flex-1 bg-zinc-950/20">
                            <ShowtimeForm />
                        </div>
                    </div>
                </ShowtimeProvider>
            </MovieProvider>
        </CinemaProvider>
    );
}
