import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Tienda' }} />
      <Tabs.Screen name="carrito" options={{ title: 'Carrito' }} />
      <Tabs.Screen name="explore" options={{ title: 'Cuenta' }} />
    </Tabs>
  );
}
