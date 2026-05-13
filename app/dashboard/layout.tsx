"use client";

import Sidebar from "./components/Sidebar";
import TopHeader from "./components/TopHeader";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <ProtectedRoute>
                <div className="flex h-screen bg-zinc-950 overflow-hidden font-sans selection:bg-primary selection:text-white">
                    <Sidebar />
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                        <TopHeader />
                        <main className="flex-1 relative overflow-hidden bg-zinc-950">
                            {children}
                        </main>
                    </div>
                </div>
            </ProtectedRoute>
        </AuthProvider>
    );
}
