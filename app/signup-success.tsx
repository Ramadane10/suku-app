import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../src/components/ui/Button';
import fonts from '../src/constants/fonts';
import { useTheme } from '../src/hooks/useTheme';

export default function SignupSuccessScreen() {
    const router = useRouter();
    const { isDark, colors } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                    <FontAwesome name="check-circle" size={80} color={colors.primary} />
                </View>

                <Text style={[styles.title, { color: colors.text }]}>Inscription Réussie !</Text>

                <Text style={[styles.message, { color: colors.textSecondary }]}>
                    Votre compte a été créé avec succès. Veuillez vérifier votre boîte mail pour activer votre compte avant de vous connecter.
                </Text>

                <Button
                    title="Retour à la connexion"
                    onPress={() => router.replace('/login')}
                    backgroundColor={colors.primary}
                    textColor="#fff"
                    style={styles.button}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    iconContainer: {
        marginBottom: 32,
        borderRadius: 100,
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontFamily: fonts.bold,
        marginBottom: 16,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        fontFamily: fonts.regular,
        textAlign: 'center',
        marginBottom: 48,
        lineHeight: 24,
    },
    button: {
        width: '100%',
    },
});
