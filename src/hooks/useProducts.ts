import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Category, Product } from "../types";
import { CACHE_TTL, cacheManager } from "../utils/cacheManager";

const PRODUCTS_CACHE_KEY = "products_list";
const CATEGORIES_CACHE_KEY = "categories_list";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (forceRefresh = false) => {
    try {
      // 1. Try to load from cache first for instant render
      if (!forceRefresh) {
        const cachedProducts = await cacheManager.get<Product[]>(PRODUCTS_CACHE_KEY);
        const cachedCategories = await cacheManager.get<Category[]>(CATEGORIES_CACHE_KEY);

        if (cachedProducts.data && cachedProducts.data.length > 0) {
          setProducts(cachedProducts.data);
          if (cachedCategories.data) {
            setCategories(cachedCategories.data);
          }
          setLoading(false);

          // If cache is still fresh, skip network request entirely
          if (!cachedProducts.isStale && !cachedCategories.isStale) {
            return;
          }
        }
      }

      // If no cache or forced refresh or stale cache, perform network request
      if (products.length === 0 && !forceRefresh) {
        setLoading(true);
      }

      // 2. Fetch Categories from Supabase
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (categoriesError) throw categoriesError;
      const freshCategories = categoriesData || [];
      setCategories(freshCategories);
      cacheManager.set(CATEGORIES_CACHE_KEY, freshCategories, CACHE_TTL.MEDIUM);

      // 3. Fetch Products with Category info from Supabase
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*, category:categories(*)")
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;
      const freshProducts = productsData || [];
      setProducts(freshProducts);
      cacheManager.set(PRODUCTS_CACHE_KEY, freshProducts, CACHE_TTL.MEDIUM);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for filtering
  const getNewArrivals = () => products.filter((p) => p.is_new_arrival);
  const getFeatured = () => products.filter((p) => p.is_featured);
  const getBestSellers = () => products.filter((p) => p.is_best_seller);

  const getProductsByCategory = useCallback(
    (categoryName: string) => {
      if (categoryName === "TOUS" || !categoryName) return products;

      // Normaliser la chaîne de recherche (minuscules, sans accents)
      const normalizeString = (str: string) => {
        if (!str) return "";
        return str
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, ""); // Supprimer les accents
      };

      const normalizedCategoryName = normalizeString(categoryName);

      // Cas spécial: BIO correspond aux produits biologiques (is_organic)
      if (normalizedCategoryName === "bio") {
        return products.filter((p) => p.is_organic);
      }

      return products.filter((p) => {
        if (!p.category) return false;

        const productCategoryName = normalizeString(p.category.name);
        const productCategorySlug = normalizeString(p.category.slug);

        return (
          productCategoryName === normalizedCategoryName ||
          productCategorySlug === normalizedCategoryName
        );
      });
    },
    [products],
  );

  return {
    products,
    categories,
    loading,
    error,
    refresh: fetchData,
    getNewArrivals,
    getFeatured,
    getBestSellers,
    getProductsByCategory,
  };
}
