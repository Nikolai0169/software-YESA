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
  Modal,
  FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import useAdminRole from '../../src/hooks/useAdminRole';
import { Colors } from '../../constants/theme';
import {
  createProduct,
  getCategorias,
  getProducto,
  getSubcategorias,
  updateProduct,
} from '../../src/services/adminService';

export default function AdminProductoForm() {
  const { isChecking, isAuthorized } = useAdminRole();
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState<{ id: number | string; nombre?: string }[]>([]);
  const [subcategorias, setSubcategorias] = useState<{ id: number | string; nombre?: string; categoriaId?: number | string }[]>([]);
  const [showCategoriaModal, setShowCategoriaModal] = useState(false);
  const [showSubcategoriaModal, setShowSubcategoriaModal] = useState(false);
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

  // Obtener nombre de categoría seleccionada
  const getCategoriaNombre = () => {
    if (!form.categoriaId) return 'Selecciona una categoría';
    const cat = categorias.find((c) => String(c.id) === form.categoriaId);
    return cat?.nombre || `Categoría ${form.categoriaId}`;
  };

  // Obtener nombre de subcategoría seleccionada
  const getSubcategoriaNombre = () => {
    if (!form.subcategoriaId) return 'Selecciona una subcategoría';
    const sub = subcategorias.find((s) => String(s.id) === form.subcategoriaId);
    return sub?.nombre || `Subcategoría ${form.subcategoriaId}`;
  };

  // Obtener subcategorías filtradas por categoría seleccionada
  const subcategoriasFiltradas = form.categoriaId
    ? subcategorias.filter((s) => String(s.categoriaId) === form.categoriaId)
    : [];

  if (isChecking || loading) {
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

      {/* Selector de Categoría */}
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShowCategoriaModal(true)}
      >
        <Text style={styles.pickerButtonText}>{getCategoriaNombre()}</Text>
        <Text style={styles.pickerArrow}>▼</Text>
      </TouchableOpacity>

      {/* Selector de Subcategoría */}
      <TouchableOpacity
        style={[styles.pickerButton, !form.categoriaId && styles.pickerButtonDisabled]}
        onPress={() => form.categoriaId && setShowSubcategoriaModal(true)}
        disabled={!form.categoriaId}
      >
        <Text style={[styles.pickerButtonText, !form.categoriaId && styles.pickerButtonTextDisabled]}>
          {getSubcategoriaNombre()}
        </Text>
        <Text style={[styles.pickerArrow, !form.categoriaId && styles.pickerArrowDisabled]}>▼</Text>
      </TouchableOpacity>

      {!form.categoriaId && (
        <Text style={styles.helperText}>Selecciona una categoría primero</Text>
      )}

      {/* Modal de Categorías */}
      <Modal visible={showCategoriaModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona una categoría</Text>
              <TouchableOpacity onPress={() => setShowCategoriaModal(false)}>
                <Text style={styles.modalCloseBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={categorias}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    String(item.id) === form.categoriaId && styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    setForm((prev) => ({ ...prev, categoriaId: String(item.id), subcategoriaId: '' }));
                    setShowCategoriaModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      String(item.id) === form.categoriaId && styles.modalItemTextSelected,
                    ]}
                  >
                    {item.nombre || `Categoría ${item.id}`}
                  </Text>
                  {String(item.id) === form.categoriaId && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modal de Subcategorías */}
      <Modal visible={showSubcategoriaModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona una subcategoría</Text>
              <TouchableOpacity onPress={() => setShowSubcategoriaModal(false)}>
                <Text style={styles.modalCloseBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            {subcategoriasFiltradas.length > 0 ? (
              <FlatList
                data={subcategoriasFiltradas}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      String(item.id) === form.subcategoriaId && styles.modalItemSelected,
                    ]}
                    onPress={() => {
                      setForm((prev) => ({ ...prev, subcategoriaId: String(item.id) }));
                      setShowSubcategoriaModal(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        String(item.id) === form.subcategoriaId && styles.modalItemTextSelected,
                      ]}
                    >
                      {item.nombre || `Subcategoría ${item.id}`}
                    </Text>
                    {String(item.id) === form.subcategoriaId && (
                      <Text style={styles.checkMark}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            ) : (
              <Text style={styles.emptyText}>No hay subcategorías para esta categoría</Text>
            )}
          </View>
        </View>
      </Modal>

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
    color: Colors.light.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.light.icon,
    marginBottom: 18,
  },
  input: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    color: Colors.light.text,
  },
  pickerButton: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  pickerButtonText: {
    color: '#111827',
    fontSize: 16,
    flex: 1,
  },
  pickerButtonTextDisabled: {
    color: '#9ca3af',
  },
  pickerArrow: {
    color: Colors.light.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  pickerArrowDisabled: {
    color: '#d1d5db',
  },
  helperText: {
    color: Colors.light.danger,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  modalCloseBtn: {
    fontSize: 24,
    color: Colors.light.icon,
  },
  modalItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.surfaceSoft,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemSelected: {
    backgroundColor: Colors.light.surfaceSoft,
  },
  modalItemText: {
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
  modalItemTextSelected: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
  checkMark: {
    fontSize: 18,
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    paddingVertical: 20,
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
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  checkboxLabel: {
    color: '#111827',
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 12,
  },
  saveButtonText: {
    color: Colors.light.surface,
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
  link: {
    marginTop: 18,
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});