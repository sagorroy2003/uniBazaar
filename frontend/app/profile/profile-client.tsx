"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { getProfile, updateProfile, User } from "@/lib/api";
import ImageUpload from "@/components/image-upload"; // Existing Cloudinary uploader

export default function ProfileClient() {
    const { refreshMe } = useAuth();
    const [profile, setProfile] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        phoneNumber: "",
        messengerUsername: "",
        whatsappUsername: "",
        avatarUrl: "",
    });

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            const data = await getProfile();
            setProfile(data);
            resetForm(data);
        } catch (err) {
            setError("Failed to load profile.");
        }
    }

    function resetForm(data: User) {
        setFormData({
            phoneNumber: data.phoneNumber || "",
            messengerUsername: data.messengerUsername || "",
            whatsappUsername: data.whatsappUsername || "",
            avatarUrl: data.avatarUrl || "",
        });
    }

    function handleCancel() {
        if (profile) resetForm(profile);
        setIsEditing(false);
        setError("");
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const updated = await updateProfile(formData);
            setProfile(updated);
            await refreshMe();
            setIsEditing(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update profile.");
        } finally {
            setIsLoading(false);
        }
    }

    if (error && !profile) return <p className="text-red-500">{error}</p>;

    if (!profile) return <p>Loading profile...</p>;

    if (isEditing) {
        return (
            <form onSubmit={handleSave} className="space-y-6 rounded border p-6">
                {error && <p className="text-red-500">{error}</p>}

                <div>
                    <label className="mb-2 block text-sm font-medium">Avatar</label>
                    <ImageUpload
                        value={formData.avatarUrl}
                        onChange={(url) => setFormData(prev => ({ ...prev, avatarUrl: url }))}
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">Email (Read Only)</label>
                    <input type="text" value={profile.email} disabled className="w-full rounded border p-2 opacity-50" />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">Phone Number</label>
                    <input
                        type="text"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className="w-full rounded border p-2 bg-transparent"
                        placeholder="+880..."
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">WhatsApp Username</label>
                    <input
                        type="text"
                        value={formData.whatsappUsername}
                        onChange={(e) => setFormData(prev => ({ ...prev, whatsappUsername: e.target.value }))}
                        className="w-full rounded border p-2 bg-transparent"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">Messenger Username</label>
                    <input
                        type="text"
                        value={formData.messengerUsername}
                        onChange={(e) => setFormData(prev => ({ ...prev, messengerUsername: e.target.value }))}
                        className="w-full rounded border p-2 bg-transparent"
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <button type="submit" disabled={isLoading} className="rounded bg-blue-600 px-4 py-2 text-white">
                        {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                    <button type="button" onClick={handleCancel} disabled={isLoading} className="rounded bg-gray-600 px-4 py-2 text-white">
                        Cancel
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className="space-y-6 rounded border p-6">
            <div className="flex items-center gap-4">
                {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" className="h-24 w-24 rounded-full object-cover" />
                ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-700 text-gray-400">No Photo</div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="font-medium">{profile.email}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="font-medium">{profile.phoneNumber || "Not provided"}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">WhatsApp</p>
                    <p className="font-medium">{profile.whatsappUsername || "Not provided"}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Messenger</p>
                    <p className="font-medium">{profile.messengerUsername || "Not provided"}</p>
                </div>
            </div>

            <button onClick={() => setIsEditing(true)} className="mt-4 rounded bg-gray-200 px-4 py-2 text-black hover:bg-gray-300">
                Edit Profile
            </button>
        </div>
    );
}
