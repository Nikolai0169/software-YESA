# Manual completo de implementacion y publicacion de YESA

## 1. Objetivo

Este manual explica, paso a paso y sin asumir conocimientos avanzados, como se preparo YESA para que pueda ser utilizado desde Internet en un servidor Windows Server 2022.

La direccion publica configurada es:

```text
http://184.72.139.211
```

La arquitectura final es:

```text
Usuario externo
      |
      | HTTP :80
      v
Gateway publico Node.js
      |-- entrega frontend React
      |-- /api y /uploads -> backend Node.js :5000
      v
Backend YESA + MySQL
```

El puerto `80` es el unico puerto que deben utilizar los usuarios. El backend permanece internamente en el puerto `5000`.

## 2. Estructura utilizada

En este proyecto se utilizaron estas carpetas:

- `frontend`: aplicacion React para navegador.
- `backend`: API Node.js con Express y conexion MySQL.
- `App`: aplicacion movil Expo. No participa en esta publicacion web.
- `deploy`: scripts y manuales de publicacion.

Nota: aunque existe una carpeta llamada `app_movil`, el `package.json` utilizado para la aplicacion Expo esta dentro de `App`.

## 3. Preparacion inicial realizada

### 3.1 Dependencias instaladas

Se instalaron las dependencias declaradas en los archivos `package.json`:

```powershell
Push-Location .\frontend; npm install; Pop-Location
Push-Location .\backend; npm install; Pop-Location
Push-Location .\App; npm install; Pop-Location
```

Para el frontend fue necesario hacer una reinstalacion limpia porque habia archivos internos incompletos en `node_modules`:

```powershell
Push-Location .\frontend
Remove-Item .\node_modules -Recurse -Force
npm ci
Pop-Location
```

Las advertencias de `npm audit` no impidieron la instalacion ni el arranque. Deben revisarse posteriormente antes de usar el sistema en produccion.

### 3.2 Base de datos

El backend necesita que exista la base de datos `yesa_db`. Se ejecuto el inicializador incluido en el proyecto:

```powershell
Push-Location .\backend
npm run init-db
Pop-Location
```

Este comando crea la base si no existe. No debe confundirse con borrar o reiniciar la base de datos.

### 3.3 Configuracion de MySQL

El archivo `backend/.env` contiene la conexion a MySQL. Antes de publicar, confirme estos valores:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=yesa_db
DB_USER=root
DB_PASSWORD=
```

En un servidor real se recomienda usar una contrasena para MySQL y no dejar la cuenta `root` sin contrasena.

## 4. Cambios realizados en archivos existentes

### 4.1 `backend/.env`

Se cambio el origen permitido del frontend:

```env
FRONTEND_URL=http://184.72.139.211
```

Antes apuntaba a `http://localhost:3000`, que solo funciona desde el propio servidor. Ahora el backend reconoce el origen utilizado por los navegadores externos.

### 4.2 `backend/server.js`

Se agrego `http://184.72.139.211` a la lista de origenes permitidos por CORS.

Tambien se agrego el metodo `OPTIONS` a la configuracion CORS. Los navegadores usan `OPTIONS` antes de solicitudes como login y registro cuando necesitan realizar una comprobacion previa, llamada preflight.

Sin estos cambios aparecia el error:

```text
CORS policy: origin not allowed
```

### 4.3 `backend/seeders/adminSeeder.js`

El backend ejecutaba el seeder completo cada vez que iniciaba. Cuando los datos ya existian, intentaba insertar subcategorias duplicadas y el servidor se cerraba antes de escuchar en el puerto `5000`.

Se agrego una comprobacion que cuenta las subcategorias existentes. Si ya hay datos, se omite el seeder completo y el backend continua arrancando.

Esto soluciono errores como:

```text
Duplicate entry 'Ceramica-1' for key 'nombre_categoria_unique'
```

## 5. Archivos creados

### 5.1 `deploy/proxy.js`

Es el gateway publico escrito en Node.js.

Sus funciones son:

- Escuchar en `0.0.0.0:80`.
- Entregar los archivos compilados de `frontend/build`.
- Enviar las rutas `/api` al backend `127.0.0.1:5000`.
- Enviar las rutas `/uploads` al backend `127.0.0.1:5000`.
- Devolver un error `502` si el backend no esta activo.
- Devolver un error `503` si aun no existe el build del frontend.

### 5.2 `deploy/publicar.ps1`

Es el script principal de publicacion para Windows Server 2022.

En orden, realiza estas acciones:

1. Localiza la raiz del proyecto.
2. Configura temporalmente la URL publica de la API:

   ```text
   http://184.72.139.211/api
   ```

3. Ejecuta `npm run build` dentro de `frontend`.
4. Comprueba si existe una regla de Firewall llamada `YESA HTTP 80`.
5. Si no existe, crea una regla que permite TCP entrante en el puerto `80`.
6. Inicia el backend con `npm start` en el puerto `5000`.
7. Inicia `proxy.js` en el puerto `80`.
8. Muestra la direccion publica para el administrador.

El script no instala dependencias. Las dependencias deben instalarse previamente con `npm install`.

### 5.3 `PUBLICAR_WINDOWS.md`

Es una guia corta con requisitos y comandos de ejecucion manual. Este archivo explica lo basico; el presente manual contiene el historial completo de implementacion.

## 6. Como ejecutar la publicacion

### Paso 1: iniciar MySQL

Inicie MySQL desde XAMPP o desde el servicio de Windows. Si MySQL no esta activo, el backend no podra conectarse.

### Paso 2: abrir PowerShell como administrador

Busque PowerShell, haga clic derecho y seleccione `Ejecutar como administrador`.

Esto es necesario para crear la regla del Firewall y utilizar el puerto `80`.

### Paso 3: entrar al proyecto

Cambie la ruta por la ubicacion real del proyecto:

```powershell
cd C:\ruta\software-YESA
```

En este equipo la ruta utilizada fue:

```powershell
cd C:\Users\Administrator\Documents\GitHub\software-YESA
```

### Paso 4: permitir el script durante esta sesion

Ejecute:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

Este cambio solo dura mientras la ventana de PowerShell permanezca abierta.

### Paso 5: ejecutar el publicador

Ejecute:

```powershell
.\deploy\publicar.ps1
```

Debe aparecer un mensaje similar a:

```text
YESA is available at http://184.72.139.211
```

### Paso 6: abrir el sistema

Desde un equipo externo, abra un navegador y escriba exactamente:

```text
http://184.72.139.211
```

No utilice `https` porque esta implementacion publica HTTP sin certificado SSL.

## 7. Comprobaciones realizadas

Durante la implementacion se verifico lo siguiente:

### 7.1 Build del frontend

Se ejecuto:

```powershell
$env:REACT_APP_API_URL='http://184.72.139.211/api'
Push-Location .\frontend
npm run build
Pop-Location
```

Resultado: compilacion exitosa y creacion de `frontend/build`.

### 7.2 Puerto 80

Se comprobo que el gateway escuchara en todas las interfaces:

```powershell
Get-NetTCPConnection -LocalPort 80 -State Listen
```

Resultado esperado:

```text
LocalAddress: 0.0.0.0
LocalPort: 80
State: Listen
```

### 7.3 Puerto 5000

Se comprobo que el backend escuchara internamente:

```powershell
Get-NetTCPConnection -LocalPort 5000 -State Listen
```

### 7.4 Respuesta del frontend

Se comprobo el gateway localmente:

```powershell
Invoke-WebRequest http://127.0.0.1/ -UseBasicParsing
```

Resultado obtenido: HTTP `200`.

### 7.5 CORS

Se envio una solicitud preflight de prueba:

```powershell
curl.exe -i -X OPTIONS http://127.0.0.1:5000/api/auth/login `
  -H "Origin: http://184.72.139.211" `
  -H "Access-Control-Request-Method: POST" `
  -H "Access-Control-Request-Headers: content-type"
```

Resultado obtenido: HTTP `204`, con estas cabeceras:

```text
Access-Control-Allow-Origin: http://184.72.139.211
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
```

Tambien se comprobo el mismo preflight pasando por el gateway del puerto `80`.

## 8. Firewall y AWS

El script crea la regla local de Windows:

```text
Nombre: YESA HTTP 80
Direccion: Inbound
Protocolo: TCP
Puerto local: 80
Accion: Allow
Perfil: Any
```

En AWS tambien debe existir una regla en el Security Group de la instancia:

```text
Type: HTTP
Protocol: TCP
Port: 80
Source: 0.0.0.0/0
```

Si falta esta regla, los usuarios externos pueden recibir `ERR_TIMED_OUT` aunque el servidor funcione localmente.

Tambien se debe verificar que:

- La IP `184.72.139.211` pertenezca a esta instancia.
- La Network ACL permita TCP `80` de entrada y salida.
- La instancia tenga salida de red.
- No exista otro firewall externo bloqueando el puerto.

## 9. Detener los servicios

El publicador inicia procesos Node separados. Para identificarlos:

```powershell
Get-Process node
```

Para detenerlos:

```powershell
Stop-Process -Name node
```

Advertencia: este comando detiene todos los procesos Node del servidor. No lo use si existen otras aplicaciones Node ejecutandose.

Para retirar la regla local del Firewall:

```powershell
Remove-NetFirewallRule -DisplayName 'YESA HTTP 80'
```

## 10. Problemas conocidos y soluciones

### `ERR_TIMED_OUT`

Revise primero el Security Group de AWS, la Network ACL y el Firewall de Windows. Desde el servidor se puede probar:

```powershell
Test-NetConnection 184.72.139.211 -Port 80
```

### `CORS policy: origin not allowed`

Confirme que:

- `backend/.env` tenga `FRONTEND_URL=http://184.72.139.211`.
- El backend haya sido reiniciado despues de cambiar `.env`.
- El frontend haya sido compilado nuevamente.
- Se este accediendo por `http://184.72.139.211`, sin cambiar el puerto.

### Respuesta `502 Backend unavailable`

El gateway esta activo, pero el backend no escucha en `5000`. Compruebe:

```powershell
Get-NetTCPConnection -LocalPort 5000 -State Listen
```

Luego revise la salida del backend. Si aparece un error de datos duplicados del seeder, confirme que `backend/seeders/adminSeeder.js` contiene la comprobacion de subcategorias existentes.

### Respuesta `503 Frontend build not found`

Ejecute nuevamente:

```powershell
Push-Location .\frontend
npm run build
Pop-Location
```

Luego reinicie el gateway.

## 11. Seguridad antes de produccion

Esta publicacion usa HTTP sin cifrado. Para una instalacion real se recomienda:

- Usar un dominio.
- Configurar HTTPS con certificado.
- Utilizar IIS/ARR o Nginx como reverse proxy de produccion.
- Cambiar `JWT_SECRET` por una clave aleatoria larga.
- Configurar una contrasena segura para MySQL.
- No publicar directamente el puerto `5000` en Internet.
- Revisar y corregir las vulnerabilidades reportadas por `npm audit`.
- No compartir el archivo `backend/.env`.
- Crear un servicio de Windows para que el backend y el gateway se reinicien automaticamente.

## 12. Resumen de la implementacion

Acciones completadas:

- Instalacion de dependencias en `frontend`, `backend` y `App`.
- Reinstalacion limpia de dependencias del frontend.
- Creacion y verificacion de la base `yesa_db`.
- Configuracion del origen publico para CORS.
- Soporte CORS para preflight `OPTIONS`.
- Correccion del seeder para evitar duplicados al reiniciar.
- Creacion del gateway `deploy/proxy.js`.
- Creacion del publicador `deploy/publicar.ps1`.
- Generacion del build de React.
- Creacion de la regla de Firewall para TCP `80`.
- Inicio del backend en `5000`.
- Inicio del gateway en `80`.
- Verificacion HTTP `200` del frontend.
- Verificacion HTTP `204` del preflight CORS.
- Confirmacion de que los puertos `80` y `5000` quedan activos.

Para repetir todo el proceso normalmente solo se necesita iniciar MySQL, abrir PowerShell como administrador y ejecutar:

```powershell
cd C:\ruta\software-YESA
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\deploy\publicar.ps1
```
