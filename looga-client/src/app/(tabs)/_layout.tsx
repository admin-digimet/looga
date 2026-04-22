import { Tabs } from 'expo-router';
import { Compass, Heart, Home, Ticket, User } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

import { Colors } from '@/constants/colors';
import { Fonts } from '@/constants/typography';

const TAB_CONFIG: Record<string, { label: string; Icon: typeof Home }> = {
  index:     { label: 'Accueil',  Icon: Home    },
  explore:   { label: 'Explorer', Icon: Compass },
  tickets:   { label: 'Billets',  Icon: Ticket  },
  favorites: { label: 'Favoris',  Icon: Heart   },
  profile:   { label: 'Compte',   Icon: User    },
};

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { paddingBottom: insets.bottom || 8 }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const cfg = TAB_CONFIG[route.name] ?? { label: route.name, Icon: Home };
        const { Icon, label } = cfg;

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

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            {isFocused && <View style={styles.indicator} />}
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

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="tickets" />
      <Tabs.Screen name="favorites" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    paddingTop: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 4,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: -4,
    left: '25%',
    right: '25%',
    height: 2,
    backgroundColor: Colors.orange,
    borderRadius: 1,
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
