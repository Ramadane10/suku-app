import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

export interface ProductReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: { [key: number]: number };
}

export function useReviews(productId?: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ProductReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Charger les avis d'un produit
  const fetchReviews = useCallback(async (pid: string) => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les avis
      const { data: reviewsData, error: fetchError } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', pid)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Récupérer les profils pour chaque avis
      const reviewsWithProfiles = await Promise.all(
        (reviewsData || []).map(async (review) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', review.user_id)
            .single();

          return {
            ...review,
            profiles: profileData || null,
          };
        })
      );

      setReviews(reviewsWithProfiles);

      // Calculer les statistiques
      if (reviewsWithProfiles && reviewsWithProfiles.length > 0) {
        const total = reviewsWithProfiles.length;
        const sum = reviewsWithProfiles.reduce((acc, r) => acc + r.rating, 0);
        const average = sum / total;
        
        const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviewsWithProfiles.forEach(r => {
          distribution[r.rating] = (distribution[r.rating] || 0) + 1;
        });

        setStats({
          averageRating: Math.round(average * 10) / 10,
          totalReviews: total,
          ratingDistribution: distribution,
        });
      } else {
        setStats({
          averageRating: 0,
          totalReviews: 0,
          ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        });
      }
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (productId) {
      fetchReviews(productId);
    }
  }, [productId, fetchReviews]);

  // Créer ou mettre à jour un avis
  const createOrUpdateReview = useCallback(async (pid: string, rating: number, comment?: string) => {
    if (!user) {
      throw new Error('Vous devez être connecté pour laisser un avis.');
    }

    if (rating < 1 || rating > 5) {
      throw new Error('La note doit être entre 1 et 5.');
    }

    try {
      // Vérifier si l'utilisateur a déjà un avis pour ce produit
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', pid)
        .single();

      if (existingReview) {
        // Mettre à jour l'avis existant
        const { data, error: updateError } = await supabase
          .from('reviews')
          .update({
            rating,
            comment: comment || null,
          })
          .eq('id', existingReview.id)
          .select()
          .single();

        if (updateError) throw updateError;
        
        await fetchReviews(pid);
        return data;
      } else {
        // Créer un nouvel avis
        const { data, error: createError } = await supabase
          .from('reviews')
          .insert([{
            user_id: user.id,
            product_id: pid,
            rating,
            comment: comment || null,
          }])
          .select()
          .single();

        if (createError) throw createError;
        
        await fetchReviews(pid);
        return data;
      }
    } catch (err: any) {
      console.error('Error creating/updating review:', err);
      throw new Error(`Erreur lors de l'enregistrement de l'avis: ${err.message}`);
    }
  }, [user, fetchReviews]);

  // Supprimer un avis
  const deleteReview = useCallback(async (reviewId: string, pid: string) => {
    if (!user) {
      throw new Error('Vous devez être connecté pour supprimer un avis.');
    }

    try {
      const { error: deleteError } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      await fetchReviews(pid);
    } catch (err: any) {
      console.error('Error deleting review:', err);
      throw new Error(`Erreur lors de la suppression de l'avis: ${err.message}`);
    }
  }, [user, fetchReviews]);

  // Vérifier si l'utilisateur a déjà laissé un avis
  const getUserReview = useCallback(() => {
    if (!user) return null;
    return reviews.find(r => r.user_id === user.id) || null;
  }, [reviews, user]);

  return {
    reviews,
    stats,
    loading,
    error,
    fetchReviews,
    createOrUpdateReview,
    deleteReview,
    getUserReview,
  };
}

