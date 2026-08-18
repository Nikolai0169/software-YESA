import { Tabs } from 'expo-router';
import React from 'react';
import { HapticTab } from '../../components/haptic-tab';
import { IconSymbol } from '../../components/ui/icon-symbol';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

type TabIconProps = Readonly<{ color: string }>;

function StoreTabIcon({ color }: TabIconProps) {
  return <IconSymbol size={28} name="house.fill" color={color} />;
}

function CartTabIcon({ color }: TabIconProps) {
  return <IconSymbol size={28} name="cart.fill" color={color} />;
}

function AccountTabIcon({ color }: TabIconProps) {
  return <IconSymbol size={28} name="person.circle" color={color} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tienda',
          tabBarIcon: StoreTabIcon,
        }}
      />
      <Tabs.Screen
        name="carrito"
        options={{
          title: 'Carrito',
          tabBarIcon: CartTabIcon,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Cuenta',
          tabBarIcon: AccountTabIcon,
        }}
      />
    </Tabs>
  );
}
