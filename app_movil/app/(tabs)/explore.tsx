/**
 * pantalla de cuenta pestaña 3 tiene 2 metodos 
 * no autenticado muestra formulario login y registro
 * autenticado muestra perfil de usuario con opciones de editar datos
 * acceder al panel admin/aux ver pedidos segun rol
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
//manejo de variables de estado local
import {useState} from 'react';
//importar componentes
import {ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';

import {router} from 'expo-router';
//ionicons libreria de iconos vectoriales para react native
import {Ionicons} from '@expo/vector-icons';
import {useAuth} from '../../src/context/authContext';
//themedText : texto que aplica colores del tema del dispositivo de manera automatica claro u oscuro
import {ThemedText} from '@/components/themed-text';
//themedView : color de fondo automatico segun el tema del dispositivo
import {ThemedView} from '@/components/themed-view';

/**
 * AuthCtx define la forma del objeto devuelto por useAuth es necesario
 * porque authContext.js esta en javascript no typescript y el compilador no los reconoce 
 */
type AuthCtx = {
    //user datos del usuario autenticado o null si no inicio sesion
    user: {nombre?:string, email?: string, rol?: string} | null;
    //isAuthenticated: tru si hay sesion activa
    isAuthenticated: boolean;
    //isLoading: true mientras se verifica si hay sesion guardada a abrir la app
    isLoading: boolean;
    //login: funcion que recibe el email y contraseña lanza error si falla
    login: (email: string, password: string) => Promise<unknown>;
    //register funcion que registra un nuevo usuario lanza error si falla
    register: (data: {nombre: string, apellido: string, email: string, password: string, telefono?: string, direccion?: string}) => Promise<unknown>;
    //logout: funcion de cerrar la sesion del usuario 
    logout: () => Promise<void>;
    //updatePerfil: funcion que actualiza los datos del usuario
    updatePerfil:(data: {nombre?: string, email?: string, password?: string}) => Promise<unknown>;
};

//routerPush navega apilando la nueva pantalla permite volver atras con la opcion de atras
//se usa as unknown as para evitar errores de typescript con contextos router

const routerPush = (path: string) => (router as unknown as {push: (p: string) => void}).push(path);

//componente principal del tab de cuenta 

export default function TabTwoScreen() {
    const {user, isAuthenticated, logout, login, register, isLoading, updatePerfil} = useAuth() as AuthCtx;
    // estado del formulario login y registro
    //isRegisterMode true mostrar formulario de registro false mostrar login
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    //campos del formulario de registro y login
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [telefono, setTelefono] = useState('');
    const [direccion, setDireccion] = useState('');
    //loadingSubmit true mientras se procesa el login o registro evita el doble envio
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    //manejo de retroalimentacion al usuario (error o exito)
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    //estado de edicion de perfil 
    //editMode true mostrar campos editables false modo lectura
    const [editMode, setEditMode] = useState(false);
    //campos editables del perfil
    const [editNombre, setEditNombre] = useState('');
    const [editApellido, setEditApellido] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPassword, setEditPassword] = useState('');
    //savingerfil true mientras de guarda el perfil en backend
    const [savingPerfil, setSavingPerfil] = useState(false);
    //mensajes del formulario de edicion del perfil
    const [perfilError, setPerfilError] = useState('');
    const [perfilSuccess, setPerfilSuccess] = useState('');

    //function resetFeedBack
    //limpia los mensajes de error y exito del formulario login y registro
    const resetFeedBack = () => {
        setErrorMessage('');
        setSuccessMessage('');
    };

    //function: handleLogout
    //cierra la sesion y resetea todos los campos del formulario para que la pantalla quede limpia cuando el usuario vuelva a ver formulario
    const handleLogout = async() => {
        await logout(); //llama el contexto de cerrar sesion
        setNombre('');
        setApellido('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setTelefono('');
        setDireccion('');
        setIsRegisterMode(false);
    };

    //function handleSubmit
    //valida y envia el fromulario de login o registro segun el modo activo
    const handleSubmit = async() => {
        resetFeedBack();//limpia mensajes anteriores antes de validar

        if(isRegisterMode) {
            //validaciones de registro
            //todos los campos marcados con * son obligatorios
            if(!nombre || !apellido || !email || ! password || !confirmPassword) {
                setErrorMessage('Completa todos los campos obligatorios *.');
                return;
            }

            //las contraseñas deben coincidir
            if(password !== confirmPassword) {
                setErrorMessage('Las contraseñas no coinciden');
                return;
            }

            //la contraseña debe tener minimo 6 caracteres
            if(password.length < 6) {
                setErrorMessage('La contraseña debe tener al menos 6 caracteres');
                return;
            }

            //telefono si se proporciona debe ser colombiano(10 digitos y debe empezar con 3)
            if(telefono && !/^3\d{9}$/.test(telefono)) {
                setErrorMessage('Telefono invalido: 10 digitos iniciando con 3');
                return;
            }
        }else {
            //validaciones de login 
            if(!email || !password) {
                setErrorMessage('Ingresa con tu correo y contraseña');
                return;
            }
        }

        //activa el spinner y bloquea el boton parea evitar multiples envios 
        setLoadingSubmit(true);
        try {
            if(isRegisterMode) {
                //llama a register() del contexto con los datos del formulario
                //el operador spread condicional ... solo incluye telefono/direccion si no estan vacios 
                await register({nombre, apellido, email, password, 
                    ...(telefono ? {telefono}: {}),
                    ...(direccion ? {direccion}: {})
                });
                setSuccessMessage('Registro exitoso! Ahora inicia sesion');
                setIsRegisterMode(false); //vuelve al modo login tras el registro exitoso
                //limpia los campos que no se comparten en el formulario login
                setPassword('');
                setConfirmPassword('');
                setNombre('');
                setApellido('');
                setTelefono('');
                setDireccion('');
            }else{
                //llama al login del contexto con el email y la contraseña
                await login(email, password);
                setSuccessMessage('Sesion inicada correctamente');

            }
         }catch(error:unknown) {
            //si el backend devuewlve error muestra su mensaje si no muestra uno generico
            setErrorMessage((error as {message?: string})?.message || 'No fue posible completar la acción');
         }finally{
            //siempre desactiva el spinner al terminar exito y error
            setLoadingSubmit(false);
         }
    };

    /**
     * funcion handleGuardarPerfil
     * valida y envia los cambios al perfil del usuario autenticado 
     */

    const handleGuardarPerfil = async () => {
        setPerfilError('');
        setPerfilSuccess('');
        //al menos uno de los tres campos debe estar modificado 
        if(!editNombre.trim() && !editEmail.trim() && !editPassword.trim()) {
            setPerfilError('Modifica al menos un campo');
            return;
        }
    }
}