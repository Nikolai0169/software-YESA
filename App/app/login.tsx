import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../src/context/authContext';
import { STORAGE_KEYS } from '../src/utils/constants';
import { storageGetItem } from '../src/utils/storage';

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tieneCarrito, setTieneCarrito] = useState(false);

  useEffect(() => {
    const checkCart = async () => {
      const raw = await storageGetItem(STORAGE_KEYS.carritoLocal);
      const cartItems = raw ? JSON.parse(raw) : [];
      setTieneCarrito(Array.isArray(cartItems) && cartItems.length > 0);
    };
    checkCart();
  }, []);

  const handleSubmit = async () => {
    setError('');
    if (!isValidEmail(email.trim())) {
      setError('Ingresa un email válido.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      const payload = await login(email.trim(), password);
      const user = payload?.usuario || payload?.user || payload || null;
      const role = user?.rol || user?.role || 'cliente';
      if (role === 'administrador' || role === 'auxiliar') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/');
      }
    } catch (err) {
      setError((err as Error)?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>
      <Text style={styles.subtitle}>Accede a tu cuenta YESA para comprar desde el móvil.</Text>
      {tieneCarrito ? (
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>Tu carrito local se sincronizará al iniciar sesión.</Text>
        </View>
      ) : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Iniciar sesión</Text>
        )}
      </TouchableOpacity>
      <View style={styles.footer}>
        <Text style={styles.footerText}>¿No tienes cuenta?</Text>
        <Link href="/register" style={styles.link}>
          <Text style={styles.linkText}>Regístrate</Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#f9f5ff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#7d2181',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#6b7280',
    marginBottom: 8,
  },
  link: {
    paddingVertical: 8,
  },
  linkText: {
    color: '#7d2181',
    fontWeight: '700',
  },
  errorText: {
    color: '#dc2626',
    marginBottom: 12,
  },
  noticeBox: {
    marginBottom: 16,
    backgroundColor: '#eef2ff',
    padding: 12,
    borderRadius: 14,
  },
  noticeText: {
    color: '#1d4ed8',
  },
});
