import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { useAuth } from "../src/context/AuthContext";

export default function Index() {
    const { user, isLoading: authLoading } = useAuth();
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

    useEffect(() => {
        const checkOnboarding = async () => {
            try {
                const value = await AsyncStorage.getItem('hasSeenOnboarding');
                setHasSeenOnboarding(value === 'true');
            } catch (e) {
                setHasSeenOnboarding(false);
            }
        };
        checkOnboarding();
    }, []);

    if (authLoading || hasSeenOnboarding === null) {
        return null;
    }

    if (!hasSeenOnboarding) {
        return <Redirect href="/onboarding" />;
    }

    if (user) {
        return <Redirect href="/home" />;
    }

    return <Redirect href="/welcome" />;
}
