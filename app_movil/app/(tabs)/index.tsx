/**
 * pantalla principal tienda muestra el catalogo de productos
 * con un banner hero tarjetas de caracteristicas buscador de texto
 * chips de categorias lista de productos a 2 columnas paginacion y un modal de detalle de producto
 */

/**
 * importar componentes de react native para construir la pantalla
 * hooks de react:
 * useEffect ejecuta el codigo al montar el componente o cuando camboian las dependencias
 * useMemo memoriza valores calculados para evitar recalculos innecesarios
 * useState maneja variables de estado local 
 */
//manejo de variables de estado local
import {useState, useEffect, useMemo} from 'react';
//importar componentes
//dimensions obtiene el ancho y alto de la pantalla para hacer diseños responsivos
//flatilist lista optimizada con virtualizacion para mostras grandes cantidades de datos 
//modal mostrar detalles de contenido en ventana emergente
import {ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View, Alert, Dimensions, FlatList, Image, RefreshControl} from 'react-native';

//ionicons libreria de iconos vectoriales para react native
import {Ionicons} from '@expo/vector-icons';
//catalogoService servicio que hace las llamadas http (api) del backend para productos y categorias
import catalogoService  from '../../src/services/catalogoService'
//themedText : texto que aplica colores del tema del dispositivo de manera automatica claro u oscuro
import {ThemedText} from '@/components/themed-text';
//themedView : color de fondo automatico segun el tema del dispositivo
import {ThemedView} from '@/components/themed-view';
//useCarrito hook del contexto del carrito para agregar prdouctos 
import {useCarrito} from '../../src/context/carritoContext';

/**
 * tipo carrito ctx 
 * descrtibe los campos que usan de uyseCarrito en pantalla 
 */

type CarritoCtx = {
    //agregarProducto: agrega producto al carrito con la cantidad indicada
    agregarProducto: (producto: unknown, cantidad: number) => Promise<void>; 
    //totalItems numero total de items en el carrito
    totalItems: number;
};

/**
 * constantes globales 
 * se calculan una sola vez al cargar el modulo 
 */

//SCREEN_WIDTH ancho del dispositivo en dp (density independent pixels) para diseños responsivos
const {width: SCREEN_WIDTH} = Dimensions.get('window');
//card_gap espacio horizontal entre las 2 columnas de la tarjeta de producto
const CARD_GAP = 10;
//CARD_WIDTH ancho de cada tarjeta calculado para que quepan exactamente 2 por fila en dos columnas 
const CARD_WIDTH = (SCREEN_WIDTH - 32 - CARD_GAP) /2;
//ITEMS_POR_PAGINA numero de productos por pagina usando paginacion
const ITEMS_POR_PAGINA = 15;

const FEATURES = [
  { icon: 'cube-outline', title: 'Envío Rápido', desc: 'Recibe en tu hogar', color: '#6366f1', bg: '#eef2ff' },
  { icon: 'shield-checkmark', title: 'Compra Segura', desc: 'Datos protegidos', color: '#10b981', bg: '#d1fae5' },
  { icon: 'headset', title: 'Atención 24/7', desc: 'Siempre disponibles', color: '#06b6d4', bg: '#cffafe' },
] as const;


/**
 * componente principal HOME SCREEN
 */

export default function HomeScreen() {
    //extrae las funciones del carrito necesarias para la pantalla
    const {agregarProducto, totalItems} = useCarrito() as CarritoCtx;

    /**
     * estado de datos 
     * productos lista completa de productos traida del backend
     */
    const [productos, setProductos] = useState<any[]>([]);
    //categoria lista de categorias traida del backend
    const [categorias, setCategorias] = useState<any[]>([]);

    //estados de UI
    //loading true mientras cargan los datos por primera vez
    const [loading, setLoading] = useState(true);
    //refreshing true mientras el usuario hace pull to refresh
    const [refreshing, setRefreshing] = useState(true);
    //errorMessage mensaje de error si falla la carga
    const [errorMessage, setErrorMessage] = useState('');
    //busqueda texto de campo de busqueda filtra productos en tiempo real
    const [busqueda, setBusqueda] = useState('');
    //categoriaActiva id de la categoria seleccionada o all para ver todas 
    const [categoriaActiva, setCategoriaActiva] = useState<any>('all');
    //productoDetalle prdoucto seleccionado para ver el modal 
    const [productoDetalle, setProductoDetalle] = useState<any>(null);
    //paginaActual numero de pagina actual para paginacion empieza en 1
    const [paginaActual, setPaginaActual] = useState(1);
    //ITEMS_POR_PAGINA numero de productos por pagina 
    const ITEMS_POR_PAGINA = 15;
}