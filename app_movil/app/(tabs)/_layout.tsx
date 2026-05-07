/**
 * define la barra de navegación inferior (tab bar) de app
 * expo router usa este archivo como el contenedor de todas las pantallas que viven de la carpeta (tabs)
 */

//tabs componente de expo router que genera la barra de pestañas inferior
import {Tabs} from 'expo-router';
//react necesario para que JSX funcione correctamente
import React from 'react';
//hapticTab version personalizada del boton de la pestaña que agrega vibracion tactil (haptic feedback) al presionar el tab
import {HapticTab} from '@/components/haptic-tab';
//InconSymbols componente que muestra inconos SF Synbols iOS y material de android
import {IconSymbol} from '@/components/ui/icon-symbol';
//colors objeto de colores del tema de app modo claro y oscuro
import {Colors} from '@/constats/theme';
//useColoSchema hook que detecta si el dispositivo esta en modo claro u oscuro
import {useColorScheme} from '@/hooks/use-color-scheme';

//TabLayOut componente principal que configura toda la barra de navegacion
//expo router lo exporta como default y lo monte automaticamente
export default function TabLayout() {
    //colorschema valor 'light' o dark segun la preferencia del sistema
    const colorSchema = useColorScheme();

    return (
        //tabs renderiza la barra de pestañas inferior y gestiona que la pantalla esté activa en cada momento 
        <Tabs
            screenOptions = {{
                //tabbar ActiveTintColor color del icono y texto de la pestaña activa 
                //si colorSchema es null (no detectado) usa light por defecto
                tabBarActiveTintColor: Colors[colorSchema ?? 'light'].tint,
                //headerShown false oculta el encabezado superior en todas las pantallas
                headerShown: false,
                //tabBarButton reemplaza el boton estandar por hapticTab con vibracion
                tabBarButton: HapticTab,

            }}> 
        
            {/**
             * pestaña 1 tienda
             * name=index -> apunta el archivo /index.tsx (pantalla principal)
             */}
            <Tabs.Screen
                name='index'
                options={{
                    //texto que aparece debajo del icono de la barra
                    title: 'Tienda Adso',
                    //tabBarIcon funcion que recibe el color activo o inactivo y devuelve el icono 
                    //house.fill = iconos de casa relleno (representa el icono de la tienda)
                    tabBarIcon: ({color}) => <IconSymbol size={28} name='house.fill' color={color}/>
                }}
            />

            {/**
             * pestaña 2 carrito
             * name=carrito-> apunta el archivo /carrito.tsx 
             */}
            <Tabs.Screen
                name='carrito'
                options={{
                    //texto que aparece debajo del icono de la barra
                    title: 'Carrito',
                    //tabBarIcon funcion que recibe el color activo o inactivo y devuelve el icono 
                    //cart.fill = iconos de carito relleno
                    tabBarIcon: ({color}) => <IconSymbol size={28} name='cart.fill' color={color}/>
                }}
            />

            {/**
             * pestaña 3 cuenta
             * name=cuenta-> apunta el archivo /cuenta.tsx 
             */}
            <Tabs.Screen
                name='explore'
                options={{
                    //texto que aparece debajo del icono de la barra
                    title: 'Cuenta',
                    //tabBarIcon funcion que recibe el color activo o inactivo y devuelve el icono 
                    //house.fill = iconos de casa relleno (representa el icono de la tienda)
                    tabBarIcon: ({color}) => <IconSymbol size={28} name='person.circle' color={color}/>
                }}
            />
            
            
        </Tabs>
        
    );
}