import ProfileClient from "./profile-client";
import { ProtectedRoute } from "@/components/protected-route";

export default function ProfilePage() {
    return (
        <ProtectedRoute>
            <div className="container mx-auto max-w-2xl px-4 py-8">
                <h1 className="mb-8 text-2xl font-bold">Profile</h1>
                <ProfileClient />
            </div>
        </ProtectedRoute>
    );
}
