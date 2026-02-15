import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import { Category, Product } from "../types";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // 1. Fetch Categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (categoriesError) throw categoriesError;
      setCategories(categoriesData || []);

      // 2. Fetch Products with Category info
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*, category:categories(*)")
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);
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
