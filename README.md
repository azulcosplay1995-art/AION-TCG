# AION TCG

Juego de cartas coleccionables (TCG) **en un solo archivo HTML**, sin servidor, sin
dependencias y sin build pesado. Combate estilo Hearthstone/Shadowverse y un modo
**Campaña ramificada estilo Slay the Spire** ("Los Fragmentos de Kaelen"). Todo en español.

## Jugar
Abre **`AION TCG.html`** en cualquier navegador moderno. Eso es todo.

## Estructura del repositorio
```
AION TCG.html          ← juego jugable (GENERADO; no editar a mano)
aionsim3.js            ← simulador headless IA-vs-IA (regresión + métricas de balance)
aion-src/              ← CÓDIGO FUENTE editable (se ensambla en el HTML)
  ├─ README.md         ← arranque rápido
  ├─ ARCHITECTURE.md   ← guía técnica completa (EMPIEZA AQUÍ)
  ├─ HANDOFF-FABLE5.md ← notas para continuar el proyecto
  ├─ CARDS-IMPLEMENTED.md ← las 229 cartas tal como están en el código
  ├─ assemble.js       ← une js/*.js dentro de shell.html → ../AION TCG.html
  ├─ shell.html        ← markup + CSS (con placeholder para el JS)
  └─ js/               ← 01-preamble … 09-campaign-map (se cargan en orden alfabético)
design/                ← listado maestro de diseño (fuente de verdad de reglas)
  ├─ MAESTRO-2.1.md
  └─ aion-2.1-master.json
```

## Desarrollar
**No edites `AION TCG.html` a mano.** Edita `aion-src/` y regénéralo:
```bash
cd aion-src && node assemble.js        # reconstruye el HTML (valida sintaxis)
node aionsim3.js 150                    # regresión motor+IA (desde la raíz del repo)
```
Solo necesitas Node (sin `npm install`). Detalle completo en `aion-src/ARCHITECTURE.md`.

## Estado
Set 1.0 · 229 cartas · 7 facciones · tutorial interactivo, constructor, sobres, catálogo,
glosario, ajustes y campaña. Ver `aion-src/HANDOFF-FABLE5.md` para próximos pasos.

## Licencia
Proyecto con **licenciamiento doble**:

- **Código** (`aion-src/`, `aionsim3.js`, `AION TCG.html`): **AGPL-3.0-or-later** — ver
  [`LICENSE`](LICENSE). Quien lo use o modifique (incluido como servicio
  web) debe publicar su versión bajo la misma licencia y dar atribución.
- **Contenido creativo** (cartas, lore, diseño, listas en `design/`):
  **CC BY-NC 4.0** — ver [`LICENSE-CONTENT.md`](LICENSE-CONTENT.md). Uso no comercial con atribución.

© 2026 Andrés Azul.
Para el texto íntegro de la AGPL-3.0, ver la nota dentro de [`LICENSE`](LICENSE).
