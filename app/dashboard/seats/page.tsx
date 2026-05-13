"use client";

import { CinemaProvider } from "../cinemas/CinemaContext";
import { SeatProvider } from "./SeatContext";
import SeatManagement from "../components/SeatManagement";

export default function SeatsPage() {
    return (
        <CinemaProvider>
            <SeatProvider>
                <div className="h-full overflow-hidden">
                    <SeatManagement />
                </div>
            </SeatProvider>
        </CinemaProvider>
    );
}
