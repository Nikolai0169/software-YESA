/**
 * pantalla del carrito de compras y sus respectivas gestiones no requieren que este autenticado solo para hacer compras
 */

/**
 * importar componentes de react native para construir la pantalla
 * ActivityIndicator: spinner de carga circular
 * Alert: dialogos emergentes nativos del sistema
 * Image: muestra las imagenes
 * Pressable: area tactil
 * ScrollView: contenedor con scroll vertical
 * StyleSheet: crea los estilos de forma optimizada
 * Text: muestra texto plano en pantalla
 * View: contenedor generico equivale a un div en html y css
 */
import {ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';

import {router} from 'expo-router';
//ionicons libreria de iconos vectoriales para react native
import {Ionicons} from '@expo/vector-icons';
import {useAuth} from '../../src/context/authContext';
import {useCarrito} from '../../src/context/carritoContext';

//carritoctx define la forma de los datos que devuelve useCarrito
//TypeScript necesita esto porque carritoContext.js esta en javaScript
type carritoCtx = {
    //items lista de productos en el carrito 
    items: {id:string, nombre?: string, precio?:number, cantidad:number, imagen?:string}[];
    //suma total en pesos colombianos de tpodos los items
    total: number;
    //numero total de items del carrito 
    totalItems: number;
    //loading true mientras el contexto cargalos datos iniciales 
    loading: boolean;
    //cambiar cantidad actualiza la cantidad de un producto
    cambiarCantidad: (id: string, cantidad: number) => Promise<void>;
    //eliminar item elimina un producto del carrito
    eliminarItem: (id:string) => Promise<void>;
    //vaciar carrito elimina todos los productos del carrito
    vaciarCarrito: () => Promise<void>;
};

//helpers de navegacion
//expo router tipifica router de forma estricta y expone .push/replace 
//directamente en typescript, se usa as unknown as .... para forzar el tipo y poder llamar a las funciones de navegacion sin errores de compilador

//routerPush navega a una nueva pantalla apilandola, es decir, se puede volver atras
const routerPush = (path:string) => (router as unknown as {push:(p: string) => void}).push(path);
//routerreplace navega a una pantalla reemplazando la actual recuerda que se puede volver atras
const routerReplace = (path:string) => (router as unknown as {replace: (p:string) => void}).replace(path);

//fmt: formatea un numero como precio en pesos colombianos eje fmt (15000) -> $15.000
const fmt = (n: number) => `$${Number(n).toLocaleString('es-CO')}`;

//componente principal carrito Screen
export default function carritoScreen() {
    //obtiene el contexto de auth solo si el usuario estta autenticado
    const {isAuthenticated} = useAuth() as {isAuthenticated:boolean};

    //obtiene del contexto del carrito los datos y funciones necesarias 
    //se usa as carritoCtx porque el contexto de js y typeScript no infiere en tipos
    const {items, total, totalItems, loading, cambiarCantidad, eliminarItem, vaciarCarrito} = useCarrito() as carritoCtx;

    //pantall de carga 
    //si el carrito aun esta cargando por ejemplo recuperando datos guardados
    //se muestra un spinner centrado en lugar del contenido normal

    if(loading) {
        return (
            <view style={styles.centered}>
                {/**
                 * spinner circular color indigo
                 */}
                 <ActivityIndicator size='large' color='#6366f1'/>
                <text style={styles.loadingText}>Cargando carrito...</text> 
            </view>
        );
    }

    //funcion handleIrACheckout o sea pagar
    //si el usuario no esta autenticado muestra el dialogo de inicio de sesion
    //si esta autenticado navega directamente a la pantalla de pagos 
    const handleIrACheckout = () => {
        if(!isAuthenticated) {
            Alert.alert(
                'Inicia sesion',
                'Debes iniciar sesion para proceder al pago',
                [
                    //boton 'cancelar' cierra el dialogo sin hacer nada
                    {text: 'Cancelar', style: 'cancel'},
                    //boton iniciar sesione leva a la pestaña cuenta explore.tsx
                    {text: 'Iniciar sesion', onPress: () => routerReplace('/tabs/explore')}
                ]
            );

            return; //sale de la funcion
        }

        //usuario autenticado navega a la pantalla de pagos
        routerPush('/checkout');
    };
}
