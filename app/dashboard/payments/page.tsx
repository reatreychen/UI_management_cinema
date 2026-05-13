"use client";

import { PaymentProvider } from "./PaymentContext";
import PaymentList from "../components/PaymentList";

export default function PaymentsPage() {
    return (
        <PaymentProvider>
            <div className="h-full overflow-hidden">
                <PaymentList />
            </div>
        </PaymentProvider>
    );
}
