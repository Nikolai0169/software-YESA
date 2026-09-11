# Publicar YESA en Windows Server 2022

Este procedimiento publica el frontend y el backend mediante:

`http://184.72.139.211`

El gateway escucha en el puerto `80`, sirve el build de React y reenvia `/api` y `/uploads` al backend local en el puerto `5000`.

## Requisitos

- Windows Server 2022 con Node.js instalado y disponible como `node` y `npm`.
- MySQL/XAMPP iniciado.
- La base de datos configurada en `backend/.env`.
- Regla del router o proveedor cloud para permitir TCP `80` hacia este servidor.
- Ejecutar PowerShell como **Administrador**. El puerto 80 y la regla del Firewall lo requieren.

## Ejecucion manual

1. Abra PowerShell como Administrador.
2. Vaya a la carpeta del proyecto:

```powershell
cd C:\ruta\software-YESA
```

3. Si la politica de PowerShell bloquea scripts, permita scripts locales para la sesion:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

4. Ejecute el publicador:

```powershell
.\deploy\publicar.ps1
```

El script instala no instala paquetes: primero debe haber ejecutado `npm install` dentro de `frontend` y `backend`. Tambien genera `frontend/build` mediante `npm run build`.

5. Desde una red externa, abra:

```text
http://184.72.139.211
```

## Comprobaciones

En el servidor puede comprobar los puertos con:

```powershell
Get-NetTCPConnection -LocalPort 80,5000 -State Listen
```

Pruebe el gateway:

```powershell
Invoke-WebRequest http://127.0.0.1/ -UseBasicParsing
Invoke-WebRequest http://127.0.0.1/api -UseBasicParsing
```

Si el navegador externo no conecta, revise el Firewall de Windows, el Firewall del proveedor cloud y el NAT/router. El backend no debe exponerse directamente a Internet si el gateway ya publica `/api`.

## Detener la publicacion

Identifique los procesos Node y detengalos solo si no ejecutan otra aplicacion Node:

```powershell
Get-Process node
Stop-Process -Name node
```

Para quitar la regla de Firewall:

```powershell
Remove-NetFirewallRule -DisplayName 'YESA HTTP 80'
```

## Seguridad

Este script publica HTTP sin cifrado. Para produccion se recomienda usar un dominio, HTTPS con certificado y un reverse proxy de produccion (IIS/ARR o Nginx), ademas de cambiar `JWT_SECRET` y `DB_PASSWORD` en `backend/.env`.