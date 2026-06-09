/**
 * archivo contexto globlal de autenticacion 
 * restaurA LA SESION GUARDADA AL INICAR LA APP (TOKEN, USUARIO)
 * Expone las funciones de login register, logout, actualizar perfil
 * cualquier componente que se necesite saber si el usuario esta logueado usa un hook useAuth() en lugar de leer el asyncStorage directamente
 */

import {createContext, useCallback, useEffect, useContext, useMemo, useState} from 'react';
import authService from '../services/authService';

//valor inicial null; useAuth() valida que esta dentro del provider
const authContext = createContext(/** @type {any} */ (null));

export function AuthProvider({ children }) {
    //usuario autenticado objeto con id, nombre, rol o null
    const [user, setUser] = useState(null);
    //JWT recibido del backend; su presencia indica que el usuario esta logueado
    const [token, setToken] = useState(null);
    //true mientras se lee asyncStorage al iniciar la app; evita redirigir antes de tiempo
    const [isLoading, setLoading] = useState(true);

    /**
     * restoreSession
     * lee el token y el usuario guardados en asyncStorage al abrir la app
     * si no hay sesion guardada, deja los estados en null
    */

    const restoreSession = useCallback(async () => {
        try {
            const session = await authService.getSession();
            setToken(session?.token || null);
            setUser(session?.user || null);
        }finally {
            //siemnpr marca la carga como terminada, aunque falle la lectura
            setLoading(false);
        }
    }, []);

    //se ejecuta al montar una sola vez  al montar el provider; restaura la sesion guardada
    useEffect(() => {
        restoreSession();
    }, [restoreSession]);

    /**
     * Login 
     * llama el post/auth/login, guarda el token en asyncStorage y actualiza el estado global para que toda la app sepa que el usuario esta logueado 
     */

    const login = useCallback (async (email, password) => {
        const response = await authService.login(email,password);
        //el backend puede devoler el payload dento de response.data o directo
        const payload = response.data || response; 

        setToken(payload?.token || null);
        // El servicio devuelve el usuario bajo la clave `usuario` (backend en español)
        // o en algunos casos `user`. Guardamos ambos para compatibilidad.
        setUser(payload?.usuario || payload?.user || null);
        
        return payload;
    }, []);

    /**
     * register
     * delega el registro al servicio; no inicia sesion automaticamente
     */

    const register = useCallback(async (data) => {
        const payload = await authService.register(data);
        setToken(payload?.token || null);
        setUser(payload?.usuario || null);
        return payload;
    }, []);

    /**
     * logout
     * actualiza el estado del usuario en el backend y sincroniza el estado actual
     */

    const logout = useCallback(async () => {
        await authService.logout();
        setToken(null);
        setUser(null);
    }, []);

    /**
     * updatePerfil
     * actualiuza los datos del usuario eln el backend y sincroniza el estado local
     */

    const updatePerfil = useCallback(async (data) => {
        const usuario = await authService.updatePerfil(data);
        if(usuario) setUser(usuario)
        return usuario;
    }, []);

    /**
     * valor de contexto
     * usememo evita recrar el objeto en cada render solo cambia si algguna de las dependencias cambia
     */
    
    const value = useMemo(() => ({
        user, //objeto del usuario autenticado o null
        token, //JWT o null
        isAuthenticated: Boolean(token), //booleano derivado del token
        isLoadingSession: isLoading, //true mientras se restaura la sesion al iniciar la app
        login,
        register,
        logout,
        updatePerfil,
        refreshSession: restoreSession, //permite forzar una relectura del storage
    }), [user, token, isLoading, login, register, logout, updatePerfil, restoreSession]
    );

    return <authContext.Provider value={value}>{children}</authContext.Provider>;
}

    /**
     * hook
     * simplifica el acceso del contexto y lanza un error descriptivo si se usa fuera del arbol del provider
     */

    export function useAuth() {
        const context = useContext(authContext);

        if(!context) {
            throw new Error('useAuth debe usarse dentro de un authProvider');
        }
        return context;
    }