import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../src/components/ui/BackButton';
import Button from '../src/components/ui/Button';
import InputField from '../src/components/ui/InputField';
import fonts from '../src/constants/fonts';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/hooks/useTheme';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { colors } = useTheme();
    const { sendPasswordResetEmail } = useAuth();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleResetPassword = async () => {
        if (!email) {
            if (Platform.OS === 'web') {
                window.alert('Veuillez entrer votre adresse email.');
            } else {
                alert('Veuillez entrer votre adresse email.');
            }
            return;
        }

        setLoading(true);
        try {
            const { error } = await sendPasswordResetEmail(email);

            if (error) {
                let message = error.message;
                let title = 'Erreur';

                if (message.includes('Email rate limit exceeded')) {
                    title = 'Trop de tentatives';
                    message = 'Veuillez patienter quelques instants avant de réessayer.';
                }

                if (Platform.OS === 'web') {
                    window.alert(title + '\n' + message);
                } else {
                    alert(title + ': ' + message);
                }
            } else {
                setSent(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={colors.background === '#000000' ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            <View style={styles.topNav}>
                <BackButton onPress={() => router.back()} color={colors.text} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Logo Header */}
                    <View style={styles.logoHeader}>
                        <Image
                            source={require('../assets/images/Nwanma-transparent.png')}
                            style={styles.logoImage}
                            contentFit="contain"
                            transition={200}
                        />
                    </View>

                    {sent ? (
                        /* ---- Success State ---- */
                        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <View style={[styles.successIconWrap, { backgroundColor: colors.primary + '20' }]}>
                                <Ionicons name="mail-open-outline" size={48} color={colors.primary} />
                            </View>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>Email envoyé !</Text>
                            <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                                Un lien de réinitialisation a été envoyé à{'\n'}
                                <Text style={[styles.emailHighlight, { color: colors.primary }]}>{email}</Text>
                                {'\n\n'}Vérifiez votre boîte de réception (et vos spams).
                            </Text>
                            <Button
                                title="Retour à la connexion"
                                onPress={() => router.replace('/login')}
                                backgroundColor={colors.primary}
                                textColor="#fff"
                                style={styles.actionBtn}
                            />
                        </View>
                    ) : (
                        /* ---- Input State ---- */
                        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <View style={[styles.iconWrap, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name="lock-open-outline" size={40} color={colors.primary} />
                            </View>
                            <Text style={[styles.cardTitle, { color: colors.text }]}>Mot de passe oublié ?</Text>
                            <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                                Entrez votre email ci-dessous. Nous vous enverrons un lien pour réinitialiser votre mot de passe.
                            </Text>

                            <Text style={[styles.label, { color: colors.text }]}>Adresse email</Text>
                            <InputField
                                placeholder="votre@email.com"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                leftIcon={<Ionicons name="mail-outline" size={20} color={colors.primary} />}
                            />

                            <Button
                                title="Envoyer le lien"
                                onPress={handleResetPassword}
                                backgroundColor={colors.primary}
                                textColor="#fff"
                                style={styles.actionBtn}
                                isLoading={loading}
                                disabled={!email}
                            />
                        </View>
                    )}

                    {/* Back link */}
                    <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
                        <Ionicons name="arrow-back-outline" size={16} color={colors.primary} />
                        <Text style={[styles.backLinkText, { color: colors.primary }]}>Retour à la connexion</Text>
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topNav: {
        paddingHorizontal: 20,
        paddingTop: 12,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    logoHeader: {
        alignItems: 'center',
        marginVertical: 12,
    },
    logoImage: {
        width: 200,
        height: 100,
    },
    card: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 24,
        marginTop: 4,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
    },
    iconWrap: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    successIconWrap: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontFamily: fonts.bold,
        fontSize: 22,
        textAlign: 'center',
        marginBottom: 8,
    },
    cardDesc: {
        fontFamily: fonts.regular,
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
    },
    emailHighlight: {
        fontFamily: fonts.bold,
    },
    label: {
        fontFamily: fonts.bold,
        fontSize: 14,
        marginBottom: 6,
        alignSelf: 'flex-start',
        width: '100%',
    },
    actionBtn: {
        marginTop: 8,
        width: '100%',
    },
    backLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        gap: 6,
    },
    backLinkText: {
        fontFamily: fonts.bold,
        fontSize: 14,
    },
});
