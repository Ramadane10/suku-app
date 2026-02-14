export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            products: {
                Row: {
                    id: string
                    name: string
                    price_per_kg: number
                    category_id: string | null
                    image_url: string | null
                    description: string | null
                    origin: string | null
                    is_organic: boolean
                    is_featured: boolean
                    is_new_arrival: boolean
                    is_best_seller: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    price_per_kg: number
                    category_id?: string | null
                    image_url?: string | null
                    description?: string | null
                    origin?: string | null
                    is_organic?: boolean
                    is_featured?: boolean
                    is_new_arrival?: boolean
                    is_best_seller?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    price_per_kg?: number
                    category_id?: string | null
                    image_url?: string | null
                    description?: string | null
                    origin?: string | null
                    is_organic?: boolean
                    is_featured?: boolean
                    is_new_arrival?: boolean
                    is_best_seller?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            categories: {
                Row: {
                    id: string
                    name: string
                    slug: string
                }
                Insert: {
                    id?: string
                    name: string
                    slug: string
                }
                Update: {
                    id?: string
                    name?: string
                    slug?: string
                }
            }
        }
    }
}

export type Product = Database['public']['Tables']['products']['Row'] & {
    category?: Database['public']['Tables']['categories']['Row'] | null
}
export type Category = Database['public']['Tables']['categories']['Row']
