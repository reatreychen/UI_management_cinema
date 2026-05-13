import UserList from "../components/UserList";
import UserForm from "../components/UserForm";
import { UserProvider } from "./UserContext";

export default function UsersPage() {
    return (
        <UserProvider>
            <div className="absolute inset-0 flex">
                {/* Left Panel: User List */}
                <div className="w-[480px] flex flex-col h-full border-r border-white/5">
                    <UserList />
                </div>

                {/* Right Panel: Add/Edit User Form */}
                <div className="flex-1 flex flex-col h-full">
                    <UserForm />
                </div>
            </div>
        </UserProvider>
    );
}
