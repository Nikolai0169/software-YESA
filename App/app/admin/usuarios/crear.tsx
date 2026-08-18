import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Link, router, useLocalSearchParams } from 'expo-router';
import useAdminRole from '../../../src/hooks/useAdminRole';
import authService from '../../../src/services/authService';
import { updateUsuario } from '../../../src/services/adminService';
import { Colors } from '../../../constants/theme';

const validateUserForm = (formData: {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmPassword: string;
  telefono: string;
}, isEditing: boolean) => {
  const email = formData.email.trim();

  if (!isEditing && (!formData.nombre.trim() || !formData.apellido.trim() || !email)) {
    return 'Nombre, apellido y email son obligatorios al crear un usuario.';
  }
  if (!isEditing && !formData.password.trim()) {
    return 'La contraseña es obligatoria para crear un usuario.';
  }
  if (!isEditing && formData.password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (!isEditing && formData.password !== formData.confirmPassword) {
    return 'Las contraseñas no coinciden.';
  }
  if (email && !/^[^\s@]+@[^.\s@]+(?:\.[^.\s@]+)+$/.test(email)) {
    return 'El email ingresado no es válido.';
  }
  if (formData.telefono && !/^3\d{9}$/.test(formData.telefono)) {
    return 'El teléfono debe tener 10 dígitos iniciando con 3.';
  }
  return null;
};

export default function CrearUsuarioAdmin() {
  const { isChecking, isAuthorized } = useAdminRole();
  const params = useLocalSearchParams();
  const isEditing = params.mode === 'edit' && typeof params.id === 'string' && params.id.length > 0;
  const userId = typeof params.id === 'string' ? params.id : '';
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    direccion: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEditing) return;

    setFormData({
      nombre: typeof params.nombre === 'string' ? params.nombre : '',
      apellido: typeof params.apellido === 'string' ? params.apellido : '',
      email: typeof params.email === 'string' ? params.email : '',
      password: '',
      confirmPassword: '',
      telefono: typeof params.telefono === 'string' ? params.telefono : '',
      direccion: typeof params.direccion === 'string' ? params.direccion : '',
    });
  }, [isEditing, params.nombre, params.apellido, params.email, params.telefono, params.direccion]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const validationError = validateUserForm(formData, isEditing);
    if (validationError) {
      Alert.alert('Validación', validationError);
      return;
    }

    setLoading(true);
    try {
      if (isEditing && userId) {
        const payload = {
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          email: formData.email.trim(),
          telefono: formData.telefono.trim(),
          direccion: formData.direccion.trim(),
        };
        await updateUsuario(userId, payload);
        Alert.alert('Éxito', 'Usuario actualizado correctamente.', [
          { text: 'Aceptar', onPress: () => router.back() },
        ]);
      } else {
        const { confirmPassword, ...userData } = formData;
        await authService.register(userData);
        Alert.alert('Éxito', 'Usuario creado correctamente.', [
          { text: 'Aceptar', onPress: () => router.back() },
        ]);
      }
    } catch (error: unknown) {
      const err = error as Error;
      Alert.alert('Error', err.message || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el usuario.`);
    } finally {
      setLoading(false);
    }
  };

  if (isChecking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{isEditing ? 'Editar usuario' : 'Crear usuario'}</Text>
      <Text style={styles.subtitle}>
        {isEditing ? 'Actualiza los datos del usuario desde el panel de administración.' : 'Completa los datos para registrar un nuevo usuario desde el panel de administración.'}
      </Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>Nombre{!isEditing ? ' *' : ''}</Text>
        <TextInput
          style={styles.input}
          value={formData.nombre}
          onChangeText={(text) => handleChange('nombre', text)}
          placeholder="Nombre"
        />

        <Text style={styles.label}>Apellido{!isEditing ? ' *' : ''}</Text>
        <TextInput
          style={styles.input}
          value={formData.apellido}
          onChangeText={(text) => handleChange('apellido', text)}
          placeholder="Apellido"
        />

        <Text style={styles.label}>Email{!isEditing ? ' *' : ''}</Text>
        <TextInput
          style={styles.input}
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
          placeholder="tu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {!isEditing ? (
          <>
            <Text style={styles.label}>Contraseña *</Text>
            <TextInput
              style={styles.input}
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
            />

            <Text style={styles.label}>Confirmar contraseña *</Text>
            <TextInput
              style={styles.input}
              value={formData.confirmPassword}
              onChangeText={(text) => handleChange('confirmPassword', text)}
              placeholder="Repite la contraseña"
              secureTextEntry
            />
          </>
        ) : null}

        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={formData.telefono}
          onChangeText={(text) => handleChange('telefono', text)}
          placeholder="3001234567"
          keyboardType="phone-pad"
          maxLength={10}
        />

        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={styles.input}
          value={formData.direccion}
          onChangeText={(text) => handleChange('direccion', text)}
          placeholder="Calle 123 #45-67"
          multiline
          numberOfLines={3}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>{isEditing ? 'Guardar cambios' : 'Crear usuario'}</Text>}
        </TouchableOpacity>

        <Link href="/admin/usuarios" asChild>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Volver a usuarios</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: 18,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.icon,
    marginBottom: 18,
  },
  formCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: Colors.light.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.light.primary,
    fontWeight: '700',
    fontSize: 16,
  },
});
