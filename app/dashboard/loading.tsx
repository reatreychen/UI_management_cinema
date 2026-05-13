import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-red-600" />
            <p className="text-zinc-500 font-medium animate-pulse">Loading dashboard...</p>
        </div>
    );
}
