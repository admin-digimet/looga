import {
  CalendarDays,
  ChevronRight,
  LogOut,
  User,
  Volume2
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { Fonts, FontSize } from '@/constants/typography';
import { useLogout } from '@/hooks/useAuth';
import { useAuthStore } from '@/lib/store/authStore';
import { storage } from '@/lib/store/mmkv';
import { useScanStore } from '@/lib/store/scanStore';

const SOUND_ENABLED_KEY = 'sound_enabled';
const SCANNER_NAME_KEY = 'scanner_name';

function readSoundEnabled(): boolean {
  const val = storage.getString(SOUND_ENABLED_KEY);
  return val !== 'false'; // par défaut activé
}

function readScannerName(): string {
  return storage.getString(SCANNER_NAME_KEY) ?? 'Scanner';
}

export default function SettingsScreen() {
  const { activeEvent, scanCount } = useScanStore();
  const { user, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogout();

  const [soundEnabled, setSoundEnabled] = useState(readSoundEnabled);
  const [scannerName] = useState(readScannerName);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Recharge les infos de la session Supabase
    await useAuthStore.getState().loadToken();
    setRefreshing(false);
  }, []);

  const handleSoundToggle = useCallback((val: boolean) => {
    setSoundEnabled(val);
    storage.set(SOUND_ENABLED_KEY, val ? 'true' : 'false');
  }, []);

  function handleLogout() {
    Alert.alert(
      'Se déconnecter ?',
      'Tu devras te reconnecter pour scanner à nouveau.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: () => logoutMutation.mutate(),
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.orange]}
            tintColor={Colors.orange}
          />
        }
      >
        {/* Header profil */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarCircle}>
            <User size={28} color={Colors.orange} />
          </View>
          <Text style={styles.profileName}>{user?.name ?? scannerName}</Text>
          {user?.email ? <Text style={styles.profileEmail}>{user.email}</Text> : null}
        </View>


         {/* Événement actif */}
        {activeEvent && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Événement actif</Text>
            <View style={styles.eventCard}>
              <View style={styles.eventCardLeft}>
                <CalendarDays size={18} color={Colors.orange} />
                <View style={styles.eventCardInfo}>
                  <Text style={styles.eventCardName} numberOfLines={2}>
                    {activeEvent.name}
                  </Text>
                  <Text style={styles.eventCardMeta}>{scanCount} billet{scanCount !== 1 ? 's' : ''} validé{scanCount !== 1 ? 's' : ''}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: 'rgba(255,92,26,0.1)' }]}>
                  <Volume2 size={16} color={Colors.orange} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Son au scan</Text>
                  <Text style={styles.settingDesc}>Feedback sonore à chaque scan</Text>
                </View>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={handleSoundToggle}
                trackColor={{ false: Colors.border, true: Colors.orange }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Compte */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Compte</Text>
            <View style={styles.card}>

              <TouchableOpacity
                style={styles.actionRow}
                onPress={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: 'rgba(255,59,59,0.1)' }]}>
                    <LogOut size={16} color={Colors.error} />
                  </View>
                  <Text style={[styles.settingLabel, { color: Colors.error }]} numberOfLines={1}>
                    {logoutMutation.isPending ? 'Déconnexion…' : 'Se déconnecter'}
                  </Text>
                </View>
                <ChevronRight size={18} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Version */}
        <Text style={styles.version}>Looga Scan v0.0.1</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
    gap: 8,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,92,26,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  profileName: {
    fontFamily: Fonts.headingBold,
    fontSize: FontSize.xl,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  profileEmail: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: 56,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    gap: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  settingLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  settingDesc: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 1,
  },
  scannerNameInput: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: 'right',
    maxWidth: 140,
  },
  eventCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventCardLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  eventCardInfo: {
    flex: 1,
    gap: 3,
  },
  eventCardName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.text,
    lineHeight: 20,
  },
  eventCardMeta: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  version: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
  },
});
