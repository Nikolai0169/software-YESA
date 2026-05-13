 /**
 * este archivo y pantalla de detalle de un pedido especifico para el administrador
 * recibe el parametro dinamico id desde la url 
 * consulta el backend para traer los datos del pedido
 * muestra los datos del cliente estado actual total fecha y lista de productos
 * permite cambiar el estado del pedido pendiente -> enviado-> entregado o cancelar si esta en pendiente 
 */
 

//manejo de variables de estado local
import {useState, useEffect} from 'react';
//importar componentes
//dimensions obtiene el ancho y alto de la pantalla para hacer diseños responsivos
//flatilist lista optimizada con virtualizacion para mostras grandes cantidades de datos 
//modal mostrar detalles de contenido en ventana emergente
import {ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View, Alert} from 'react-native';

//lee los parametros de la url para obtener el id del pedido
import {useLocalSearchParams} from 'expo-router';
//themedText : texto que aplica colores del tema del dispositivo de manera automatica claro u oscuro
import {ThemedText} from '@/components/themed-text';
//cliente http axios con JWT 
import apiClient from '../../../src/api/apiClient';

/**
 * tipos
 * representa un item de la lista de productos del pedido
 * todos los campos son opcionales porque el backend puede enviarlos todos
 */
type Detalle = {
    producto?: {nombre?: string}; //solo de los productos comprados
    cantidad?: number;
    precio?: number; //precio unitario del producto
};

//representa el pedido completo tal como lo devuelve el backend 
type Pedido = {
    id: string;
    estado?: string;
    total?: number;
    createdAt?: string;
    usuario?: {
        nombre?: string;
        apellido?: string;
        email?: string;
    };
    detalles?: Detalle[];//arreglo de productos incluidos en el pedido 
};

/**
 * componente principal 
 */

export default function AdminPedidoDetalleScreen() {
    /**
     * parametros de ruta
     * useLocalSearchParams lee los segmentos dinamicos de la url
     * como el archivo se llama [id].tsx el parametro se llama id es decir si un pedido se llam 38 el id es 38
     */

    const {id} = useLocalSearchParams<{id:string}>();

    //estado local 
    const [pedido, setPedido] = useState<Pedido | null>(null); //datos del pedido null = aun no cargados 
    const [loading, setLoading] = useState(true);//activo mientras hace la peticion api
    const [errorMessage, setErrorMessage] = useState('');// mensaje de error si falla la carga 
    const [cambiando, setCambiando] = useState(false);//true mientras se esta cambiando el estado evita el doble click

    /**
     * funcion fetchPedido
     * llama el endpoint get/admin/pedidos/:id y guarda el resultado en estado
     * se usa tanto en el montaje inicial useEffect como despues de cambiar el estado 
     */

    const fetchPedido = async() => {
        setLoading(true); //muestra el spinner de carga 
        setErrorMessage('');
        try {
            //peticion get autenticada el token JWT lo agrega el apiClient automaticamente
            const res = await apiClient.get(`/admin/pedidos/${id}`);
            //la respuesta tiene estructura {data: data : {pedido...}}
            //el operador ? evita errores si algun nivel es undefined 
            setPedido(res.data?.data?.pedido || null);
        }catch (error: unknown) {
            //si la peticion falla guarda el mensaje de error para mostrarlo en pantalla 
            setErrorMessage((error as {message?:string})?.message || 'No se pudo cargar el pedido');
        }finally {
            setLoading(false); //oculta el spinner siempre que haya un error o no 
        }
    };

    /**
     * efecto carga inicial 
     * se ejecuta cada vez que cambie el parametro id de la url 
     * en la practica solo se ejecuta al montar porque no se navega entre ids diferentes
     */

    useEffect(() => {
        fetchPedido();
        /**
         * eslint-disable-next-line react-hooks/exhaustive-deps
         * fetchPedido no se incluye en el array de dependencias para evitar bucles infinitos
         * el lint warning se suprime con el comentario de arriba 
         */
    }, [id]);

    /**
     * funcion cambiar estado 
     * envia un PATCH al backend para actualizar el estado del pedido
     * parametro: nuevoEstado el estado al que requiere transicionar 
     * enviado, entregado o cancelado 
     */
    const cambiarEstado = async(nuevoEstado: string) => {
        setCambiando(true); //bloquea los botones para evitar clicks multiples
        try {
            //patch /admin/pedidos/:id/estado con el nuevo estado en el body 
            await apiClient.patch(`/admin/pedidos/${id}/estado`, {estado: nuevoEstado});
        }catch {
            //si falla muestra un alert nativo con el mensaje de error
            Alert.alert('Error', 'No se pudo cambiar el estado')
        }finally {
            setCambiando(false); //desbloquea los botones 
        }
    };
}