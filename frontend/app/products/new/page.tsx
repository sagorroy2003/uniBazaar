"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/protected-route";
import ProductForm from "@/components/ProductForm";
import { apiRequest } from "@/lib/api";

export default function CreateProductPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: any) => {
    setError(null);
    try {
      // Data flows: UI -> API Client -> POST /products -> Database
      const newProduct = await apiRequest<{ id: number }>("/products", {
        method: "POST",
        body: formData
      });
      router.push(`/products/${newProduct.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create product. Please try again.");
    }
  };

  const handleCancel = () => {
    router.push("/products");
  };

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-white">Create Product</h1>
        <ProductForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Create Product"
          error={error}
        />
      </div>
    </ProtectedRoute>
  );
}
