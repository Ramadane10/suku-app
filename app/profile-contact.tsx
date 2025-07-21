import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from '../src/components/ui/BottomTabBar';
import colors from '../src/constants/colors';
import fonts from '../src/constants/fonts';

export const options = { headerShown: false };

const ProfileContact = () => {
  const router = useRouter();
  const handleCall = () => {
    Linking.openURL('tel:+2246269279451');
  };
  const handleEmail = () => {
    Linking.openURL('mailto:contact@suku-app.com');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Contactez-nous</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.sectionLabel}>CONTACT</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Notre adresse</Text>
          <Text style={styles.infoValue}>1412 rue Steiner, Paris, 75015</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>E-mail</Text>
          <TouchableOpacity onPress={handleEmail}>
            <Text style={styles.infoValueLink}>contact@suku-app.com</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.infoNote}>Notre service client est ouvert du lundi au vendredi, 10h - 17h.</Text>
        <TouchableOpacity style={styles.callBtn} onPress={handleCall}>
          <Text style={styles.callBtnText}>Appeler</Text>
        </TouchableOpacity>
      </ScrollView>
      <BottomTabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 20,
    color: colors.dark,
  },
  sectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 14,
    color: colors.grey,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 16,
  },
  infoRow: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
  },
  infoLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.grey,
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.dark,
  },
  infoValueLink: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  infoNote: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.grey,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  callBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  callBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.primary,
  },
});

export default ProfileContact; 