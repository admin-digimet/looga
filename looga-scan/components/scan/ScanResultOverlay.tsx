import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { AlertTriangle, CheckCircle, Search, XCircle } from 'lucide-react-native';

import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import type { ScanResult } from '@/types/scan';

interface ScanResultOverlayProps {
  result: ScanResult;
  onDismiss: () => void;
}

const STATUS_CONFIG = {
  valid: {
    bg: 'rgba(0, 200, 100, 0.95)',
    bgTint: 'rgba(0, 200, 100, 0.12)',
    color: Colors.success,
    Icon: CheckCircle,
    title: 'ENTRÉE AUTORISÉE',
    subtitle: 'Billet valide — Accès accordé',
    btnText: 'Scanner le suivant →',
    secondaryText: 'Voir détails billet',
  },
  already_used: {
    bg: 'rgba(255, 184, 0, 0.95)',
    bgTint: 'rgba(255, 184, 0, 0.12)',
    color: Colors.warning,
    Icon: AlertTriangle,
    title: 'DÉJÀ UTILISÉ',
    subtitle: 'Ce billet a déjà été scanné',
    btnText: 'Retour au scanner →',
    secondaryText: 'Signaler un problème',
  },
  invalid: {
    bg: 'rgba(255, 59, 59, 0.95)',
    bgTint: 'rgba(255, 59, 59, 0.12)',
    color: Colors.error,
    Icon: XCircle,
    title: 'BILLET INVALIDE',
    subtitle: 'QR code non reconnu ou falsifié',
    btnText: 'Retour au scanner →',
    secondaryText: 'Rechercher manuellement',
  },
} as const;

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatNow() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function AnimatedIcon({ Icon, color }: { Icon: typeof CheckCircle; color: string }) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 180 });
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Icon size={72} color={color} strokeWidth={1.5} />
    </Animated.View>
  );
}

export function ScanResultOverlay({ result, onDismiss }: ScanResultOverlayProps) {
  const cfg = STATUS_CONFIG[result.status];

  // Refus pour billet non payé → libellé dédié (sinon « QR falsifié » serait trompeur)
  const isNotPaid = result.status === 'invalid' && result.invalidReason === 'not_paid';
  const title = isNotPaid ? 'BILLET NON PAYÉ' : cfg.title;
  const subtitle = isNotPaid ? 'Paiement non confirmé — Accès refusé' : cfg.subtitle;

  // Auto-dismiss après 2.5s
  useEffect(() => {
    const timer = setTimeout(onDismiss, 2500);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  // Fade-in pour le contenu texte
  const contentOpacity = useSharedValue(0);
  useEffect(() => {
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));
  }, [contentOpacity]);
  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  return (
    <View style={[styles.overlay, { backgroundColor: cfg.bg }]}>
      {/* Icône animée */}
      <AnimatedIcon Icon={cfg.Icon} color="#fff" />

      {/* Contenu avec fade-in */}
      <Animated.View style={[styles.content, contentStyle]}>
        {/* Titre principal */}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

        {/* Carte infos */}
        {(result.attendeeName || result.ticketType || result.ticketNumber) && (
          <View style={styles.infoCard}>
            <InfoRow label="Participant" value={result.attendeeName || 'Inconnu'} />
            {result.ticketType && (
              <InfoRow label="Type de billet" value={result.ticketType} />
            )}
            {result.ticketNumber && (
              <InfoRow label="N° billet" value={result.ticketNumber} />
            )}
            {result.eventName && (
              <InfoRow label="Événement" value={result.eventName} />
            )}
            {result.status === 'valid' && (
              <InfoRow label="Heure de validation" value={formatNow()} />
            )}
          </View>
        )}

        {/* Infos spécifiques "déjà utilisé" */}
        {result.status === 'already_used' && result.firstScanAt && (
          <View style={styles.infoCard}>
            <InfoRow
              label="Premier scan"
              value={`Aujourd'hui à ${formatTime(result.firstScanAt)}`}
            />
            {result.firstScannerName && (
              <InfoRow label="Scanner" value={result.firstScannerName} />
            )}
            <InfoRow label="Statut" value="⚠ Accès refusé" />
          </View>
        )}

        {/* Infos spécifiques "invalide" */}
        {result.status === 'invalid' && (
          <View style={styles.infoCard}>
            {isNotPaid ? (
              <InfoRow label="Paiement" value="Non confirmé" />
            ) : (
              <InfoRow label="Code scanné" value="Non reconnu" />
            )}
            <InfoRow label="Statut" value="🚫 Accès refusé" />
          </View>
        )}
      </Animated.View>

      {/* Boutons */}
      <Animated.View
        entering={FadeIn.delay(400).duration(300)}
        style={styles.buttons}
      >
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: 'rgba(255,255,255,0.25)' }]}
          onPress={onDismiss}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>{cfg.btnText}</Text>
        </TouchableOpacity>

        {result.status === 'invalid' && (
          <TouchableOpacity style={styles.secondaryBtn} onPress={onDismiss}>
            <Search size={14} color="rgba(255,255,255,0.8)" />
            <Text style={styles.secondaryBtnText}>{cfg.secondaryText}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  title: {
    fontFamily: Fonts.headingBold,
    fontSize: FontSize.display,
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginBottom: 8,
  },

  // Carte infos
  infoCard: {
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.65)',
  },
  infoValue: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.sm,
    color: '#fff',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },

  // Boutons
  buttons: {
    width: '100%',
    marginTop: 16,
    gap: 10,
    alignItems: 'center',
  },
  primaryBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 100,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: '#fff',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  secondaryBtnText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
});
