/* MODULO: 08-qol.js
   Calidad de vida: pantalla de fin (revancha/menu), registro de partida, glosario, slots de mazos, ajustes/accesibilidad, estadisticas, import/export y atajos de teclado.
   (Detalle completo y guia para extender: aion-src/ARCHITECTURE.md) */
/* ============ QoL: pantalla de fin + registro de partida ============ */
var LAST_MATCH=null;var GLOG=[];
function logEvent(msg){try{if(typeof msg!=='string')return;GLOG.push(msg);if(GLOG.length>200)GLOG.shift();
  var l=document.getElementById('glogList');if(l){var d=document.createElement('div');d.textContent=((typeof G!=='undefined'&&G&&G.turn)?('T'+G.turn+' · '):'')+msg;l.appendChild(d);l.scrollTop=l.scrollHeight;}}catch(e){}}
function toggleGlog(){var p=document.getElementById('glogPanel');if(p)p.classList.toggle('show');}
function clearGlog(){GLOG=[];var l=document.getElementById('glogList');if(l)l.innerHTML='';}
function endNormalBtns(){var e=document.getElementById('endBtns');if(!e)return;e.innerHTML='';
  var r=document.createElement('button');r.className='bigbtn';r.textContent='↻ Revancha';r.onclick=rematchGame;
  var m=document.createElement('button');m.className='bigbtn alt';m.textContent='🏠 Menú';m.onclick=endToMenu;
  e.appendChild(r);e.appendChild(m);}
function rematchGame(){var o=document.getElementById('endover');if(o)o.classList.remove('show','win','lose');
  if(!LAST_MATCH){endToMenu();return;}var L=LAST_MATCH;startMatch(L.pDeck,L.pFac,L.aiDeck,L.aiFac,L.opts);}
function endToMenu(){var o=document.getElementById('endover');if(o)o.classList.remove('show','win','lose');backToMenu();}
// campaña: rellena endBtns en lugar de un botón fijo

/* ============ QoL: glosario + slots de mazos ============ */
var GLOSS=[
 ['Baluarte','Debe ser atacada antes que otras Entidades aliadas en su misma fila; protege a las demás.'],
 ['Impulso','Puede atacar o Estabilizar el turno en que entra (no sufre el mareo de invocación).'],
 ['Aéreo','Solo puede ser bloqueada/atacada por Entidades con Aéreo o de alcance; evade el frente terrestre.'],
 ['Impacto','Al atacar, el exceso de daño sobre el HP del defensor se traslada; premia mantener el combate.'],
 ['Mutar','Al entrar (o al activarse), eliges una de varias mejoras: token, +POW, cura, keyword, etc.'],
 ['Glitch','Marca una Entidad: no se endereza en su próximo enderezamiento (pierde un turno de actividad).'],
 ['Sincronía (SYNC)','Valor que la Entidad aporta al Estabilizar para generar Puntos AION (PA).'],
 ['Estabilizar','Agotar una Entidad para ganar PA igual a su SYNC, en vez de atacar.'],
 ['Ascensión','Condición que voltea la carta a su Lado B, más poderoso.'],
 ['Timeline (Aether)','Tu recurso por turno: cargas cartas a tu Timeline para pagar costes.'],
 ['Vacío','Tu cementerio. Algunas cartas lo usan como recurso (reanimar, recursión).'],
 ['Dominio Temporal','Victoria al alcanzar 20 Puntos AION (PA).'],
 ['Paradoja Total','Derrota: si debes robar con el mazo vacío, tu línea colapsa.']
];
function openGlossary(){var b=document.getElementById('glossBody');if(b){b.innerHTML=GLOSS.map(function(g){return '<div class="gk"><b>'+g[0]+':</b> '+g[1]+'</div>';}).join('');}
  var m=document.getElementById('glossary');if(m)m.classList.add('show');}
function closeGlossary(){var m=document.getElementById('glossary');if(m)m.classList.remove('show');}

var DECKSLOTS_KEY='aion_decks_v1';
function loadDeckSlots(){try{var s=localStorage.getItem(DECKSLOTS_KEY);if(s)return JSON.parse(s);}catch(e){}return {};}
function saveDeckSlotsObj(o){try{localStorage.setItem(DECKSLOTS_KEY,JSON.stringify(o));}catch(e){}}
function saveDeckSlot(){
  if(typeof CAMP_EDIT!=='undefined'&&CAMP_EDIT){toast('Los slots no aplican al mazo de campaña');return;}
  var tot=deckTotal(builderDeck);if(tot<1){toast('Tu mazo está vacío');return;}
  var name=(prompt&&prompt('Nombre del mazo:'))||'';name=(name||'').trim();if(!name)return;
  var all=loadDeckSlots();all[name]=Object.assign({},builderDeck);saveDeckSlotsObj(all);renderDeckSlots();toast('Mazo guardado: '+name);
}
function loadDeckSlot(name){var all=loadDeckSlots();if(!all[name])return;builderDeck=Object.assign({},all[name]);renderGrid();renderDeckPanel();toast('Mazo cargado: '+name);}
function deleteDeckSlot(name){var all=loadDeckSlots();if(all[name]){delete all[name];saveDeckSlotsObj(all);renderDeckSlots();toast('Mazo borrado: '+name);}}
function renderDeckSlots(){
  var box=document.getElementById('deckSlots');if(!box)return;
  if(typeof CAMP_EDIT!=='undefined'&&CAMP_EDIT){box.style.display='none';return;}
  box.style.display='flex';
  var all=loadDeckSlots();var names=Object.keys(all);
  var html='<span style="color:#9fb0d6">💾 Mis mazos:</span>';
  html+='<button class="minibtn" onclick="saveDeckSlot()">＋ Guardar actual</button>';
  if(!names.length)html+='<span style="color:#6b7aa0">(ninguno aún)</span>';
  names.forEach(function(nm){var t=Object.values(all[nm]).reduce(function(a,b){return a+b;},0);
    var safe=nm.replace(/'/g,"\\'");
    html+='<span style="display:inline-flex;align-items:center;gap:3px;background:#0e1526;border:1px solid #243154;border-radius:8px;padding:2px 6px">'+
      '<button class="minibtn" style="padding:2px 7px" onclick="loadDeckSlot(\''+safe+'\')">'+nm+' ('+t+')</button>'+
      '<button class="minibtn" style="padding:2px 6px" title="Borrar" onclick="deleteDeckSlot(\''+safe+'\')">✕</button></span>';});
  box.innerHTML=html;
}

/* ============ QoL: ajustes/accesibilidad + estadísticas + rendirse ============ */
var SETTINGS=(function(){try{var s=localStorage.getItem('aion_settings_v1');if(s)return JSON.parse(s);}catch(e){}return {motion:true,contrast:false,scale:1};})();
function saveSettings(){try{localStorage.setItem('aion_settings_v1',JSON.stringify(SETTINGS));}catch(e){}}
function applySettings(){var b=document.body;if(!b)return;
  if(b.classList){b.classList.toggle('rmotion',!SETTINGS.motion);b.classList.toggle('hc',!!SETTINGS.contrast);}
  try{b.style.zoom=SETTINGS.scale||1;}catch(e){}}
function setMotion(v){SETTINGS.motion=v;saveSettings();applySettings();openSettings();}
function setContrast(v){SETTINGS.contrast=v;saveSettings();applySettings();openSettings();}
function setScale(v){SETTINGS.scale=v;saveSettings();applySettings();openSettings();}
function closeSettings(){var s=document.getElementById('settings');if(s)s.classList.remove('show');}
function loadStats(){try{var s=localStorage.getItem('aion_stats_v1');if(s){var o=JSON.parse(s);o.total=o.total||{w:0,l:0};o.byFac=o.byFac||{};return o;}}catch(e){}return {total:{w:0,l:0},byFac:{}};}
function recordStat(win){try{var s=loadStats();var f=(typeof G!=='undefined'&&G&&G.player&&G.player.facLbl)||'—';
  s.byFac[f]=s.byFac[f]||{w:0,l:0};if(win){s.total.w++;s.byFac[f].w++;}else{s.total.l++;s.byFac[f].l++;}
  localStorage.setItem('aion_stats_v1',JSON.stringify(s));}catch(e){}}
function concedeGame(){if(typeof G==='undefined'||!G||G.over)return;
  if(typeof confirm==='function'&&!confirm('¿Rendirte? Contará como derrota.'))return;
  endGame(false,'Rendición','Te has rendido.');}
applySettings();

/* ============ QoL: recompensa de campaña + importar/exportar ============ */
function rewardRandomCard(){var r=Math.random();var rar=r<0.55?'C':r<0.8?'PC':r<0.93?'R':r<0.98?'E':'L';
  var pool=Object.keys(CARDS).filter(function(k){return CARDS[k].rar===rar&&CARDS[k].type!=='token'&&!CARDS[k].promo;});
  if(!pool.length)pool=Object.keys(CARDS).filter(function(k){return CARDS[k].rar==='C'&&CARDS[k].type!=='token';});
  return pool[Math.floor(Math.random()*pool.length)];}
// campResolve final: combate -> recompensa antes de avanzar
// importar/exportar mazos
function exportDeck(){try{var code=btoa(unescape(encodeURIComponent(JSON.stringify(builderDeck))));
  if(typeof prompt==='function')prompt('Copia el código de tu mazo:',code);else toast('Código: '+code);}catch(e){toast('No se pudo exportar');}}
function importDeck(){
  if(typeof CAMP_EDIT!=='undefined'&&CAMP_EDIT){toast('No disponible al editar el mazo de campaña');return;}
  var code=(typeof prompt==='function'&&prompt('Pega el código de mazo:'))||'';code=(code||'').trim();if(!code)return;
  try{var obj=JSON.parse(decodeURIComponent(escape(atob(code))));var nd={};
    Object.keys(obj).forEach(function(k){if(CARDS[k]&&(obj[k]|0)>0)nd[k]=Math.min(3,obj[k]|0);});
    if(!Object.keys(nd).length){toast('Código sin cartas válidas');return;}
    builderDeck=nd;renderGrid();renderDeckPanel();toast('Mazo importado ('+deckTotal(nd)+' cartas)');
  }catch(e){toast('Código inválido');}}

/* ============ QoL: atajos de teclado + onboarding + lecciones de keyword ============ */
function tutKwLesson(def){
  if(typeof G==='undefined'||!G||!G.tutorial||!G.tut)return;
  var T=G.tut;T.kw=T.kw||{};
  var L={
    baluarte:'<b>Keyword: Baluarte</b> 🛡️<br>Una Entidad con Baluarte <b>debe ser atacada antes</b> que sus aliadas de la misma fila: protege a las demás como un muro.',
    impulso:'<b>Keyword: Impulso</b> ⚡<br>Esta Entidad <b>puede atacar o Estabilizar el mismo turno en que entra</b>, saltándose la inestabilidad de invocación.',
    aereo:'<b>Keyword: Aéreo</b> 🕊️<br>Solo puede ser bloqueada o atacada por Entidades con <b>Aéreo</b> (o de alcance): evade el frente terrestre.',
    impacto:'<b>Keyword: Impacto</b> 💥<br>Al atacar, el <b>daño sobrante</b> sobre el HP del defensor se traslada. Premia mantener el combate en movimiento.',
    mutar:'<b>Keyword: Mutar</b> 🧬<br>Al entrar eliges <b>una de varias mejoras</b> (token, +POW, cura, keyword...). Adapta la Entidad a la situación.',
    glitch:'<b>Keyword: Glitch</b> 🌀<br>Marca a una Entidad: <b>no se endereza</b> en su próximo enderezamiento, así que pierde un turno de actividad.'
  };
  var kws=(def&&def.kw)||[];
  for(var i=0;i<kws.length;i++){var k=kws[i];if(L[k]&&!T.kw[k]){T.kw[k]=true;tutEnqueue([L[k]]);return;}}
  if(def&&def.mutar&&!T.kw.mutar){T.kw.mutar=true;tutEnqueue([L.mutar]);}
}
// onboarding de primer arranque
function showWelcome(){var m=document.getElementById('welcome');if(m)m.classList.add('show');}
function welcomeSeen(){try{localStorage.setItem('aion_seen_v1','1');}catch(e){}}
function welcomeTutorial(){var m=document.getElementById('welcome');if(m)m.classList.remove('show');welcomeSeen();if(typeof openTutorial==='function')openTutorial();}
function welcomeSkip(){var m=document.getElementById('welcome');if(m)m.classList.remove('show');welcomeSeen();}
(function(){try{if(!localStorage.getItem('aion_seen_v1'))setTimeout(showWelcome,700);}catch(e){}})();
// atajos de teclado
function qolEsc(){
  ['welcome','settings','glossary','campReward','voidView','cardDetail'].forEach(function(id){var el=document.getElementById(id);if(el&&el.classList)el.classList.remove('show');});
  if(typeof closeMenu==='function')closeMenu();
  if(typeof G!=='undefined'&&G&&G.mode){if(typeof cancelTarget==='function')cancelTarget();else{G.mode=null;applyModeHighlights();render();}}
}
document.addEventListener('keydown',function(e){
  var tag=(e.target&&e.target.tagName)||'';if(tag==='INPUT'||tag==='SELECT'||tag==='TEXTAREA')return;
  var k=e.key;
  if(k==='Escape'){qolEsc();return;}
  if(k==='?'){if(typeof openGlossary==='function')openGlossary();return;}
  var b=document.getElementById('board');if(!b||b.classList.contains('hidden'))return;
  if(typeof G==='undefined'||!G||G.over||G.active!=='player'||(typeof busy!=='undefined'&&busy))return;
  if(k==='e'||k==='E'||k==='Enter'){e.preventDefault();if(typeof endTurn==='function')endTurn();}
  else if(k==='c'||k==='C'){if(typeof beginCharge==='function')beginCharge();}
  else if(k==='l'||k==='L'){if(typeof toggleGlog==='function')toggleGlog();}
});

