import { Link, router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Ticket } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Input } from '@/components/ui/Input';
import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import { useLogin } from '@/hooks/useAuth';
import { useAuthStore } from '@/lib/store/authStore';

export default function LoginScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  const loginMutation = useLogin(returnTo);
  const { login } = useAuthStore();

  function clearErrors() {
    setFieldErrors({});
    setGlobalError('');
  }

  function handleSubmit() {
    clearErrors();
    if (!email.trim() || !password.trim()) {
      setGlobalError('Remplis tous les champs.');
      return;
    }
    loginMutation.mutate(
      { email: email.trim().toLowerCase(), password },
      {
        onError: (error: any) => {
          const status = error?.response?.status as number | undefined;
          if (status === 401 || status === 422 || status === 400) {
            setGlobalError('Email ou mot de passe incorrect.');
          } else if (!error?.response) {
            setGlobalError('Vérifie ta connexion internet.');
          } else {
            setGlobalError('Une erreur est survenue, réessaie.');
          }
        },
      }
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.authBg} />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)');
            }
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={20} color={Colors.authText} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── CONTENU SCROLLABLE ── */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Titre */}
          <Text style={styles.title}>{'Se connecter\nou s\'inscrire'}</Text>

          {/* Champs */}
          <View style={styles.form}>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="Adresse e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
              error={fieldErrors.email}
              light
              variant="flat"
            />
            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="Mot de passe"
              secureTextEntry
              error={fieldErrors.password}
              light
              variant="flat"
            />
          </View>

          {/* Bannière info */}
          <View style={styles.infoBanner}>
            <Ticket size={18} color={Colors.orange} style={{ marginTop: 1 }} />
            <Text style={styles.infoBannerText}>
              Utilise l'adresse e-mail avec laquelle tu as acheté tes billets.
            </Text>
          </View>

          {globalError ? (
            <Text style={styles.globalError}>{globalError}</Text>
          ) : null}
        </ScrollView>

        {/* ── PIED FIXE ── */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.ctaBtn, loginMutation.isPending && styles.ctaBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={loginMutation.isPending}
          >
            <Text style={styles.ctaBtnText}>
              {loginMutation.isPending ? 'Connexion…' : 'Suivant'}
            </Text>
          </TouchableOpacity>

          <Link href="/(auth)/register" asChild>
            <TouchableOpacity style={styles.linkWrapper}>
              <Text style={styles.linkText}>
                Pas encore de compte ?{' '}
                <Text style={styles.linkAccent}>S'inscrire</Text>
              </Text>
            </TouchableOpacity>
          </Link>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.authBg,
  },
  flex: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scroll
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },

  // Titre
  title: {
    fontFamily: Fonts.headingBold,
    fontSize: 30,
    color: Colors.authText,
    letterSpacing: -0.5,
    lineHeight: 38,
    marginBottom: 32,
  },

  // Formulaire
  form: {
    gap: 12,
    marginBottom: 16,
  },

  // Bannière
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: 'rgba(255,92,26,0.08)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,92,26,0.15)',
  },
  infoBannerText: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.authText,
    lineHeight: 20,
  },

  globalError: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 12,
  },

  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    paddingTop: 8,
    gap: 16,
  },
  ctaBtn: {
    backgroundColor: Colors.authBtn,
    borderRadius: 100,
    paddingVertical: 17,
    alignItems: 'center',
  },
  ctaBtnDisabled: {
    opacity: 0.5,
  },
  ctaBtnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.authBtnText,
  },
  linkWrapper: {
    alignItems: 'center',
  },
  linkText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.authMuted,
  },
  linkAccent: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.orange,
  },
});
