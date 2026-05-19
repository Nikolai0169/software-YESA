 /**
 * este archivo y pedidos del cliente
 * la ruta de dinamica por que se obtiene del pedido por su id y url
 * carga el pedido con pedidoService.getPedidoById(id)
 * muestra la informacion del pedido productos y total
 * si el estado es pendiente permite cancelar el pedido
 */
 

//manejo de variables de estado local
import {useState, useEffect} from 'react';
//importar componentes
//dimensions obtiene el ancho y alto de la pantalla para hacer diseños responsivos
//flatilist lista optimizada con virtualizacion para mostras grandes cantidades de datos 
//modal mostrar detalles de contenido en ventana emergente
import {ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View} from 'react-native';

//lee los parametros de la url para obtener el id del pedido
import {router, useLocalSearchParams} from 'expo-router';
//themedText : texto que aplica colores del tema del dispositivo de manera automatica claro u oscuro
import {ThemedText} from '@/components/themed-text';
import {ThemedView} from '@/components/themed-view';
//cliente http axios con JWT 
import pedidoService from '../../src/services/pedidoService';
type ProductoDetalle = {
  nombre?:string;
  imagen?: string;
};
type Detalle = {
  id: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto?: ProductoDetalle; //detalle del producto en memoria cache
  Producto?: ProductoDetalle; //detalle del producto desde el backend
};
//estructura principal del pedido mostrada en la pantalla
type Pedido = {
  id: string;
  estado: string;
  streatedAt: string;
  direccionEnvio?: string;
  telefono?: string;
  metodoPago?: string;
  total: number;
  detalles: Detalle[]; //variable de tipo array de detalles del pedido
  DetallePedido?: Detalle[]; //detalles del pedido desde el backend 
};

/**
 * helpers para formatear la fecha y el estado del pedido 
 */
//formatea un numero como pesos colombianos
function formatCOP(value:number | undefined):string {
  return `$${Number(value || 0).toLocaleString('es-CO')}`;
}

//convierte una fecha ISO a formato legible en español (Colombia)
function formatDate(value: string | undefined): string {
  if(!value) {
    return '-';
  }

  return new Date(value).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

//traduce estados tecnicos del backend a etiquetas amigables para el usuario
function mapEstadoLabel(value: string | undefined): string {
  const labels: Record<string, string> = {
    pendiente: 'Pendiente',
    confirmado: 'Confirmado',
    en_proceso: 'En proceso',
    enviado: 'Enviado',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  };

  //prioridad: etiqueta mapeada -> valor original -> texto por defecto
  return labels[value || ''] || value || 'Pendiente';
}

/**
 * Componente principal 
 * 
 */

export default function PedidoDetalleScreen() {
  //lee el parametro dinamico [id] desde la url
  const {id} = useLocalSearchParams();
  //normaliza por si expo router devuelve arreglo 
  const pedidoId = Array.isArray(id) ? id[0] : id;

  //estado local 
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
}



