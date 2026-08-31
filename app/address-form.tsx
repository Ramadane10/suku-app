import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../src/components/ui/Button';
import InputField from '../src/components/ui/InputField';
import fonts from '../src/constants/fonts';
import { useCustomAlert } from '../src/context/AlertContext';
import { useAuth } from '../src/context/AuthContext';
import { useAddresses } from '../src/hooks/useAddresses';
import { useTheme } from '../src/hooks/useTheme';

export default function AddressFormScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const addressId = params.id as string | undefined;

    const { colors } = useTheme();
    const { user } = useAuth();
    const { showSuccess, showError } = useCustomAlert();
    const { addresses, createAddress, updateAddress } = useAddresses();

    const [addressLine, setAddressLine] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('Guinée');
    const [isDefault, setIsDefault] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const isEditing = Boolean(addressId);

    // Pré-remplir les champs en mode modification
    useEffect(() => {
        if (isEditing && addresses.length > 0) {
            const existing = addresses.find((addr) => addr.id === addressId);
            if (existing) {
                setAddressLine(existing.address_line || '');
                setCity(existing.city || '');
                setPostalCode(existing.postal_code || '');
                setCountry(existing.country || 'Guinée');
                setIsDefault(existing.is_default || false);
            }
        }
    }, [addressId, addresses, isEditing]);

    const handleSubmit = async () => {
        if (!addressLine.trim() || !city.trim()) {
            showError('Erreur', 'Veuillez renseigner au moins l\'adresse et la ville.');
            return;
        }

        if (!user) {
            showError('Connexion requise', 'Veuillez vous connecter pour enregistrer une adresse.');
            router.push('/login');
            return;
        }

        setSubmitting(true);
        try {
            if (isEditing && addressId) {
                await updateAddress(addressId, {
                    address_line: addressLine.trim(),
                    city: city.trim(),
                    postal_code: postalCode.trim() || '00000',
                    country: country.trim() || 'Guinée',
                    is_default: isDefault,
                });
                showSuccess('Succès', 'Adresse mise à jour avec succès !');
            } else {
                await createAddress({
                    address_line: addressLine.trim(),
                    city: city.trim(),
                    postal_code: postalCode.trim() || '00000',
                    country: country.trim() || 'Guinée',
                    is_default: isDefault,
                });
                showSuccess('Succès', 'Nouvelle adresse ajoutée avec succès !');
            }
            router.back();
        } catch (error: any) {
            showError('Erreur', error.message || 'Impossible d\'enregistrer l\'adresse.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    style={styles.backButton}
                    activeOpacity={0.3}
                    delayPressIn={0}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    {isEditing ? 'Modifier l\'adresse' : 'Nouvelle adresse'}
                </Text>
                <View style={{ width: 44 }} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={[styles.label, { color: colors.text }]}>Adresse</Text>
                    <InputField
                        placeholder="Ex: 123 Avenue de la République"
                        value={addressLine}
                        onChangeText={setAddressLine}
                        leftIcon={<Ionicons name="location-outline" size={20} color={colors.primary} />}
                    />

                    <Text style={[styles.label, { color: colors.text }]}>Ville</Text>
                    <InputField
                        placeholder="Ex: Paris, Conakry..."
                        value={city}
                        onChangeText={setCity}
                        leftIcon={<Ionicons name="business-outline" size={20} color={colors.primary} />}
                    />

                    <Text style={[styles.label, { color: colors.text }]}>Code Postal</Text>
                    <InputField
                        placeholder="Ex: 75001"
                        value={postalCode}
                        onChangeText={setPostalCode}
                        keyboardType="number-pad"
                        leftIcon={<Ionicons name="mail-outline" size={20} color={colors.primary} />}
                    />

                    <Text style={[styles.label, { color: colors.text }]}>Pays</Text>
                    <InputField
                        placeholder="Ex: France, Guinée..."
                        value={country}
                        onChangeText={setCountry}
                        leftIcon={<Ionicons name="earth-outline" size={20} color={colors.primary} />}
                    />

                    <View style={[styles.switchRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={{ flex: 1, marginRight: 12 }}>
                            <Text style={[styles.switchTitle, { color: colors.text }]}>Adresse par défaut</Text>
                            <Text style={[styles.switchSub, { color: colors.textSecondary }]}>
                                Utiliser automatiquement cette adresse pour vos prochaines commandes.
                            </Text>
                        </View>
                        <Switch
                            value={isDefault}
                            onValueChange={setIsDefault}
                            trackColor={{ false: colors.border, true: colors.primary + '80' }}
                            thumbColor={isDefault ? colors.primary : '#f4f3f4'}
                        />
                    </View>

                    <Button
                        title={isEditing ? 'Enregistrer les modifications' : 'Ajouter l\'adresse'}
                        onPress={handleSubmit}
                        backgroundColor={colors.primary}
                        textColor="#fff"
                        isLoading={submitting}
                        style={styles.submitBtn}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: fonts.bold,
        fontSize: 18,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    label: {
        fontFamily: fonts.bold,
        fontSize: 14,
        marginBottom: 6,
        marginTop: 10,
    },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginTop: 16,
        marginBottom: 24,
    },
    switchTitle: {
        fontFamily: fonts.bold,
        fontSize: 15,
    },
    switchSub: {
        fontFamily: fonts.regular,
        fontSize: 12,
        marginTop: 2,
    },
    submitBtn: {
        marginTop: 10,
    },
});
