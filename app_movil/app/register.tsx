import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../src/context/authContext';
import { STORAGE_KEYS } from '../src/utils/constants';
import { storageGetItem } from '../src/utils/storage';

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
const isValidPhone = (phone: string) => /^3\d{9}$/.test(phone);

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
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

    if (!nombre || !apellido || !email || !password || !confirmPassword) {
      setError('Completa todos los campos obligatorios.');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError('Ingresa un email válido.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (telefono && !isValidPhone(telefono)) {
      setError('Teléfono inválido. Debe ser 10 dígitos y empezar con 3.');
      return;
    }

    setLoading(true);
    try {
      await register({ nombre, apellido, email: email.trim(), password, telefono, direccion });
      router.replace('/');
    } catch (err) {
      setError((err as Error)?.message || 'Error al crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Regístrate</Text>
      <Text style={styles.subtitle}>Crea tu cuenta YESA y comienza a comprar desde tu teléfono.</Text>
      {tieneCarrito ? (
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>Si registras tu cuenta ahora, el carrito local se sincronizará con tu perfil.</Text>
        </View>
      ) : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder="Apellido" value={apellido} onChangeText={setApellido} />
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
      <TextInput
        style={styles.input}
        placeholder="Confirmar contraseña"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono (opcional)"
        keyboardType="phone-pad"
        value={telefono}
        onChangeText={setTelefono}
        maxLength={10}
      />
      <TextInput style={styles.input} placeholder="Dirección (opcional)" value={direccion} onChangeText={setDireccion} />
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Crear cuenta</Text>}
      </TouchableOpacity>
      <View style={styles.footer}>
        <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
        <Link href="/login" style={styles.link}>
          <Text style={styles.linkText}>Inicia sesión</Text>
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
    backgroundColor: '#fbf5ff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
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
    backgroundColor: '#4f46e5',
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
    color: '#4f46e5',
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
