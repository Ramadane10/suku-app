import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';
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

    const handleResetPassword = async () => {
        if (!email) {
            if (Platform.OS === 'web') {
                window.alert('Veuillez entrer votre adresse email.');
            } else {
                Alert.alert('Erreur', 'Veuillez entrer votre adresse email.');
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
                    Alert.alert(title, message);
                }
            } else {
                const title = 'Email envoyé';
                const message = 'Vérifiez votre boîte mail pour réinitialiser votre mot de passe.';

                if (Platform.OS === 'web') {
                    window.alert(title + '\n' + message);
                    router.back();
                } else {
                    Alert.alert(title, message, [
                        { text: 'OK', onPress: () => router.back() }
                    ]);
                }
            }
        } catch (err) {
            console.error(err);
            if (Platform.OS === 'web') {
                window.alert('Une erreur inattendue est survenue.');
            } else {
                Alert.alert('Erreur', 'Une erreur inattendue est survenue.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <BackButton onPress={() => router.back()} color={colors.text} />
                <Text style={[styles.title, { color: colors.text }]}>Réinitialiser mot de passe</Text>
            </View>

            <View style={styles.content}>
                <Text style={[styles.description, { color: colors.textSecondary }]}>
                    Entrez l'email associé à votre compte et nous vous enverrons les instructions pour réinitialiser votre mot de passe.
                </Text>

                <InputField
                    placeholder="Adresse email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon={<FontAwesome name="envelope" size={18} color={colors.grey} />}
                />

                <Button
                    title="Réinitialiser"
                    onPress={handleResetPassword}
                    backgroundColor={colors.primary}
                    textColor="#fff"
                    style={styles.button}
                    isLoading={loading}
                    disabled={!email}
                />

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: colors.textSecondary }]}>Je me souviens de mon mot de passe. </Text>
                    <Text
                        style={[styles.footerLink, { color: colors.primary }]}
                        onPress={() => router.back()}
                    >
                        Se connecter
                    </Text>
                </View>
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
        paddingHorizontal: 20,
    },
    description: {
        fontSize: 16,
        fontFamily: fonts.regular,
        marginBottom: 32,
        lineHeight: 24,
    },
    button: {
        marginTop: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
    },
    footerText: {
        fontFamily: fonts.regular,
        fontSize: 14,
    },
    footerLink: {
        fontFamily: fonts.bold,
        fontSize: 14,
    },
});
