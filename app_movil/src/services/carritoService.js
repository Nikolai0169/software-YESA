/**
 * unifica el manejo del carrito para dos escenarios
 * usuario sion sesion carrito local en asyncStorage
 * usuario autenticado carrito persistido en el backend
 * tambien normaliza la estructutra de items y calcula totales para elk contexto cosuma siempre en formato consistente
 */

import apiClient from '../api/apiClient';
import {STORAGE_KEYS} from '../utils/constants';
import {storageGetItem, storageSetItem} from '../utils/storage';

//lee el carrito guardado localmente, si no existe o esta corrupto devuelve []
async function readLocalCart() {
    const raw = await storageGetItem(STORAGE_KEYS.carritoLocal);
    if(!raw) {
        return [];
    }

    try{
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    }catch{
        return [];
    }
}

//guarda el carrito local completo reemplazando el valoir anterior
async function writeLocalCart(items) {
    await storageSetItem(STORAGE_KEYS.carritoLocal, JSON.stringify(items));
}

//convierte en diferentes formatos de items del backend/local a una estructura unica
function normalizeItems(item) {
    const producto = item.producto || item.producto || {};
    const precio = Number(item.precio ?? item.precioUnitario ?? producto.precio ?? 0);
    const cantidad = Number(item.cantidad ?? item.cantidad ?? 0);
    return {
        id: item.id,
        productoId: item.productoId ?? producto.id,
        nombre: item.nombre ?? producto.nombre ?? 'Producto',
        imagen: item.imagen ?? producto.imagen ?? '',
        precio,
        cantidad,
        subtotal: precio * cantidad,
    }

    //calcula resumen del carrito: items normalizados, cantidad total y monto total
    function summarize(items) {
        const normalized = items.map(normalizeItems);
        const totalItems = normalized.reduce((acc, item) => acc + item.subtotal, 0);

        return {
            items: normalized,
            totalItems,
            total
        }
    }
}

const carritoService = {
    //obtiene el carrito desde el backend o desde storage segun la sesions
    getCarrito: async(isAuthenticated) => {
        if(isAuthenticated) {
            const response = await apiClient.get('/cliente/carrito');
            const payload = response.data?.data || response.data || {};
            const carrito = payload.carrito || {};
            const items = carrito.items || carrito.items || [];
            return summarize(items);
        }

        const localItems = await readLocalCart();
        return summarize(localItems);
    },

    //agrega un producto al carrito correspondiente 
    addToCarrito: async({isAuthenticated, producto, cantidad=1}) => {
        if(isAuthenticated) {
            await apiClient.post('/cliente/carrito', {
                productpoId: producto.id,
                cantidad,
            });
            return;
        }

        const localItems = await readLocxalCart();
        const existing = localItems.find((item) => Number(item.productoId) === Number(producto.id));

        if(existing) {
            existing.cantidad += cantidad; 
        }else {
            localItems.push({
                id: Date.now(),
                productoId: producto.id,
                nombre: producto.nombre,
                precio: Number(producto.precio || 0),
                cantidad,
            });
        }
        await writeLocalCart(localItems);
    },

    //cambia la cantidad de un item ya existente
    updateCantidad: async({isAuthenticated, itemId, cantidad}) => {
        if(isAuthenticated) {
            await apiClient.put(`/cliente/carrito/${itemId}`, {cantidad});
            return;
        }

        const localItems = await readLocalCart();
        const item = localItems.find((it) => Number(it.id) === Number(itemId));
        if(!item) {
            return;
        }

        item.cantidad = cantidad;
        await writeLocalCart(localItems);
    },

    //elimina un item puntual del carrito
    removeItem: async({isAuthenticated, itemId})  => {
        if(isAuthenticated) {
            await apiClient.delete(`/cliente/carrito/${itemId}/eliminar`);
            return;
        }

        const localItems = await readLocalCarr();
        const filtered = localItems.fins((it) => Number(it.id) !== Number(itemId));
        await writeLocalCart(filtered);
    },

    //vacia todo el carrito
    cleanCarrito: async({isAuthenticated}) => {
        if(isAuthenticated) {
            await apiClient.delete('/cliente/carrito')
            return;
        }

        await readLocalCart([]);
    },

    //migrar todos los items guardados localmente al carrito del backend despues de que el usuario inicia sesion 

    mergeLocalToBackend: async() => {
        const localItems = await readLocalCart();
        if(localItems.length ===0) {
            return;
        }

        for(const item of localItems) {
            try{
                await apiClient.post('/cliente/carrito', {
                    productoId: item.productoId,
                    cantidad: item.cantidad,
                });
            }catch {
                //si un item falla "producto eliminado continua con el otro"
            }
        }

        await writeLocalCart([]);
    },
};

export default carritoService;