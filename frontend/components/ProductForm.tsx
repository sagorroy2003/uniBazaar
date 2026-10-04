"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { apiRequest, Product } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import ImageUpload from "@/components/image-upload";

type Category = {
    id: number;
    name: string;
};

export type ProductFormPayload = {
    title: string;
    price: number;
    categoryId: number;
    description: string;
    location: string;
    imageUrl: string;
    showEmail: boolean;
    showWhatsapp: boolean;
    showMessenger: boolean;
};

interface ProductFormProps {
    initialData?: Partial<Product>;
    onSubmit: (data: ProductFormPayload) => Promise<void>;
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
    const { user } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const hasWhatsappInProfile = Boolean(
        user?.whatsappUsername?.trim() || user?.phoneNumber?.trim()
    );
    const hasMessengerInProfile = Boolean(user?.messengerUsername?.trim());

    // Initialize state with initialData (for Edit) or defaults (for Create)
    const getInitialFormData = (data?: Partial<Product>) => ({
        title: data?.title ?? "",
        price: data?.price ?? "",
        categoryId: data?.categoryId ?? "",
        description: data?.description ?? "",
        location: data?.location ?? "",
        imageUrl: data?.imageUrl ?? "",
        showEmail: data?.showEmail ?? true,
        showWhatsapp: data?.showWhatsapp ?? false,
        showMessenger: data?.showMessenger ?? false,
    });

    const [formData, setFormData] = useState(getInitialFormData(initialData));

    useEffect(() => {
        setFormData(getInitialFormData(initialData));
    }, [initialData]);

    useEffect(() => {
        const fetchCategories = async () => {
            setIsLoadingCategories(true);
            setCategoriesError(null);
            try {
                const data = await apiRequest<Category[]>("/categories");
                setCategories(data);
            } catch (err) {
                console.error("Failed to load categories", err);
                setCategoriesError("Failed to load categories. Please refresh.");
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const checked = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formattedPayload: ProductFormPayload = {
                ...formData,
                price: Number(formData.price),
                categoryId: Number(formData.categoryId),
            };

            await onSubmit(formattedPayload);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
            {categoriesError && <div className="text-amber-400 text-sm mb-2">{categoriesError}</div>}

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
                {categories.map((cat) => (
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

                <div>
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" name="showWhatsapp" checked={formData.showWhatsapp} onChange={handleChange} />
                        <span>Show WhatsApp</span>
                    </label>
                    {!hasWhatsappInProfile && (
                        <p className="text-xs text-gray-400 mt-1">
                            Add a WhatsApp username or phone number in Profile first.
                        </p>
                    )}
                </div>

                <div>
                    <label className="flex items-center space-x-2">
                        <input type="checkbox" name="showMessenger" checked={formData.showMessenger} onChange={handleChange} />
                        <span>Show Messenger</span>
                    </label>
                    {!hasMessengerInProfile && (
                        <p className="text-xs text-gray-400 mt-1">
                            Add a Messenger username in Profile first.
                        </p>
                    )}
                </div>
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
