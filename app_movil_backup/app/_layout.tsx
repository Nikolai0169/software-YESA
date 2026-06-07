import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '../src/context/authContext';
import { CarritoProvider } from '../src/context/carritoContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
          <Stack.Screen name="mis-pedidos" options={{ title: 'Mis pedidos' }} />
          <Stack.Screen name="pedidos/[id]" options={{ title: 'Detalle pedido' }} />
          <Stack.Screen name="pedido-confirmado" options={{ title: 'Pedido confirmado' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="admin/dashboard" options={{ title: 'Dashboard Admin' }} />
          <Stack.Screen name="admin/categorias" options={{ title: 'Categorías' }} />
          <Stack.Screen name="admin/subcategorias" options={{ title: 'Subcategorías' }} />
          <Stack.Screen name="admin/productos" options={{ title: 'Productos' }} />
          <Stack.Screen name="admin/producto-form" options={{ title: 'Crear/Editar Producto' }} />
          <Stack.Screen name="admin/usuarios" options={{ title: 'Usuarios' }} />
          <Stack.Screen name="admin/pedidos" options={{ title: 'Pedidos' }} />
          <Stack.Screen name="admin/pedidos/[id]" options={{ title: 'Detalle Pedido' }} />
        </Stack>
        <StatusBar style="auto" />
      </CarritoProvider>
    </AuthProvider>
  );
}
