import { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import catalogoService from '../../src/services/catalogoService';
import { useCarrito } from '../../src/context/carritoContext';

export default function ProductoDetalleScreen() {
  const params = useLocalSearchParams();
  const productoId = params.id as string;
  const { agregarProducto } = useCarrito();
  const [producto, setProducto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!productoId) return;
    const loadProducto = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await catalogoService.getProductoById(productoId);
        setProducto(response?.producto || response?.data || response);
      } catch (err) {
        setError('No se pudo cargar el producto.');
      } finally {
        setLoading(false);
      }
    };
    loadProducto();
  }, [productoId]);

  const handleAddToCart = async () => {
    if (!producto) return;
    await agregarProducto(producto, 1);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  if (error || !producto) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Producto no disponible.'}</Text>
      </View>
    );
  }

  const imageUrl = catalogoService.buildImageUrl(producto.imagen);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      <Text style={styles.title}>{producto.nombre || producto.titulo}</Text>
      <Text style={styles.price}>${Number(producto.precio || 0).toLocaleString('es-CO')}</Text>
      <Text style={styles.subtitle}>{producto.categoria?.nombre || producto.categoria || 'Categoría'}</Text>
      <Text style={styles.description}>{producto.descripcion || 'No hay descripción disponible.'}</Text>
      <Text style={styles.stock}>Stock disponible: {producto.stock ?? 0}</Text>
      <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
        <Text style={styles.buttonText}>Agregar al carrito</Text>
      </TouchableOpacity>
      <View style={styles.extraInfo}>
        <Text style={styles.extraTitle}>Visor 3D</Text>
        <Text style={styles.extraText}>Si deseas ver el modelo 3D del producto, visita la sección "Ver modelos 3D" en la pantalla principal.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f5ff',
  },
  content: {
    padding: 20,
  },
  image: {
    width: '100%',
    height: 320,
    borderRadius: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  price: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: '700',
    color: '#7c3aed',
  },
  subtitle: {
    marginTop: 8,
    color: '#6b7280',
    fontSize: 16,
  },
  description: {
    marginTop: 20,
    lineHeight: 24,
    color: '#374151',
    fontSize: 16,
  },
  stock: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#4b5563',
  },
  button: {
    marginTop: 24,
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f5ff',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 16,
    textAlign: 'center',
  },
  extraInfo: {
    marginTop: 28,
    padding: 18,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
  },
  extraTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  extraText: {
    color: '#4b5563',
    lineHeight: 22,
  },
});
