import { useEffect, useState } from 'react';
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

    // Helper functions for filtering
    const getNewArrivals = () => products.filter(p => p.is_new_arrival);
    const getFeatured = () => products.filter(p => p.is_featured);
    const getBestSellers = () => products.filter(p => p.is_best_seller);

    const getProductsByCategory = (categorySlug: string) => {
        if (categorySlug === 'TOUS' || !categorySlug) return products;
        // Map UI "TOUS" to null or ignore
        // Assuming UI categories match DB Slugs or Names.
        // The home screen currently uses Names like 'FRUITS', 'LÉGUMES'. 
        // We should better direct map slugs.
        return products.filter(p => p.category?.slug.toUpperCase() === categorySlug.toUpperCase() || p.category?.name.toUpperCase() === categorySlug.toUpperCase());
    };

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
