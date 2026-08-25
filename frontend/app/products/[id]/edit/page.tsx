"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import ProductForm from "@/components/ProductForm";
import { apiRequest } from "@/lib/api";

// 1. Update the type to be a Promise
export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { user } = useAuth();

    // 2. Unwrap the params using React.use()
    const { id } = use(params);

    const [product, setProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // 3. Use the unwrapped 'id' here
                const data = await apiRequest(`/products/${id}`) as any;

                if (user && data.userId !== user.userId) {
                    router.replace("/");
                    return;
                }

                setProduct(data);
            } catch (err: any) {
                setError("Failed to load product.");
            } finally {
                setIsLoading(false);
            }
        };

        if (user) fetchProduct();
    }, [id, user, router]); // 4. Update the dependency array

    const handleSubmit = async (formData: any) => {
        setError(null);
        try {
            // 5. Use the unwrapped 'id' here
            await apiRequest(`/products/${id}`, {
                method: "PUT",
                body: formData,
            });
            router.push(`/products/${id}`);
        } catch (err: any) {
            setError(err.message || "Failed to update product.");
        }
    };

    const handleCancel = () => {
        router.push(`/products/${id}`);
    };

    if (isLoading) return <div className="text-white p-4">Loading...</div>;
    if (!product) return <div className="text-white p-4">Product not found.</div>;

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6 text-white">Edit Product</h1>
            <ProductForm
                initialData={product}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                submitLabel="Save Changes"
                error={error}
            />
        </div>
    );
}
