"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/context/auth-context";
// NEW: Import the getProducts function we built in api.ts
import { apiRequest, deleteProduct, getMyProducts, markProductSold, getProducts } from "@/lib/api";

type Category = { id: number; name: string };

type Product = {
  id: number;
  userId: number;
  categoryId: number;
  title: string;
  description?: string;
  price: number | string;
  location?: string;
  imageUrl?: string;
  isSold: boolean;
};

export default function HomePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // 1. Grab both parameters from the URL
  const selectedCategoryId = searchParams.get("categoryId") || "";
  const currentSearch = searchParams.get("search") || "";
  const view = searchParams.get("view") === "my" ? "my" : "all";

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Local state just for the search input box so we don't fetch on every keystroke
  const [searchInput, setSearchInput] = useState(currentSearch);

  // 3. Keep the input box in sync if the user hits the browser "Back" button
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);

      const categoriesPromise = apiRequest<Category[]>("/categories");

      // 4. Use our new clean api function for fetching products!
      const productsPromise =
        view === "my"
          ? user
            ? getMyProducts()
            : Promise.resolve([])
          : getProducts(selectedCategoryId, currentSearch);

      const [categoriesData, productsData] = await Promise.all([categoriesPromise, productsPromise]);
      setCategories(categoriesData);
      setProducts(productsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }
  
  // NEW: The Debounce Effect for Live Search
  useEffect(() => {
    // 1. We set up a timer that will run after 400 milliseconds
    const debounceTimer = setTimeout(() => {
      // 2. Only trigger the URL change if the input actually differs from the URL
      // (This prevents an infinite loop when the page first loads)
      if (searchInput !== currentSearch) {
        const params = new URLSearchParams(searchParams.toString());
        const trimmed = searchInput.trim();
        
        if (trimmed) {
          params.set("search", trimmed);
        } else {
          params.delete("search");
        }
        
        const qs = params.toString();
        router.push(qs ? `/?${qs}` : "/");
      }
    }, 400); // Wait 400ms after they stop typing

    // 3. THE MAGIC TRICK (Cleanup Function): 
    // If the user types another letter BEFORE the 400ms is up,
    // React runs this cleanup function, which destroys the old timer.
    return () => clearTimeout(debounceTimer);
    
  }, [searchInput, currentSearch, searchParams, router]);

  // 5. Add currentSearch to the dependency array so it re-fetches when search changes
  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, currentSearch, view, user]);

  // 6. Handle Search Form Submission
  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    const trimmed = searchInput.trim();
    if (trimmed) {
      params.set("search", trimmed);
    } else {
      params.delete("search");
    }

    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  function onCategoryChange(categoryId: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) params.set("categoryId", categoryId);
    else params.delete("categoryId");
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  function onViewChange(nextView: "all" | "my") {
    const params = new URLSearchParams(searchParams.toString());

    if (nextView === "my") {
      params.set("view", "my");
      params.delete("categoryId");
      params.delete("search"); // Clear search when going to "My Products"
    } else {
      params.delete("view");
    }

    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  async function onMarkSold(id: number) {
    if (!user) {
      setError("Please login first");
      return;
    }
    try {
      await markProductSold(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark as sold");
    }
  }

  async function onDelete(id: number) {
    if (!user) {
      setError("Please login first");
      return;
    }
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) return;

    try {
      await deleteProduct(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    }
  }

  const emptyMessage =
    view === "my" ? "You have not created any products yet." : "No products found for the selected filter.";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Products</h1>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`rounded border px-3 py-2 text-sm ${view === "all" ? "bg-slate-900 text-white" : "bg-white"}`}
            onClick={() => onViewChange("all")}
          >
            All Products
          </button>
          <button
            type="button"
            className={`rounded border px-3 py-2 text-sm ${view === "my" ? "bg-slate-900 text-white" : "bg-white"}`}
            onClick={() => onViewChange("my")}
            disabled={!user}
            title={!user ? "Login to see your products" : undefined}
          >
            My Products
          </button>
        </div>
      </div>

      {view === "all" ? (
        // 7. Added a flex container so Search and Category filter sit next to each other
        <div className="flex flex-col md:flex-row gap-2 w-full max-w-2xl">

          {/* 8. The new Search Form */}
          <form onSubmit={onSearchSubmit} className="flex flex-1 gap-2">
            <input
              type="text"
              placeholder="Search by title or description..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="flex-1 rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <button
              type="submit"
              className="rounded bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 transition"
            >
              Search
            </button>
          </form>

          {/* Existing Category Filter */}
          <select
            id="category"
            aria-label="Category"
            className="rounded border px-3 py-2 md:w-48"
            value={selectedCategoryId}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      {/* --- THE REST OF YOUR UI REMAINS EXACTLY THE SAME BELOW THIS POINT --- */}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-xl border bg-white p-4">
              <div className="h-44 w-full rounded bg-slate-200"></div>
              <div className="mt-3 h-4 w-3/4 rounded bg-slate-200"></div>
              <div className="mt-2 h-4 w-1/2 rounded bg-slate-200"></div>
            </div>
          ))}
        </div>
      )}

      {error ? <p className="text-red-600">{error}</p> : null}

      {!loading && !error ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.length === 0 ? (
            <p className="text-slate-500">{emptyMessage}</p>
          ) : (
            products.map((product) => {
              const isOwner = Boolean(user && user.userId === product.userId);

              return (
                <div
                  key={product.id}
                  className="group overflow-hidden rounded-xl border bg-white shadow-sm transition duration-200 hover:shadow-xl hover:-translate-y-1"
                >
                  {/* Image block */}
                  <div className="relative bg-slate-100">
                    <Link href={`/products/${product.id}`} className="block">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <svg className="w-full h-44 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs font-medium uppercase tracking-wider">No Photo Available</span>
                        </div>
                      )}

                      <div className="absolute inset-0 hidden items-center justify-center bg-black/40 text-white group-hover:flex">
                        <span className="rounded bg-white/90 px-3 py-1 text-sm text-black">
                          View Details
                        </span>
                      </div>
                    </Link>

                    {product.imageUrl ? (
                      <button
                        type="button"
                        aria-label="Open image in new tab"
                        title="Open image"
                        onClick={() => window.open(product.imageUrl!, "_blank", "noopener,noreferrer")}
                        className="absolute right-3 top-3 hidden rounded-full border bg-white/90 p-2 shadow group-hover:block"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path
                            d="M14 3h7v7"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M21 3l-9 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M10 7H7a4 4 0 0 0-4 4v6a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4v-3"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    ) : null}

                    {product.isSold ? (
                      <span className="absolute left-3 top-3 rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">
                        Sold
                      </span>
                    ) : null}
                  </div>

                  {/* Content */}
                  <div className="flex min-h-[130px] flex-col gap-1 p-4">
                    <Link href={`/products/${product.id}`} className="block">
                      <h2 className="line-clamp-2 text-base font-semibold min-h-[48px]">
                        {product.title}</h2>
                      <p className="mt-1 text-lg font-bold">৳ {product.price}</p>
                      <p className="line-clamp-1 text-sm text-slate-500">{product.location || "No location"}</p>
                    </Link>

                    {/* Owner actions */}
                    {isOwner ? (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          className="rounded bg-amber-500 px-3 py-1.5 text-sm text-white disabled:opacity-60"
                          onClick={() => void onMarkSold(product.id)}
                          disabled={product.isSold}
                          title={product.isSold ? "Already sold" : "Mark as sold"}
                        >
                          Sold
                        </button>
                        <button
                          type="button"
                          className="rounded bg-red-600 px-3 py-1.5 text-sm text-white"
                          onClick={() => void onDelete(product.id)}
                        >
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : null}
    </div>
  );
}
