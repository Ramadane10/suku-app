import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Category, Product } from '../types';

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
                .from('categories')
                .select('*')
                .order('name');

            if (categoriesError) throw categoriesError;
            setCategories(categoriesData || []);

            // 2. Fetch Products with Category info
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select('*, category:categories(*)')
                .order('created_at', { ascending: false });

            if (productsError) throw productsError;
            setProducts(productsData || []);

        } catch (err: any) {
            console.error('Error fetching data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Helper functions for filtering (mémorisées avec useCallback)
    const getNewArrivals = useCallback(() => products.filter(p => p.is_new_arrival), [products]);
    const getFeatured = useCallback(() => products.filter(p => p.is_featured), [products]);
    const getBestSellers = useCallback(() => products.filter(p => p.is_best_seller), [products]);

    const getProductsByCategory = useCallback((categoryName: string) => {
        if (categoryName === 'TOUS' || !categoryName) return products;
        
        // Filtrer par nom de catégorie (comparaison insensible à la casse)
        const normalizedCategoryName = categoryName.toUpperCase().trim();
        
        return products.filter(p => {
            if (!p.category) return false;
            
            const dbName = (p.category.name || '').toUpperCase().trim();
            const dbSlug = (p.category.slug || '').toUpperCase().trim();
            
            // Comparaison exacte
            return dbName === normalizedCategoryName || dbSlug === normalizedCategoryName;
        });
    }, [products]);

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
