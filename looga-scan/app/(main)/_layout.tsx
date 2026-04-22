import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Redirect, Tabs } from 'expo-router';
import { CalendarDays, Clock, ScanLine, Search, User } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/typography';
import { useAuthStore } from '@/lib/store/authStore';

const TAB_CONFIG: Record<string, { label: string; Icon: typeof ScanLine; isCenter?: boolean }> = {
  event:    { label: 'Événement',  Icon: CalendarDays },
  search:   { label: 'Recherche',  Icon: Search },
  scan:     { label: 'Scanner',    Icon: ScanLine, isCenter: true },
  profile: { label: 'Profil',      Icon: User },
  history:  { label: 'Historique', Icon: Clock },
};

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || 8 }]}>
      {state.routes.map((route, index) => {
        const cfg = TAB_CONFIG[route.name];
        if (!cfg) return null;
        const isFocused = state.index === index;
        const { Icon, label, isCenter } = cfg;

        function onPress() {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        }

        if (isCenter) {
          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tabItem}
              onPress={onPress}
              activeOpacity={0.8}
            >
              <View style={[styles.centerBtn, !isFocused && styles.centerBtnInactive]}>
                <Icon size={26} color="#FFFFFF" strokeWidth={2.2} />
              </View>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Icon
              size={22}
              color={isFocused ? Colors.text : Colors.textMuted}
              strokeWidth={isFocused ? 2.5 : 1.8}
            />
            <Text style={[styles.label, isFocused && styles.labelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function MainLayout() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
      initialRouteName="scan"
    >
      <Tabs.Screen name="event" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="scan" />
      <Tabs.Screen name="history" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    paddingTop: 4,
    alignItems: 'flex-end',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 4,
  },
  centerBtn: {
    width: 64,
    height: 64,
    borderRadius: 100,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    shadowColor: Colors.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  centerBtnInactive: {
    opacity: 0.75,
    shadowOpacity: 0.2,
  },
  label: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 3,
  },
  labelActive: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.text,
  },
});
