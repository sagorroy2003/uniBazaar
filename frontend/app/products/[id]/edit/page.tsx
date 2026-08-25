"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import { useAuth } from "@/context/auth-context";
import ProductForm from "@/components/ProductForm";
import { apiRequest } from "@/lib/api";

// 1. Define params as a Promise
export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();

    // 2. Unwrap the Promise using React.use() to safely get the ID
    const resolvedParams = use(params);
    const id = resolvedParams.id;

    const { user } = useAuth();

    const [product, setProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [pageError, setPageError] = useState<string | null>(null);

    // 3. Fetch the Product safely
    useEffect(() => {
        if (!id) return;

        // Protect the backend from 'undefined' or NaN strings
        if (!/^\d+$/.test(id)) {
            setPageError("Invalid product ID format.");
            setIsLoading(false);
            return;
        }

        const fetchProduct = async () => {
            try {
                setPageError(null);
                const data = await apiRequest(`/products/${id}`) as any;
                setProduct(data);
            } catch (err: any) {
                console.error("Fetch error:", err);
                setPageError(err.message || "Failed to load product.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // 4. Enforce Ownership Security
    useEffect(() => {
        if (product && user && product.userId !== user.userId) {
            router.replace("/");
        }
    }, [product, user, router]);

    const handleSubmit = async (formData: any) => {
        setPageError(null);
        try {
            await apiRequest(`/products/${id}`, {
                method: "PUT",
                body: formData
            });
            router.push(`/products/${id}`);
        } catch (err: any) {
            setPageError(err.message || "Failed to update product.");
        }
    };

    const handleCancel = () => {
        router.push(`/products/${id}`);
    };

    if (pageError) return <div className="text-red-500 p-4 text-center mt-10">Error: {pageError}</div>;
    if (isLoading) return <div className="text-white p-4 text-center mt-10">Loading...</div>;
    if (!product) return <div className="text-white p-4 text-center mt-10">Product not found.</div>;

    return (
        <ProtectedRoute>
            <div className="max-w-2xl mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6 text-white">Edit Product</h1>
                <ProductForm
                    initialData={product}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    submitLabel="Save Changes"
                />
            </div>
        </ProtectedRoute>
    );
}
