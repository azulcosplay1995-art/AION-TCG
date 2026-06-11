/* MODULO: 07-campaign.js
   Campania — HELPERS COMPARTIDOS que reutiliza la campania activa: mazo base, coleccion, mercado/economia, editor de mazo, briefing/consejos, pantalla de victoria. NOTA: el mapa lineal antiguo se ELIMINO; la campania ACTIVA es la ramificada en 09-campaign-map.js.
   (Detalle completo y guia para extender: aion-src/ARCHITECTURE.md) */
/* ============ MODO CAMPAÑA — Los Fragmentos de Kaelen (Fase A) ============ */
var CAMP_SAVE='aion_camp_v1';
var CAMP_PREV_DIFF='normal';
var CAMP=null;
var CAMP_BASIC_DECK={kaelen:1,mercVet:3,comerciante:3,contrabandista:3,dronEnt:3,caravana:2,segador:2,disruptor:2,botiquin:2,recalibrar:2,municion:2,bateria:2,huellas:1,dronx:2};
var CAMP_NODES=[
  {id:0,name:'Despertar del Fragmento',region:'El Umbral',fac:'solaris',diff:'easy',type:'combat'},
  {id:1,name:'Ciudadela Blanca',region:'Solaris',fac:'solaris',diff:'easy',type:'combat'},
  {id:2,name:'Mercado de Eones',region:'Neutral',fac:'neutral',diff:null,type:'shop'},
  {id:3,name:'Ciudad Neón',region:'Neón',fac:'neon',diff:'normal',type:'combat'},
  {id:4,name:'Zona Muerta',region:'Gaia',fac:'gaia',diff:'normal',type:'combat'},
  {id:5,name:'Mercado de Eones',region:'Neutral',fac:'neutral',diff:null,type:'shop'},
  {id:6,name:'Yermos de Hierro',region:'Forja',fac:'forja',diff:'normal',type:'combat'},
  {id:7,name:'Torre de la Melodía',region:'Cónclave',fac:'conclave',diff:'hard',type:'combat'},
  {id:8,name:'Mercado de Eones',region:'Neutral',fac:'neutral',diff:null,type:'shop'},
  {id:9,name:'Fisuras de Nada',region:'Vacío',fac:'vacio',diff:'hard',type:'boss-yami'},
  {id:10,name:'Protocolo Xul-Than',region:'Horizonte de Eventos',fac:'vacio',diff:'hard',type:'boss-xul'}
];
function campIntro(){showCoachMsg('<b>Los Fragmentos de Kaelen</b><br>Kaelen, el Nexo Infinito, se fragmentó para salvar la existencia. Eres una de sus esquirlas: reúne Fragmentos a través de un mundo roto para detener a Xul-Than, la Estrella Muerta, antes de que todo caiga en la Paradoja Total.<br><br>Empiezas con un mazo básico. Gana combates, consigue Cristales de Aether y mejora tu baraja.','Comenzar travesía →',function(){hideCoach();campNew();renderCampaign();});}
function campToMenu(){DIFF=CAMP_PREV_DIFF;backToMenu();}
function campReset(){showCoachMsg('<b>¿Nueva travesía?</b><br>Perderás tu progreso, colección y Cristales actuales.','Sí, reiniciar',function(){hideCoach();campNew();renderCampaign();});}
function campShowDeck(){var tot=0,html='';var fo=['solaris','neon','gaia','forja','conclave','vacio','neutral'];
  Object.keys(CAMP.deck).sort(function(a,b){return fo.indexOf(CARDS[a].fac)-fo.indexOf(CARDS[b].fac);}).forEach(function(k){tot+=CAMP.deck[k];html+=CAMP.deck[k]+'x '+CARDS[k].name+'<br>';});
  showCoachMsg('<b>Tu mazo ('+tot+' cartas)</b><div style="max-height:240px;overflow:auto;text-align:left;font-size:12px;margin-top:8px">'+html+'</div>','Cerrar',hideCoach);}
function campHideHud(){['helpBtn','muteBtn','musicBtn','emoteBtn'].forEach(function(id){var e=document.getElementById(id);if(e)e.classList.add('hidden');});}
function campBack(){DIFF=CAMP_PREV_DIFF;campHideHud();show('campaign');renderCampaign();}
function campVictory(){DIFF=CAMP_PREV_DIFF;campHideHud();show('campaign');showCoachMsg('<b>El silencio se detiene.</b><br>Xul-Than colapsa sobre sí mismo. Por un presente más, gracias al Ancla de Nara, la línea temporal respira. Los Fragmentos de Kaelen perduran.<br><br>🏆 <b>Travesía completada</b>','Volver al mapa',function(){hideCoach();renderCampaign();});}

/* ============ MODO CAMPAÑA — Economía + Mercado (Fase B) ============ */
var CAMP_EDIT=false;var CAMP_EDIT_RETURN='map';
var SELLP={C:8,PC:16,R:35,E:60,L:100,P:80};
var PACK_COST=100;
var RAR_NEXT={C:'PC',PC:'R',R:'E',E:'L'};
function addToColl(k,n){CAMP.collection[k]=(CAMP.collection[k]||0)+(n||1);}
function excessOf(k){return (CAMP.collection[k]||0)-(CAMP.deck[k]||0);}
// recompensas (sobrescribe Fase A): más Cristales para alimentar la economía
// tienda
function campShop(node){campShopOpen(node);}
function campShopOpen(node){show('campShop');campShopRender();}
function buyPack(){if(CAMP.crystals<PACK_COST){toast('Cristales insuficientes');return;}
  CAMP.crystals-=PACK_COST;var pack=generatePack();pack.forEach(function(it){addToColl(it.key,1);});campSave();campShopRender(pack);
  toast('Data-Packet abierto: 10 Fragmentos añadidos a tu colección');}
function sellCard(k){if(excessOf(k)<=0)return;var r=CARDS[k].rar;CAMP.collection[k]--;CAMP.crystals+=(SELLP[r]||5);campSave();campShopRender();}
function tradeUp(r){var nx=RAR_NEXT[r];if(!nx)return;
  var pool=Object.keys(CAMP.collection).filter(function(k){return CARDS[k]&&CARDS[k].rar===r&&excessOf(k)>0;});
  var total=pool.reduce(function(a,k){return a+excessOf(k);},0);
  if(total<3){toast('Necesitas 3 duplicados de rareza '+r);return;}
  var need=3;for(var i=0;i<pool.length&&need>0;i++){var k=pool[i];var take=Math.min(excessOf(k),need);CAMP.collection[k]-=take;need-=take;}
  var cands=Object.keys(CARDS).filter(function(k){return CARDS[k].rar===nx&&CARDS[k].type!=='token'&&!CARDS[k].promo;});
  var won=cands[Math.floor(Math.random()*cands.length)];addToColl(won,1);campSave();
  toast('Fusión: obtuviste '+CARDS[won].name+' ('+nx+')');campShopRender();}
function campShopRender(got){
  var sc=document.getElementById('shopCrystals');if(sc)sc.textContent='💎 '+CAMP.crystals+' Cristales';
  var bd=document.getElementById('shopBody');if(!bd)return;var html='';
  html+='<div class="shopsec"><h3>📦 Data-Packet (10 Fragmentos)</h3>';
  html+='<p class="shopsub">Misma distribución que los sobres estándar. Las cartas van a tu colección.</p>';
  html+='<button class="bigbtn" '+(CAMP.crystals<PACK_COST?'disabled':'')+' onclick="buyPack()">Comprar — '+PACK_COST+' 💎</button>';
  if(got&&got.length){html+='<div class="packrow">';got.forEach(function(it){var d=CARDS[it.key];html+='<div class="card '+FAC[d.fac].cls+' r-'+(d.rar||'C')+' t-'+d.type+'" style="transform:scale(.74)">'+cardInnerHTML(d)+'</div>';});html+='</div>';}
  html+='</div>';
  html+='<div class="shopsec"><h3>💱 Vender duplicados</h3><p class="shopsub">Solo copias libres (que no usa tu mazo guardado).</p>';
  var sell=Object.keys(CAMP.collection).filter(function(k){return excessOf(k)>0&&CARDS[k];}).sort(function(a,b){return CARDS[a].name.localeCompare(CARDS[b].name);});
  if(!sell.length)html+='<p class="shopsub">No tienes duplicados libres por ahora.</p>';
  else{html+='<div class="selllist">';sell.forEach(function(k){var d=CARDS[k];html+='<div class="sellrow"><span>'+d.name+' ('+d.rar+') · '+excessOf(k)+' libres</span><button class="minibtn" onclick="sellCard(\''+k+'\')">Vender 1 (+'+(SELLP[d.rar]||5)+'💎)</button></div>';});html+='</div>';}
  html+='</div>';
  html+='<div class="shopsec"><h3>🔁 Intercambio (3 duplicados → 1 de rareza superior)</h3><div class="traderow">';
  ['C','PC','R','E'].forEach(function(r){var tot=Object.keys(CAMP.collection).filter(function(k){return CARDS[k]&&CARDS[k].rar===r;}).reduce(function(a,k){return a+Math.max(0,excessOf(k));},0);
    html+='<button class="minibtn" '+(tot<3?'disabled':'')+' onclick="tradeUp(\''+r+'\')">3 '+r+' → 1 '+RAR_NEXT[r]+' ('+tot+' libres)</button>';});
  html+='</div></div>';
  bd.innerHTML=html;
}
// editor de mazo restringido a la colección
function campEditDeck(ret){CAMP_EDIT=true;CAMP_EDIT_RETURN=ret||'map';builderDeck=Object.assign({},CAMP.deck);openBuilder();
  var ab=document.getElementById('autogenBar');if(ab)ab.style.display='none';
  var st=document.getElementById('starterBar');if(st)st.style.display='none';
  var pb=document.getElementById('playDeckBtn');if(pb){pb.textContent='💾 Guardar mazo';pb.onclick=campSaveDeck;}
  var mb=document.querySelector('#builder .bhead .minibtn');if(mb)mb.onclick=campCancelEdit;
  var h=document.querySelector('#builder .bhead h2');if(h)h.textContent='MI MAZO (Campaña)';
  toast('Construye con las cartas que posees');
}
function campRestoreBuilder(){CAMP_EDIT=false;
  var ab=document.getElementById('autogenBar');if(ab)ab.style.display='';
  var st=document.getElementById('starterBar');if(st)st.style.display='';
  var pb=document.getElementById('playDeckBtn');if(pb){pb.textContent='▶ JUGAR';pb.onclick=function(){playWithDeck();};}
  var mb=document.querySelector('#builder .bhead .minibtn');if(mb)mb.onclick=function(){backToMenu();};
  var h=document.querySelector('#builder .bhead h2');if(h)h.textContent='CONSTRUCTOR';
}
function campSaveDeck(){var tot=deckTotal(builderDeck);if(tot<20){toast('Necesitas al menos 20 cartas');return;}
  CAMP.deck=Object.assign({},builderDeck);campSave();campRestoreBuilder();toast('Mazo guardado');
  if(CAMP_EDIT_RETURN==='shop'){campShopOpen();}else{campHideHud();show('campaign');renderCampaign();}}
function campCancelEdit(){campRestoreBuilder();
  if(CAMP_EDIT_RETURN==='shop'){campShopOpen();}else{campHideHud();show('campaign');renderCampaign();}}

/* ============ MODO CAMPAÑA — Jefe + narrativa + consejos (Fase C) ============ */
var CAMP_FLAVOR={
  0:'Tu conciencia se reensambla entre los restos del Colapso. Una sombra hostil bloquea el primer paso de tu travesía.',
  1:'Isla flotante de luz cegadora y geometría perfecta. Los Centinelas Solaris no reconocen a un Fragmento como aliado.',
  3:'Metrópolis eléctrica donde la realidad se hackea y la atención es moneda. Los Runners de Zero-Day cazan avatares como el tuyo.',
  4:'Selva de carne y raíces que asimila el metal. Las bestias mutantes de Gaia crecen con cada turno que les concedes.',
  6:'Infierno industrial de chatarra ardiente. Los soldados de la Forja se vuelven más fuertes cuanto más daño reciben.',
  7:'La Torre donde el tiempo no fluye: se calcula mediante música. Los Cronomantes del Cónclave te robarán la iniciativa si tardas.',
  9:'El sonido muere y la realidad se desvanece en gris. Yami, Oscuridad Encarnada, guarda el umbral del Vacío.',
  10:'El horizonte de eventos. La Estrella Muerta aguarda. Xul-Than no ataca: consume tu tiempo. Vence antes de que tu mazo se desvanezca.'
};
// redefinición: etiqueta de jefe + flag boss
// redefinición: briefing narrativo + consejo automático tras derrotas
function campFacThreat(fac){return ({
  solaris:'Solaris se atrinchera con muros Baluarte. Lleva remoción o presión que no se atasque contra defensas.',
  neon:'Neón es agresivo (Impulso) y aplica Glitch. Lleva bloqueadores tempranos y algo de Sanar.',
  gaia:'Gaia evoluciona con Mutar y gana cuerpos grandes. Lleva remoción que mate antes de que crezcan.',
  forja:'Forja se fortalece al recibir daño y golpea con Impacto. Evita trades largos; remata rápido.',
  conclave:'Cónclave controla el tiempo y filtra cartas. Presiónalo pronto, antes de que tome ventaja.',
  vacio:'Vacío te desgasta el mazo y reanima. Cierra rápido y no juegues mazos enormes.'
})[fac]||'Adapta tu mazo a la amenaza de esta región.';}
function campChallengeTip(node){
  if(node.type==='boss-xul')return 'Xul-Than consume tu mazo cada turno (riesgo de Paradoja) y silencia tu mejor unidad. Baja tu coste medio, recorta el mazo hacia ~30 cartas y gana la carrera de PA rápido.';
  if(node.type==='boss-yami')return 'Yami es un muro del Vacío con mucha vida. Lleva daño sostenido o perforante y no dejes que reanime a placer.';
  return campFacThreat(node.fac);
}
function campAdvice(){
  if(!CAMP){toast('Inicia una travesía primero');return;}
  var d=CAMP.deck,keys=Object.keys(d),tot=deckTotal(d),tips=[];
  var low=0,sum=0,n=0;keys.forEach(function(k){var c=(CARDS[k].cost||0);sum+=c*d[k];n+=d[k];if(c<=2)low+=d[k];});
  var avg=n?(sum/n):0;
  if(tot>34)tips.push('Tu mazo tiene '+tot+' cartas. Recórtalo hacia 30 para robar tus mejores cartas más seguido.');
  if(low<Math.ceil(tot*0.3))tips.push('Tienes pocas cartas baratas (coste ≤2). Añade más para no quedarte sin jugadas al inicio.');
  if(avg>3.4)tips.push('Tu coste medio es alto ('+avg.toFixed(1)+'). Baja la curva para un reloj más rápido.');
  var isRem=function(k){var e=CARDS[k].effect||CARDS[k].entrada||{};var t=e.t||'';return ['damage','dmgScaled','destroy','destroyOrDmg','aoeFront','millThenDmg'].indexOf(t)>=0;};
  var rem=keys.filter(isRem).reduce(function(a,k){return a+d[k];},0);
  if(rem<3)tips.push('Llevas poca remoción. Añade Directivas o entidades que dañen/destruyan amenazas enemigas.');
  var draw=keys.filter(function(k){var e=CARDS[k].effect||CARDS[k].entrada||{};return ['draw','drawDiscard','peek'].indexOf(e.t||'')>=0;}).reduce(function(a,k){return a+d[k];},0);
  if(draw<2)tips.push('Añade algo de robo o filtrado para encontrar tus piezas clave a tiempo.');
  var unused=Object.keys(CAMP.collection).filter(function(k){return (CAMP.collection[k]||0)>(d[k]||0)&&CARDS[k]&&CARDS[k].type!=='token';});
  var sugg=unused.filter(function(k){var e=CARDS[k].effect||CARDS[k].entrada||{};return ['damage','dmgScaled','destroy','destroyOrDmg','draw','heal','peek'].indexOf(e.t||'')>=0;}).slice(0,3).map(function(k){return CARDS[k].name;});
  if(sugg.length)tips.push('En tu colección, sin usar: '+sugg.join(', ')+'. Podrían reforzar tu mazo.');
  if(!tips.length)tips.push('Tu mazo luce equilibrado. ¡Buen trabajo! Ajusta según la región que enfrentes.');
  showCoachMsg('<b>💡 Consejo de mazo ('+tot+' cartas · coste medio '+avg.toFixed(1)+')</b><div style="text-align:left;font-size:13px;margin-top:8px">• '+tips.join('<br>• ')+'</div>','Cerrar',hideCoach);
}

