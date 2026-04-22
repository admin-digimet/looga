import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ScanLine } from 'lucide-react-native';

import { Input } from '@/components/ui/Input';
import { Colors, Gradient } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import { useLogin } from '@/hooks/useAuth';
import { useAuthStore } from '@/lib/store/authStore';

interface ValidationError {
  message: string;
  errors: Record<string, string[]>;
}

type Step = 'credentials' | 'pin';

export default function LoginScreen() {
  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  // PIN refs dans un seul useRef
  const pinRefs = useRef<Array<TextInput | null>>([null, null, null, null]);

  const loginMutation = useLogin();

  function clearErrors() {
    setFieldErrors({});
    setGlobalError('');
  }

  // Étape 1 — email + password
  function handleCredentials() {
    clearErrors();
    if (!email.trim() || !password.trim()) {
      setGlobalError('Remplis tous les champs.');
      return;
    }
    loginMutation.mutate(
      { email: email.trim().toLowerCase(), password },
      {
        onSuccess: () => {
          // Si l'API indique que le compte a un PIN → étape 2
          // Sinon → events directement
          setStep('pin');
        },
        onError: (error: any) => {
          const msg: string = error?.message ?? ''
          if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
            setGlobalError('Email ou mot de passe incorrect.')
          } else if (msg.includes('introuvable') || msg.includes('désactivé')) {
            setGlobalError(msg)
          } else if (msg.includes('Email not confirmed')) {
            setGlobalError('Compte non confirmé. Contacte ton organisateur.')
          } else {
            setGlobalError(msg || 'Une erreur est survenue. Réessaie.')
          }
        },
      }
    );
  }

  // Étape 2 — PIN (configuré par l'orga dans le dashboard)
  function handlePinChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const next = [...pin];
    next[index] = value.slice(-1);
    setPin(next);
    if (value && index < 3) {
      pinRefs.current[index + 1]?.focus();
    }
    // Auto-submit quand les 4 chiffres sont saisis
    if (value && index === 3) {
      const full = [...next].join('');
      if (full.length === 4) handlePinSubmit(full);
    }
  }

  async function handlePinSubmit(pinStr?: string) {
    const code = pinStr ?? pin.join('');
    if (code.length < 4) {
      setGlobalError('Entre les 4 chiffres de ton PIN.');
      return;
    }
    // Le PIN est vérifié côté serveur ou localement selon l'implémentation backend
    // Pour l'instant on stocke et on navigue
    await useAuthStore.getState().setPin(code);
    router.replace('/(main)/event' as any);
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.authBg} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <ScanLine size={24} color={Colors.orange} />
            </View>
            <LinearGradient
              colors={Gradient.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoGradient}
            >
              <Text style={styles.logoText}>looga scan</Text>
            </LinearGradient>
          </View>

          {/* Indicateur étapes */}
          <View style={styles.stepsRow}>
            <View style={[styles.stepDot, styles.stepDotDone]} />
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, step === 'pin' && styles.stepDotActive]} />
          </View>

          {step === 'credentials' ? (
            <>
              <Text style={styles.title}>Connexion</Text>
              <Text style={styles.subtitle}>
                Identifiants créés par ton organisateur depuis le dashboard Looga.
              </Text>
              <View style={styles.form}>
                <Input
                  label="Adresse e-mail"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="ton@email.com"
                  keyboardType="email-address"
                  error={fieldErrors.email}
                />
                <Input
                  label="Mot de passe"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry
                  error={fieldErrors.password}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.title}>Code PIN</Text>
              <Text style={styles.subtitle}>
                Entre le code PIN à 4 chiffres associé à ton compte scanner.
              </Text>
              <View style={styles.pinRow}>
                {pin.map((digit, i) => (
                  <TextInput
                    key={i}
                    ref={(el) => { pinRefs.current[i] = el; }}
                    style={[styles.pinCell, digit ? styles.pinCellFilled : null]}
                    value={digit}
                    onChangeText={(v) => handlePinChange(i, v)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    secureTextEntry
                    autoFocus={i === 0}
                  />
                ))}
              </View>
            </>
          )}

          {globalError ? (
            <Text style={styles.globalError}>{globalError}</Text>
          ) : null}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {step === 'credentials' ? (
            <TouchableOpacity
              style={[styles.ctaBtn, loginMutation.isPending && styles.ctaBtnDisabled]}
              onPress={handleCredentials}
              activeOpacity={0.85}
              disabled={loginMutation.isPending}
            >
              <Text style={styles.ctaBtnText}>
                {loginMutation.isPending ? 'Connexion…' : 'Suivant →'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.ctaBtn, pin.join('').length < 4 && styles.ctaBtnDisabled]}
              onPress={() => handlePinSubmit()}
              activeOpacity={0.85}
              disabled={pin.join('').length < 4}
            >
              <Text style={styles.ctaBtnText}>Confirmer</Text>
            </TouchableOpacity>
          )}

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
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
  },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,92,26,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGradient: {
    borderRadius: 4,
    paddingHorizontal: 1,
  },
  logoText: {
    fontFamily: Fonts.headingBold,
    fontSize: FontSize.xl,
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  // Étapes
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 28,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.authBorder,
  },
  stepDotDone: {
    backgroundColor: Colors.orange,
  },
  stepDotActive: {
    width: 24,
    borderRadius: 4,
    backgroundColor: Colors.orange,
  },
  stepLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.authBorder,
  },

  title: {
    fontFamily: Fonts.headingBold,
    fontSize: 28,
    color: Colors.authText,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.authMuted,
    lineHeight: 20,
    marginBottom: 28,
  },

  form: { gap: 4 },

  // PIN
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  pinCell: {
    width: 64,
    height: 72,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.authBorder,
    backgroundColor: Colors.authSurface,
    fontFamily: Fonts.headingBold,
    fontSize: FontSize.xxl,
    color: Colors.authText,
    textAlign: 'center',
  },
  pinCellFilled: {
    borderColor: Colors.orange,
    backgroundColor: 'rgba(255,92,26,0.06)',
  },

  globalError: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 12,
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    paddingTop: 8,
    gap: 12,
  },
  ctaBtn: {
    backgroundColor: Colors.authBtn,
    borderRadius: 100,
    paddingVertical: 17,
    alignItems: 'center',
  },
  ctaBtnDisabled: { opacity: 0.45 },
  ctaBtnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.authBtnText,
  },
});
