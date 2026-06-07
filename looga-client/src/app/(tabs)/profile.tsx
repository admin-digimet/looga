import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Bell,
  BookOpen,
  ChevronRight,
  FileText,
  Heart,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  Pencil,
  ShieldCheck,
  Ticket,
  Users,
  type LucideIcon,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';

import { useLogout } from '@/hooks/useAuth';
import { useAuthStore } from '@/lib/store/authStore';
import { useTicketStore } from '@/lib/store/ticketStore';
import { useSavedStore } from '@/lib/store/savedStore';
import { Colors } from '@/constants/colors';
import { LEGAL_LINKS } from '@/constants/links';
import { Fonts, FontSize } from '@/constants/typography';

function openLegal(url: string) {
  return WebBrowser.openBrowserAsync(url, {
    presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
    controlsColor: Colors.orange,
    toolbarColor: Colors.bg,
  });
}

export default function AccountScreen() {
  const { user, isAuthenticated } = useAuthStore();
  const logoutMutation = useLogout();
  const { tickets } = useTicketStore();
  const { savedEvents } = useSavedStore();

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const activeTickets = tickets.filter(
    (t) => t.status === 'valid' && new Date(t.eventDate) >= today,
  ).length;
  const savedCount = savedEvents.length;

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.notAuthContainer}>
          <Text style={styles.notAuthTitle}>Mon compte</Text>
          <Text style={styles.notAuthText}>
            Connecte-toi pour accéder à ton profil et tes billets.
          </Text>
          <TouchableOpacity
            style={styles.notAuthBtn}
            onPress={() => router.replace('/(auth)/welcome')}
            activeOpacity={0.85}
          >
            <Text style={styles.notAuthBtnText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : '?';

  function confirmLogout() {
    Alert.alert(
      'Déconnexion',
      'Tu vas être déconnecté de Looga.',
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <Text style={styles.title}>Compte</Text>
        </View>

        {/* ── USER CARD ── */}
        <View style={styles.userCard}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.initials}>{initials}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>{user?.name ?? '—'}</Text>
              <Text style={styles.userSub}>
                {user?.email ?? user?.phone ?? '—'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.push('/edit-profile')}
              activeOpacity={0.7}
            >
              <Pencil size={16} color={Colors.orange} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── MON ACTIVITÉ ── */}
        <Text style={styles.sectionTitle}>Mon activité</Text>
        <View style={styles.menuSection}>
          <MenuItem
            Icon={Ticket}
            label="Mes billets"
            sublabel={activeTickets > 0 ? `${activeTickets} billet${activeTickets > 1 ? 's' : ''} actif${activeTickets > 1 ? 's' : ''}` : 'Aucun billet'}
            onPress={() => router.push('/(tabs)/tickets')}
          />
          <View style={styles.divider} />
          <MenuItem
            Icon={Heart}
            label="Mes favoris"
            sublabel={savedCount > 0 ? `${savedCount} événement${savedCount > 1 ? 's' : ''} sauvegardé${savedCount > 1 ? 's' : ''}` : 'Aucun événement sauvegardé'}
            onPress={() => router.push('/(tabs)/favorites')}
          />
        </View>

        {/* ── PRÉFÉRENCES ── */}
        <Text style={styles.sectionTitle}>Préférences</Text>
        <View style={styles.menuSection}>
          <MenuItem
            Icon={Bell}
            label="Notifications"
            onPress={() => router.push('/notifications')}
          />
          <View style={styles.divider} />
          <MenuItem
            Icon={HelpCircle}
            label="Contacter le support"
            sublabel="support@looga-ci.com"
            onPress={() => Linking.openURL('mailto:support@looga-ci.com')}
          />
        </View>

        {/* ── INFORMATIONS ── */}
        <Text style={styles.sectionTitle}>Informations</Text>
        <View style={styles.menuSection}>
          <MenuItem
            Icon={BookOpen}
            label="Centre d'aide"
            onPress={() => openLegal(LEGAL_LINKS.aide)}
          />
          <View style={styles.divider} />
          <MenuItem
            Icon={Info}
            label="À propos de Looga"
            onPress={() => openLegal(LEGAL_LINKS.aPropos)}
          />
          <View style={styles.divider} />
          <MenuItem
            Icon={ShieldCheck}
            label="Sécurité"
            onPress={() => openLegal(LEGAL_LINKS.securite)}
          />
          <View style={styles.divider} />
          <MenuItem
            Icon={Users}
            label="Règles de la communauté"
            onPress={() => openLegal(LEGAL_LINKS.communaute)}
          />
          <View style={styles.divider} />
          <MenuItem
            Icon={FileText}
            label="Conditions d'utilisation"
            onPress={() => openLegal(LEGAL_LINKS.cgu)}
          />
          <View style={styles.divider} />
          <MenuItem
            Icon={Lock}
            label="Politique de confidentialité"
            onPress={() => openLegal(LEGAL_LINKS.confidentialite)}
          />
        </View>

        {/* ── DÉCONNEXION ── */}
        <View style={[styles.menuSection, styles.menuSectionDanger]}>
          <MenuItem
            Icon={LogOut}
            label="Déconnexion"
            onPress={confirmLogout}
            danger
            disabled={logoutMutation.isPending}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  Icon,
  label,
  sublabel,
  onPress,
  danger = false,
  disabled = false,
}: {
  Icon: LucideIcon;
  label: string;
  sublabel?: string;
  onPress: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, disabled && styles.menuItemDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Icon size={20} color={danger ? Colors.error : Colors.text} strokeWidth={1.8} />
      <View style={styles.menuLabelWrapper}>
        <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>{label}</Text>
        {sublabel && <Text style={styles.menuSublabel}>{sublabel}</Text>}
      </View>
      <ChevronRight size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: {
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  title: {
    fontFamily: Fonts.headingBold,
    fontSize: 28,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  // User card
  userCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontFamily: Fonts.headingBold,
    fontSize: FontSize.lg,
    color: Colors.surface,
  },
  userInfo: { flex: 1 },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: `${Colors.orange}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontFamily: Fonts.headingBold,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  userSub: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  // Sections
  sectionTitle: {
    fontFamily: Fonts.headingBold,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  menuSection: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuSectionDanger: {
    marginTop: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuItemDisabled: { opacity: 0.45 },
  menuLabelWrapper: {
    flex: 1,
    gap: 1,
  },
  menuLabel: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  menuLabelDanger: { color: Colors.error },
  menuSublabel: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: 48,
  },

  // État non authentifié
  notAuthContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  notAuthTitle: {
    fontFamily: Fonts.headingBold,
    fontSize: FontSize.xl,
    color: Colors.text,
    textAlign: 'center',
  },
  notAuthText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  notAuthBtn: {
    marginTop: 8,
    backgroundColor: Colors.orange,
    borderRadius: 100,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  notAuthBtnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: '#FFFFFF',
  },
});
