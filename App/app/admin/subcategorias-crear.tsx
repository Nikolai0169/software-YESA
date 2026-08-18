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
import { useRouter } from 'expo-router';
import useAdminRole from '../../src/hooks/useAdminRole';
import { createSubcategoria, getCategorias } from '../../src/services/adminService';
import { Colors } from '../../constants/theme';

export default function CrearSubcategoriaScreen() {
  const router = useRouter();
  const { isChecking, isAuthorized } = useAdminRole();
  const [categorias, setCategorias] = useState<{ id: number | string; nombre?: string; titulo?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [busquedaCategoria, setBusquedaCategoria] = useState('');
  const [showCategoriaList, setShowCategoriaList] = useState(false);

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const data = await getCategorias();
        setCategorias(Array.isArray(data) ? data : []);
      } catch (error: unknown) {
        const err = error as Error;
        console.error('Error cargando categorías:', err.message || error);
        Alert.alert('Error', 'No se pudieron cargar las categorías.');
      } finally {
        setLoading(false);
      }
    };

    cargarCategorias();
  }, []);

  const categoriasFiltradas = categorias.filter((categoria) => {
    const texto = busquedaCategoria.trim().toLowerCase();
    if (!texto) return true;
    return (categoria.nombre || categoria.titulo || '').toLowerCase().includes(texto);
  });

  const getCategoriaNombre = () => {
    if (!categoriaId) return 'Selecciona una categoría';
    const categoria = categorias.find((item) => String(item.id) === String(categoriaId));
    return categoria?.nombre || categoria?.titulo || 'Selecciona una categoría';
  };

  async function handleCreate() {
    if (!nombre.trim()) {
      Alert.alert('Validación', 'El nombre de la subcategoría es obligatorio.');
      return;
    }

    if (!categoriaId) {
      Alert.alert('Validación', 'Debes seleccionar una categoría.');
      return;
    }

    try {
      await createSubcategoria({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        categoriaId: Number(categoriaId),
      });
      Alert.alert('Éxito', 'Subcategoría creada correctamente.');
      router.back();
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error creando subcategoría:', err.message || error);
      Alert.alert('Error', 'No se pudo crear la subcategoría.');
    }
  }

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
      <Text style={styles.title}>Crear subcategoría</Text>
      <Text style={styles.subtitle}>Asocia una nueva subcategoría con una categoría existente.</Text>

      <View style={styles.formSection}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre de la subcategoría"
          value={nombre}
          onChangeText={setNombre}
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>Descripción</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descripción opcional"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          numberOfLines={4}
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.label}>Categoría</Text>
        <TouchableOpacity style={styles.selector} onPress={() => setShowCategoriaList((value) => !value)}>
          <Text style={styles.selectorText}>{getCategoriaNombre()}</Text>
        </TouchableOpacity>

        {showCategoriaList ? (
          <View style={styles.dropdownBox}>
            <TextInput
              style={styles.input}
              placeholder="Buscar categoría"
              value={busquedaCategoria}
              onChangeText={setBusquedaCategoria}
              placeholderTextColor="#9ca3af"
            />
            <View style={styles.dropdownList}>
              {loading && <ActivityIndicator size="small" color={Colors.light.primary} />}
              {!loading && categoriasFiltradas.length > 0 && categoriasFiltradas.map((categoria) => {
                  const isSelected = String(categoria.id) === String(categoriaId);
                  return (
                    <TouchableOpacity
                      key={String(categoria.id)}
                      style={[styles.option, isSelected && styles.optionSelected]}
                      onPress={() => {
                        setCategoriaId(String(categoria.id));
                        setShowCategoriaList(false);
                        setBusquedaCategoria('');
                      }}
                    >
                      <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                        {categoria.nombre || categoria.titulo || `Categoría ${categoria.id}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              {!loading && categoriasFiltradas.length === 0 && (
                <Text style={styles.emptyText}>No se encontraron categorías.</Text>
              )}
            </View>
          </View>
        ) : null}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleCreate}>
        <Text style={styles.submitButtonText}>Crear subcategoría</Text>
      </TouchableOpacity>
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
    backgroundColor: '#f8f7fb',
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
    marginBottom: 20,
  },
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#111827',
    marginBottom: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  selector: {
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  selectorText: {
    color: '#111827',
    fontWeight: '600',
  },
  dropdownBox: {
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 10,
    marginBottom: 8,
  },
  dropdownList: {
    maxHeight: 220,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginTop: 6,
  },
  optionSelected: {
    backgroundColor: '#7d2181',
  },
  optionText: {
    color: '#111827',
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#fff',
  },
  emptyText: {
    color: '#6b7280',
    paddingVertical: 8,
  },
  submitButton: {
    backgroundColor: '#7d2181',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
