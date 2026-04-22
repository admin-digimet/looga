import { router, useLocalSearchParams } from 'expo-router';
import { BadgeCheck, Lock, ShieldCheck, Ticket } from 'lucide-react-native';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';

export default function WelcomeScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const insets = useSafeAreaInsets();

  function goToLogin() {
    router.push({
      pathname: '/(auth)/login',
      params: returnTo ? { returnTo } : {},
    });
  }

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.authBg} />

      {/* ── Décoration géométrique abstraite ── */}
      <View style={styles.decoOrange} pointerEvents="none" />
      <View style={styles.decoViolet} pointerEvents="none" />

      {/* ── Contenu principal ── */}
      <View style={styles.container}>

        {/* Logo */}
        <Text style={styles.logo}>looga</Text>

        {/* Espace souple */}
        <View style={styles.spacer} />

        {/* Headline */}
        <View style={styles.heroText}>
          <Text style={styles.headline}>
            Découvre les meilleurs{'\n'}événements à Abidjan
          </Text>
          <Text style={styles.subline}>
            Concerts, soirées, culture…{'\n'}Réserve ton billet en quelques secondes.
          </Text>
        </View>

        {/* Trust row */}
        <View style={styles.trustRow}>
          <TrustItem Icon={ShieldCheck} label="Billets sécurisés" />
          <TrustItem Icon={BadgeCheck} label="Accès garanti" />
          <TrustItem Icon={Lock} label="Sans fraude" />
        </View>

        {/* Espace souple */}
        <View style={styles.spacer} />

        {/* CTA */}
        <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? 0 : 8 }]}>
          <Button label="Continuer avec mon e-mail" onPress={goToLogin} />

          <TouchableOpacity
            style={styles.secondaryLink}
            onPress={goToLogin}
            activeOpacity={0.7}
          >
            <Ticket size={14} color={Colors.authMuted} />
            <Text style={styles.secondaryLinkText}>J'ai déjà un billet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

function TrustItem({
  Icon,
  label,
}: {
  Icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
}) {
  return (
    <View style={styles.trustItem}>
      <Icon size={14} color={Colors.orange} />
      <Text style={styles.trustLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.authBg,
  },

  // ── Décoration géométrique ────────────────────────────────────────────────
  decoOrange: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 9999,
    backgroundColor: Colors.orange,
    opacity: 0.07,
    top: -100,
    right: -80,
  },
  decoViolet: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 9999,
    backgroundColor: Colors.violet,
    opacity: 0.06,
    top: 60,
    left: -80,
  },

  // ── Layout ───────────────────────────────────────────────────────────────
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 12,
  },
  spacer: {
    flex: 1,
  },

  // ── Logo ─────────────────────────────────────────────────────────────────
  logo: {
    fontFamily: Fonts.headingBold,
    fontSize: 26,
    color: Colors.orange,
    letterSpacing: -0.5,
    marginTop: 16,
    textAlign: 'center',
  },

  // ── Hero text ────────────────────────────────────────────────────────────
  heroText: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  headline: {
    fontFamily: Fonts.headingBold,
    fontSize: 32,
    color: Colors.authText,
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  subline: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.authMuted,
    textAlign: 'center',
    lineHeight: 24,
  },

  // ── Trust ────────────────────────────────────────────────────────────────
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 20,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trustLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.authMuted,
  },

  // ── Footer ───────────────────────────────────────────────────────────────
  footer: {
    gap: 16,
    paddingBottom: 8,
  },
  secondaryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 8,
  },
  secondaryLinkText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.authMuted,
  },
});
