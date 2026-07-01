import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Dimensions,
  Modal,
  Image,
  Pressable,
} from 'react-native';
import { formatCurrency } from '../../src/utils/formatters';
import { Link, useRouter } from 'expo-router';
import { useCarrito } from '../../src/context/carritoContext';
import catalogoService from '../../src/services/catalogoService';
import ProductCard from '../../src/components/ProductCard';

const SCREEN_WIDTH = Dimensions.get('window').width;
const ITEMS_PER_PAGE = 12;

const FEATURES = [
  { icon: '📦', title: 'Envío rápido', subtitle: 'Recibe tu pedido cuanto antes' },
  { icon: '🔒', title: 'Compra segura', subtitle: 'Pago protegido y confiable' },
  { icon: '📞', title: 'Soporte 24/7', subtitle: 'Atención disponible siempre' },
];

export default function Index() {
  const router = useRouter();
  const { agregarProducto, totalItems } = useCarrito();
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [subcategorias, setSubcategorias] = useState<any[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [selectedSubcategoria, setSelectedSubcategoria] = useState<string>('');
  const [buscar, setBuscar] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [showSubcategorias, setShowSubcategorias] = useState(false);

  useEffect(() => {
    loadCatalogo();
  }, []);

  useEffect(() => {
    setPaginaActual(1);
  }, [buscar, selectedCategoria, selectedSubcategoria]);

  useEffect(() => {
    if (!selectedCategoria) {
      setSubcategorias([]);
      setSelectedSubcategoria('');
      setShowSubcategorias(false);
      return;
    }

    const cargarSubcategorias = async () => {
      try {
        const listaSubcategorias = await catalogoService.getSubcategorias(selectedCategoria);
        setSubcategorias(Array.isArray(listaSubcategorias) ? listaSubcategorias : []);
        setSelectedSubcategoria('');
        setShowSubcategorias(true);
      } catch (err) {
        console.error('cargarSubcategorias error', err);
        setSubcategorias([]);
        setShowSubcategorias(true);
      }
    };

    cargarSubcategorias();
  }, [selectedCategoria]);

  const loadCatalogo = async () => {
    setLoading(true);
    setError('');
    try {
      const [listaProductos, listaCategorias] = await Promise.all([
        catalogoService.getProductos({ limite: 1000 }),
        catalogoService.getCategorias(),
      ]);
      // Filtrar defensivamente productos inactivos en el cliente
      const productosActivos = Array.isArray(listaProductos)
        ? listaProductos.filter((p) => (p.activo !== false) && (Number(p.stock || 0) > 0))
        : [];
      setProductos(productosActivos);
      setCategorias(Array.isArray(listaCategorias) ? listaCategorias : []);
    } catch (err) {
      // Loguear error detallado para diagnóstico
      console.error('loadCatalogo error', err);
      const backendMsg = err?.responseData?.message || err?.message || 'Error desconocido';
      setError(`No se pudo cargar el catálogo: ${backendMsg}`);
      setProductos([]);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = useMemo(() => {
    const termino = buscar.trim().toLowerCase();
    return productos.filter((producto) => {
      const nombre = String(producto.nombre || producto.titulo || producto.descripcion || '').toLowerCase();
      const descripcion = String(producto.descripcion || '').toLowerCase();
      const coincideTexto = termino === '' || nombre.includes(termino) || descripcion.includes(termino);
      const categoriaId = String(producto.categoriaId || producto.categoria?.id || producto.categoria?.idCategoria || '');
      const subcategoriaId = String(producto.subcategoriaId || producto.subcategoria?.id || producto.subcategoria?.idSubcategoria || '');
      const coincideCategoria = selectedCategoria === '' || selectedCategoria === 'all' || categoriaId === selectedCategoria;
      const coincideSubcategoria = selectedSubcategoria === '' || selectedSubcategoria === 'all' || subcategoriaId === selectedSubcategoria;
      return coincideTexto && coincideCategoria && coincideSubcategoria;
    });
  }, [buscar, productos, selectedCategoria, selectedSubcategoria]);

  const productosVisibles = useMemo(() => {
    const start = (paginaActual - 1) * ITEMS_PER_PAGE;
    return productosFiltrados.slice(start, start + ITEMS_PER_PAGE);
  }, [paginaActual, productosFiltrados]);

  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / ITEMS_PER_PAGE));

  const handlePressProducto = (producto: any) => {
    setSelectedProduct(producto);
  };

  const handleOpenProducto = (id: string) => {
    router.push({ pathname: '/producto/[id]', params: { id } });
  };

  const renderCategoria = (categoria: any) => {
    const categoryId = String(categoria.id || categoria._id || categoria.idCategoria || categoria._idCategoria || '');
    const isSelected = selectedCategoria === categoryId;

    return (
      <TouchableOpacity
        key={categoryId || `cat-${Math.random()}`}
        style={[styles.categoryButton, isSelected && styles.categoryButtonSelected]}
        onPress={() => setSelectedCategoria(isSelected ? '' : categoryId)}
      >
        <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>{categoria.nombre || categoria.nombreCategoria || 'Categoría'}</Text>
      </TouchableOpacity>
    );
  };

  const renderSubcategoria = (subcategoria: any) => {
    const subcategoryId = String(subcategoria.id || subcategoria._id || subcategoria.idSubcategoria || '');
    const isSelected = selectedSubcategoria === subcategoryId;

    return (
      <TouchableOpacity
        key={subcategoryId || `sub-${Math.random()}`}
        style={[styles.subcategoryButton, isSelected && styles.subcategoryButtonSelected]}
        onPress={() => {
          setSelectedSubcategoria(isSelected ? '' : subcategoryId);
          setShowSubcategorias(false);
        }}
      >
        <Text style={[styles.subcategoryText, isSelected && styles.subcategoryTextSelected]}>{subcategoria.nombre || 'Subcategoría'}</Text>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View>
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>TIENDA OFICIAL</Text>
        <Text style={styles.heroTitle}>Bienvenido a YESA</Text>
        <Text style={styles.heroSubtitle}>Explora productos reales, encuentra ofertas y compra con seguridad desde tu móvil.</Text>
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{productos.length}</Text>
            <Text style={styles.heroStatLabel}>Productos</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{categorias.length}</Text>
            <Text style={styles.heroStatLabel}>Categorías</Text>
          </View>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatValue}>{totalItems}</Text>
            <Text style={styles.heroStatLabel}>Items carrito</Text>
          </View>
        </View>
      </View>

      <View style={styles.featuresRow}>
        {FEATURES.map((feature) => (
          <View key={feature.title} style={styles.featureCard}>
            <Text style={styles.featureIcon}>{feature.icon}</Text>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureSubtitle}>{feature.subtitle}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Busca tu producto</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView horizontal style={styles.quickActions} contentContainerStyle={styles.quickActionList} showsHorizontalScrollIndicator={false}>
        <Link href="/modal" asChild>
          <TouchableOpacity style={styles.quickButton}>
            <Text style={styles.quickButtonText}>Modelos 3D</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/carrito" asChild>
          <TouchableOpacity style={styles.quickButton}>
            <Text style={styles.quickButtonText}>Carrito</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/mis-pedidos" asChild>
          <TouchableOpacity style={styles.quickButton}>
            <Text style={styles.quickButtonText}>Pedidos</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/faq" asChild>
          <TouchableOpacity style={styles.quickButton}> 
            <Text style={styles.quickButtonText}>FAQ</Text>
          </TouchableOpacity>
        </Link>
      </ScrollView>

      <View style={styles.searchRow}>
        <TextInput
          placeholder="Buscar producto, categoría o palabra clave"
          style={styles.searchInput}
          value={buscar}
          onChangeText={setBuscar}
          returnKeyType="search"
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={styles.categoriesContainer}>
        <TouchableOpacity
          style={[styles.categoryButton, !selectedCategoria && styles.categoryButtonSelected]}
          onPress={() => setSelectedCategoria('')}
        >
          <Text style={[styles.categoryText, !selectedCategoria && styles.categoryTextSelected]}>Todas</Text>
        </TouchableOpacity>
        {categorias.map(renderCategoria)}
      </ScrollView>

      {selectedCategoria ? (
        <View style={styles.subcategoryFilterBox}>
          <TouchableOpacity
            style={styles.subcategoryToggle}
            onPress={() => setShowSubcategorias((value) => !value)}
          >
            <Text style={styles.subcategoryToggleText}>Subcategorías</Text>
            <Text style={styles.subcategoryToggleText}>{showSubcategorias ? '▾' : '▸'}</Text>
          </TouchableOpacity>
          {showSubcategorias ? (
            <View style={styles.subcategoryList}>
              <TouchableOpacity
                style={[styles.subcategoryButton, !selectedSubcategoria && styles.subcategoryButtonSelected]}
                onPress={() => setSelectedSubcategoria('')}
              >
                <Text style={[styles.subcategoryText, !selectedSubcategoria && styles.subcategoryTextSelected]}>Todas</Text>
              </TouchableOpacity>
              {subcategorias.length > 0 ? subcategorias.map(renderSubcategoria) : (
                <Text style={styles.subcategoryEmptyText}>No hay subcategorías activas para esta categoría.</Text>
              )}
            </View>
          ) : null}
        </View>
      ) : null}

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#7c3aed" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={productosVisibles}
          keyExtractor={(item) => String(item.id || item._id || item._idProducto || item.idProducto)}
          renderItem={({ item }) => (
            <ProductCard
              producto={item}
              onPress={() => handlePressProducto(item)}
              onAddToCart={() => agregarProducto(item, 1)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={() => (
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No hay productos que coincidan.</Text>
            </View>
          )}
        />
      )}

      <View style={styles.paginationRow}>
        <TouchableOpacity
          style={[styles.pageButton, paginaActual === 1 && styles.pageButtonDisabled]}
          disabled={paginaActual === 1}
          onPress={() => setPaginaActual(Math.max(1, paginaActual - 1))}
        >
          <Text style={styles.pageButtonText}>Anterior</Text>
        </TouchableOpacity>
        <Text style={styles.paginationInfo}>{paginaActual} / {totalPaginas}</Text>
        <TouchableOpacity
          style={[styles.pageButton, paginaActual === totalPaginas && styles.pageButtonDisabled]}
          disabled={paginaActual === totalPaginas}
          onPress={() => setPaginaActual(Math.min(totalPaginas, paginaActual + 1))}
        >
          <Text style={styles.pageButtonText}>Siguiente</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={Boolean(selectedProduct)} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>{selectedProduct?.nombre || selectedProduct?.titulo || 'Detalle'}</Text>
              {selectedProduct?.imagen ? (
                <Image source={{ uri: catalogoService.buildImageUrl(selectedProduct.imagen) }} style={styles.modalImage} />
              ) : null}
              <Text style={styles.modalDescription}>{selectedProduct?.descripcion || 'Sin descripción disponible.'}</Text>
              <Text style={styles.modalPrice}>{formatCurrency(Number(selectedProduct?.precio || selectedProduct?.precioVenta || 0))}</Text>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={() => handleOpenProducto(String(selectedProduct?.id || selectedProduct?._id || selectedProduct?.idProducto || selectedProduct?._idProducto))}>
                <Text style={styles.modalButtonText}>Ver detalles</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedProduct(null)}>
                <Text style={styles.modalCloseText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f5ff',
    paddingTop: 24,
    paddingBottom: 8,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 16,
    flexShrink: 0,
  },
  quickActionList: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 20,
  },
  quickButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginRight: 10,
  },
  quickButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  searchRow: {
    marginHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  categoriesScroll: {
    maxHeight: 68,
    marginBottom: 10,
    flexShrink: 0,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingVertical: 6,
  },
  subcategoryFilterBox: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  subcategoryToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  subcategoryToggleText: {
    color: '#374151',
    fontWeight: '700',
  },
  subcategoryList: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  subcategoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f5f3ff',
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  subcategoryButtonSelected: {
    backgroundColor: '#7c3aed',
  },
  subcategoryText: {
    color: '#4c1d95',
    fontWeight: '600',
  },
  subcategoryTextSelected: {
    color: '#fff',
  },
  subcategoryEmptyText: {
    color: '#6b7280',
    paddingHorizontal: 4,
    paddingTop: 4,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#eef2ff',
    borderRadius: 999,
    marginRight: 10,
  },
  categoryButtonSelected: {
    backgroundColor: '#7c3aed',
  },
  categoryText: {
    color: '#374151',
    fontWeight: '600',
  },
  categoryTextSelected: {
    color: '#fff',
  },
  heroCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#eef2ff',
    borderRadius: 24,
    padding: 24,
  },
  heroLabel: {
    color: '#7c3aed',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 10,
    color: '#111827',
  },
  heroSubtitle: {
    color: '#374151',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroStat: {
    flex: 1,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#fff',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  heroStatLabel: {
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  sectionTitle: {
    marginHorizontal: 20,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    gap: 12,
  },
  pageButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#7c3aed',
  },
  pageButtonDisabled: {
    backgroundColor: '#c7d2fe',
  },
  pageButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  paginationInfo: {
    color: '#374151',
    fontWeight: '600',
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    gap: 12,
  },
  pageButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#7c3aed',
  },
  pageButtonDisabled: {
    backgroundColor: '#c7d2fe',
  },
  pageButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  paginationInfo: {
    color: '#374151',
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 14,
  },
  modalImage: {
    width: '100%',
    height: SCREEN_WIDTH * 0.5,
    borderRadius: 18,
    marginBottom: 14,
  },
  modalDescription: {
    color: '#374151',
    fontSize: 15,
    marginBottom: 14,
  },
  modalPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    backgroundColor: '#7c3aed',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  modalClose: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#7c3aed',
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#7c3aed',
    fontWeight: '700',
  },
});
