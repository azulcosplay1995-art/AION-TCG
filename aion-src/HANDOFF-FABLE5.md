# Handoff a Claude Fable 5 — AION TCG

> Notas para el siguiente modelo (o persona) que continúe AION TCG. Escrito por el
> modelo anterior (Opus). Léelo junto con `ARCHITECTURE.md` (la verdad técnica) y
> `README.md` (arranque rápido).

---

## 0. TL;DR

AION TCG es un juego de cartas completo y jugable, en **un solo HTML**, ensamblado
desde `output/aion-src/`. Motor de reglas, IA, 229 cartas, tutorial interactivo,
constructor, sobres, catálogo y una **campaña ramificada estilo Slay the Spire**. Lo
que queda es pulir/extender, no reconstruir. La regla de oro: **no se edita
`AION TCG.html` a mano; se regenera con `node assemble.js`**.

---

## 1. Cómo subir el proyecto a Claude Fable 5

Según el anuncio de Anthropic (jun 2026), Fable 5 está disponible en claude.ai (web/app),
en Claude Code y vía API (`claude-fable-5`), además de marketplaces y Microsoft Foundry.
Tres formas, de menor a mayor potencia:

1. **Solo jugar / QA visual rápido**: sube **`AION TCG.html`** a una conversación de
   claude.ai. Fable 5 tiene visión fuerte y puede abrir/leer el archivo, razonar sobre la
   UI y sugerir cambios. Suficiente para revisiones puntuales.
2. **Desarrollo conversacional**: sube **toda la carpeta `aion-src/`** (o un zip). Pídele
   que lea primero `ARCHITECTURE.md`. Trabajará sobre los módulos y te devolverá diffs;
   tú reensamblas con `node assemble.js`.
3. **Desarrollo autónomo (recomendado para tareas grandes)**: ábrelo en **Claude Code**
   apuntando a la carpeta del proyecto. Fable 5 está hecho para correr en arneses de
   agente y sostener tareas largas (planificar, delegar en subagentes, probar su propio
   trabajo). Aquí es donde más rinde.

> Nota de acceso/costo (cobertura de prensa, jun 2026): Fable 5 es de los modelos más
> caros y **consume tokens muy rápido** (cuenta doble contra los límites de suscripción
> frente a Opus 4.8). Para este proyecto, ver §3.

---

## 2. Qué puede hacer Fable 5 que el modelo anterior NO pudo

Esto es lo más valioso del handoff. Limitaciones de mi entorno (Opus) que Fable 5
debería superar:

- **QA visual real del juego.** Yo NO tuve navegador: validé con regresión por simulación
  y con `new Function` (sintaxis), pero **nunca pude *ver* la UI**. Fable 5 tiene visión
  estado del arte (reconstruye apps desde capturas, verifica su salida contra el objetivo).
  → **Pídele que abra `AION TCG.html`, tome capturas y revise**: alineación del tablero,
  mapa de campaña (espina + nodos + bandeja de reliquias), pantallas de victoria/derrota
  (confeti, barra de PA), tutorial con spotlight, y el responsive en anchos de móvil/tablet.
  Hay varias cosas de la Fase 5/6 que solo se pueden confirmar viéndolas.
- **Jugar y balancear de verdad.** La prensa destaca que Fable 5, con memoria en archivos,
  **jugó Slay the Spire mejor que modelos previos** y completó juegos solo con visión. AION
  tiene precisamente una campaña tipo roguelite: Fable 5 puede *jugarla*, detectar
  fricciones de UX reales y proponer ajustes de dificultad/balance con criterio.
- **Sesiones autónomas largas.** Migraciones y refactors grandes de una sentada (con
  auto-tests). Bueno para, p. ej., un pase de tipado/validación o el drag&drop aplazado.

---

## 3. Cómo trabajar bien con Fable 5 en ESTE proyecto

- **Aprovecha que ya está modularizado.** Da tareas **acotadas a un módulo** (“ajusta el
  combate en `04-engine.js`”, “rediseña el mapa en `09-campaign-map.js`”) en vez de cargar
  todo el motor. Reduce tokens y errores.
- **Caché de prompts.** Fable 5 mantiene el descuento del 90% en tokens de entrada
  cacheados. Si vas a iterar, mantén estable el contexto base (este doc + `ARCHITECTURE.md`
  + el módulo en foco) para pagar la lectura una sola vez.
- **Vigila el gasto.** Quema tokens rápido; cierra el ciclo *editar → `node assemble.js` →
  `node aionsim3.js` → snapshot* y pídele que NO relea archivos enteros sin necesidad.
- **Déjale verificar su trabajo.** Rinde mejor cuando se le pide “prueba y valida tú mismo”:
  reensamblar, correr la simulación de regresión y, ahora sí, **revisar capturas**.
- **Salvaguardas.** Fable 5 desvía a Opus 4.8 temas de ciberseguridad/biología/química;
  irrelevante para un juego de cartas, pero si algún efecto se llama “toxina/exploit” y el
  modelo se pone raro, es por eso.

---

## 4. Objetivos y diseño del juego (lo que hay que respetar)

- **Meta de partida:** ser el primero en llegar a **20 Puntos AION (PA)**. Se gana PA
  sobre todo **Estabilizando** entidades (su valor SYNC) y con remates (Impacto, etc.).
- **Recurso:** **Aether**, generado por el **Timeline** (cada carta enviada ahí da +1
  Aether/turno, permanente). Tensión central: ¿gasto cartas como recurso o como jugada?
- **Tablero:** dos filas por jugador — **Frente** (combate) y **Soporte** (3 ranuras c/u).
- **Tipos:** Entidad (combatiente), Directiva (efecto de un uso), Ancla (estructura), Token.
- **7 facciones con identidad clara** (mantenerla al diseñar cartas nuevas):
  Solaris = muros Baluarte + sanación · Neón = Glitch/agresión/tempo · Gaia = Mutar/tokens
  flexibles · Forja = auto-daño con payoff · Cónclave = control/filtrado de mazo · Vacío =
  mill/valor desde el cementerio · Neutral = pegamento.
- **Palabras clave** (def en `KW`, 01-preamble): ascension, impulso, baluarte, aereo,
  impacto, mutar, glitch, sanar. No inventar keywords sin registrarlas en KW + glosario.
- **Campaña “Los Fragmentos de Kaelen”** (lore): Kaelen fragmentó la línea temporal; Nara
  es el ancla; el jefe final es **Xul-Than, la Estrella Muerta**. Mapa ramificado con
  combates, élites, eventos, mercado (Cristales) y reliquias.
- **Tono visual buscado:** Hearthstone/Shadowverse en combate, Slay the Spire en campaña.

---

## 5. Listas de cartas y verificación 1:1

- **Diseño (la fuente de verdad de reglas):** `output/AION TCG  MAESTRO AION CORE SET 2.1 (editado).md`
  (y `output/aion-2.1-master.json`). Si el código y el maestro discrepan, **manda el maestro**.
- **Implementado (lo que está en el código HOY):** `CARDS-IMPLEMENTED.md` (229 cartas,
  generado desde `js/02-cards.js`).
- **Tarea sugerida para Fable 5:** *diff 1:1* entre ambos — stats, coste, keywords y, sobre
  todo, que el **texto** de cada carta coincida con su **efecto real** (`02-cards.js` +
  el `case` correspondiente en `04-engine.js`). Ya se hizo una auditoría histórica, pero
  un repaso fresco con un modelo más capaz puede cazar matices.

---

## 6. Próximos pasos sugeridos (en orden de valor)

1. **Pase de QA visual** (solo posible con visión): abrir el juego, capturar y corregir lo
   que se vea mal en Fases 5/6 (mapa, fin de partida, tutorial, responsive). *Esto quedó
   sin verificar por falta de navegador en mi entorno.*
2. **Jugar la campaña** de principio a fin y ajustar curva de dificultad/economía con base
   en la experiencia real (no solo simulación).
3. **Re-simular balance** con volumen alto: `node aionsim3.js 4000` → leer
   `output/aion-2.1-metricas.txt` → proponer nerfs/buffs (presentar antes de aplicar).
4. **Drag & drop** para jugar/atacar (se aplazó a propósito “para el final”).
5. Diff 1:1 cartas (ver §5).

---

## 7. Reglas duras (no romper)

- **No editar `AION TCG.html` a mano.** Editar `aion-src/` y `node assemble.js`.
- **Orden de carga = alfabético** de `js/*.js`. Si añades módulo, nómbralo para que caiga
  en su sitio.
- **Hoisting:** si ves dos `function foo(){}`, **gana la del módulo de mayor número**. El
  código muerto duplicado ya se limpió (20 definiciones); no lo reintroduzcas.
- **FS frágil (EIO):** escribe con reintentos; **nunca `mv`** el entregable; copia y verifica.
- **Sin red ni instalaciones** en el entorno (ni `npm`, ni `pip`). Solo Node nativo.
- **Verifica siempre:** `node assemble.js` (sintaxis) + `node aionsim3.js 150` (reglas) +
  ahora también **revisión visual por capturas**. Actualiza el snapshot tras cada build bueno.

Todo el detalle técnico está en **`ARCHITECTURE.md`**. ¡Suerte, Fable 5!
