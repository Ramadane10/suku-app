import { FontAwesome } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Button from '../src/components/ui/Button';
import InputField from '../src/components/ui/InputField';
import fonts from '../src/constants/fonts';
import { useTheme } from '../src/hooks/useTheme';
import { supabase } from '../src/lib/supabase';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const url = Linking.useURL();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionActive, setSessionActive] = useState(false);

    useEffect(() => {
        if (url) {
            const handleSession = async () => {
                // Parse the hash from the URL
                // Supabase sends tokens in the hash like: #access_token=...&refresh_token=...&type=recovery
                const hashIndex = url.indexOf('#');
                if (hashIndex !== -1) {
                    const hash = url.substring(hashIndex + 1);
                    const params = new URLSearchParams(hash);
                    const accessToken = params.get('access_token');
                    const refreshToken = params.get('refresh_token');

                    if (accessToken && refreshToken) {
                        const { error } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken,
                        });

                        if (!error) {
                            setSessionActive(true);
                        } else {
                            Alert.alert('Erreur', 'Lien invalide ou expiré.');
                        }
                    }
                }
            };
            handleSession();
        }
    }, [url]);

    const handleUpdatePassword = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) {
                Alert.alert('Erreur', error.message);
            } else {
                Alert.alert('Succès', 'Votre mot de passe a été mis à jour.', [
                    { text: 'Se connecter', onPress: () => router.replace('/login') }
                ]);
            }
        } catch (err) {
            Alert.alert('Erreur', 'Une erreur inattendue est survenue.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!sessionActive && !url?.includes('access_token')) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.content}>
                    <Text style={[styles.message, { color: colors.text }]}>
                        En attente du lien de réinitialisation...
                        {"\n\n"}
                        Veuillez cliquer sur le lien reçu par email.
                    </Text>
                    <Button
                        title="Retour à la connexion"
                        onPress={() => router.replace('/login')}
                        backgroundColor={colors.surface}
                        textColor={colors.text}
                        style={styles.button}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Nouveau mot de passe</Text>
            </View>

            <View style={styles.content}>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                    Entrez votre nouveau mot de passe ci-dessous.
                </Text>

                <InputField
                    placeholder="Nouveau mot de passe"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    leftIcon={<FontAwesome name="lock" size={20} color={colors.grey} />}
                />

                <InputField
                    placeholder="Confirmer nouveau mot de passe"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    leftIcon={<FontAwesome name="lock" size={20} color={colors.grey} />}
                />

                <Button
                    title="Mettre à jour mot de passe"
                    onPress={handleUpdatePassword}
                    backgroundColor={colors.primary}
                    textColor="#fff"
                    style={styles.button}
                    isLoading={loading}
                    disabled={!password || !confirmPassword}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 20,
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontFamily: fonts.bold,
        marginTop: 16,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'center',
    },
    description: {
        fontSize: 16,
        fontFamily: fonts.regular,
        marginBottom: 32,
        lineHeight: 24,
    },
    message: {
        fontSize: 18,
        fontFamily: fonts.medium,
        textAlign: 'center',
        marginBottom: 32,
    },
    button: {
        marginTop: 16,
    },
});
