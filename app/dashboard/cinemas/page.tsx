import CinemaList from "../components/CinemaList";
import CinemaForm from "../components/CinemaForm";
import { CinemaProvider } from "./CinemaContext";

export default function CinemasPage() {
    return (
        <CinemaProvider>
            <div className="absolute inset-0 flex">
                {/* Left Panel: Cinema List */}
                <div className="w-[480px] flex flex-col h-full border-r border-white/5">
                    <CinemaList />
                </div>

                {/* Right Panel: Add/Edit Cinema Form */}
                <div className="flex-1 flex flex-col h-full">
                    <CinemaForm />
                </div>
            </div>
        </CinemaProvider>
    );
}
