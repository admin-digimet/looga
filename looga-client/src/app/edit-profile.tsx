import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

import { useAuthStore } from '@/lib/store/authStore';
import { Colors, Gradient } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export default function EditProfileScreen() {
  const { user, token, refreshToken, login } = useAuthStore();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!user) return;
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      Alert.alert('Nom invalide', 'Le nom doit contenir au moins 2 caractères.');
      return;
    }

    setSaving(true);
    try {
      await axios.patch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}`,
        { name: trimmedName, phone: phone.trim() },
        {
          headers: {
            apikey: ANON_KEY,
            Authorization: `Bearer ${token ?? ANON_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
        }
      );

      // Mettre à jour le store local avec les nouvelles valeurs
      if (token) {
        await login(token, { ...user, name: trimmedName, phone: phone.trim() }, refreshToken ?? undefined);
      }

      router.back();
    } catch {
      Alert.alert('Erreur', 'Impossible de sauvegarder. Réessaie dans un instant.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <ChevronLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier le profil</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar */}
          <View style={styles.avatarWrap}>
            <LinearGradient colors={Gradient.primary} style={styles.avatar}>
              <Text style={styles.initials}>
                {(name.trim()[0] ?? user?.name?.[0] ?? 'U').toUpperCase()}
              </Text>
            </LinearGradient>
          </View>

          {/* Formulaire */}
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Nom complet</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Ton prénom et nom"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+225 07 00 00 00 00"
                placeholderTextColor={Colors.textMuted}
                keyboardType="phone-pad"
                returnKeyType="done"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={user?.email ?? ''}
                editable={false}
                placeholderTextColor={Colors.textMuted}
              />
              <Text style={styles.hint}>L'email ne peut pas être modifié.</Text>
            </View>
          </View>

          {/* Bouton Sauvegarder */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
            style={styles.saveBtnWrap}
          >
            <LinearGradient
              colors={saving ? ['#555', '#555'] : Gradient.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveBtn}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Enregistrer</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: Fonts.headingBold,
    fontSize: FontSize.md,
    color: Colors.text,
  },

  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  avatarWrap: {
    alignItems: 'center',
    paddingVertical: 28,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: Fonts.headingBold,
    fontSize: 32,
    color: '#fff',
  },

  form: { gap: 16 },

  field: { gap: 6 },
  label: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: FontSize.base,
    fontFamily: Fonts.body,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputDisabled: {
    opacity: 0.5,
  },
  hint: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },

  saveBtnWrap: { marginTop: 32 },
  saveBtn: {
    borderRadius: 100,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontFamily: Fonts.headingBold,
    fontSize: FontSize.base,
    color: '#fff',
    letterSpacing: 0.3,
  },
});
