/**
 * Este archivo es la gestion de productos panel de administracion
 * lista de todos los productos del sistema con imagen, descripcion, precio y stock y estado
 * permite buscar en tiempo real y navega entre paginas 10 productos por pagina
 * producto-form con los datos de editar 
 * al presionar el producto navega a sus caracteristicas y edicion
 * solo administradores isAdmin pueden activar o desactivar y eliminar productos
 * el auxiliar solo puede ver y navegar 
 */
 

//manejo de variables de estado local
import {useEffect, useState} from 'react';
//importar componentes
//dimensions obtiene el ancho y alto de la pantalla para hacer diseños responsivos
//flatilist lista optimizada con virtualizacion para mostras grandes cantidades de datos 
//modal mostrar detalles de contenido en ventana emergente
import {ActivityIndicator, ScrollView, StyleSheet,TextInput, Alert, FlatList, Image, Pressable, View} from 'react-native';


//lee los parametros de la url para obtener el id del pedido
import {router} from 'expo-router';//navegacion y parametros de ruta
import {ThemedText} from '@/components/themed-text';
import apiClient from '../../src/api/apiClient';
import {activarProducto, desactivarProducto, deleteProduct} from '../../src/services/adminService';
import {useAuth} from '../../src/context/authContext';
/**
 * tipo de producto 
 * estructura del producto recibido tal como viene del backend
 */

type Producto = {
    id?: number,
    nombre?: string,
    decripcion?: string,
    precio?: number
    stock?: number,
    imagen?: string,
    activo?: boolean,
};

type AuthUser = {rol?: string};

/**
 * helpers de navegacion 
 * cats de router para navegar con string simple sin parametros 
 */
const push = (path: string) => (router as unknown as {push: (p:string) => void}).push(path);

//cast de router para navegar con pathname + params (para pasar el objeto a producto)
const pushParams = (pathname:string, params: Record<string, string>) => (router as unknown as {push: (p:{pathname: string; params: Record<string,string>}) => void}).push({pathname, params});

export default function AdminProductosScreen() {
    /**
     * contexto de autenticacion 
     */
    const {user} = useAuth() as {user: AuthUser | null};
    /**
     * Estado local 
     */
    const [productos, setProductos] = useState<Producto[]>([]); //productos en la pagina actual
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [busqueda, setBusqueda] = useState('');
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);

    /**
     * Funcion fetchProductos 
     * consulta get / admin / productos con filtro de busqueda y paginacion 
     */

    const fetchProductos = async(page=1, search='') => {
        setLoading(true);
        setErrorMessage('');
        try{
            const params: string[] = [];
            if(search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
            params.push(`pagina=${page}`);
            params.push(`limite=10`);
            const url = `/admin/productos?${params.join('&')}`;
            const res = await apiClient.get(url);
            const productosData: Producto[] = res.data?.productos || [];
            setProductos(productosData);
            setPagina(page);
            setTotalPaginas(res.data?.data.paginacion?.totalPaginas || 1);
        }catch(error: unknown) {
            setErrorMessage((error as {message?:string})?.message || 'Error al cargar productos');
        }finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProductos(1, '');
    }, []);

    //avanza y retrocede paginas 
    const handlePagina = (next: number) => {
        const nueva = Math.max(1, Math.min(totalPaginas, pagina + next));
        fetchProductos(nueva, busqueda);
    };

    const isAdmin = user?.rol === 'administrador';
}