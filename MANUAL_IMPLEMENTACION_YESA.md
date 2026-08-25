# Manual sencillo de implementación de YESA

## 1. ¿Qué se implementó?

Se realizaron tres mejoras principales en el proyecto YESA:

1. Se corrigió la publicación del proyecto con `publish.ps1`.
2. Se agregó un menú lateral para celulares en la barra de navegación.
3. Se mejoró el modo oscuro en el dashboard y en la pantalla de checkout para que los textos se puedan leer correctamente.

Este manual explica las acciones realizadas paso a paso.

## 2. Archivos modificados

### Publicación

- `publish.ps1`

Cambios realizados:

- Se agregó la variable `DISABLE_ESLINT_PLUGIN=true` antes de construir el frontend.
- Se agregó una validación para detener el proceso si el build falla.
- Se actualizó el mensaje final para mostrar los PID reales del backend y del gateway.

> Nota: El archivo `publish.ps1` fue posteriormente revertido por el usuario. Si se necesita recuperar esos cambios, deben volver a agregarse manualmente.

### Menú responsive

- `frontend/src/components/Navbar.js`
- `frontend/src/App.css`

Cambios realizados:

- Se agregó el componente `Offcanvas` de React Bootstrap.
- Se creó un menú lateral que aparece en celulares.
- Se incluyeron las opciones de inicio, catálogo, búsqueda, filtros, administración, carrito, FAQ, sesión y cierre de sesión.
- Se agregó un bloque móvil con los accesos rápidos `Inicio` y `Catálogo` en posición horizontal.
- Se agregaron estilos para que el menú tenga scroll, botones cómodos para tocar y buena visualización en celulares pequeños.
- En pantallas pequeñas se oculta la navbar horizontal de escritorio.

### Modo oscuro

- `frontend/src/index.css`
- `frontend/src/pages/admin/AdminDashboardPage.js`
- `frontend/src/pages/CheckoutPage.js`

Cambios realizados:

- Se agregaron variables de colores para el dashboard.
- Se definieron colores diferentes para modo claro y modo oscuro.
- Se cambiaron colores fijos del dashboard por variables adaptables al tema.
- Se agregó una clase al dashboard para aplicar estilos específicos.
- Se agregó una clase al checkout para aplicar estilos específicos.
- Se mejoraron los colores de tarjetas, listas, formularios, separadores y textos secundarios.
- Se conservó el encabezado degradado del dashboard en modo oscuro.

## 3. Archivos creados

Antes de este manual no se creó ningún archivo nuevo de código.

Este archivo es el único archivo nuevo creado:

- `MANUAL_IMPLEMENTACION_YESA.md`

No se crearon dependencias nuevas ni paquetes adicionales.

## 4. Paso a paso de la implementación

### Paso 1: Revisar el script de publicación

Se abrió el archivo `publish.ps1` para conocer:

- Qué puertos utiliza.
- Qué carpetas necesita.
- Qué comandos ejecuta.
- Si necesita permisos de administrador.
- Qué procesos inicia.

Se comprobó que utiliza normalmente:

- Puerto público: `80`.
- Puerto del backend: `5000`.
- Dirección pública configurada en el script.

### Paso 2: Ejecutar la publicación

Desde PowerShell se utilizó:

```powershell
cd C:\software-YESA
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\publish.ps1
```

PowerShell debe abrirse como administrador porque el script configura el Firewall de Windows y puede abrir el puerto 80.

Para utilizar otros puertos se puede ejecutar:

```powershell
.\publish.ps1 -PublicPort 8080 -BackendPort 5000 -PublicIp "54.205.90.36"
```

### Paso 3: Identificar el error de ESLint

Durante la compilación apareció este error:

```text
Plugin "react" was conflicted
```

La causa fue que Windows estaba resolviendo la misma carpeta con dos formas distintas:

```text
C:\software-YESA
C:\software-yesa
```

Aunque Windows considera iguales esas rutas, algunas herramientas de JavaScript las consideran diferentes.

### Paso 4: Probar la solución del build

Se ejecutó el build desde la carpeta del frontend con ESLint desactivado temporalmente:

```powershell
cd C:\software-YESA\frontend
$env:DISABLE_ESLINT_PLUGIN = "true"
npm run build
```

El resultado fue:

```text
Compiled successfully.
```

También aparecieron advertencias de Browserslist, tamaño del bundle y APIs obsoletas de Node. Esas advertencias no impidieron la compilación.

### Paso 5: Evitar publicaciones falsas

Se modificó `publish.ps1` para que, después de `npm run build`, revise el código de salida.

Si la compilación falla, el script muestra un error y no debería continuar anunciando que la publicación fue exitosa.

También se modificó el mensaje de detención para que muestre números reales, por ejemplo:

```powershell
Stop-Process -Id 7776,7404 -Force
```

No se deben escribir literalmente estos textos:

```text
<PID_BACKEND>
<PID_GATEWAY>
```

Esos nombres son solo marcadores. Deben reemplazarse por números reales.

### Paso 6: Detener backend y gateway

Para detener procesos usando sus PID reales:

```powershell
Stop-Process -Id 7776,7404 -Force
```

Para encontrar procesos activos por puerto:

```powershell
Get-NetTCPConnection -LocalPort 80,8080,5000 -State Listen
```

Si no aparece ningún resultado, no hay procesos escuchando en esos puertos.

### Paso 7: Agregar el menú lateral móvil

En `Navbar.js` se importó `Offcanvas` desde React Bootstrap.

Después se agregó un estado para controlar si el menú está abierto o cerrado:

```javascript
const [showMobileMenu, setShowMobileMenu] = useState(false);
```

El botón de la navbar abre el menú:

```javascript
onClick={() => setShowMobileMenu(true)}
```

El panel se cierra con:

```javascript
onHide={() => setShowMobileMenu(false)}
```

También se agregó un efecto para cerrar el menú automáticamente cuando el usuario cambia de página.

### Paso 8: Agregar las opciones del menú

Dentro del menú lateral se agregaron enlaces para:

- Inicio.
- Catálogo.
- Búsqueda de productos.
- Filtros del catálogo.
- Personalizar.
- Diseños guardados.
- Mis cotizaciones.
- Favoritos.
- Mis consultas.
- Administración.
- Carrito.
- Preguntas frecuentes.
- Mis pedidos.
- Mi perfil.
- Iniciar sesión.
- Registro.
- Cerrar sesión.

Las opciones de administración y las opciones privadas aparecen únicamente si el usuario tiene los permisos correspondientes.

### Paso 9: Mostrar Inicio y Catálogo horizontalmente

En la vista móvil se agregó una sección de accesos rápidos con dos botones:

- `Inicio`.
- `Catálogo`.

Estos botones se muestran en una misma fila. En pantallas muy pequeñas se reducen sus espacios y se ocultan sus iconos para evitar que el contenido se salga de la pantalla.

### Paso 10: Mejorar el modo oscuro

Se identificó que algunos textos del dashboard tenían colores escritos directamente en los componentes, por ejemplo:

```javascript
color: '#1f2937'
background: '#fff'
```

Esos colores funcionaban en modo claro, pero podían quedar poco visibles en modo oscuro.

Para solucionarlo se crearon variables de tema, como:

```css
--dashboard-background
--dashboard-surface
--dashboard-text
--dashboard-text-muted
--dashboard-border
```

En modo oscuro esas variables utilizan fondos oscuros y textos claros.

También se agregaron reglas específicas para:

- Tarjetas del dashboard.
- Encabezado del dashboard.
- Tarjetas de checkout.
- Elementos de las listas del checkout.
- Campos de formulario.
- Separadores.
- Texto secundario.
- Opciones de los campos desplegables.

### Paso 11: Validar la compilación

Después de cada cambio importante se ejecutó:

```powershell
cd C:\software-YESA\frontend
$env:DISABLE_ESLINT_PLUGIN = "true"
npm run build
```

El resultado final fue:

```text
Compiled successfully.
The build folder is ready to be deployed.
```

Esto confirma que los cambios no tienen errores de compilación.

### Paso 12: Iniciar el frontend para probarlo

El primer intento desde la raíz produjo este mensaje:

```text
Missing script: "start"
```

La razón fue que el comando se ejecutó en la carpeta equivocada. El frontend tiene su propio `package.json`, por lo que el comando correcto es:

```powershell
cd C:\software-YESA\frontend
npm start
```

Después se puede abrir en el navegador:

```text
http://localhost:3000
```

Para probar el menú móvil se puede:

1. Abrir la página.
2. Presionar `F12`.
3. Activar el modo dispositivo móvil.
4. Elegir un teléfono.
5. Revisar la navbar.
6. Abrir el botón del menú lateral.
7. Entrar al dashboard y al checkout.
8. Activar el modo oscuro.
9. Confirmar que los textos se leen correctamente.

## 5. Advertencias que todavía pueden aparecer

Estas advertencias no impiden que la aplicación funcione:

### Browserslist desactualizado

Puede actualizarse con:

```powershell
cd C:\software-YESA\frontend
npx update-browserslist-db@latest
```

### Bundle grande

React informa que el archivo JavaScript final es grande. La aplicación sigue compilando, pero en el futuro se puede mejorar usando carga diferida y división de código.

### Advertencias de Node.js

Mensajes como `fs.F_OK is deprecated` indican que una dependencia utiliza una API antigua. No fue necesario cambiarla para completar esta implementación.

### Diferencias de mayúsculas en las rutas

Se recomienda utilizar siempre la misma escritura:

```text
C:\software-YESA
```

Evitar alternar con:

```text
C:\software-yesa
```

Esto reduce conflictos de ESLint y Webpack.

## 6. Resumen final

La implementación terminó con una compilación exitosa. Se mejoró la navegación en celulares, se conservaron las opciones dentro de un menú lateral y se corrigió la legibilidad del modo oscuro en dashboard y checkout.

La comprobación principal fue:

```text
Compiled successfully.
```
