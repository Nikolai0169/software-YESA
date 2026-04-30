/**
 * es el contexto global del carrito de compras
 * funciona en dos modos segun si el usuario esta autenticado 
 * sin sesion lee y escribe en asyncStorage (carrito local)
 * con sesion lee y escribe en backend via api rest
 * al iniciar sesion fusiona automaticamente el carrito local al backend para que el usuario no pierda las productos agregados sin cuenta
 * expone items totales y las accioones: agregar cambiar cantidad eliminar y vaciar 
 */

import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {useAuth} from './authContext';
import carritoService from '../services/carritoService';

const carritoContext = createContext(null);

export function carritoProvider({children}) {
    //lee isAuthenticated e isLoadingSession contexto de autenticacion 
    const {isAuthenticated, isLoadingSession} = useAuth();

    //estado del carrito
    const [carrito, setItems] = useState([]);//lista de productos del carrito
    const [totalItems, setTotalItems] = useState(0);//suma de cantidades
    const [total, setTotal] = useState(0);//precio total
    const [loading, setLoading] = useState(true);//true mientras se carga el carrito

    //rastrea si el usuario estaba autenticado en el render anterio para detectar en el momento exacto de inicio de sesion
    const prevAuthenticated = useRef(false);

    /**
     * hydrate
     * carga o recarga el carrito desde el origen correcto local o backend 
     * se llama al montar el provider y despues de cada operacion de escritura
     */

    const hydrate = useCallback(async () => {
        //espera a que authContext termine de restaurar la sesion guardada 
        if(isLoadingSession) {
            return;
        }

        /**fusion al inicar sesion 
         * si el usuario se acaba de autenticar (prevAuthenticated es false pero isAuthenticated es true) fusiona el carrito local al backend
         * sube los items del carrito local antes de leerlo
         * asi no se pierden los productos agregado sin cuenta
         */

        if (isAuthenticated && !prevAuthenticated.current) {
            try{
                await carritoService.mergeLocalToBavckend();
            }catch{
                //si la fusion falla continua sin bloquear 
            }
        }

        //actualiza la referencia par el proximo render
        prevAuthenticated.current = isAuthenticated;

        setLoading(true);
        try{
            //getCarrito decide internamente si consulta el backend o asyncStorage
            const snapshot = await carritoService.getCarrito(isAuthenticated);
            setItems(snapshot.setItems);
            setTotalItems(snapshot.totalItems);
            setTotal(snapshot.setTotal);
        }catch{
            //si falla muestra carrito vacio sin productos
            setItems([]);
            setTotalItems(0);
            setTotal(0);
        }finally {
            setLoading(false);
        }
    }, [isAuthenticated, isLoadingSession]);

    //se ejecuta cada vez que cambia isAuthenticated o isLoadingSession para cargar el carrito correcto
    useEffect(() => {
        hydrate();
    }, [hydrate]);

    /**
     * agregar producto
     * agrega producto al carrito (local o backend) y recarga el estado
     */

    const agregarProducto = useCallback(async(producto,cantidad=1) => {
        await carritoService.addToCarrito({isAuthenticated, producto, cantidad,});
        await hydrate();
    }, [isAuthenticated, hydrate]);

    /**
     * cambiar cantidad
     * modifica la cantidad de un item ya existente en el carrito
     */

    const cambiarCantidad = useCallback(async(itemId, cantidad) => {
        await carritoService.updateCantidad({isAuthenticated, itemId, cantidad});
        await hydrate();
    }, [isAuthenticated, hydrate]);

    /**
     * vaciar carrito
     * elimina todos los items del carrito de una vez
     */

    const vaciarCarrito = useCallback(async() => {
        await carritoService.vaciarCarrito(isAuthenticated);
        await hydrate();
    }, [isAuthenticated, hydrate]);
}

