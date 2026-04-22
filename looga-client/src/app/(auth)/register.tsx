import { Link, router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
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
import { useRegister } from '@/hooks/useAuth';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  const registerMutation = useRegister();

  function clearErrors() {
    setFieldErrors({});
    setGlobalError('');
  }

  function handleSubmit() {
    clearErrors();
    if (!name.trim() || !email.trim() || !password.trim() || !passwordConfirmation.trim()) {
      setGlobalError('Remplis tous les champs.');
      return;
    }
    if (password !== passwordConfirmation) {
      setFieldErrors({ password_confirmation: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    registerMutation.mutate(
      {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        password_confirmation: passwordConfirmation,
        ...(phone.trim() && { phone: phone.trim() }),
      },
      {
        onError: (error: any) => {
          const status = error?.response?.status as number | undefined;
          const errors = error?.response?.data?.errors as Record<string, string[]> | undefined;
          if (errors?.email) {
            setFieldErrors({ email: 'Un compte existe déjà avec cet email.' });
          } else if (status === 422 || status === 400) {
            setGlobalError('Vérifie les informations saisies.');
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
              router.replace('/(auth)/login');
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
          <Text style={styles.title}>Créer un compte</Text>

          {/* Champs */}
          <View style={styles.form}>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Nom complet"
              autoCapitalize="words"
              error={fieldErrors.name}
              light
              variant="flat"
            />
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
              value={phone}
              onChangeText={setPhone}
              placeholder="Téléphone (optionnel)"
              keyboardType="phone-pad"
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
            <Input
              value={passwordConfirmation}
              onChangeText={setPasswordConfirmation}
              placeholder="Confirmer le mot de passe"
              secureTextEntry
              error={fieldErrors.password_confirmation}
              light
              variant="flat"
            />
          </View>

          {/* Mention légale */}
          <Text style={styles.terms}>
            En créant un compte, j'accepte les{' '}
            <Text style={styles.termsLink}>Conditions d'utilisation</Text>
            {' '}et la{' '}
            <Text style={styles.termsLink}>Politique de confidentialité</Text>
            {' '}de Looga.
          </Text>

          {globalError ? (
            <Text style={styles.globalError}>{globalError}</Text>
          ) : null}
        </ScrollView>

        {/* ── PIED FIXE ── */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.ctaBtn, registerMutation.isPending && styles.ctaBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={registerMutation.isPending}
          >
            <Text style={styles.ctaBtnText}>
              {registerMutation.isPending ? 'Création…' : "S'inscrire"}
            </Text>
          </TouchableOpacity>

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.linkWrapper}>
              <Text style={styles.linkText}>
                Déjà un compte ?{' '}
                <Text style={styles.linkAccent}>Se connecter</Text>
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
    marginBottom: 32,
  },

  // Formulaire
  form: {
    gap: 12,
    marginBottom: 20,
  },

  // Mentions légales
  terms: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.authMuted,
    lineHeight: 20,
  },
  termsLink: {
    fontFamily: Fonts.bodyMedium,
    color: Colors.authText,
    textDecorationLine: 'underline',
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
