import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

if (Platform.OS !== 'web') {
  require('react-native-reanimated');
}

import { useColorScheme } from '../hooks/use-color-scheme';
import { AuthProvider } from '../src/context/authContext';
import { CarritoProvider } from '../src/context/carritoContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <CarritoProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
            <Stack.Screen name="mis-pedidos" options={{ title: 'Mis pedidos' }} />
            <Stack.Screen name="pedidos/[id]" options={{ title: 'Detalle pedido' }} />
            <Stack.Screen name="pedido-confirmado" options={{ title: 'Pedido confirmado' }} />
            <Stack.Screen name="login" options={{ title: 'Iniciar sesión' }} />
            <Stack.Screen name="register" options={{ title: 'Crear cuenta' }} />
              <Stack.Screen name="producto/[id]" options={{ title: 'Detalle de producto' }} />
            <Stack.Screen name="Faq" options={{ title: 'Preguntas Frecuentes' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modelos 3D' }} />
            <Stack.Screen name="admin/dashboard" options={{ title: 'Dashboard Admin' }} />
            <Stack.Screen name="admin/cotizaciones" options={{ title: 'Cotizaciones' }} />
            <Stack.Screen name="admin/categorias" options={{ title: 'Categorías' }} />
            <Stack.Screen name="admin/subcategorias" options={{ title: 'Subcategorías' }} />
            <Stack.Screen name="admin/productos" options={{ title: 'Productos' }} />
            <Stack.Screen name="admin/producto-form" options={{ title: 'Crear/Editar Producto' }} />
            <Stack.Screen name="admin/usuarios" options={{ title: 'Usuarios' }} />
            <Stack.Screen name="admin/usuarios/crear" options={{ title: 'Crear usuario' }} />
            <Stack.Screen name="admin/pedidos" options={{ title: 'Pedidos' }} />
            <Stack.Screen name="admin/pedidos/[id]" options={{ title: 'Detalle Pedido' }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </CarritoProvider>
    </AuthProvider>
  );
}
