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
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import {
  createProduct,
  getCategorias,
  getProducto,
  getSubcategorias,
  updateProduct,
} from '../../src/services/adminService';

export default function AdminProductoForm() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState<{ id: number | string; nombre?: string }[]>([]);
  const [subcategorias, setSubcategorias] = useState<{ id: number | string; nombre?: string }[]>([]);
  const [form, setForm] = useState<{
    nombre: string;
    descripcion: string;
    precio: string;
    stock: string;
    categoriaId: string;
    subcategoriaId: string;
    activo: boolean;
  }>({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoriaId: '',
    subcategoriaId: '',
    activo: true,
  });

  useEffect(() => {
    loadMeta();
  }, []);

  useEffect(() => {
    if (id) {
      loadProducto();
    }
  }, [id]);

  async function loadMeta() {
    setLoading(true);
    try {
      const [cats, subs] = await Promise.all([getCategorias(), getSubcategorias()]);
      setCategorias(Array.isArray(cats) ? (cats as any) : []);
      setSubcategorias(Array.isArray(subs) ? (subs as any) : []);
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error cargando datos del formulario:', err.message || error);
      Alert.alert('Error', 'No se pudieron cargar categorías o subcategorías.');
    } finally {
      setLoading(false);
    }
  }

  async function loadProducto() {
    setLoading(true);
    try {
      const data: any = await getProducto(id);
      if (data) {
        setForm({
          nombre: data.nombre || '',
          descripcion: data.descripcion || data.descripcionCorta || '',
          precio: String(data.precio || data.price || ''),
          stock: String(data.stock || data.cantidad || ''),
          categoriaId: String(data.categoriaId || data.categoria?.id || ''),
          subcategoriaId: String(data.subcategoriaId || data.subcategoria?.id || ''),
          activo: data.activo !== false,
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error cargando producto:', err.message || error);
      Alert.alert('Error', 'No se pudo cargar el producto.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!form.nombre.trim() || !form.precio.trim()) {
      Alert.alert('Validación', 'El nombre y el precio son obligatorios.');
      return;
    }

    setSaving(true);
    const payload: Record<string, any> = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio: Number(form.precio),
      stock: Number(form.stock) || 0,
      activo: form.activo,
    };
    if (form.categoriaId) payload.categoriaId = Number(form.categoriaId);
    if (form.subcategoriaId) payload.subcategoriaId = Number(form.subcategoriaId);

    try {
      if (id) {
        await updateProduct(id, payload);
      } else {
        await createProduct(payload);
      }
      Alert.alert('Éxito', `Producto ${id ? 'actualizado' : 'creado'} correctamente.`);
      router.replace('/admin/productos');
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error guardando producto:', err.message || error);
      Alert.alert('Error', 'No se pudo guardar el producto.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7d2181" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{id ? 'Editar producto' : 'Crear producto'}</Text>
      <Text style={styles.subtitle}>Formulario de producto con campos básicos de catálogo.</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={form.nombre}
        onChangeText={(value) => setForm((prev) => ({ ...prev, nombre: value }))}
        placeholderTextColor="#9ca3af"
      />
      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={form.descripcion}
        onChangeText={(value) => setForm((prev) => ({ ...prev, descripcion: value }))}
        placeholderTextColor="#9ca3af"
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Precio"
        value={form.precio}
        onChangeText={(value) => setForm((prev) => ({ ...prev, precio: value }))}
        placeholderTextColor="#9ca3af"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Stock"
        value={form.stock}
        onChangeText={(value) => setForm((prev) => ({ ...prev, stock: value }))}
        placeholderTextColor="#9ca3af"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="ID de categoría"
        value={form.categoriaId}
        onChangeText={(value) => setForm((prev) => ({ ...prev, categoriaId: value }))}
        placeholderTextColor="#9ca3af"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="ID de subcategoría"
        value={form.subcategoriaId}
        onChangeText={(value) => setForm((prev) => ({ ...prev, subcategoriaId: value }))}
        placeholderTextColor="#9ca3af"
        keyboardType="numeric"
      />
      <View style={styles.checkboxRow}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setForm((prev) => ({ ...prev, activo: !prev.activo }))}
        >
          <View style={[styles.checkboxBox, form.activo && styles.checkboxBoxActive]} />
          <Text style={styles.checkboxLabel}>Activo</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? 'Guardando...' : 'Guardar producto'}</Text>
      </TouchableOpacity>

      <Link href="/admin/productos" style={styles.link}>
        Volver a productos
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f7fb',
  },
  content: {
    padding: 18,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#4b5563',
    marginBottom: 18,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#111827',
  },
  checkboxRow: {
    marginVertical: 8,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#9ca3af',
    marginRight: 10,
  },
  checkboxBoxActive: {
    backgroundColor: '#7d2181',
    borderColor: '#7d2181',
  },
  checkboxLabel: {
    color: '#111827',
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: '#7d2181',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 12,
  },
  saveButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
  link: {
    marginTop: 18,
    color: '#7d2181',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});
