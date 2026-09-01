import { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '../lib/supabase';

type AuthContextType = {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    isAdmin: boolean;
    signIn: (email: string, password: string) => Promise<{ error: any }>;
    signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any; data?: any }>;
    signOut: () => Promise<void>;
    sendPasswordResetEmail: (email: string) => Promise<{ error: any }>;
    resetInactivityTimer: () => void;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    isLoading: true,
    isAdmin: false,
    signIn: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signOut: async () => { },
    sendPasswordResetEmail: async () => ({ error: null }),
    resetInactivityTimer: () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

// Durée d'inactivité avant déconnexion automatique : 30 minutes
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearInactivityTimer = () => {
        if (inactivityTimer.current) {
            clearTimeout(inactivityTimer.current);
            inactivityTimer.current = null;
        }
    };

    const resetInactivityTimer = () => {
        clearInactivityTimer();
        // Ne démarrer le timer que si l'utilisateur est connecté
        setSession(current => {
            if (current) {
                inactivityTimer.current = setTimeout(async () => {
                    await supabase.auth.signOut();
                }, INACTIVITY_TIMEOUT_MS);
            }
            return current;
        });
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
            if (session) resetInactivityTimer();
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
            if (session) {
                resetInactivityTimer();
            } else {
                clearInactivityTimer();
            }
        });

        // Réinitialiser le timer quand l'app revient au premier plan
        const handleAppState = (nextState: AppStateStatus) => {
            if (nextState === 'active') {
                resetInactivityTimer();
            } else {
                clearInactivityTimer();
            }
        };
        const appStateSub = AppState.addEventListener('change', handleAppState);

        return () => {
            subscription.unsubscribe();
            appStateSub.remove();
            clearInactivityTimer();
        };
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error };
    };

    const signUp = async (email: string, password: string, metadata?: any) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata, // metadata (full_name, phone, etc.) will be accessible in triggers
            },
        });

        if (!error && data?.user) {
            // Manually create profile if trigger is not set up or for redundancy
            // Use upsert to handle cases where a trigger might have already created the profile
            const { error: profileError } = await supabase.from('profiles').upsert([
                {
                    id: data.user.id,
                    email: email,
                    full_name: metadata?.full_name,
                    phone: metadata?.phone,
                    updated_at: new Date(),
                },
            ]);

            if (profileError) {
                console.error("Error creating profile:", profileError);
            }
        }

        return { data, error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const sendPasswordResetEmail = async (email: string) => {
        const redirectUrl = Linking.createURL('/reset-password');
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: redirectUrl,
        });
        return { error };
    };

    const value = {
        session,
        user,
        isLoading,
        isAdmin,
        signIn,
        signUp,
        signOut,
        sendPasswordResetEmail,
        resetInactivityTimer,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
