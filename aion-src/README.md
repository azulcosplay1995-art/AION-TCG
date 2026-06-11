# AION TCG — Arranque rápido

Juego de cartas en **un solo archivo HTML**, sin servidor ni build. Todo en español.

## Para jugar
Abre **`output/AION TCG.html`** en cualquier navegador moderno. No necesita nada más.

## Para desarrollar
**Nunca edites `AION TCG.html` a mano.** Se genera a partir de esta carpeta (`output/aion-src/`):

```bash
# 1) editar shell.html (markup + CSS) o js/*.js (lógica)
# 2) reconstruir el HTML (valida la sintaxis JS automáticamente):
cd output/aion-src && node assemble.js
# 3) regresión motor+IA (debe terminar sin errores; imprime métricas de balance):
cd /mnt/workspace && node aionsim3.js 150
# 4) guardar el build bueno como respaldo:
cp "output/AION TCG.html" output/aion-src/_snapshot_AION_TCG.html
```

Los módulos `js/*.js` se concatenan en **orden alfabético** (= orden de carga), por eso
los prefijos numéricos importan. Esta carpeta vive en OneDrive, así que **es el backup**:
si el HTML se corrompe, `node assemble.js` lo reconstruye; `_snapshot_AION_TCG.html` es
una copia íntegra adicional.

## Documentos clave (léelos en este orden)
1. **`ARCHITECTURE.md`** — cómo está construido todo: build, módulos, modelo de datos,
   motor de efectos, IA, campaña, simulador, recetas para extender y trampas conocidas.
   **Empieza aquí.**
2. **`HANDOFF-FABLE5.md`** — guía para el siguiente modelo: cómo subir el proyecto, cómo
   trabajar con él, objetivos/diseño del juego y próximos pasos sugeridos.
3. **`CARDS-IMPLEMENTED.md`** — las 229 cartas tal como están en el código, para contrastar
   1:1 con el listado maestro de diseño (`output/AION TCG  MAESTRO AION CORE SET 2.1 (editado).md`).

## Mapa de `js/`
`01-preamble` constantes/audio/partículas · `02-cards` datos de cartas · `03-setup`
navegación/constructor/sobres · `04-engine` motor+efectos · `05-ai` IA · `06-render-ui`
tablero+pantalla de fin · `07-campaign` helpers de campaña · `08-qol` calidad de vida ·
`09-campaign-map` campaña ramificada activa.
