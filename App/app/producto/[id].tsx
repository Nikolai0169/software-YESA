import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import catalogoService from '../../src/services/catalogoService';
import SmartImage from '../../src/components/SmartImage';
import { useCarrito } from '../../src/context/carritoContext';
import { formatCurrency } from '../../src/utils/formatters';
import ResenaForm from '../../src/components/ResenaForm';

const renderRatingStars = (rating: number) => {
  const filledStars = Math.round(rating);
  return '★'.repeat(Math.max(0, Math.min(5, filledStars))) + '☆'.repeat(Math.max(0, 5 - filledStars));
};

export default function ProductoDetalleScreen() {
  const params = useLocalSearchParams();
  const productoId = params.id as string;
  const { agregarProducto } = useCarrito();
  const [producto, setProducto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resenas, setResenas] = useState<any[]>([]);
  const [resenasLoading, setResenasLoading] = useState(false);
  const [resenasError, setResenasError] = useState('');

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

  useEffect(() => {
    if (!productoId) return;
    const loadResenas = async () => {
      setResenasLoading(true);
      setResenasError('');
      try {
        const response = await catalogoService.getResenasPorProducto(productoId);
        setResenas(Array.isArray(response) ? response : []);
      } catch (err) {
        console.error('Error cargando reseñas:', err);
        setResenasError('No se pudieron cargar las reseñas.');
      } finally {
        setResenasLoading(false);
      }
    };
    loadResenas();
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

  const imageCandidates = catalogoService.buildImageCandidates(producto.imagen);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SmartImage sources={imageCandidates} style={styles.image} resizeMode="cover" placeholder={{ uri: 'https://via.placeholder.com/320x240' }} />
      <Text style={styles.title}>{producto.nombre || producto.titulo}</Text>
      <Text style={styles.price}>{formatCurrency(Number(producto.precio || 0))}</Text>
      <Text style={styles.subtitle}>{producto.categoria?.nombre || producto.categoria || 'Categoría'}</Text>
      <Text style={styles.description}>{producto.descripcion || 'No hay descripción disponible.'}</Text>
      <Text style={styles.stock}>Stock disponible: {producto.stock ?? 0}</Text>
      <TouchableOpacity style={styles.button} onPress={handleAddToCart}>
        <Text style={styles.buttonText}>Agregar al carrito</Text>
      </TouchableOpacity>

      <View style={styles.reviewSection}>
        <Text style={styles.reviewTitle}>Reseñas de clientes</Text>
        {resenasLoading ? (
          <ActivityIndicator size="small" color="#7c3aed" style={styles.reviewLoader} />
        ) : resenasError ? (
          <Text style={styles.reviewError}>{resenasError}</Text>
        ) : resenas.length === 0 ? (
          <Text style={styles.reviewEmpty}>Aún no hay reseñas para este producto.</Text>
        ) : (
          resenas.map((resena) => (
            <View key={resena.id || `${resena.usuarioId}-${resena.createdAt}`} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewAuthor}>{resena.nombre || 'Cliente satisfecho'}</Text>
                <Text style={styles.reviewDate}>{new Date(resena.createdAt).toLocaleDateString('es-CO')}</Text>
              </View>
              <Text style={styles.reviewStars}>{renderRatingStars(Number(resena.calificacion || 0))}</Text>
              <Text style={styles.reviewComment}>{resena.comentario}</Text>
            </View>
          ))
        )}
        <ResenaForm
          productoId={productoId}
          onResenaCreada={() => {
            catalogoService.getResenasPorProducto(productoId).then((data) => {
              setResenas(Array.isArray(data) ? data : []);
            });
          }}
        />
        
      </View>
    

      <View style={styles.extraInfo}>
        <Text style={styles.extraTitle}>Visor 3D</Text>
        <Text style={styles.extraText}>Si deseas ver el modelo 3D del producto, visita la sección "Ver modelos 3D" en la pantalla principal.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f5ff' },
  content: { padding: 20 },
  image: { width: '100%', height: 320, borderRadius: 24, marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  price: { marginTop: 12, fontSize: 24, fontWeight: '700', color: '#7c3aed' },
  subtitle: { marginTop: 8, color: '#6b7280', fontSize: 16 },
  description: { marginTop: 20, lineHeight: 24, color: '#374151', fontSize: 16 },
  stock: { marginTop: 16, fontSize: 15, fontWeight: '600', color: '#4b5563' },
  button: { marginTop: 24, backgroundColor: '#7c3aed', borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8f5ff' },
  errorText: { color: '#b91c1c', fontSize: 16, textAlign: 'center' },
  reviewSection: { marginTop: 28 },
  reviewTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  reviewLoader: { marginTop: 8 },
  reviewError: { color: '#b91c1c', marginTop: 8 },
  reviewEmpty: { color: '#6b7280', marginTop: 8, fontSize: 15 },
  reviewCard: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reviewAuthor: { fontSize: 16, fontWeight: '700' },
  reviewDate: { fontSize: 12, color: '#6b7280' },
  reviewStars: { fontSize: 14, color: '#f59e0b', marginBottom: 8 },
  reviewComment: { fontSize: 15, lineHeight: 22, color: '#374151' },
  extraInfo: { marginTop: 28, padding: 18, borderRadius: 20, backgroundColor: '#eef2ff' },
  extraTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  extraText: { color: '#4b5563', lineHeight: 22 },
});