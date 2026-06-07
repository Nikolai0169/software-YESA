import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../src/context/authContext';

const isValidEmail = (email: string) => /\S+@\S+\.\S+/.test(email);
const isValidPhone = (phone: string) => /^3\d{9}$/.test(phone);

export default function Explore() {
  const { user, isAuthenticated, login, register, logout, isLoadingSession } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    setError('');
    setMessage('');
  }, [isRegisterMode]);

  const resetForm = () => {
    setNombre('');
    setApellido('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setTelefono('');
    setDireccion('');
  };

  const handleSubmit = async () => {
    setError('');
    setMessage('');

    if (!email.trim() || !password) {
      setError('Email y contraseña son obligatorios.');
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError('Ingresa un email válido.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (isRegisterMode) {
      if (!nombre || !apellido || !confirmPassword) {
        setError('Completa todos los campos obligatorios para registrarte.');
        return;
      }

      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }

      if (telefono && !isValidPhone(telefono)) {
        setError('Teléfono inválido. Debe tener 10 dígitos y comenzar con 3.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegisterMode) {
        await register({
          nombre,
          apellido,
          email: email.trim(),
          password,
          telefono: telefono || undefined,
          direccion: direccion || undefined,
        });
        setMessage('Registro completado. Ahora puedes iniciar sesión.');
        setIsRegisterMode(false);
        resetForm();
      } else {
        await login(email.trim(), password);
        setMessage('Inicio de sesión exitoso.');
        resetForm();
      }
    } catch (err) {
      setError((err as Error)?.message || 'No fue posible completar la acción.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    resetForm();
    setIsRegisterMode(false);
    setError('');
    setMessage('Has cerrado sesión.');
  };

  if (isLoadingSession) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7d2181" />
        <Text style={styles.subtitle}>Verificando sesión...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>{isRegisterMode ? 'Crear cuenta' : 'Iniciar sesión'}</Text>
          <Text style={styles.subtitle}>
            {isRegisterMode
              ? 'Regístrate para comprar con tu cuenta YESA y sincronizar tu carrito.'
              : 'Inicia sesión para acceder a tus pedidos, carrito y administración.'}
          </Text>

          {message ? <Text style={styles.noticeText}>{message}</Text> : null}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {isRegisterMode && (
            <>
              <TextInput style={styles.input} placeholder="Nombre" value={nombre} onChangeText={setNombre} />
              <TextInput style={styles.input} placeholder="Apellido" value={apellido} onChangeText={setApellido} />
            </>
          )}

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
          {isRegisterMode && (
            <>
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
              <TextInput
                style={styles.input}
                placeholder="Dirección (opcional)"
                value={direccion}
                onChangeText={setDireccion}
              />
            </>
          )}

          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isRegisterMode ? 'Registrarse' : 'Ingresar'}</Text>}
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{isRegisterMode ? '¿Ya tienes cuenta?' : '¿Aún no estás registrado?'}</Text>
            <TouchableOpacity onPress={() => setIsRegisterMode(!isRegisterMode)}>
              <Text style={styles.footerLink}>{isRegisterMode ? 'Iniciar sesión' : 'Crear cuenta'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Mi perfil</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Nombre completo</Text>
        <Text style={styles.value}>{user?.nombre || `${user?.name || ''} ${user?.apellido || ''}`.trim()}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
        <Text style={styles.label}>Rol</Text>
        <Text style={styles.value}>{user?.rol || user?.role || 'Cliente'}</Text>
        {user?.telefono ? (
          <>
            <Text style={styles.label}>Teléfono</Text>
            <Text style={styles.value}>{user.telefono}</Text>
          </>
        ) : null}
        {user?.direccion ? (
          <>
            <Text style={styles.label}>Dirección</Text>
            <Text style={styles.value}>{user.direccion}</Text>
          </>
        ) : null}
      </View>

      <TouchableOpacity onPress={() => {}} style={styles.sectionButton} disabled>
        <Text style={styles.sectionButtonText}>Edición de perfil no disponible en móvil</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => {}}>
        <Text style={styles.buttonText}>Mis pedidos</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonSecondary} onPress={() => {}}>
        <Text style={styles.buttonSecondaryText}>Abrir panel admin</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f5ff',
  },
  content: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 20,
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
  buttonSecondary: {
    borderWidth: 1,
    borderColor: '#7d2181',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonSecondaryText: {
    color: '#7d2181',
    fontSize: 16,
    fontWeight: '700',
  },
  footerRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  footerText: {
    color: '#6b7280',
  },
  footerLink: {
    color: '#7d2181',
    fontWeight: '700',
  },
  noticeText: {
    marginBottom: 12,
    color: '#065f46',
  },
  errorText: {
    marginBottom: 12,
    color: '#b91c1c',
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 14,
  },
  value: {
    fontSize: 18,
    color: '#111827',
    marginTop: 6,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logoutButton: {
    marginTop: 24,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#fee2e2',
  },
  logoutText: {
    color: '#b91c1c',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionButton: {
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
  },
  sectionButtonText: {
    color: '#2563eb',
    fontWeight: '700',
  },
});
