import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Link } from 'expo-router';
import { useCarrito } from '../../src/context/carritoContext';
import catalogoService from '../../src/services/catalogoService';
import SmartImage from '../../src/components/SmartImage';
import { formatCurrency } from '../../src/utils/formatters';

export default function Carrito() {
  const { items, totalItems, total, loading, cambiarCantidad, eliminarItem, vaciarCarrito } = useCarrito();

  const renderItem = ({ item }: any) => {
    const cantidad = Number(item.cantidad || 0);
    const subtotal = Number(item.subtotal || item.precio * cantidad || 0);
    return (
      <View style={styles.item}>
        {item.imagen ? (
          <SmartImage
            sources={catalogoService.buildImageCandidates(item.imagen)}
            style={styles.thumb}
            placeholder={{ uri: 'https://via.placeholder.com/64' }}
          />
        ) : null}
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle}>{item.nombre}</Text>
          <Text style={styles.itemPrice}>{formatCurrency(Number(item.precio || 0))}</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => cambiarCantidad(item.id, Math.max(1, cantidad - 1))}>
              <Text style={styles.qtyBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{cantidad}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => cambiarCantidad(item.id, cantidad + 1)}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.removeBtn} onPress={() => eliminarItem(item.id)}>
              <Text style={styles.removeText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.itemSubtotal}>{formatCurrency(subtotal)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Carrito</Text>
      {loading ? (
        <Text style={styles.message}>Cargando carrito...</Text>
      ) : items && items.length > 0 ? (
        <>
          <FlatList
            data={items}
            keyExtractor={(i) => String(i.id)}
            renderItem={renderItem}
            style={styles.list}
          />
          <View style={styles.summaryRow}>
            <Text style={styles.summary}>Productos: {totalItems || 0}</Text>
            <Text style={styles.summary}>Total: {formatCurrency(Number(total || 0))}</Text>
          </View>
          <Link href="/checkout" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Ir a checkout</Text>
            </TouchableOpacity>
          </Link>
          <TouchableOpacity style={styles.clearButton} onPress={vaciarCarrito}>
            <Text style={styles.clearText}>Vaciar carrito</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.empty}>No hay productos en el carrito.</Text>
          <Link href="/" style={styles.link}>
            Volver a tienda
          </Link>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  message: {
    color: '#6b7280',
    fontSize: 16,
    marginBottom: 20,
  },
  summary: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#7d2181',
    paddingVertical: 14,
    borderRadius: 12,
    marginVertical: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  link: {
    color: '#0a84ff',
    fontSize: 16,
    textAlign: 'center',
  },
  list: {
    maxHeight: '60%'
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f3f4f6'
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },
  itemPrice: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  qtyBtnText: {
    fontSize: 18,
    color: '#7d2181',
    fontWeight: '700'
  },
  qtyText: {
    fontSize: 16,
    minWidth: 24,
    textAlign: 'center'
  },
  removeBtn: {
    marginLeft: 12,
  },
  removeText: {
    color: '#ef4444',
    fontWeight: '700'
  },
  itemSubtotal: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ef4444',
    marginTop: 8,
  },
  clearText: {
    color: '#ef4444',
    fontWeight: '700'
  },
  empty: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
  }
});
