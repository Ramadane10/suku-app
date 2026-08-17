import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import fonts from '../src/constants/fonts';
import { useTheme } from '../src/hooks/useTheme';

export const options = { headerShown: false };

const ProfileContact = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const handleCall = () => {
    Linking.openURL('tel:+2246269279451');
  };
  const handleEmail = () => {
    Linking.openURL('mailto:contact@nwanma.com');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Contactez-nous</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>CONTACT</Text>
        <View style={[styles.infoRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Notre adresse</Text>
          <Text style={[styles.infoValue, { color: colors.text }]}>1412 rue Steiner, Paris, 75015</Text>
        </View>
        <View style={[styles.infoRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>E-mail</Text>
          <TouchableOpacity onPress={handleEmail}>
            <Text style={[styles.infoValueLink, { color: colors.primary }]}>contact@nwanma.com</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.infoNote, { color: colors.textSecondary }]}>Notre service client est ouvert du lundi au vendredi, 10h - 17h.</Text>
        <TouchableOpacity style={[styles.callBtn, { backgroundColor: colors.surface, borderColor: colors.primary }]} onPress={handleCall}>
          <Text style={[styles.callBtnText, { color: colors.primary }]}>Appeler</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 12,
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
  },
  sectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 16,
  },
  infoRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  infoValueLink: {
    fontFamily: fonts.regular,
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  infoNote: {
    fontFamily: fonts.regular,
    fontSize: 13,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  callBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  callBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
  },
});

export default ProfileContact;