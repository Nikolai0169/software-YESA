import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import catalogoService from '../services/catalogoService';

type ProductCardProps = {
  producto: any;
  onPress: () => void;
  onAddToCart: () => void;
};

const formatPrice = (value: number) => {
  return value.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
};

export default function ProductCard({ producto, onPress, onAddToCart }: ProductCardProps) {
  const imageUrl = catalogoService.buildImageUrl(producto.imagen);

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.preview} onPress={onPress} activeOpacity={0.8}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      </TouchableOpacity>
      <View style={styles.body}>
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          <Text style={styles.name}>{producto.nombre || producto.titulo || 'Producto'}</Text>
          <Text style={styles.category}>{producto.categoria?.nombre || producto.categoria || 'Categoria'}</Text>
        </TouchableOpacity>
        <Text style={styles.price}>{formatPrice(Number(producto.precio || 0))}</Text>
        <View style={styles.footer}>
          <Text style={styles.stock}>{producto.stock ?? 0} en stock</Text>
          <TouchableOpacity style={styles.button} onPress={onAddToCart}>
            <Text style={styles.buttonText}>Agregar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: 180,
    backgroundColor: '#f3f4f6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  body: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  category: {
    color: '#6b7280',
    marginBottom: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7c3aed',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stock: {
    color: '#6b7280',
  },
  button: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
