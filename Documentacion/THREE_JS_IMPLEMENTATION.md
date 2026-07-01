# Implementación Three.js (Personalizacion3D)

Resumen corto
- Archivo principal: frontend/src/components/Personalizacion3D.jsx
- Objetivo: render 3D (taza / anillo) y componer texturas dinámicas (imagen + texto) mediante canvas.

Propiedades (props) principales
- `modelo`: "taza" | "anillo" (controla geometría y materiales)
- `texture`: URL de la textura aplicada (string)
- `textureOffset`: { x, y } (desplazamiento en píxeles aplicados al canvas de composición)
- `textureScale`: número (escala relativa de la imagen en el canvas; 1 = tamaño base)
- `overlayText`, `overlayTextFontFamily`, `overlayTextFontSize`, `overlayTextColor`: parámetros para texto sobre la textura
- `colorInterior`, `colorExterior`, `colorBase`, `colorAsa`: colores base de materiales
- `zoom`, `autoRotate`: controles de cámara/animación

Funciones clave y su comportamiento
- `createTextureCanvas(textureUrl, overlayText, fontFamily, fontSize, color, offset, scale, callback, backgroundColor)`
  - Crea un canvas cuadrado (2048x2048), dibuja la imagen con los parámetros `offset` y `scale`, después pinta `overlayText` centrado.
  - Offset se aplica en píxeles relativos al canvas: se calcula `scaledSize = size * scale` y `centerOffset = (size - scaledSize)/2`; luego `drawImage(image, centerOffset + offset.x, centerOffset + offset.y, scaledSize, scaledSize)`.
  - Devuelve un `THREE.CanvasTexture` vía callback.

- `createTextSprite(text, fontFamily, fontSize, color)`
  - Genera una textura de texto con canvas (2048x512) y la envuelve en `THREE.CanvasTexture` para crear `THREE.Sprite`.
  - Usado para anillos donde el texto se renderiza como sprites en posiciones específicas.

- `updateExteriorTexture()`
  - Orquesta la creación del canvas-texture llamando a `createTextureCanvas` y asigna el `map` del material exterior.
  - Maneja la liberación/dispose de texturas previas para evitar fugas de memoria.

- `updateRingTextSprites()` / `addTextSprite()`
  - Para modelo `anillo` crea sprites con texto en posiciones y escalas heurísticas.

Consideraciones de rendimiento
- Se limita `devicePixelRatio` entre 1 y 2 para evitar render costoso en pantallas muy densas.
- Texturas generadas desde canvas se configuran con `LinearFilter` y `ClampToEdgeWrapping`.
- Dispose manual de texturas viejas (`texture.dispose()`) para liberar GPU.

Guardado / serialización (esquema esperado en `Diseño` / `Cotizacion`)
- Al guardar o cotizar incluir:
  - `textureUrl`: URL de la imagen original
  - `textureOffsetX`, `textureOffsetY`: offsets individuales (píxeles)
  - `textureScale`: número
  - `overlayText`, `overlayTextFontSize`, `overlayTextFontFamily`, `overlayTextColor`

Ejemplo JSON (item dentro de `cotizacion.items`):
{
  "productoId": 123,
  "textureUrl": "uploads/miTextura.jpg",
  "textureOffset": { "x": 12, "y": -8 },
  "textureOffsetX": 12,
  "textureOffsetY": -8,
  "textureScale": 1.2,
  "overlayText": "Hola\nMundo",
  "overlayTextFontFamily": "Montserrat",
  "overlayTextFontSize": 28,
  "overlayTextColor": "#ffffff"
}

Depuración y problemas comunes
- CORS: las imágenes cargadas en `Image()` deben servirse con cabeceras CORS (`Access-Control-Allow-Origin: *`) para que `canvas` pueda leerlas y generar textura.
- `crossOrigin = "anonymous"` se usa antes de asignar `image.src`.
- Si la imagen no carga, el código realiza fallback y genera solo el texto o fondo.
- En mobile/Expo: las URLs deben apuntar al host accesible desde el dispositivo (no usar `localhost` en device físico). Ver `app_movil/src/utils/constants.js` para resolución automática de `API_BASE_URL`.

Dónde tocar para extender
- Añadir soporte para rotación/tiling de texturas: modificar `createTextureCanvas` para repetir `drawImage` o usar `pattern`.
- Soporte para máscaras/alfa: componer en canvas con `globalCompositeOperation` antes de crear la textura.
- Guardado de vista previa: usar `canvas.toDataURL()` antes de convertir a `CanvasTexture` para persistir imagen compuesta.

Referencias en código
- Componente React: [frontend/src/components/Personalizacion3D.jsx](frontend/src/components/Personalizacion3D.jsx#L1)
- Punto de salvado / cotización: [frontend/src/pages/personalizacion.js](frontend/src/pages/personalizacion.js#L1)

Notas finales
- Mantener la normalización de datos entre frontend y backend: si en DB existen `textureOffsetX/Y`, también almacenar `textureOffset` como objeto para compatibilidad.
- Evitar textos muy grandes en canvas (se escala con límites en la implementación) para prevenir overflow en GPU.

