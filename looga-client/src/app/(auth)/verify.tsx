import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Delete, Mail } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import { useAuthStore } from '@/lib/store/authStore';
import { supabase } from '@/lib/supabase';

const CODE_LENGTH = 6;

const KEYBOARD_ROWS = [
  [
    { num: '1', letters: '' },
    { num: '2', letters: 'ABC' },
    { num: '3', letters: 'DEF' },
  ],
  [
    { num: '4', letters: 'GHI' },
    { num: '5', letters: 'JKL' },
    { num: '6', letters: 'MNO' },
  ],
  [
    { num: '7', letters: 'PQRS' },
    { num: '8', letters: 'TUV' },
    { num: '9', letters: 'WXYZ' },
  ],
];

export default function VerifyScreen() {
  const { email, token } = useLocalSearchParams<{ email: string; token: string }>();
  const { login } = useAuthStore();
  const insets = useSafeAreaInsets();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSent, setResendSent] = useState(false);

  // Blinking cursor animation
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.linear,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [cursorOpacity]);

  // Décompte cooldown renvoyer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  async function handleResend() {
    if (resendCooldown > 0) return;
    setError('');
    setResendSent(false);
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email ?? '',
    });
    if (resendError) {
      setError('Impossible de renvoyer. Réessaie dans un moment.');
    } else {
      setResendSent(true);
      setResendCooldown(60);
    }
  }

  function handlePress(num: string) {
    if (code.length < CODE_LENGTH) {
      const next = code + num;
      setCode(next);
      if (error) setError('');
    }
  }

  function handleBackspace() {
    if (code.length > 0) setCode((prev) => prev.slice(0, -1));
  }

  async function handleVerify() {
    if (code.length < CODE_LENGTH) {
      setError('Saisis le code à 6 chiffres.');
      return;
    }
    setError('');
    setLoading(true);

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email: email ?? '',
      token: code,
      type: 'signup',
    });

    if (verifyError || !data.user) {
      setError('Code incorrect ou expiré. Vérifie ton email.');
      setLoading(false);
      return;
    }

    const accessToken = data.session?.access_token ?? token ?? '';
    const user = {
      id: data.user.id,
      name: (data.user.user_metadata?.name as string) ?? data.user.email ?? '',
      email: data.user.email ?? '',
      phone: (data.user.user_metadata?.phone as string) ?? '',
      avatar_url: null,
      role: 'user',
      push_token: null,
      is_active: true,
      createdAt: data.user.created_at,
      updated_at: data.user.updated_at ?? data.user.created_at,
    };
    await login(accessToken, user);
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.authBg} />

      {/* ── CONTENT ── */}
      <View style={styles.content}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backBtn}
        >
          <ChevronLeft size={28} color={Colors.authText} strokeWidth={2} />
        </TouchableOpacity>

        <View style={styles.iconCircle}>
          <Mail size={26} color={Colors.authMuted} strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>Saisir le code</Text>
        <Text style={styles.subtitle}>
          Code envoyé à{' '}
          <Text style={styles.emailText}>{email}</Text>
        </Text>

        {/* PIN display */}
        <View style={styles.pinRow}>
          {Array.from({ length: CODE_LENGTH }).map((_, i) => {
            const isActive = code.length === i;
            const hasValue = code.length > i;
            return (
              <View key={i} style={styles.pinCell}>
                {hasValue ? (
                  <Text style={styles.pinDigit}>{code[i]}</Text>
                ) : isActive ? (
                  <Animated.Text style={[styles.pinCursor, { opacity: cursorOpacity }]}>
                    |
                  </Animated.Text>
                ) : (
                  <Text style={styles.pinDash}>—</Text>
                )}
              </View>
            );
          })}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {resendSent ? (
          <Text style={styles.resendSuccess}>Code renvoyé ✓</Text>
        ) : null}

        {/* Renvoyer le code */}
        <TouchableOpacity
          onPress={handleResend}
          disabled={resendCooldown > 0}
          style={styles.resendBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.resendText, resendCooldown > 0 && styles.resendTextDim]}>
            {resendCooldown > 0
              ? `Renvoyer dans ${resendCooldown}s`
              : 'Pas reçu ? Renvoyer le code'}
          </Text>
        </TouchableOpacity>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Suivant button */}
        <TouchableOpacity
          style={[styles.ctaBtn, (loading || code.length < CODE_LENGTH) && styles.ctaBtnDim]}
          onPress={handleVerify}
          activeOpacity={0.85}
          disabled={loading || code.length < CODE_LENGTH}
        >
          <Text style={styles.ctaBtnText}>{loading ? 'Vérification…' : 'Suivant'}</Text>
        </TouchableOpacity>
      </View>

      {/* ── CLAVIER NUMÉRIQUE ── */}
      <View style={[styles.keyboard, { paddingBottom: Math.max(insets.bottom + 4, 16) }]}>
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyRow}>
            {row.map((item) => (
              <TouchableOpacity
                key={item.num}
                style={styles.key}
                onPress={() => handlePress(item.num)}
                activeOpacity={0.6}
              >
                <Text style={styles.keyNum}>{item.num}</Text>
                {item.letters ? (
                  <Text style={styles.keyLetters}>{item.letters}</Text>
                ) : (
                  <View style={styles.keyLetterSpacer} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Dernière ligne : vide / 0 / effacer */}
        <View style={styles.keyRow}>
          <View style={styles.keyEmpty} />
          <TouchableOpacity
            style={styles.key}
            onPress={() => handlePress('0')}
            activeOpacity={0.6}
          >
            <Text style={styles.keyNum}>0</Text>
            <View style={styles.keyLetterSpacer} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.keyBackspace}
            onPress={handleBackspace}
            activeOpacity={0.6}
          >
            <Delete size={26} color={Colors.authText} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.authBg,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    marginBottom: 28,
    marginLeft: -4,
    width: 40,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.surface2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: Fonts.headingBold,
    fontSize: 26,
    color: Colors.authText,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.authMuted,
    lineHeight: 22,
    marginBottom: 28,
  },
  emailText: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.authText,
  },

  // PIN display
  pinRow: {
    backgroundColor: Colors.surface2,
    borderRadius: 18,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  pinCell: {
    width: 32,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDigit: {
    fontFamily: Fonts.headingBold,
    fontSize: 28,
    color: Colors.authText,
  },
  pinCursor: {
    fontFamily: Fonts.body,
    fontSize: 28,
    color: Colors.authMuted,
    lineHeight: 36,
  },
  pinDash: {
    fontFamily: Fonts.body,
    fontSize: 20,
    color: Colors.authBorder,
    lineHeight: 28,
  },

  errorText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 12,
  },

  resendBtn: {
    marginTop: 14,
    alignSelf: 'center',
  },
  resendText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.authText,
    textDecorationLine: 'underline',
  },
  resendTextDim: {
    color: Colors.authMuted,
    textDecorationLine: 'none',
  },
  resendSuccess: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.success,
    textAlign: 'center',
    marginTop: 8,
  },

  spacer: { flex: 1 },

  // CTA
  ctaBtn: {
    backgroundColor: Colors.authBtn,
    borderRadius: 100,
    paddingVertical: 17,
    alignItems: 'center',
  },
  ctaBtnDim: { opacity: 0.45 },
  ctaBtnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.authBtnText,
  },

  // Keyboard
  keyboard: {
    backgroundColor: Colors.authBorder,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 8,
    paddingHorizontal: 6,
    gap: 6,
  },
  keyRow: {
    flexDirection: 'row',
    gap: 6,
  },
  key: {
    flex: 1,
    height: Platform.OS === 'ios' ? 48 : 52,
    backgroundColor: Colors.authSurface,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.28,
        shadowRadius: 0,
      },
      android: { elevation: 2 },
    }),
  },
  keyNum: {
    fontFamily: Fonts.body,
    fontSize: 26,
    color: Colors.authText,
    lineHeight: 30,
    marginTop: 2,
  },
  keyLetters: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 9,
    color: Colors.authText,
    letterSpacing: 1.5,
    lineHeight: 13,
  },
  keyLetterSpacer: { height: 13 },
  keyEmpty: {
    flex: 1,
    height: Platform.OS === 'ios' ? 48 : 52,
  },
  keyBackspace: {
    flex: 1,
    height: Platform.OS === 'ios' ? 48 : 52,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
