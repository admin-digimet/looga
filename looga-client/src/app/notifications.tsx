import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';

interface PrefRow {
  key: string;
  label: string;
  sub: string;
}

const PREFS: PrefRow[] = [
  { key: 'purchase',  label: 'Confirmation d\'achat',     sub: 'Reçois une notif dès que ton billet est prêt' },
  { key: 'reminder',  label: 'Rappel 24h avant',          sub: 'On te rappelle la veille de l\'événement' },
  { key: 'reminder3', label: 'Rappel 3h avant',           sub: 'Rappel juste avant que ça commence' },
  { key: 'news',      label: 'Nouveaux événements',       sub: 'Sois le premier informé des nouvelles dates' },
  { key: 'promo',     label: 'Offres & promotions',       sub: 'Codes promo et réductions exclusives' },
];

export default function NotificationsScreen() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    purchase: true,
    reminder: true,
    reminder3: true,
    news: false,
    promo: false,
  });

  function toggle(key: string) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ArrowLeft size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionLabel}>Choisir ce que tu veux recevoir</Text>

        <View style={styles.card}>
          {PREFS.map((pref, i) => (
            <View key={pref.key}>
              <View style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={styles.rowLabel}>{pref.label}</Text>
                  <Text style={styles.rowSub}>{pref.sub}</Text>
                </View>
                <Switch
                  value={prefs[pref.key]}
                  onValueChange={() => toggle(pref.key)}
                  trackColor={{ false: Colors.surface2, true: Colors.orange }}
                  thumbColor="#FFFFFF"
                />
              </View>
              {i < PREFS.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <Text style={styles.note}>
          Les notifications de confirmation d'achat sont envoyées automatiquement et ne peuvent pas être désactivées.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontFamily: Fonts.headingBold,
    fontSize: FontSize.md,
    color: Colors.text,
    textAlign: 'center',
  },
  placeholder: { width: 36 },

  scroll: { padding: 16, paddingBottom: 40 },

  sectionLabel: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  rowText: { flex: 1, gap: 2 },
  rowLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  rowSub: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: 16,
  },

  note: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    lineHeight: 18,
    marginTop: 16,
    paddingHorizontal: 4,
  },
});
