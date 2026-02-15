import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  url?: string; // Support pour les deux noms de colonnes possibles
  is_primary: boolean;
  display_order?: number;
  sort_order?: number; // Support pour les deux noms de colonnes possibles
  created_at: string;
}

export function useProductImages(productId?: string) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async (pid: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_id', pid)
        .order('is_primary', { ascending: false })
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;

      // Normaliser les données pour supporter les deux noms de colonnes possibles
      const normalizedData = (data || []).map(img => ({
        ...img,
        image_url: img.image_url || img.url || '',
        display_order: img.display_order || img.sort_order || 0,
      }));
      setImages(normalizedData);
    } catch (err: any) {
      console.error('Error fetching product images:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (productId) {
      fetchImages(productId);
    } else {
      setImages([]);
      setLoading(false);
    }
  }, [productId, fetchImages]);

  const getPrimaryImage = useCallback(() => {
    return images.find(img => img.is_primary) || images[0] || null;
  }, [images]);

  const getAllImages = useCallback(() => {
    return images.length > 0 ? images : null;
  }, [images]);

  return {
    images,
    loading,
    error,
    fetchImages,
    getPrimaryImage,
    getAllImages,
  };
}

