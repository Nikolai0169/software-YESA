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
function normalizeItem(item) {
    const producto = item.producto || {};
    const precio = Number(item.precio ?? item.precioUnitario ?? producto.precio ?? 0);
    const cantidad = Number(item.cantidad ?? producto.cantidad ?? 0);
    return {
        id: item.id,
        productoId: item.productoId ?? producto.id,
        nombre: item.nombre ?? producto.nombre ?? 'Producto',
        imagen: item.imagen ?? producto.imagen ?? '',
        precio,
        cantidad,
        subtotal: precio * cantidad,
    };
}

//calcula resumen del carrito: items normalizados, cantidad total y monto total
function summarize(items) {
    const normalized = (items || []).map(normalizeItem);
    const totalItems = normalized.reduce((acc, it) => acc + (it.cantidad || 0), 0);
    const total = normalized.reduce((acc, it) => acc + (it.subtotal || 0), 0);
    return {
        items: normalized,
        totalItems,
        total,
    };
}

const carritoService = {
    //obtiene el carrito desde el backend o desde storage segun la sesions
    getCarrito: async(isAuthenticated) => {
        if(isAuthenticated) {
            const response = await apiClient.get('/cliente/carrito');
            const payload = response.data?.data || response.data || {};
            const items = payload.items || payload.carrito?.items || [];
            return summarize(items);
        }

        const localItems = await readLocalCart();
        return summarize(localItems);
    },

    //agrega un producto al carrito correspondiente 
    addToCarrito: async({isAuthenticated, producto, cantidad = 1}) => {
        console.log('[carritoService] addToCarrito called', { isAuthenticated, productoId: producto?.id ?? producto?.productoId, cantidad });
        const productoId = producto?.id ?? producto?.productoId ?? null;
        if (!productoId) {
            throw new Error('El productId es requerido para agregar al carrito');
        }

        if (isAuthenticated) {
            console.log('[carritoService] POST /cliente/carrito', { productoId, cantidad });
            await apiClient.post('/cliente/carrito', {
                productoId,
                cantidad,
            });
            return;
        }

        const localItems = await readLocalCart();
        const existing = localItems.find((item) => Number(item.productoId) === Number(productoId));

        if (existing) {
            existing.cantidad = Number(existing.cantidad || 0) + Number(cantidad || 0);
        } else {
            localItems.push({
                id: Date.now(),
                productoId,
                nombre: producto?.nombre || 'Producto',
                imagen: producto?.imagen || '',
                precio: Number(producto?.precio || 0),
                cantidad,
            });
        }
        console.log('[carritoService] writeLocalCart', localItems);
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
            await apiClient.delete(`/cliente/carrito/${itemId}`);
            return;
        }

        const localItems = await readLocalCart();
        const filtered = localItems.filter((it) => Number(it.id) !== Number(itemId));
        await writeLocalCart(filtered);
    },

    //vacia todo el carrito
    vaciarCarrito: async(isAuthenticated) => {
        if (isAuthenticated) {
            await apiClient.delete('/cliente/carrito');
            return;
        }

        await writeLocalCart([]);
    },

    //migrar todos los items guardados localmente al carrito del backend despues de que el usuario inicia sesion 

    mergeLocalToBackend: async() => {
        const localItems = await readLocalCart();
        if(localItems.length === 0) {
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