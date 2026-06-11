# AION TCG — Guía de Arquitectura y Handoff

> Documento para quien continúe el proyecto (humano o modelo). Explica cómo está
> construido el juego, dónde vive cada cosa, el modelo de datos, y cómo extenderlo
> con seguridad. **Léelo antes de tocar código.**

---

## 1. Qué es esto

AION TCG es un juego de cartas coleccionables (estilo Hearthstone / Shadowverse /
Slay the Spire para el modo campaña), **en un único archivo HTML** que corre en el
navegador sin servidor, sin build y sin dependencias externas. Todo el texto de
interfaz está en **español**.

- **Entregable final**: `output/AION TCG.html` — un solo archivo, autocontenido.
  **NUNCA se edita a mano**: se genera con el ensamblador (ver §3).
- **Fuente real (lo que SÍ se edita)**: la carpeta `output/aion-src/`.

---

## 2. Mapa de archivos

```
output/
├─ AION TCG.html            ← ENTREGABLE generado (no editar a mano)
└─ aion-src/                ← FUENTE editable (se respalda en OneDrive)
   ├─ shell.html            ← markup + TODO el CSS, con el placeholder /*__AION_APP_JS__*/
   ├─ assemble.js           ← ensamblador: une js/*.js dentro de shell.html → ../AION TCG.html
   ├─ _snapshot_AION_TCG.html ← copia de emergencia del último build bueno
   ├─ ARCHITECTURE.md       ← este documento
   └─ js/                   ← módulos del juego (se concatenan en orden ALFABÉTICO)
      ├─ 01-preamble.js     ← constantes (KW, FAC), audio (SFX/MUSIC), partículas (FX)
      ├─ 02-cards.js        ← const CARDS={...}  (solo DATOS de cartas)
      ├─ 03-setup.js        ← tokens, dificultad, navegación, constructor, sobres, mazos prearmados
      ├─ 04-engine.js       ← MOTOR: estado G, zonas, jugar/combate, applyEffect (núcleo de reglas)
      ├─ 05-ai.js           ← objeto AI (cerebro compartido juego+simulador)
      ├─ 06-render-ui.js    ← render del tablero, menús, objetivos, pantalla de fin
      ├─ 07-campaign.js     ← helpers de campaña compartidos (economía, editor, victoria)
      ├─ 08-qol.js          ← calidad de vida (fin, log, glosario, slots, ajustes, atajos)
      └─ 09-campaign-map.js ← campaña ACTIVA ramificada (nodos, reliquias, eventos, mapa)

(en la raíz del workspace)
└─ aionsim3.js              ← simulador headless IA-vs-IA (regresión + métricas de balance)
```

Cada módulo `js/*.js` empieza con una cabecera-comentario `/* MODULO: ... */` que
resume su rol.

---

## 3. Flujo de build (el ensamblador)

No hay Vite/webpack/npm (restricción de entorno: no se puede instalar nada). En su
lugar, `assemble.js`:

1. Lee `shell.html`.
2. Lee todos los `js/*.js` **en orden alfabético** y los concatena con `''` (sin
   separador). **El orden alfabético = orden de carga**, por eso los prefijos
   numéricos `01-`..`09-` importan.
3. Valida el JS concatenado con `new Function(js)` (falla ruidosamente si hay error
   de sintaxis).
4. Sustituye el placeholder `/*__AION_APP_JS__*/` dentro de `shell.html` por el JS.
5. Escribe `../AION TCG.html` (con reintentos: el FS del entorno a veces lanza EIO).

**Comando**: desde `output/aion-src/` → `node assemble.js`

### Ciclo de trabajo recomendado (y obligado por la fragilidad del FS)
```
1. Editar js/*.js o shell.html
2. cd output/aion-src && node assemble.js          # reconstruye y valida sintaxis
3. cd /mnt/workspace && node aionsim3.js 120        # regresión (no debe lanzar; partidas terminan)
4. node -e "...new Function(js)..."                 # (assemble ya valida, opcional)
5. cp "output/AION TCG.html" output/aion-src/_snapshot_AION_TCG.html   # snapshot del build bueno
```
- **Nunca uses `mv` sobre el entregable** (corrupción EIO histórica). Copia y verifica.
- `writeFileSync` puede lanzar EIO de forma transitoria: usa bucles de reintento
  (ver `assemble.js` y el patrón `writeRetry`).

---

## 4. Modelo de datos

### 4.1 Esquema de una carta (`CARDS` en `02-cards.js`)

`CARDS` es un objeto `{ claveCarta: definición }`. Campos de una definición:

| Campo | Tipo | Significado |
|-------|------|-------------|
| `name` | string | Nombre mostrado |
| `fac` | `solaris\|neon\|gaia\|forja\|conclave\|vacio\|neutral` | Facción (ver `FAC` en 01) |
| `art` | emoji | Ilustración |
| `type` | `entidad\|directiva\|ancla\|token` | Tipo de carta |
| `pos` | `front\|support\|flex\|na` | Zona donde se coloca (`na` = Directiva) |
| `cost` | number | Coste en Aether |
| `rar` | `C\|PC\|R\|E\|L\|P\|T` | Rareza (T=token). L/E/P llevan foil holográfico |
| `pow/hp/sync` | number | Poder / Vida / Sincronía (PA al Estabilizar) — solo entidades |
| `kw` | string[] | Palabras clave (ver `KW` en 01: baluarte, impulso, aereo, impacto, mutar, glitch, ascension) |
| `text` | string | Texto de reglas legible (lo que ve el jugador) |

**Disparadores / efectos** (opcionales, según la carta):
| Campo | Cuándo dispara |
|-------|----------------|
| `entrada` | Al entrar al tablero (efecto `{t:...}`) |
| `onStab` | Al Estabilizar la entidad |
| `onKill` | Al destruir otra entidad en combate |
| `onAscend` | Al ascender a Lado B |
| `onDeath`/`onSurvive`/`onAllyHeal`/... | Hooks de evento (ver bus de eventos en 04) |
| `effect` | Efecto principal de una Directiva |
| `activa` | Habilidad activable de una Entidad/Ancla (cuesta agotar/tap) |
| `tlb` | "Timeline Bonus": `{cond:{k,v}, eff:{t:...}}` — bonus si se cumple condición |
| `asc`/`ascN`/`sideB` | Condición de Ascensión (`victoria\|resistencia\|dominio`) y cara B |
| `atkBonus`/`postSelfDmg`/... | Modificadores de combate específicos |

Un **efecto** es siempre un objeto `{t:'<tipo>', ...params}`. El tipo compuesto
`{t:'multi', list:[...]}` aplica varios en orden.

### 4.2 Estado de juego (`04-engine.js`)
- `G` — objeto global de la partida: `{turn, active, first, player, ai, over, campaign, tut, ...}`.
- `PS(side)` — devuelve el estado del jugador (`side` = `'player'` | `'ai'`).
- Estructura de un jugador (`mkPlayer()`): `{pa, deck[], hand[], front[3], support[3],
  timeline[], charged, void[], exile[], ...}`.
- **Zonas**: `front` (frente) y `support` (soporte), 3 ranuras cada una; `timeline`
  (motor de Aether); `void` (cementerio); `exile`.
- Meta de victoria: **20 Puntos AION (PA)**.

### 4.3 Motor de efectos (`applyEffect` en `04-engine.js`)
- `applyEffect(eff, p, source, done, fa)` — gran `switch(eff.t)` con **~130 tipos**.
- Los tipos cubren: daño, sanación, buffs, robo, mill (a Vacío), glitch, mover,
  reanimar, exiliar, tokens, peek/filtrado, escalados por Vacío, riders condicionales,
  y todos los `tlb*` (Timeline Bonus). Lista completa: busca `case '` en 04-engine.js.
- **Scopes de objetivo** (a quién apunta un efecto): `enemyEntity`, `enemyTapped`,
  `ally`, `allyOther`, `allyMarked`, `allyFac:<f>`, `allyFacOther:<f>`, `enemyAncla`,
  etc. `targetList(scope, side, source)` resuelve la lista de objetivos válidos.
  (Un efecto sin objetivos válidos hace "fizzle" — el simulador mide esto.)

### 4.4 Cerebro de IA (`05-ai.js`)
- `const AI = {...}` — **funciones puras y síncronas** que NO tocan UI ni timers.
  Las usan TANTO el juego (en 04/06) COMO el simulador (`aionsim3.js`), por eso la
  sim mide exactamente la IA que enfrenta el jugador.
- Métodos clave: `archetype`, `facCount`, `drawValue`, `glitchScore`, `scoreCard`
  (puntúa qué carta jugar), `chargePick` (qué carga al Timeline), `attackWorth`,
  `abilityPriority`, `peekKeep` (filtrado de mazo), `mutarScore`, `forjaSetup`
  (combos de Forja), `frontPlan` (atacar/estabilizar).
- **DIFF** (`'easy'|'normal'|'hard'`) gradúa la heurística. Persiste en localStorage.

### 4.5 Campaña — ⚠️ IMPORTANTE
Hubo DOS sistemas de campaña. **El lineal (Fase A) fue retirado**; la campaña
**ACTIVA es la ramificada** en `09-campaign-map.js`:
- Estado `CAMP = {cur, pending[], visited{}, crystals, deck, collection, relics[], done}`.
- Nodos `CAMP_NODES2` (mapa ramificado por filas, con `next[]`).
- Reliquias `RELICS` (objeto id→{name, ic, desc}).
- `07-campaign.js` conserva SOLO los helpers que 09 reutiliza (economía, editor de
  mazo, briefing, victoria). Las definiciones homónimas vivas están en 09.

---

## 5. El simulador (`aionsim3.js`)

Carga el `<script>` del HTML en un VM de Node con un **stub de DOM**, aplica unas
transformaciones de string (`rep(...)`) para auto-resolver UI/asíncronía (objetivos,
reacciones, peek, mutar, descartes), y corre N partidas IA-vs-IA.

- **Uso**: `node aionsim3.js [nº partidas]` (p.ej. `node aionsim3.js 120`).
- **Doble propósito**:
  1. **Regresión**: si el JS rompe, el VM lanza al cargar; si las reglas rompen, las
     partidas no terminan. 120–150 partidas sin error = motor sano.
  2. **Balance**: imprime ~20 métricas (win-rate por carta/facción, fizzle, duración,
     curva, candidatas a nerf/buff). Escribe `output/aion-2.1-metricas.txt`.
- **Límite**: NO ejercita la campaña (solo partidas sueltas). Para validar campaña,
  usa un smoke en VM que llame a `campNew/openCampaign/renderCampaign` sin lanzar.

---

## 6. Cómo extender (recetas)

### Añadir una carta
1. Añade una entrada a `CARDS` en `02-cards.js` con su esquema (§4.1). Reusa un
   `t:` de efecto existente si puedes.
2. Si necesitas un efecto nuevo, añade un `case` en el `switch` de `applyEffect`
   (04-engine.js) y, si la IA debe valorarlo, ajusta `AI.scoreCard` (05-ai.js).
3. `node assemble.js` → `node aionsim3.js 120` → revisa que la carta aparezca y no
   rompa nada → actualiza el snapshot.

### Añadir una palabra clave
1. Regístrala en `KW` (01-preamble.js) con nombre y descripción.
2. Impleméntala donde aplique (combate en 04, render del chip en 06).
3. Añádela al glosario (`GLOSS` en 08-qol.js) y a los filtros del constructor/catálogo
   (selects en shell.html).

### Tocar balance
- No cambies números a ojo: corre `aionsim3.js` con 2000–4000 partidas, mira las
  candidatas a nerf/buff y el fizzle por facción, ajusta, re-simula.

---

## 7. Gotchas (trampas conocidas)

- **El orden de carga es alfabético** (prefijos `01-`..`09-`). Si añades un módulo,
  nómbralo para que caiga en el lugar correcto.
- **Hoisting/sobrescritura**: una `function foo(){}` declarada en un módulo posterior
  SOBRESCRIBE a otra homónima anterior (gana la última). Esto se usó a propósito en
  la evolución por fases; el código muerto duplicado **ya se limpió**, pero si ves
  dos definiciones del mismo nombre, la viva es la del módulo de mayor número.
- **FS frágil (EIO)**: escribe con reintentos; nunca `mv` el entregable; copia+verifica.
- **No hay red ni instalaciones** en el entorno de desarrollo ni en el PC del usuario.
- **No puedo verificar visualmente** (sin navegador en el entorno): tras cambios de
  CSS/UI, pide al usuario que lo pruebe en el navegador.
- El `#fx` canvas tiene una capa de partículas `FX` (01) y además `winConfetti`
  (06) dibuja confeti directamente sobre él en la victoria.

---

## 8. Estado actual

- Set 2.1, ~221 cartas, 7 facciones. Motor de efectos, reacciones, ascensión,
  Timeline/Aether, Glitch, Vacío, etc. implementados 1:1 con el listado maestro.
- Modos: Partida Rápida, Tutorial interactivo (con spotlight, consejo de mulligan y
  de qué carta jugar), Constructor, Sobres, Catálogo, Glosario, Ajustes, y Campaña
  ramificada "Los Fragmentos de Kaelen".
- Pulido visual completado (frames por rareza/tipo, juice de combate, afordancias,
  mapa de campaña con espina+reliquias, pantallas de fin con confeti/barra de PA,
  responsive y accesibilidad).
- Pendiente conocido / ideas: arrastrar-para-jugar (drag&drop) quedó aplazado para el
  final.
