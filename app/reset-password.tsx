import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../src/components/ui/Button';
import InputField from '../src/components/ui/InputField';
import fonts from '../src/constants/fonts';
import { useCustomAlert } from '../src/context/AlertContext';
import { useTheme } from '../src/hooks/useTheme';
import { supabase } from '../src/lib/supabase';

export default function ResetPasswordScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { showError, showConfirm } = useCustomAlert();
    const url = Linking.useURL();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [sessionActive, setSessionActive] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const [urlError, setUrlError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        // 1. Écouter les changements d'état d'authentification Supabase (ex: PASSWORD_RECOVERY)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (!isMounted) return;
            if (event === 'PASSWORD_RECOVERY' || (session && (event === 'SIGNED_IN' || event === 'USER_UPDATED'))) {
                setSessionActive(true);
                setCheckingSession(false);
            }
        });

        const initSession = async () => {
            try {
                // 2. Vérifier si une session active existe déjà
                const { data: { session } } = await supabase.auth.getSession();
                if (session && isMounted) {
                    setSessionActive(true);
                    setCheckingSession(false);
                    return;
                }

                // 3. Analyser l'URL de redirection reçue
                const currentUrl = url || (await Linking.getInitialURL());
                if (currentUrl) {
                    // Vérifier si Supabase a renvoyé une erreur dans l'URL (ex: lien expiré)
                    const parsedUrl = Linking.parse(currentUrl);
                    const queryParams = parsedUrl.queryParams || {};

                    if (queryParams.error_description) {
                        const errMsg = decodeURIComponent(String(queryParams.error_description));
                        setUrlError(errMsg);
                        showError('Lien expiré ou invalide', errMsg);
                        setCheckingSession(false);
                        return;
                    }

                    // Cas A : PKCE flow (?code=...)
                    const code = queryParams.code;
                    if (code && typeof code === 'string') {
                        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
                        if (!error && data.session && isMounted) {
                            setSessionActive(true);
                            setCheckingSession(false);
                            return;
                        } else if (error && isMounted) {
                            setUrlError(error.message);
                            showError('Erreur de validation', error.message);
                            setCheckingSession(false);
                            return;
                        }
                    }

                    // Cas B : Implicit grant (#access_token=...&refresh_token=...)
                    const hashIndex = currentUrl.indexOf('#');
                    if (hashIndex !== -1) {
                        const hash = currentUrl.substring(hashIndex + 1);
                        const params = new URLSearchParams(hash);
                        const accessToken = params.get('access_token');
                        const refreshToken = params.get('refresh_token');
                        const errorDesc = params.get('error_description');

                        if (errorDesc) {
                            setUrlError(decodeURIComponent(errorDesc));
                            showError('Lien expiré ou invalide', decodeURIComponent(errorDesc));
                            setCheckingSession(false);
                            return;
                        }

                        if (accessToken && refreshToken) {
                            const { error } = await supabase.auth.setSession({
                                access_token: accessToken,
                                refresh_token: refreshToken,
                            });

                            if (!error && isMounted) {
                                setSessionActive(true);
                                setCheckingSession(false);
                                return;
                            } else if (error && isMounted) {
                                setUrlError(error.message);
                                showError('Erreur', 'Lien invalide ou expiré.');
                                setCheckingSession(false);
                                return;
                            }
                        }
                    }
                }
            } catch (err: any) {
                console.error('Error initializing recovery session:', err);
            } finally {
                if (isMounted) setCheckingSession(false);
            }
        };

        initSession();

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [url]);

    const handleUpdatePassword = async () => {
        if (!password || !confirmPassword) {
            showError('Champs requis', 'Veuillez remplir les deux champs de mot de passe.');
            return;
        }

        if (password.length < 6) {
            showError('Mot de passe trop court', 'Le mot de passe doit contenir au moins 6 caractères.');
            return;
        }

        if (password !== confirmPassword) {
            showError('Mots de passe différents', 'Les deux mots de passe ne correspondent pas.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) {
                showError('Erreur', error.message || 'Impossible de mettre à jour le mot de passe.');
            } else {
                showConfirm(
                    'Mot de passe mis à jour !',
                    'Votre mot de passe a été modifié avec succès. Vous pouvez maintenant vous connecter.',
                    () => router.replace('/login'),
                    'Se connecter',
                    'Fermer'
                );
            }
        } catch (err: any) {
            showError('Erreur', 'Une erreur inattendue est survenue.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                        Vérification du lien de réinitialisation...
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    if (!sessionActive) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.content}>
                    <View style={[styles.iconWrap, { backgroundColor: colors.primary + '15' }]}>
                        <Ionicons name="mail-unread-outline" size={48} color={colors.primary} />
                    </View>
                    <Text style={[styles.title, { color: colors.text, textAlign: 'center' }]}>
                        Lien de réinitialisation requis
                    </Text>
                    <Text style={[styles.message, { color: colors.textSecondary }]}>
                        {urlError
                            ? `Le lien utilisé n'est plus valide : ${urlError}`
                            : "Pour définir un nouveau mot de passe, vous devez d'abord cliquer sur le lien sécurisé envoyé dans votre boîte de réception."}
                    </Text>

                    <Button
                        title="Demander un nouveau lien"
                        onPress={() => router.replace('/forgot-password')}
                        backgroundColor={colors.primary}
                        textColor="#fff"
                        style={styles.button}
                    />

                    <Button
                        title="Retour à la connexion"
                        onPress={() => router.replace('/login')}
                        backgroundColor={colors.surface}
                        textColor={colors.text}
                        style={[styles.button, { marginTop: 12 }]}
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <View style={[styles.iconWrap, { backgroundColor: colors.primary + '15', marginBottom: 12 }]}>
                            <Ionicons name="lock-closed-outline" size={32} color={colors.primary} />
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>Nouveau mot de passe</Text>
                        <Text style={[styles.description, { color: colors.textSecondary }]}>
                            Choisissez un mot de passe sécurisé d'au moins 6 caractères pour accéder à votre compte.
                        </Text>
                    </View>

                    <View style={styles.formContent}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>Nouveau mot de passe</Text>
                        <InputField
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.grey} />}
                            rightIcon={
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={colors.grey}
                                    />
                                </TouchableOpacity>
                            }
                        />

                        <Text style={[styles.inputLabel, { color: colors.text, marginTop: 14 }]}>
                            Confirmer le nouveau mot de passe
                        </Text>
                        <InputField
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry={!showConfirmPassword}
                            leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.grey} />}
                            rightIcon={
                                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <Ionicons
                                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={colors.grey}
                                    />
                                </TouchableOpacity>
                            }
                        />

                        <Button
                            title="Mettre à jour le mot de passe"
                            onPress={handleUpdatePassword}
                            backgroundColor={colors.primary}
                            textColor="#fff"
                            style={styles.button}
                            isLoading={loading}
                            disabled={!password || !confirmPassword}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 40,
    },
    centerBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    loadingText: {
        fontFamily: fonts.medium,
        fontSize: 15,
        marginTop: 16,
        textAlign: 'center',
    },
    header: {
        marginBottom: 24,
        alignItems: 'center',
    },
    iconWrap: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontFamily: fonts.bold,
        textAlign: 'center',
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        fontFamily: fonts.regular,
        textAlign: 'center',
        lineHeight: 20,
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'center',
    },
    formContent: {
        marginTop: 8,
    },
    inputLabel: {
        fontFamily: fonts.medium,
        fontSize: 13,
        marginBottom: 6,
    },
    message: {
        fontSize: 15,
        fontFamily: fonts.regular,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 28,
    },
    button: {
        marginTop: 20,
    },
});
