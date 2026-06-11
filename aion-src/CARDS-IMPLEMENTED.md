# AION TCG — Lista de cartas IMPLEMENTADAS (generada desde el código)

> Volcado automático de `const CARDS` en `js/02-cards.js` — es lo que el juego
> tiene cargado HOY. Sirve para contrastar 1:1 contra el listado maestro de
> diseño (`output/AION TCG  MAESTRO AION CORE SET 2.1 (editado).md`). Si algo no
> coincide, el maestro manda y hay que corregir 02-cards.js (y el efecto en 04-engine.js).

**Total: 229 cartas** (8 tokens incluidos).

## Imperio Solaris  (29)

| Clave | Nombre | Tipo | Coste | Rar | POW/HP/SYNC | Keywords | Texto |
|---|---|---|---|---|---|---|---|
| `t_escudero` | Escudero de Luz | token | 0 | Token | 1/2/0 | — | — |
| `escudero` | Escudero de Iones | entidad | 1 | Común | 1/3/1 | baluarte | — |
| `fervor` | Fervor del Alba | directiva | 1 | Común | — | — | Elige una Entidad Solaris aliada. Gana +1 POW este turno. Si tiene Baluarte, Sanar 1 a esa Entidad. Luego roba 1 carta. |
| `infanteria` | Infantería Solar | entidad | 1 | Común | 1/2/1 | — | — |
| `peregrina` | Peregrina del Alba | entidad | 1 | Común | 1/3/1 | — | Entrada — Si el oponente controla más Entidades que tú, Sanar 1 a una Entidad Solaris aliada. |
| `arquera` | Arquera de Fotones | entidad | 2 | Común | 2/2/1 | — | Cuando esta Entidad ataca, si la defensora está dañada, gana +1 POW este combate. |
| `arquitectoCiudad` | Arquitecto de la Ciudadela | entidad | 2 | Común | 1/4/1 | — | Al final de tu turno, si una Entidad Solaris aliada con Baluarte recibió Daño este turno, puedes Sanar 1 a esa Entidad. |
| `cronistaGuerra` | Cronista de Guerra | entidad | 2 | Común | 1/3/0 | — | Una vez por turno, cuando otra Entidad aliada sea destruida, mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `custodio` | Custodio del Alba | entidad | 2 | Común | 1/4/1 | baluarte | Entrada — Sanar 1 a otra Entidad aliada. |
| `edicto` | Edicto de Disipación | directiva | 2 | Común | — | — | Destruye 1 Ancla enemiga. Timeline Bonus — Si controlas una Entidad Solaris con Baluarte: Sanar 1 a una Entidad Solaris. |
| `estandarteSolar` | Estandarte Solar | ancla | 2 | Común | — | — | Continuo — Tus Entidades Solaris con Baluarte tienen +1 HP. Activa — Agota esta Ancla: Sanar 1 a una Entidad Solaris con Baluarte. |
| `faroSensor` | Faro Sensor de Realidad | ancla | 2 | Poco Común | — | — | Continuo — Las Entidades enemigas en Soporte no pueden ganar Aéreo. Activa — Paga 1 Aether, agota y destruye esta Ancla: Mueve 1 Entidad enemiga Flexible agotada del Soporte al Frente si hay espacio. |
| `formacion` | Formación de Emergencia | directiva | 2 | Común | — | — | Crea 1 Token Escudero de Luz en tu Frente. Timeline Bonus — Si controlas una Entidad Solaris: Ese Token gana Baluarte este turno. |
| `milicia` | Milicia de Aurora | entidad | 2 | Común | 2/3/1 | — | Cuando esta Entidad ataca, si la defensora está dañada, gana +1 HP este turno. |
| `murallaIones` | Muralla de Iones Divina | directiva | 2 | Común | — | — | Reacción — Al declararse un Ataque enemigo: Una Entidad Solaris aliada gana Baluarte este turno. Si ya tenía Baluarte, Sanar 1 a esa Entidad. Timeline Bonus — Si controlas una Entidad Solaris Ascendida: Remueve Glitch de hasta 1 carta aliada. |
| `sentenciaSolar` | Sentencia Solar | directiva | 2 | Común | — | — | Reacción — Al declararse un Ataque enemigo: La Entidad atacante recibe 2 Daño. Timeline Bonus — Si controlas una Entidad Solaris: Sanar 1 a una Entidad aliada. |
| `votoSerafin` | Voto de Serafín | directiva | 2 | Poco Común | — | — | Reacción — Al declararse una Estabilización enemiga: Sanar 1 a una Entidad aliada. Luego, una Entidad aliada con Baluarte puede recibir 1 Daño para que el oponente gane 1 PA menos por esa Estabilización. |
| `alineacion` | Alineación Orbital | directiva | 3 | Poco Común | — | — | Sanar 2 a una Entidad Solaris aliada. Si esa Entidad tiene Baluarte, gana +1 HP este turno. Timeline Bonus — Si controlas una Entidad Solaris Ascendida: Mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `campana` | Campana de Toque de Queda | ancla | 3 | Rara | — | — | Continuo — Las Entidades enemigas de coste 1 no pueden atacar el mismo turno en que entran al campo. Activa — Paga 1 Aether, agota y destruye esta Ancla: Una Entidad Solaris aliada gana Baluarte este turno. |
| `capitanVanguardia` | Capitana de la Vanguardia Veloz | entidad | 3 | Poco Común | 3/3/1 | — | Cuando esta Entidad ataca, gana +1 POW este combate. |
| `guardiaCiudadela` | Guardia de la Ciudadela | entidad | 3 | Poco Común | 2/5/1 | baluarte | — |
| `oficialEnlace` | Oficial de Enlace Táctico | entidad | 3 | Poco Común | 2/3/1 | — | Mientras controles otra Entidad Solaris preparada en el Frente, esta Entidad gana +1 POW durante tu turno. |
| `paladinReal` | Paladín de la Guardia Real | entidad | 3 | Poco Común | 2/5/1 | baluarte | Cuando esta Entidad recibe Daño por combate y sobrevive, Sanar 1 a otra Entidad aliada. |
| `caballero` | Caballero de Plata | entidad | 4 | Rara | 3/6/1 | — | Cuando esta Entidad destruye una Entidad en combate, puedes Sanar 1 a esta Entidad. Límite 1 vez por turno. |
| `interceptora` | Interceptora Serafín | entidad | 4 | Rara | 3/3/1 | aereo | Cuando esta Entidad ataca, si la defensora está en Soporte, recibe 1 Daño después del combate. |
| `jerico` | Bastión Móvil Modelo Jericó | entidad | 5 | Épica | 2/6/1 | baluarte | Esta Entidad no puede ser movida por efectos enemigos mientras esté preparada. |
| `valerius` | General Valerius, Can del Alba | entidad | 5 | Legendaria | 4/6/1 | baluarte | La primera vez por turno que una Entidad Solaris aliada con Baluarte recibe Daño y sobrevive, esa Entidad gana +1 POW este turno. |
| `seraphina` | Seraphina Aegis, Ícono Celestial | entidad | 6 | Legendaria | 4/5/1 | baluarte, aereo | La primera vez por turno que otra Entidad Solaris aliada con Baluarte recibe Daño por combate, reduce ese daño en 1. |
| `lordSolaria` | Lord Solaria, Voz del Amanecer | entidad | 7 | Legendaria | 5/6/1 | baluarte, aereo | Tus otras Entidades Solaris con Baluarte en el Frente tienen +1 HP. La primera vez por turno que otra Entidad Solaris aliada con Baluarte recibe Daño por combate, puedes mirar la carta superior de tu mazo. Puedes ponerla en el fondo. |

## Sindicato Neón  (30)

| Clave | Nombre | Tipo | Coste | Rar | POW/HP/SYNC | Keywords | Texto |
|---|---|---|---|---|---|---|---|
| `t_proxy` | Proxy Desechable | token | 0 | Token | 1/1/0 | — | — |
| `adicto` | Adicto al Net-Stream | entidad | 1 | Poco Común | 0/2/1 | glitch | Al inicio de tu turno, puedes aplicar Glitch a una carta agotada. Si lo haces, roba 1 carta y luego descarta 1 carta. |
| `corredor` | Corredor de Paquetes | entidad | 1 | Común | 2/1/1 | impulso | — |
| `cortinaHumo` | Cortina de Humo Digital | directiva | 1 | Común | — | — | Elige una Entidad aliada. Mueve esa Entidad entre tu Frente y Soporte si tiene posición Flexible. Luego mira la carta superior de tu mazo. Puedes ponerla en el fondo. Timeline Bonus — Si controlas una Entidad Neón: Esa Entidad gana +1 POW este turno. |
| `fanaticaYui` | Fanática de Yui | entidad | 1 | Común | 2/1/1 | impulso | Cuando esta Entidad Estabiliza, mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `hackeoNeural` | Hackeo Neuronal | directiva | 1 | Común | — | — | Elige una Entidad Neón aliada. Gana +2 POW este turno. Al final del turno, si esa Entidad está agotada, puedes aplicar Glitch a esa Entidad. Si lo haces, roba 1 carta. |
| `malware` | Malware Infection | directiva | 1 | Común | — | — | Elige una Entidad Neón aliada. Gana +1 POW este turno. Si ataca a una Entidad dañada este turno, gana +1 POW adicional durante ese combate. Timeline Bonus — Si controlas una Entidad con Glitch: Mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `mensajero` | Mensajero Zero-Day | entidad | 1 | Común | 1/1/1 | impulso | Cuando esta Entidad Estabiliza, puedes aplicar Glitch a 1 Entidad enemiga agotada. Si no puedes, roba 1 carta. |
| `reroute` | Reroute Neural | directiva | 1 | Común | — | — | Mira las 2 cartas superiores de tu mazo. Pon una en la parte superior y la otra en el fondo. Luego roba 1 carta y descarta 1 carta. Timeline Bonus — Si controlas una Entidad Neón: Puedes poner ambas en cualquier orden en la parte superior o fondo. |
| `backdoor` | Backdoor Exploit | directiva | 2 | Común | — | — | Aplica Glitch a 1 Entidad enemiga agotada. Timeline Bonus — Si controlas una Entidad Neón: Mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `corredorFantasma` | Corredor Fantasma | entidad | 2 | Común | 2/2/1 | impulso | Entrada — Mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `duelista` | Duelista Callejero | entidad | 2 | Común | 2/1/1 | impulso | — |
| `pistolero` | Pistolero Callejero | entidad | 2 | Común | 3/2/1 | — | Cuando esta Entidad ataca, si la defensora está agotada, gana +1 POW este combate. |
| `proxyFantasma` | Proxy Fantasma | entidad | 2 | Común | 1/3/1 | — | Entrada — Crea 1 Token Proxy Desechable en tu Frente. |
| `senalNueve` | Señal de Proyecto Nueve | ancla | 2 | Común | — | — | Una vez por turno, cuando el oponente agote una carta de su Timeline para pagar una Directiva, mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `tecnicoFibra` | Técnico de Fibra Óptica | entidad | 2 | Común | 2/2/1 | — | Entrada — Remueve Glitch de hasta 1 carta aliada. Si removiste Glitch de una Entidad Neón, esa Entidad gana +1 HP este turno. |
| `troyano` | Troyano Letal | directiva | 2 | Común | — | — | Destruye 1 Ancla enemiga de coste 2 o menos. Si no puedes, roba 1 carta. Timeline Bonus — Si controlas una Entidad Neón: Aplica Glitch a 1 Entidad enemiga agotada. |
| `vendedorFideos` | Vendedor de Holo-Fideos | entidad | 2 | Común | 1/3/1 | — | Activa — Agota esta Entidad: Genera 1 Aether temporal este turno. El oponente mira la carta superior de su mazo y puede ponerla en el fondo. |
| `runner` | @Runner, Cazador de Avatares | entidad | 3 | Legendaria | 3/2/1 | impulso | Cuando esta Entidad destruye una Entidad en combate, puedes aplicar Glitch a 1 Entidad enemiga agotada. |
| `asaltante` | Asaltante de Circuitos | entidad | 3 | Poco Común | 3/2/1 | impulso | La primera Directiva Neón que juegas cada turno le da +1 POW a esta Entidad este turno. |
| `redhat` | Redhat Hacker | entidad | 3 | Poco Común | 1/4/1 | — | Entrada — Mira las 2 cartas superiores de tu mazo. Pon una en el fondo y la otra arriba. |
| `ronin` | Ronin de Holo-Camuflaje | entidad | 3 | Poco Común | 3/3/1 | impulso | Cuando esta Entidad entra al Frente desde el Soporte, gana +1 POW este turno. |
| `saqueador` | Saqueador de Caché | entidad | 3 | Poco Común | 3/2/1 | glitch | Entrada — Si una Entidad enemiga tiene Glitch, genera 1 Aether temporal este turno. |
| `terminalHack` | Terminal de Hackeo | ancla | 3 | Poco Común | — | — | Activa — Agota esta Ancla: Aplica Glitch a 1 carta agotada del Timeline enemigo. Activa solo si controlas una Entidad Neón Ascendida. |
| `hackerFlujo` | Hacker de Flujo de Datos | entidad | 4 | Rara | 2/4/1 | glitch | Esta Entidad gana +1 POW durante tu turno si una Entidad enemiga tiene Glitch. |
| `mercNeon` | Mercenario de Neón | entidad | 4 | Rara | 5/2/1 | impulso | Cuando esta Entidad ataca, recibe 1 Daño después del combate. |
| `yui` | Yui, Glitch Idol | entidad | 4 | Rara | 2/4/2 | glitch | Activa — Agota esta Entidad: Aplica Glitch a 1 Entidad enemiga agotada. Si no puedes, roba 1 carta. |
| `moto` | Moto-Tanque Yakuza | entidad | 5 | Épica | 5/4/1 | impulso | Entrada — Puedes mover una Entidad enemiga agotada de coste 2 o menos entre Frente y Soporte si hay espacio. |
| `kitsune` | Kitsune Cibernética Proyecto Nueve | entidad | 6 | Épica | 4/5/1 | — | Tus Entidades Neón que entran al Frente desde el Soporte ganan +1 POW este turno. |
| `yuiLeg` | Yui, Diva Holográfica | entidad | 6 | Legendaria | 4/5/1 | glitch | Entrada — Aplica Glitch a 1 Entidad enemiga agotada. Si no puedes, roba 1 carta. Una vez por turno, cuando una Entidad enemiga recibe Glitch, mira la carta superior de tu mazo. Puedes ponerla en el fondo. |

## Dinastía Gaia  (31)

| Clave | Nombre | Tipo | Coste | Rar | POW/HP/SYNC | Keywords | Texto |
|---|---|---|---|---|---|---|---|
| `t_brote` | Brote | token | 0 | Token | 0/1/0 | baluarte | — |
| `t_broteM` | Brote Mutado | token | 0 | Token | 1/1/0 | — | — |
| `broteSimb` | Brote Simbiótico | entidad | 1 | Común | 0/2/1 | mutar | Mutar — Elige una: - Esta Entidad gana +2 POW. - Crea 1 Token Brote en tu Frente. |
| `crecimiento` | Impulso Primigenio | directiva | 1 | Común | — | — | Elige una Entidad aliada. Gana +2 POW este turno. Si esa Entidad tiene Mutar, Sanar 1 a esa Entidad. |
| `recolectoraSavia` | Recolectora de Savia | entidad | 1 | Común | 1/2/1 | mutar | Mutar — Elige una: - Sanar 1 a otra Entidad Gaia. - Genera 1 Aether temporal este turno. Activa solo si controlas otra Entidad Gaia. |
| `semilla` | Semilla de Batalla | entidad | 1 | Común | 0/3/1 | mutar | Mutar — Elige una: - Una Entidad aliada gana +1 POW y +1 HP. - Sanar 1 a esta Entidad. |
| `broteMutageno` | Brote Mutágeno | entidad | 2 | Común | 2/2/1 | mutar | Mutar — Elige una: - Crea 1 Token Brote Mutado en tu Frente. - Descarta 1 carta. Si lo haces, roba 1 carta. |
| `camaraGerm` | Cámara de Germinación | ancla | 2 | Común | — | — | Al inicio de tu turno, Sanar 1 a una Entidad aliada. Si no puedes, roba 1 carta y descarta 1 carta. Activa — Agota esta Ancla: Mueve una Entidad Gaia Flexible aliada entre tu Frente y tu Soporte. |
| `cicatrizacion` | Cicatrización Verde | directiva | 2 | Común | — | — | Sanar 2 repartido como elijas entre Entidades aliadas. Timeline Bonus — Si controlas una Entidad Gaia: Una de esas Entidades gana +1 HP este turno. |
| `crecimientoDesmedido` | Crecimiento Desmedido | directiva | 2 | Común | — | — | Coloca la carta superior de tu mazo boca abajo en tu Timeline agotada. Sanar 1 a una Entidad Gaia aliada. |
| `evolucionForzada` | Evolución Forzada | directiva | 2 | Común | — | — | Sanar 2 a una Entidad aliada. Si esa Entidad tiene Mutar, puedes cambiar su opción de Mutar elegida por otra opción impresa en esa carta. Timeline Bonus — Si controlas una Entidad Gaia: Mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `guardianArb` | Guardián Arbóreo | entidad | 2 | Común | 2/2/1 | mutar | Mutar — Elige una: - Esta Entidad gana +2 HP. - Esta Entidad gana Baluarte este turno. |
| `injertador` | Injertador de Raíces | entidad | 2 | Común | 1/4/1 | mutar | Mutar — Elige una: - Coloca la carta superior de tu mazo boca abajo en tu Timeline agotada. - Sanar 2 a esta Entidad. |
| `jardinero` | Jardinero de Esporas | entidad | 2 | Común | 1/4/1 | mutar | Mutar — Elige una: - Roba 1 carta, luego descarta 1 carta. - Esta Entidad gana +2 POW y +1 HP. |
| `lanzadorEspinas` | Lanzador de Espinas | entidad | 2 | Común | 1/4/1 | — | Cuando esta Entidad ataca, si la defensora tiene Aéreo, gana +2 POW este combate. |
| `maceta` | Maceta de Cultivo | ancla | 2 | Común | — | — | Al final de tu turno, si una Entidad Gaia aliada activó Mutar este turno, puedes mirar la carta superior de tu mazo. Puedes ponerla en el fondo. Luego, si esa Entidad está dañada, puedes Sanar 1 a esa Entidad. Si no puedes, roba 1 carta. |
| `raices` | Raíces Profundas | ancla | 2 | Común | — | — | Activa — Agota esta Ancla: Mira la carta superior de tu mazo. Puedes ponerla en el fondo. Si controlas una Entidad Gaia Ascendida, puedes Sanar 1 a una Entidad Gaia. |
| `recolectoraMayor` | Recolectora de Savia Mayor | entidad | 2 | Poco Común | 1/3/1 | mutar | Mutar — Elige una: - Sanar 1 a otra Entidad Gaia. - Mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `bestiaCarga` | Bestia de Carga Mutante | entidad | 3 | Poco Común | 3/4/1 | mutar | Mutar — Elige una: - Coloca la carta superior de tu mazo boca abajo en tu Timeline agotada. - Esta Entidad gana +2 HP. |
| `bestiaInd` | Bestia Indomable | entidad | 3 | Poco Común | 3/2/1 | mutar | Mutar — Elige una: - Esta Entidad gana Impulso. - Esta Entidad gana +2 HP. |
| `cancionCuna` | Canción de Cuna del Bosque | directiva | 3 | Rara | — | — | Hasta el inicio de tu próximo turno, las Entidades enemigas con POW 5 o más no pueden declarar ataques. Timeline Bonus — Si controlas una Entidad Gaia: Mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `raptor` | Raptor Alfa-Gen | entidad | 3 | Poco Común | 3/3/1 | mutar | Mutar — Elige una: - Esta Entidad gana Impulso. - Esta Entidad gana +2 HP. |
| `rizoma` | Rizoma Expansivo | entidad | 3 | Poco Común | 2/3/1 | mutar | Mutar — Elige una: - Esta Entidad gana +1 POW y +1 HP. - Esta Entidad gana Impacto este turno. |
| `rizomaPurif` | Rizoma Purificador | entidad | 3 | Poco Común | 2/3/1 | mutar | Mutar — Elige una: - Esta Entidad gana +1 POW y +1 HP. - Remueve Glitch de hasta 1 carta aliada. |
| `tardigrado` | Tardígrado de la Espesura | entidad | 3 | Poco Común | 0/5/1 | baluarte | Esta Entidad no puede atacar. |
| `coloso` | Coloso de Esporas | entidad | 4 | Rara | 2/5/1 | mutar, baluarte | Mutar — Elige una: - Esta Entidad gana +2 HP. - Cuando esta Entidad sea atacada este turno, la Entidad atacante recibe 1 Daño después del combate. |
| `golemMusgo` | Gólem de Musgo | entidad | 4 | Rara | 3/5/1 | baluarte | La primera vez por turno que esta Entidad recibe 2 o más Daño por combate y sobrevive, puedes Sanar 1 a esta Entidad. |
| `swami` | Los Swami, Tríada de la Vida | entidad | 5 | Legendaria | 3/7/1 | mutar | Mutar — Elige una: - Una Entidad Token aliada gana +1 HP este turno. - Sanar 1 a una Entidad Token aliada. |
| `bodhisattva` | Bodhisattva, Reina Asceta | entidad | 6 | Legendaria | 4/7/1 | mutar | Mutar — Elige una: - Crea 1 Token Brote en tu Frente. - Coloca la carta superior de tu mazo boca abajo en tu Timeline agotada. |
| `kong` | Gorila Quimérico Proyecto Kong | entidad | 6 | Épica | 5/4/1 | mutar | Mutar — Elige una: - Esta Entidad gana +2 POW este turno. - Esta Entidad gana Baluarte este turno. |
| `omnia` | Omnia, Matriarca del ADN | entidad | 8 | Legendaria | 5/8/1 | mutar | Entrada — Puedes activar Mutar de 1 Entidad Gaia aliada. |

## Forja de Hierro  (28)

| Clave | Nombre | Tipo | Coste | Rar | POW/HP/SYNC | Keywords | Texto |
|---|---|---|---|---|---|---|---|
| `aprendizFund` | Aprendiz de Fundición | entidad | 1 | Común | 1/2/0 | — | Activa — Una vez por turno: Esta Entidad gana +1 POW este turno. Al final del turno, recibe 1 Daño. La primera vez por turno que esta Entidad recibiría daño de tus propios efectos, reduce ese daño en 1. |
| `aprendiz` | Aprendiz de Piro-Soldador | entidad | 1 | Común | 1/2/0 | impacto | Activa — Una vez por turno: Esta Entidad gana +2 POW este turno. Al final del turno, recibe 1 Daño. La primera vez por turno que esta Entidad recibiría daño de tus propios efectos, reduce ese daño en 1. |
| `nitro` | Inyección de Nitro | directiva | 1 | Común | — | — | Elige una Entidad aliada. Gana Impulso y +2 POW este turno. Al final del turno, recibe 1 Daño. |
| `ninoCenizas` | Niño de las Cenizas | entidad | 1 | Común | 1/2/0 | — | Cuando un Ancla aliada es destruida, mira la carta superior de tu mazo. Puedes ponerla en el fondo. Al final de tu turno, una Entidad Forja aliada gana Impacto. |
| `cantinaCenizas` | Cantina de Cenizas | ancla | 2 | Poco Común | — | — | Al inicio de tu turno, si controlas una Entidad Forja agotada, elige una Entidad Forja. Sanar 1 a esa Entidad. Si no está dañada, mira la carta superior de tu mazo. Puedes ponerla en el fondo. Activa — Descarta 1 carta y destruye esta Ancla: Una Entidad Forja aliada gana +2 POW este turno. Al final del turno, recibe 1 Daño. |
| `cantinaMinero` | Cantina del Minero | ancla | 2 | Poco Común | — | — | Al inicio de tu turno, si controlas una Entidad Forja agotada, puedes mirar la carta superior de tu mazo. Puedes ponerla en el fondo. Activa — Descarta 1 carta y destruye esta Ancla: Endereza 1 Entidad Forja aliada que atacó este turno. Esa Entidad no puede atacar de nuevo este turno. |
| `chatarrero` | Chatarrero Cromado | entidad | 2 | Común | 2/2/1 | — | Si esta Entidad es destruida en combate, puedes mirar la carta superior de tu mazo. Puedes ponerla en el fondo. Luego roba 1 carta. |
| `disipador` | Disipador Térmico | ancla | 2 | Común | — | — | Activa — Agota esta Ancla: Sanar 1 a una Entidad Forja. Si esa Entidad está dañada, Sanar 1 adicional. |
| `enfermeraQuemados` | Enfermera de Quemados | entidad | 2 | Poco Común | 1/3/1 | — | Activa — Agota esta Entidad: Sanar 1 a una Entidad Forja. Luego roba 1 carta. |
| `obreroMetalB` | Obrero de Metal | entidad | 2 | Común | 2/2/0 | — | Entrada — Si controlas un Ancla Forja, mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `perro` | Perro de Chatarra | entidad | 2 | Común | 2/2/0 | impulso | Si esta Entidad es destruida en combate, puedes devolver 1 carta Forja de coste 2 o menos de tu Vacío a tu mano. |
| `reciclador` | Reciclador de Núcleos | entidad | 2 | Común | 2/2/0 | — | Si esta Entidad es destruida, puedes elegir 1 carta Forja de coste 1 en tu Vacío y ponerla en el fondo de tu mazo. |
| `trajeRefrig` | Traje Refrigerado | ancla | 2 | Común | — | — | Una vez por turno, cuando una Entidad Forja aliada reciba Daño, reduce ese daño en 1. Activa — Agota esta Ancla: Sanar 1 a una Entidad Forja y mira la carta superior de tu mazo; puedes ponerla en el fondo. |
| `valvula` | Válvula de Alivio Térmico | ancla | 2 | Común | — | — | Una vez por turno, cuando una Entidad Forja aliada reciba Daño, puedes mirar la carta superior de tu mazo. Puedes ponerla en el fondo. Activa — Agota esta Ancla: Sanar 1 a una Entidad Forja dañada. |
| `automataBasico` | Autómata Básico | entidad | 3 | Poco Común | 2/4/1 | — | Entrada — Puedes mover una Entidad enemiga agotada del Soporte al Frente si hay espacio. |
| `corte` | Corte de Soplete | directiva | 3 | Común | — | — | Destruye 1 Ancla. Luego, una Entidad enemiga agotada recibe 2 Daño. |
| `ensamblador` | Ensamblador de Bombas | entidad | 3 | Poco Común | 2/3/1 | — | Entrada — Puedes hacer que esta Entidad reciba 1 Daño. Si lo haces, crea 1 Token Chatarra Explosiva en tu Soporte. |
| `guardiaHorno` | Guardia del Horno | entidad | 3 | Poco Común | 3/3/1 | — | Entrada — Roba 1 carta. |
| `guardiaCalderas` | Guardián de Calderas | entidad | 3 | Poco Común | 3/4/1 | — | La primera vez por turno que otra Entidad Forja aliada recibiría Daño, reduce ese daño en 1. |
| `maestraTemp` | Ingeniera de Calor | entidad | 3 | Poco Común | 2/4/1 | — | Entrada — Roba 1 carta. |
| `supervisorCrio` | Supervisor Criogénico | entidad | 3 | Poco Común | 3/4/1 | — | Activa — Agota esta Entidad: Sanar 1 a una Entidad Forja dañada. Si no hay ninguna, mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `incinerador` | Incinerador Blindado | entidad | 4 | Poco Común | 3/5/1 | — | Entrada — Puedes hacer que esta Entidad reciba 1 Daño. Si lo haces, inflige 1 Daño a una Entidad enemiga agotada. |
| `mortero` | Mortero de Chatarra | entidad | 4 | Poco Común | 3/4/1 | — | Entrada — Puedes descartar 1 carta. Si lo haces, una Entidad enemiga agotada recibe 2 Daño. |
| `soldadoBlindado` | Soldado Blindado | entidad | 4 | Rara | 4/3/1 | — | Entrada — Puedes hacer que esta Entidad reciba 1 Daño. Si lo haces, Sanar 1 a otra Entidad Forja. |
| `reactor` | Reactor Inestable G-0 | entidad | 5 | Épica | 0/8/1 | — | Al inicio de tu turno, esta Entidad recibe 1 Daño. Luego, elige una Entidad enemiga. Si está agotada, recibe 1 Daño. Si está preparada, recibe 2 Daño solo si esta Entidad ha recibido 3 o más Daño. |
| `rust` | Rust, Princesa Mecánica | entidad | 6 | Legendaria | 5/6/0 | — | La primera vez por turno que una Entidad Forja aliada recibe Daño, elige una Entidad enemiga. La Entidad elegida recibe 1 Daño. Activa — Una vez por turno: Elige otra Entidad Forja aliada. Gana +1 POW este turno |
| `trak` | Trak, Jefe de Motores | entidad | 6 | Legendaria | 5/4/0 | impulso | La primera vez por turno que una Entidad Forja aliada recibe Daño, reduce ese daño en 1. |
| `ferrous` | Barón Ferrous, Corazón de Hierro | entidad | 7 | Legendaria | 5/7/0 | — | La primera vez por turno que una Entidad Forja aliada fuera a ser destruida por daño de un efecto aliado, en lugar de eso queda en el campo con Daño igual a su HP menos 1. |

## Cónclave Aether  (31)

| Clave | Nombre | Tipo | Coste | Rar | POW/HP/SYNC | Keywords | Texto |
|---|---|---|---|---|---|---|---|
| `acolito` | Acólito del Tiempo | entidad | 1 | Común | 1/1/1 | — | Entrada — Mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `conserje` | Conserje del Tiempo | entidad | 1 | Común | 1/2/1 | — | Entrada — Elige 1 carta de tu Vacío y ponla en el fondo de tu mazo. |
| `discipulaMirai` | Discípula de Mirai | entidad | 1 | Común | 1/2/1 | — | Entrada — Mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `gafasCronista` | Gafas de Cronista | ancla | 1 | Común | — | — | Activa — Agota esta Ancla: Mira las 2 cartas superiores de tu mazo y devuélvelas en el mismo orden. |
| `archivista` | Archivista del Tiempo | entidad | 2 | Común | 1/3/1 | — | Activa — Agota esta Entidad: Mira las 2 cartas superiores de tu mazo y devuélvelas en cualquier orden. |
| `correccionParadoja` | Corrección de Paradoja | directiva | 2 | Común | — | — | Reacción — Cuando el oponente juega una Entidad de coste 2 o menos: Cancela esa Entidad. Va al Vacío sin entrar al campo. Timeline Bonus — Si controlas una Entidad Cónclave: Mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `estasis` | Estasis Cronológica | directiva | 2 | Común | — | — | Roba 1 carta. Luego aplica Glitch a 1 Entidad enemiga agotada. Timeline Bonus — Si controlas una Entidad Cónclave: Mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `estudiante` | Estudiante de las Eras | entidad | 2 | Común | 2/1/1 | — | La primera vez por turno que juegas una Directiva, puedes mirar la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `apsArbitro` | Gran Árbitro del Cónclave | entidad | 2 | Promo | 1/4/1 | — | Continuo — Ningún jugador puede jugar más de 4 cartas durante un mismo turno. |
| `velo` | Guardián del Velo | entidad | 2 | Común | 1/5/1 | baluarte | — |
| `negacionAstral` | Negación Astral | directiva | 2 | Común | — | — | Reacción — Cuando el oponente juega una Directiva de coste 2 o menos: Cancela esa Directiva. Va al Vacío sin resolverse. Timeline Bonus — Si tienes 5 o más cartas en tu Timeline: Roba 1 carta. |
| `observadora` | Observadora de Mareas | entidad | 2 | Común | 1/3/1 | — | Entrada — Mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `refugiadoParadoja` | Refugiado de la Paradoja | entidad | 2 | Común | 0/4/1 | — | Entrada — Si tienes 5 o más cartas en tu Timeline, mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `refugiado` | Refugiado Temporal | entidad | 2 | Poco Común | 0/4/1 | — | Las Directivas enemigas que elijan esta Entidad cuestan 1 Aether adicional. |
| `relicario` | Relicario del Momento | ancla | 2 | Poco Común | — | — | Una vez por turno, cuando resuelves una Directiva, puedes pagar 1 Aether. Si lo haces, mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `relojAetherium` | Reloj de Arena Aetherium | ancla | 2 | Común | — | — | La primera Entidad Cónclave sin texto de reglas que juegas cada turno cuesta 1 Aether menos. Activa — Agota esta Ancla: Mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `aprendizFuturo` | Aprendiz del Futuro | entidad | 3 | Poco Común | 2/3/1 | — | Una vez por turno, después de mirar la carta superior de tu mazo por un efecto aliado, esta Entidad gana +1 HP este turno. |
| `archivistaTemp` | Archivista Temporal | entidad | 3 | Poco Común | 2/3/1 | — | Una vez por turno, después de mirar la carta superior de tu mazo por un efecto aliado, puedes remover Glitch de hasta 1 carta aliada. |
| `cronistaArb` | Cronista del Arbitraje | entidad | 3 | Rara | 1/5/1 | — | Una vez por turno, cuando un jugador juega su cuarta carta durante un turno, puedes mirar la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `guardiaTorre` | Guardia de la Torre | entidad | 3 | Poco Común | 2/4/1 | baluarte | Las Directivas enemigas que elijan esta Entidad cuestan 1 Aether adicional. |
| `magistrada` | Magistrada de Gravedad Zero | entidad | 3 | Poco Común | 2/3/1 | — | Entrada — Puedes mover una Entidad enemiga agotada del Frente a su Soporte si hay espacio. |
| `retroceso` | Retroceso Temporal | directiva | 3 | Poco Común | — | — | Elige una Entidad enemiga. Devuélvela a la mano de su dueño. Timeline Bonus — Si tienes 5 o más cartas en tu Timeline: El controlador de esa Entidad descarta 1 carta, luego roba 1 carta. |
| `magoReloj` | Caballero del Reloj | entidad | 4 | Rara | 3/4/1 | — | Una vez por turno, cuando juegas una Directiva, esta Entidad gana +1 POW este turno. |
| `artillero` | Cronomante Ofensivo | entidad | 4 | Poco Común | 2/4/1 | — | Una vez por turno, cuando juegues una Directiva, una Entidad enemiga agotada recibe 1 Daño. |
| `elyra` | Elyra, Líder de las Mareas | entidad | 4 | Legendaria | 2/5/1 | — | La primera vez por turno que miras la carta superior de tu mazo por un efecto aliado, puedes pagar 1 Aether. Si lo haces, prepara 1 carta agotada de tu Timeline. |
| `golemPrisma` | Gólem de Prisma Arcano | entidad | 4 | Rara | 1/6/1 | baluarte | Las Directivas enemigas que elijan esta Entidad cuestan 1 Aether adicional. |
| `recuperador` | Recuperador de Ecos | entidad | 4 | Rara | 2/4/1 | — | Una vez por turno, cuando resuelves una Directiva, esta Entidad gana +1 POW y +1 HP este turno. |
| `reflejo` | Reflejo del Observador | entidad | 4 | Épica | 2/3/1 | — | Entrada — Mira la carta superior de tu mazo. Puedes ponerla en el fondo. Si pusiste esa carta en el fondo, una Entidad aliada gana +1 HP este turno. |
| `caminanteGrieta` | Caminante de la Grieta | entidad | 5 | Épica | 4/4/1 | — | Cuando esta Entidad ataca, mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `mirai` | Mirai, Momento Eterno | entidad | 6 | Legendaria | 3/6/1 | — | Una vez por turno, cuando resuelves una Directiva, puedes pagar 1 Aether. Si lo haces, mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `solon` | Astrólogo Solon, El Vidente | entidad | 7 | Legendaria | 4/6/1 | — | Juegas con la carta superior de tu mazo revelada. Una vez por turno, puedes jugar una carta Cónclave desde la parte superior de tu mazo sin pagar su coste. |

## Vacío Estelar  (32)

| Clave | Nombre | Tipo | Coste | Rar | POW/HP/SYNC | Keywords | Texto |
|---|---|---|---|---|---|---|---|
| `t_eco` | Eco Reanimado | token | 0 | Token | 1/1/0 | — | — |
| `t_horror` | Horror | token | 0 | Token | 2/2/0 | — | — |
| `dronCorrupto` | Dron de Sondeo Corrupto | entidad | 1 | Común | 1/2/1 | — | Entrada — Envía la carta superior de tu mazo al Vacío. |
| `ecoResidual` | Eco Residual | entidad | 1 | Común | 0/2/1 | — | Entrada — Envía la carta superior de tu mazo al Vacío. |
| `perroSombrio` | Perro Sombrío Callejero | entidad | 1 | Común | 1/2/1 | — | Cuando esta Entidad ataca, si la defensora no está dañada, recibe 1 Daño antes del daño de combate. Si la Entidad defensora si está dañada, esta Entidad gana +1 POW este combate. |
| `pesar` | Pesar | directiva | 1 | Común | — | — | Elige una Entidad enemiga. La Entidad elegida obtiene -1 POW este turno. Luego, si no está dañada, recibe 1 Daño. Si está dañada, recibe 2 Daño. |
| `cosechadoraMenor` | Cosechadora Menor | entidad | 2 | Común | 2/3/1 | — | Entrada — Roba 1 carta. |
| `espirituVacio` | Espíritu del Vacío | entidad | 2 | Común | 1/4/1 | — | La primera vez por turno que una carta sea enviada de tu mazo al Vacío, esta Entidad gana +1 POW este turno. Luego, puedes elegir 1 Entidad enemiga no Token que no esté dañada. Esa Entidad recibe 1 Daño. |
| `fragmentoExogeno` | Fragmento Exógeno de Vida | entidad | 2 | Común | 0/4/1 | — | La primera vez por turno que una carta es enviada de tu mazo al Vacío, esta Entidad gana +2 POW este turno. Luego, puedes elegir hasta 1 Entidad enemiga no Token que no esté dañada. La Entidad elegida recibe 1 Daño. |
| `grito` | Grito del Vacío | directiva | 2 | Común | — | — | Elige una Entidad enemiga. Esa Entidad obtiene -2 POW este turno. Timeline Bonus — Si controlas una Entidad del Vacío: Si la Entidad enemiga no está dañada, recibe 1 Daño. Si está dañada, recibe 2 Daño. |
| `lamparaVacia` | Lámpara Vacía | ancla | 2 | Común | — | — | Una vez por turno, cuando una carta sea enviada de tu mazo al Vacío por un efecto aliado, puedes mirar la carta superior de tu mazo. Puedes ponerla en el fondo. Activa — Agota y destruye esta Ancla: Pon 1 Entidad de coste 1 de tu Vacío en tu Frente agotada. Luego, elige hasta 1 Entidad enemiga. Recibe 1 Daño. |
| `materiaInq` | Materia Inquieta | entidad | 2 | Común | 3/1/1 | — | Si esta Entidad es destruida, puedes elegir 1 carta Estelar de coste 3 o menos de tu Vacío y ponerla en el fondo de tu mazo. |
| `perroAlfa` | Perro Sombrío Alfa | entidad | 2 | Poco Común | 2/2/1 | — | Cuando esta Entidad ataca, si la defensora no está dañada, recibe 1 Daño antes del daño de combate. Si la Entidad defensora está dañada, esta Entidad gana +1 POW este combate. |
| `predicadorFin` | Predicador del Fin | entidad | 2 | Común | 1/3/1 | — | Entrada — Cada jugador envía la carta superior de su mazo al Vacío. |
| `purga` | Purga Dimensional | directiva | 2 | Común | — | — | Remueve Glitch de hasta 1 carta aliada. Timeline Bonus — Si controlas una Entidad del Vacío: Puedes enviar la carta superior de tu mazo al Vacío. Si lo haces, remueve Glitch de hasta 1 carta aliada adicional. |
| `sirviente` | Sirviente Infectado | entidad | 2 | Común | 2/2/1 | — | Si esta Entidad es destruida, envía la carta superior de tu mazo al Vacío. Luego puedes devolver 1 carta de coste 3 o menos de tu Vacío a tu mano. |
| `susurro` | Susurro de Yami | directiva | 2 | Común | — | — | Elige una Entidad enemiga. Si no está dañada, recibe 1 Daño. Si está dañada, recibe 2 Daño. Timeline Bonus — Si controlas una Entidad del Vacío: Si esa Entidad es destruida este turno, exíliala en lugar de enviarla al Vacío. |
| `abismoMenor` | Abismo Menor | entidad | 3 | Poco Común | 1/5/1 | baluarte | Entrada — Puedes enviar la carta superior de tu mazo al Vacío. Si lo haces, elige una Entidad enemiga. Si no está dañada, recibe 1 Daño. Si está dañada, recibe 2 Daño |
| `cadaverEva` | Cadáver de Traje EVA | entidad | 3 | Poco Común | 2/5/1 | — | Activa — Agota esta Entidad: Envía la carta superior de tu mazo al Vacío. Si lo haces, Sanar 1 a esta Entidad. |
| `devorador` | Devorador de Recuerdos | entidad | 3 | Poco Común | 2/4/1 | — | Cuando esta Entidad ataca, si la defensora está dañada, gana +2 POW este combate. |
| `ecoNexo` | Eco del Nexo | entidad | 3 | Poco Común | 0/5/1 | baluarte | Activa — Una vez por turno: Envía la carta superior de tu mazo al Vacío. Esta Entidad gana +1 POW este turno por cada 3 cartas en tu Vacío. Máximo +3 POW. Luego, si esta Entidad tiene 3 o más POW, puedes elegir 1 Entidad enemiga no Token que no esté dañada. La Entidad elegida recibe 1 Daño. |
| `necromedico` | Necro-Médico | entidad | 3 | Poco Común | 1/4/1 | — | Entrada — Puedes poner 1 Entidad de coste 1 de tu Vacío en tu Frente agotada. |
| `plagaDevol` | Plaga Devolutiva | directiva | 3 | Poco Común | — | — | Elige una Entidad enemiga. Si está dañada, pierde sus keywords hasta el final del turno. Luego recibe 1 Daño. Timeline Bonus — Si controlas una Entidad del Vacío: Puedes enviar la carta superior de tu mazo al Vacío. Si lo haces, la Entidad elegida recibe 1 Daño adicional. |
| `portadora` | Portadora del Umbral | entidad | 3 | Poco Común | 1/5/2 | — | Entrada — Puedes enviar las 2 cartas superiores de tu mazo al Vacío. |
| `cosechadoraEones` | Cosechadora Eones | entidad | 4 | Rara | 2/4/1 | — | Si esta Entidad es destruida, puedes poner hasta 2 cartas de tu Vacío en el fondo de tu mazo en cualquier orden. |
| `horizonte` | Horizonte de Sucesos | directiva | 4 | Rara | — | — | Elige una Entidad enemiga. Si no está dañada, destrúyela. Si está dañada, recibe 2 Daño. Timeline Bonus — Si controlas una Entidad del Vacío: Si esa Entidad enemiga fue destruida de esta forma, exíliala en lugar de enviarla al Vacío. |
| `horror` | Horrores del Espacio | entidad | 4 | Rara | 2/5/1 | — | Cuando esta Entidad ataca, si la defensora está dañada, gana +2 POW este combate. |
| `sacerdoteEntropia` | Sacerdote de la Entropía | entidad | 4 | Rara | 3/3/1 | — | Entrada — Puedes destruir otra Entidad aliada. Si lo haces, roba 1 carta y luego descarta 1 carta. |
| `nullPaladin` | Null, Paladín del Abismo | entidad | 5 | Legendaria | 3/6/1 | — | Reacción — Una vez por turno, cuando una Entidad aliada con Mutar es destruida: Puedes enviar la carta superior de tu mazo al Vacío. Si lo haces, una Entidad enemiga recibe 1 Daño. |
| `kraken` | Engendro Dimensional, El Kraken | entidad | 6 | Épica | 5/7/1 | — | Jugar esta Entidad cuesta 1 Aether menos si tienes 8 o más cartas en tu Vacío. |
| `yamiLeg` | Yami, Oscuridad Encarnada | entidad | 7 | Legendaria | 0/10/1 | baluarte | Esta Entidad no puede atacar mientras no tengas 8 o más cartas en tu Vacío. Al inicio de tu turno, puedes enviar la carta superior de tu mazo al Vacío. Si lo haces, elige una Entidad enemiga. Si no está dañada, recibe 1 Daño. Si está dañada, recibe 2 Daño. |
| `xulThan` | Xul-Than, La Estrella Muerta | entidad | 8 | Legendaria | 0/10/1 | baluarte | Esta Entidad no puede atacar mientras tengas menos de 10 cartas en tu Vacío. Al final de tu turno, puedes enviar las 2 cartas superiores de tu mazo al Vacío. Si lo haces, cada Entidad enemiga en el Frente recibe 1 Daño. Si no hay Entidades enemigas en el Frente, elige hasta 1 Entidad enemiga en el Soporte. Recibe 1 Daño. |

## Neutral  (48)

| Clave | Nombre | Tipo | Coste | Rar | POW/HP/SYNC | Keywords | Texto |
|---|---|---|---|---|---|---|---|
| `t_chatarra` | Chatarra Explosiva | token | 0 | Token | 0/1/0 | — | Activa — Agota y destruye esta Ancla Token: Una Entidad recibe 1 Daño. |
| `t_chatarraM` | Chatarra Explosiva Mejorada | token | 0 | Token | 0/1/0 | — | Activa — Agota y destruye esta Ancla Token: Una Entidad agotada recibe 1 Daño. |
| `botiquin` | Botiquín de Auxilios | directiva | 1 | Común | — | — | Sanar 1 a una Entidad aliada. Timeline Bonus — Si tienes 5 o más cartas en tu Timeline: Sanar 1 adicional a esa Entidad. |
| `apsCosplayer` | Cosplayer Aficionado | entidad | 1 | Promo | 1/1/0 | — | Entrada — Elige una Entidad Legendaria aliada. Esta Entidad gana una keyword impresa de esa Entidad hasta el final del turno. |
| `dronx` | Dron Defensivo Modelo-X | entidad | 1 | Común | 0/3/0 | baluarte | Si esta Entidad es destruida por combate, roba 1 carta. |
| `ecoPurga` | Eco de Purga | directiva | 1 | Común | — | — | Remueve Glitch de hasta 1 carta aliada. Timeline Bonus — Si controlas una Entidad con Baluarte: Sanar 1 a una Entidad aliada. |
| `huellas` | Huellas Borradas | directiva | 1 | Común | — | — | Devuelve una Entidad aliada de coste 2 o menos a tu mano. Si no puedes devolver una Entidad de esta forma, mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `maddieRoja` | Maddie de las Zapatillas Rojas | entidad | 1 | Promo | 1/2/1 | — | Entrada — Mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `planContingencia` | Plan de Contingencia | directiva | 1 | Poco Común | — | — | Mira las 2 cartas superiores de tu mazo. Pon una en la parte superior y la otra en el fondo. Timeline Bonus — Si tienes 4 o más cartas en tu Timeline: Roba 1 carta. |
| `anclaTemporal` | Ancla Temporal | directiva | 2 | Común | — | — | Elige una Entidad aliada de coste 3 o menos. Esa Entidad gana +1 POW y +1 HP este turno. Si esa Entidad está en Lado A y aún no cumple su condición de Ascensión este turno, puedes Ascenderla inmediatamente. |
| `bateria` | Batería de Reserva | ancla | 2 | Común | — | — | Activa — Agota y destruye esta Ancla: Genera 1 Aether temporal este turno. |
| `caravana` | Caravana de Refugiados | entidad | 2 | Común | 0/5/1 | — | Al final de tu turno, puedes descartar 1 carta. Si lo haces, elige una Entidad aliada. Sanar 1 a esa Entidad. Si esa Entidad no está dañada, mira la carta superior de tu mazo. Puedes ponerla en el fondo. Si descartaste una carta de esta forma y tienes 2 o menos cartas en mano, roba 1 carta. |
| `apsCloud` | Cloud y Cake, Ladrones Peludos | entidad | 2 | Promo | 1/2/0 | baluarte | Entrada — Elige 1 Ancla enemiga. Hasta el inicio de tu próximo turno, esa Ancla pierde sus habilidades Activa. |
| `cloudCake` | Cloud y Cake, Pandilla Peluda | entidad | 2 | Rara | 1/3/1 | baluarte | Continuo — Mientras esta Entidad esté preparada en el Frente, las Anclas enemigas no pueden activar habilidades Activa. |
| `comerciante` | Comerciante del Tiempo | entidad | 2 | Común | 1/3/1 | — | Entrada — Roba 1 carta, luego coloca 1 carta de tu mano en el fondo de tu mazo. |
| `contrabandista` | Contrabandista del Vacío | entidad | 2 | Común | 2/2/1 | — | Entrada — Puedes descartar 1 carta. Si lo haces, roba 1 carta. |
| `contrato` | Contrato de Desmantelamiento | directiva | 2 | Común | — | — | Elige una: - Destruye 1 Ancla enemiga. - Mira la carta superior de tu mazo. Puedes ponerla en el fondo. Timeline Bonus — Si el oponente controla más Anclas que tú: Roba 1 carta. |
| `disruptor` | Disruptor de Estática | entidad | 2 | Poco Común | 1/3/1 | — | Entrada — Remueve Glitch de hasta 1 carta aliada. Si no tienes ninguna carta con Glitch, agota una Entidad enemiga y aplicale Glitch. |
| `dronEnt` | Dron de Entregas | entidad | 2 | Común | 1/2/1 | aereo | Si esta Entidad es destruida, roba 1 carta. |
| `enfriamiento` | Enfriamiento de Emergencia | directiva | 2 | Común | — | — | Elige una Entidad enemiga. Pierde todos los aumentos temporales de POW hasta el final del turno. Si esa Entidad es Forja, recibe 1 Daño. |
| `estabilizadorAG` | Estabilizador Anti-Glitch | ancla | 2 | Común | — | — | Continuo — Tus cartas en el Timeline no pueden recibir Glitch. Activa — Agota y destruye esta Ancla: Remueve Glitch de hasta 2 cartas aliadas. |
| `firewallCuant` | Firewall Cuántico | directiva | 2 | Común | — | — | Hasta el inicio de tu próximo turno, tus cartas en el Timeline no pueden recibir Glitch. Timeline Bonus — Si una carta aliada ya tenía Glitch: Remueve Glitch de hasta 1 carta aliada. |
| `firewallFisico` | Firewall Físico | ancla | 2 | Común | — | — | Continuo — Tus cartas en el Timeline no pueden recibir Glitch. Activa — Agota y destruye esta Ancla: Remueve Glitch de hasta 1 carta aliada. |
| `apsMoneda` | Moneda Conmemorativa del Colapso | ancla | 2 | Promo | — | — | Activa — Agota esta Ancla: Revela la carta superior de tu mazo. Si su coste es par, mira la carta superior de tu mazo. Puedes ponerla en el fondo. Si su coste es impar, genera 1 Aether temporal este turno. |
| `municion` | Munición Perforante | directiva | 2 | Común | — | — | Elige una Entidad aliada. Gana +2 POW este turno. Si la Entidad elegida ataca a una Entidad con Baluarte este turno, gana +1 POW adicional durante ese combate. Timeline Bonus — Si el oponente controla una Entidad con Baluarte: Mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `recalibrar` | Recalibración de Timeline | directiva | 2 | Común | — | — | Roba 1 carta. Puedes colocar 1 carta de tu mano boca abajo en tu Timeline agotada. Esta acción no cuenta como tu carga de Timeline del turno. |
| `scriptAntimagia` | Script Antimagia | directiva | 2 | Común | — | — | Reacción — Cuando el oponente juega una Directiva de coste 1: Cancela esa Directiva. Va al Vacío sin resolverse. Timeline Bonus — Si el oponente jugó 2 o más Directivas este turno: Mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `selloAlmas` | Sello de Almas | directiva | 2 | Común | — | — | Exilia 1 carta objetivo del Vacío de un jugador. Timeline Bonus — Si esa carta era una Entidad: Mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `ultimoRecurso` | Último Recurso | directiva | 2 | Común | — | — | Roba 1 carta. Si tienes 2 o menos cartas en mano después de resolver este efecto, roba 1 carta adicional. |
| `vacunaGen` | Vacuna Genética | directiva | 2 | Común | — | — | Elige una Entidad con Mutar. Pierde sus habilidades y Keywords hasta el final del turno. Si esa Entidad está dañada, recibe 1 Daño. Timeline Bonus — Si controlas una Entidad con Baluarte: Mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `canonEstatica` | Cañón de Estática Pulsante | ancla | 3 | Poco Común | — | — | Activa — Paga 1 Aether, agota y destruye esta Ancla: Elige una Entidad enemiga. Pierde Baluarte hasta el final del turno y recibe 1 Daño. |
| `conciliadora` | Conciliadora del Mercado de Eones | entidad | 3 | Rara | 1/4/2 | — | Reacción — Una vez por turno, cuando una Entidad enemiga declara un Ataque: Puedes agotar esta Entidad y pagar 2 Aether. Si lo haces, ese Ataque no inflige ni recibe daño. |
| `defoliante` | Defoliante de Área | directiva | 3 | Poco Común | — | — | Destruye todos los Tokens en el Frente enemigo. Timeline Bonus — Si destruiste 2 o más Tokens de esta forma: Roba 1 carta, luego descarta 1 carta. |
| `edictoOxid` | Edicto de Oxidación | directiva | 3 | Poco Común | — | — | Destruye 1 Ancla enemiga. Si controlas una Entidad con Baluarte, Sanar 1 a una Entidad aliada. |
| `apsGlobo` | El Globo de Maddie | directiva | 3 | Promo | — | — | Mira las 2 cartas superiores de tu mazo. Pon una en la parte superior y la otra en el fondo. Si la carta que dejaste arriba es una Entidad, Sanar 1 a una Entidad aliada. Exilia esta Directiva después de resolverse. |
| `mercadoEones` | Mercado de Eones Abierto | directiva | 3 | Rara | — | — | Cada jugador roba 1 carta. Luego, si tienes menos cartas en mano que el oponente, roba 1 carta adicional. |
| `mercVet` | Mercenario Veterano | entidad | 3 | Común | 3/4/1 | — | — |
| `pulso` | Pulso de Paradoja | directiva | 3 | Poco Común | — | — | Elige 1 Entidad enemiga. Pierde sus keywords hasta el final del turno. Si está en Lado B, recibe 2 Daño. Timeline Bonus — Si el oponente tiene más cartas en su Timeline que tú: Mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `reinicio` | Reinicio por Electroshock | directiva | 3 | Poco Común | — | — | Elige una Entidad enemiga. Pierde todos los aumentos temporales de POW y HP este turno. Luego recibe 1 Daño. |
| `semillaEq` | Semilla de Equilibrio | entidad | 3 | Rara | 1/4/1 | mutar | Mutar — Elige una: - Esta Entidad gana +2 POW este turno. - Esta Entidad gana Baluarte este turno. |
| `kaelen` | Kaelen, El Nexo Infinito | entidad | 4 | Legendaria | 2/5/1 | — | Entrada — Mira las 3 cartas superiores de tu mazo. Pon una en la parte superior y las demás en el fondo en cualquier orden. Activa — Paga 1 Aether y agota esta Entidad: Mira la carta superior de tu mazo. Puedes ponerla en el fondo. |
| `ludopata` | Ludópata del Aether | entidad | 4 | Rara | 2/4/1 | — | Entrada — Sanar 1 a una Entidad aliada. |
| `maddieLost` | Maddie, La Chica Perdida | entidad | 4 | Legendaria | 2/6/1 | — | Activa — Una vez por turno: Mueve esta Entidad entre tu Frente y Soporte. Si se movió al Frente, gana Impulso este turno. Si se movió al Soporte, Sanar 1 a esta Entidad. |
| `robotCarga` | Robot de Carga | entidad | 4 | Poco Común | 4/4/1 | — | Entrada — Puedes mover una Ancla aliada entre espacios de Soporte. |
| `segador` | Segador de Enjambres | entidad | 4 | Poco Común | 3/3/1 | impacto | Esta Entidad gana +1 POW durante combate contra Tokens. |
| `mago` | El Maravilloso Mago de Wonderia | entidad | 5 | Legendaria | 2/7/1 | — | Activa — Paga 1 Aether y agota esta Entidad: Mira la carta superior de tu mazo. Puedes ponerla en el fondo. Si la dejaste arriba, genera 1 Aether temporal este turno. |
| `nara` | Nara, La Presente Imposible | entidad | 5 | Legendaria | 2/6/1 | glitch | Reacción — Una vez por turno, cuando el oponente aplica Glitch a una carta aliada: Puedes pagar 1 Aether. Si lo haces, remueve Glitch de esa carta y aplica Glitch a 1 Entidad enemiga agotada. |
| `resetZero` | Reset Protocolo ZERO | directiva | 6 | Rara | — | — | Todas las Entidades reciben 3 Daño. Luego destruye todas las Anclas Token. |
