import MovieList from "../components/MovieList";
import MovieForm from "../components/MovieForm";
import { MovieProvider } from "./MovieContext";

export default function MoviesPage() {
    return (
        <MovieProvider>
            <div className="absolute inset-0 flex">
                {/* Left Panel: Movie List */}
                <div className="w-[480px] flex flex-col h-full border-r border-white/5">
                    <MovieList />
                </div>

                {/* Right Panel: Add/Edit Movie Form */}
                <div className="flex-1 flex flex-col h-full">
                    <MovieForm />
                </div>
            </div>
        </MovieProvider>
    );
}
