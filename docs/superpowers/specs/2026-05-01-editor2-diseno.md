# Diseño: Editor de texto libre + Index de formatos

**Fecha:** 2026-05-01

## Contexto

El proyecto ya tiene un editor (`editor.html`) para el formato "split B&W + color" (dos frases, mitad superior en escala de grises, mitad inferior a color). Se agrega un segundo formato y un index para elegir entre ambos.

## Archivos a crear / modificar

| Archivo | Acción | Descripción |
|---|---|---|
| `index.html` | Crear | Selector de formato con 2 cards |
| `editor2.html` | Crear | Editor de texto libre |

`editor.html`, `canvas.js`, `ui.js`, `data.js`, `styles.css` no se tocan. Los nuevos HTML embedean sus estilos y fuentes inline como el resto del proyecto.

---

## index.html

Página de entrada. Muestra dos cards lado a lado (o apiladas en mobile), cada una con:
- Preview visual del formato en proporción 4:5
- Nombre del formato
- Botón que abre el editor correspondiente

**Cards:**
1. **Split B&W + Color** → abre `editor.html`
2. **Texto libre** → abre `editor2.html`

Sin navegación adicional. Diseño consistente con el resto del proyecto (fondo negro, tipografía Josefin Sans, acento dorado `#c8a96e`).

Las fuentes van embebidas como base64 igual que en el resto de los HTML, para que funcione sin servidor.

---

## editor2.html — Editor de texto libre

### Layout

Mismo layout que `editor.html`: canvas a la izquierda, panel de controles a la derecha. En mobile se apilan.

### Panel de controles

**1. Fondo**
- Toggle: `Foto` / `Color`
- Si `Foto`: zona de upload (drag & drop o click), igual al editor actual
- Si `Color`: color picker nativo (`<input type="color">`), default `#0a0a0a`

**2. Texto**
- `<textarea>` para la frase principal
- Wrapping automático en el canvas (máx ~3 líneas, mismo algoritmo que `canvas.js`)
- Placeholder: `"Tu mensaje aquí…"`

**3. Posición del bloque de texto**
- Grilla 3×3 de botones clickeables (9 puntos)
- Cada botón representa una combinación vertical (arriba/medio/abajo) × horizontal (izq/centro/der)
- Default: centro/centro
- Al hacer click se re-renderiza el canvas en tiempo real

**4. Alineación del texto**
- 3 botones: `⬅ Izq` / `↔ Centro` / `➡ Der`
- Default: centro
- Controla el `textAlign` del canvas independientemente de la posición del bloque

**5. Firma (opcional)**
- Checkbox `Agregar firma`
- Si activo: campo de texto, default `"— Barbero"`
- Se renderiza debajo de la frase principal, en menor tamaño y peso 300

**6. Descargar**
- Botón `↓ Descargar JPG (1080 × 1350)`
- Mismo mecanismo que el editor actual (`triggerDownload` + canvas offscreen)
- Deshabilitado si no hay texto

### Canvas / Renderizado

- Preview: canvas `405 × 506` px (igual al editor actual)
- Export: canvas offscreen `1080 × 1350` px
- Fondo: imagen cargada (crop center, igual a `drawHalf`) o color sólido
- Overlay de gradiente suave (rgba 0,0,0 ~0.3) cuando hay foto, para legibilidad del texto
- Texto: Josefin Sans 700, color blanco, tamaño dinámico via `getFontSize` escalado a `W/405`
- Firma: Josefin Sans 300 italic, 70% del tamaño del texto principal, separada por un espaciado de `fontSize * 0.8`
- Posición del bloque: calculada como porcentaje del canvas (top: 10%/50%/80%, left: 10%/50%/85%) con ajuste por `textAlign`

### Estado vacío

Mientras no hay texto: canvas muestra un estado vacío con ícono y label "Escribí tu frase", igual al editor actual.

### Self-contained

`editor2.html` embebe fuentes como base64 y toda la lógica JS inline (sin dependencias externas), igual que el resto de los HTML del proyecto.

---

## Consideraciones técnicas

- `getFontSize` y `wrapText` de `canvas.js` se replican inline en `editor2.html` (no se carga externamente)
- El color picker y el upload de foto son mutuamente excluyentes; al cambiar de modo se limpia el canvas
- La grilla 3×3 de posición es un `<div>` con 9 botones, estilizados como puntos, sin librerías
- Todo el JS es vanilla, sin frameworks
