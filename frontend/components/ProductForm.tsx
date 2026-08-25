"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api"; // Adjust import path if necessary
import ImageUpload from "@/components/image-upload"; // Adjust if your file is named/located differently

interface ProductFormProps {
    initialData?: any;
    onSubmit: (data: any) => Promise<void>;
    onCancel: () => void;
    submitLabel: string;
    error?: string | null;
}

export default function ProductForm({
    initialData,
    onSubmit,
    onCancel,
    submitLabel,
    error
}: ProductFormProps) {
    const [categories, setCategories] = useState<any[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize state with initialData (for Edit) or defaults (for Create)
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        price: initialData?.price || "",
        categoryId: initialData?.categoryId || "",
        description: initialData?.description || "",
        location: initialData?.location || "",
        imageUrl: initialData?.imageUrl || "",
        showEmail: initialData?.showEmail ?? true,
        showWhatsapp: initialData?.showWhatsapp ?? false,
        showMessenger: initialData?.showMessenger ?? false,
    });

    useEffect(() => {
        // Fetch categories on mount
        const fetchCategories = async () => {
            try {
                const data = await apiRequest("/categories");
                setCategories(data as any[]);
            } catch (err) {
                console.error("Failed to load categories", err);
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e: import("react").ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Format the payload so Prisma doesn't crash on string/number mismatches
        const formattedPayload = {
            ...formData,
            price: Number(formData.price),
            categoryId: Number(formData.categoryId),
        };

        await onSubmit(formattedPayload);
        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-transparent text-white border-gray-600"
            >
                <option value="" disabled>
                    {isLoadingCategories ? "Loading categories..." : "Select a category"}
                </option>
                {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
            </select>

            <input
                type="text"
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-transparent text-white border-gray-600"
            />

            <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-transparent text-white border-gray-600"
            />

            <textarea
                name="description"
                placeholder="Description (optional)"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-transparent text-white border-gray-600"
            />

            <input
                type="text"
                name="location"
                placeholder="Location (optional)"
                value={formData.location}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-transparent text-white border-gray-600"
            />

            {/* Image Upload Component */}
            <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
            />

            <div className="space-y-2">
                <label className="flex items-center space-x-2">
                    <input type="checkbox" name="showEmail" checked={formData.showEmail} onChange={handleChange} />
                    <span>Show Email</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input type="checkbox" name="showWhatsapp" checked={formData.showWhatsapp} onChange={handleChange} />
                    <span>Show Whatsapp</span>
                </label>
                <label className="flex items-center space-x-2">
                    <input type="checkbox" name="showMessenger" checked={formData.showMessenger} onChange={handleChange} />
                    <span>Show Messenger</span>
                </label>
            </div>

            <div className="flex space-x-4">
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white">
                    {isSubmitting ? "Saving..." : submitLabel}
                </button>
                <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white">
                    Cancel
                </button>
            </div>
        </form>
    );
}
