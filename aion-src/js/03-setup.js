/* MODULO: 03-setup.js
   Arranque y UI fuera de combate: tokens, dificultad, navegación de pantallas, constructor de mazos, apertura de sobres y mazos prearmados (Starters/Demo).
   (Detalle completo y guia para extender: aion-src/ARCHITECTURE.md) */

const TOKEN_KEYS=['t_brote','t_escudero','t_proxy','t_broteM','t_horror'];
function isToken(def){return def.type==='token';}

/* difficulty state */
let DIFF='normal';
/* ============================================================
   NAVEGACIÓN + CONSTRUCTOR DE MAZOS
   ============================================================ */
let builderDeck={}, curTab='solaris', allowPromos=false;
function show(id){const target=document.getElementById(id);if(!target){console.warn('Pantalla no encontrada: '+id);return;}document.querySelectorAll('.scrn').forEach(s=>s.classList.add('hidden'));target.classList.remove('hidden');}
function backToMenu(){show('start');['helpBtn','muteBtn','musicBtn','emoteBtn'].forEach(id=>document.getElementById(id).classList.add('hidden'));const eb=document.getElementById('emoteBar');if(eb)eb.classList.remove('show');}

function openBuilder(){
  show('builder');
  // tabs
  const tabs=document.getElementById('factionTabs');tabs.innerHTML='';
  FAC_ORDER.forEach(f=>{
    const b=document.createElement('button');b.className='btab '+FAC[f].cls+(f===curTab?' on':'');
    b.textContent=FAC[f].art+' '+FAC[f].name.split(' ').slice(-1);
    b.onclick=()=>{curTab=f;openBuilder();};tabs.appendChild(b);
  });
  const pb=document.createElement('button');pb.className='btab'+(curTab==='promo'?' on':'');pb.style.color='var(--gold)';pb.textContent='✨ Promo';pb.onclick=()=>{curTab='promo';openBuilder();};tabs.appendChild(pb);
  const lbl=document.createElement('label');lbl.style.cssText='display:flex;align-items:center;gap:5px;font-size:12px;color:#cdd8f5;margin-left:8px;cursor:pointer';
  lbl.innerHTML='<input type="checkbox"'+(allowPromos?' checked':'')+'> Permitir cartas Promo (no estándar)';
  lbl.querySelector('input').onchange=e=>{allowPromos=e.target.checked;renderGrid();renderDeckPanel();toast(allowPromos?'Promos permitidas — la IA también las usará':'Promos desactivadas');};
  tabs.appendChild(lbl);
  // autogen bar
  const ag=document.getElementById('autogenBar');
  ag.innerHTML='<span style="font-size:11px;color:#9fb0d6;align-self:center;margin-right:4px">AUTOGENERAR MAZO:</span>';
  FAC_ORDER.filter(f=>f!=='neutral').forEach(f=>{
    const b=document.createElement('button');b.className='agbtn';b.style.background=FAC[f].color;
    b.textContent=FAC[f].art+' '+FAC[f].name;b.onclick=()=>{builderDeck=buildAutoDeck(f,{promo:allowPromos});renderDeckPanel();renderGrid();toast('Mazo '+FAC[f].name+' generado');};
    ag.appendChild(b);
  });
  // solo neutrales
  const nb=document.createElement('button');nb.className='agbtn';nb.style.background='var(--neutral)';nb.style.color='#0b1020';nb.textContent='⚪ Solo Neutrales';
  nb.onclick=()=>{builderDeck=buildAutoDeck('neutral',{promo:allowPromos});renderDeckPanel();renderGrid();toast('Mazo Neutral generado');};ag.appendChild(nb);
  // doble facción
  const dwrap=document.createElement('span');dwrap.style.cssText='display:inline-flex;align-items:center;gap:4px;margin-left:6px;font-size:11px;color:#9fb0d6';
  const mkSel=()=>{const s=document.createElement('select');s.style.cssText='background:#161d36;color:#cdd8f5;border:1px solid var(--line);border-radius:8px;padding:5px 6px;font-size:11px';
    FAC_ORDER.filter(f=>f!=='neutral').forEach(f=>{const o=document.createElement('option');o.value=f;o.textContent=FAC[f].art+' '+FAC[f].name.split(' ').slice(-1);s.appendChild(o);});return s;};
  const sA=mkSel(),sB=mkSel();sB.selectedIndex=1;
  const db=document.createElement('button');db.className='agbtn';db.style.background='linear-gradient(90deg,var(--solaris),var(--conclave))';db.style.color='#0b1020';db.textContent='🎲 Doble facción';
  db.onclick=()=>{const a=sA.value,b=sB.value;builderDeck=buildAutoDeck(a,{fac2:b,promo:allowPromos});renderDeckPanel();renderGrid();toast('Mazo '+FAC[a].name.split(' ').slice(-1)+(a!==b?' / '+FAC[b].name.split(' ').slice(-1):'')+' generado');};
  dwrap.appendChild(document.createTextNode('Dual:'));dwrap.appendChild(sA);dwrap.appendChild(sB);dwrap.appendChild(db);ag.appendChild(dwrap);
  // starter bar
  const sb=document.getElementById('starterBar');
  sb.innerHTML='<span style="font-size:11px;color:#9fb0d6;align-self:center;margin-right:4px">MAZOS PREARMADOS (STARTER):</span>';
  Object.keys(STARTERS).forEach(key=>{const st=STARTERS[key];const b=document.createElement('button');b.className='agbtn';b.style.background='var(--gold)';b.title=st.facs+' · '+st.desc;
    b.textContent='📦 '+st.name;b.onclick=()=>loadStarter(key);sb.appendChild(b);});
  // ai selector
  const sel=document.getElementById('aiFacSel');
  if(!sel.dataset.init){sel.innerHTML='<option value="random">Aleatoria</option>'+FAC_ORDER.filter(f=>f!=='neutral').map(f=>`<option value="${f}">${FAC[f].name}</option>`).join('');sel.dataset.init='1';}
  renderGrid();renderDeckPanel();renderDeckSlots();
}

/* ---- filtros (compartidos por constructor y catálogo) ---- */
function val(id){const e=document.getElementById(id);return e?e.value:'';}
function matchFilter(def,f){
  if(def.type==='token')return false;
  if(f.promoOnly){if(!def.promo)return false;}
  else{if(def.promo&&f.hidePromo)return false; if(f.fac&&def.fac!==f.fac)return false;}
  if(f.q){const q=f.q.toLowerCase();const a=def.name.toLowerCase().includes(q);const b=def.sideB&&def.sideB.name.toLowerCase().includes(q);if(!a&&!b)return false;}
  if(f.type&&def.type!==f.type)return false;
  if(f.cost){const ok=f.cost==='6'?def.cost>=6:def.cost==(+f.cost);if(!ok)return false;}
  if(f.kw){const all=(def.kw||[]).concat(def.sideB?(def.sideB.kw||[]):[]);if(!all.includes(f.kw))return false;}
  if(f.rar&&(def.rar||'')!==f.rar)return false;
  return true;
}
let builderFilter={};
function onBuilderFilter(){builderFilter={q:val('bSearch'),type:val('bType'),cost:val('bCost'),kw:val('bKw'),rar:val('bRarity')};renderGrid();}
function clearBuilderFilter(){['bSearch','bType','bCost','bKw','bRarity'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});builderFilter={};renderGrid();}
function renderGrid(){
  const g=document.getElementById('cardGrid');g.innerHTML='';
  const f=curTab==='promo'?Object.assign({promoOnly:true},builderFilter):Object.assign({fac:curTab,hidePromo:true},builderFilter);
  const list=Object.keys(CARDS).filter(k=>matchFilter(CARDS[k],f)).filter(k=>!CAMP_EDIT||(CAMP.collection[k]||0)>0);
  if(list.length===0){g.innerHTML='<div class="noresult">Sin resultados con esos filtros</div>';return;}
  list.forEach(k=>{
    const def=CARDS[k];const ct=builderDeck[k]||0;
    const d=document.createElement('div');d.className='card gcard '+FAC[def.fac].cls+' r-'+(def.rar||'C')+' t-'+def.type;
    const _own=CAMP_EDIT?(CAMP.collection[k]||0):3;
    if(ct>=(CAMP_EDIT?_own:3))d.classList.add('maxed');
    d.innerHTML=cardInnerHTML(def)+(CAMP_EDIT?'<div class="qbadge">×'+ct+'/'+_own+'</div>':(ct>0?`<div class="qbadge">×${ct}</div>`:''));
    d.addEventListener('mouseenter',()=>showPreviewDef(def));
    d.addEventListener('mouseleave',hidePreview);
    d.onclick=()=>addToDeck(k);
    g.appendChild(d);
  });
}
/* ---- catálogo ---- */
function openCatalog(){show('catalog');renderCatalog();}

/* ===== Simulador de apertura de sobres =====
   10 cartas por sobre: 6 Comunes, 2 Poco Comunes, 1 Rara, 1 Wildcard.
   Wildcard: 65% Rara · 20% Épica · 12.5% Legendaria · 2.5% Promo. */
let packStats={n:0,R:0,E:0,L:0,P:0};
function buildPackPools(){
  const pools={C:[],PC:[],R:[],E:[],L:[],P:[]};
  Object.keys(CARDS).forEach(k=>{const d=CARDS[k];if(d.type==='token'||d.rar==='T')return;if(pools[d.rar])pools[d.rar].push(k);});
  ['recalibrar','ultimoRecurso'].forEach(k=>{if(CARDS[k]&&pools.C){pools.C.push(k);pools.C.push(k);}});
  return pools;
}
function randFrom(arr){return arr[Math.floor(Math.random()*arr.length)];}
function generatePack(){
  const P=buildPackPools();const out=[];
  for(let i=0;i<6;i++)out.push({key:randFrom(P.C),slot:'C'});
  for(let i=0;i<2;i++)out.push({key:randFrom(P.PC),slot:'PC'});
  out.push({key:randFrom(P.R),slot:'R'});
  const r=Math.random();let wr;
  if(r<0.65)wr='R';else if(r<0.85)wr='E';else if(r<0.975)wr='L';else wr='P';
  let pool=P[wr];if(!pool||!pool.length){wr='R';pool=P.R;}
  out.push({key:randFrom(pool),slot:'WC',wcRarity:wr});
  return out;
}
function openPacks(){
  show('packs');
  document.getElementById('packGrid').innerHTML='';
  document.getElementById('packBanner').textContent='Sincroniza tu terminal y extrae protocolos olvidados del Colapso.';
  updatePackStats();
}
function updatePackStats(){setT('packCount',packStats.n);setT('packR',packStats.R);setT('packE',packStats.E);setT('packL',packStats.L);setT('packP',packStats.P);}
function openOnePack(){
  const pack=generatePack();packStats.n++;
  const grid=document.getElementById('packGrid');grid.innerHTML='';
  const SLOT={C:'Común',PC:'P. Común',R:'Rara'};
  const order={C:0,PC:1,R:2,E:3,L:4,P:5};let best=null;
  pack.forEach((item,i)=>{
    const def=CARDS[item.key];const rar=item.slot==='WC'?item.wcRarity:def.rar;
    if(rar==='R')packStats.R++;else if(packStats[rar]!=null)packStats[rar]++;
    if(!best||order[rar]>order[best.rar])best={rar,name:def.name};
    const w=document.createElement('div');
    w.className='packcard'+(item.slot==='WC'&&['E','L','P'].includes(rar)?' hit-'+rar:'');
    w.style.animationDelay=(i*0.07)+'s';
    const lbl=item.slot==='WC'?'★ '+(rar==='R'?'Rara extra':rar==='E'?'ÉPICA':rar==='L'?'LEGENDARIA':'PROMO'):SLOT[item.slot];
    w.innerHTML='<div class="slotlabel">'+lbl+'</div><div class="card '+FAC[def.fac].cls+' r-'+(def.rar||'C')+' t-'+def.type+'">'+cardInnerHTML(def)+'</div>';
    const cd=w.querySelector('.card');cd.addEventListener('mouseenter',()=>showPreviewDef(def));cd.addEventListener('mouseleave',hidePreview);
    grid.appendChild(w);
  });
  const bn=document.getElementById('packBanner');
  if(best&&best.rar==='P'){bn.innerHTML='✨ <span style="color:var(--neon)">¡PROMO SEMI-LEGAL! '+best.name+'</span>';sfx('win');}
  else if(best&&best.rar==='L'){bn.innerHTML='👑 <span style="color:var(--gold)">¡LEGENDARIA! '+best.name+'</span>';sfx('win');}
  else if(best&&best.rar==='E'){bn.innerHTML='💎 <span style="color:#c79bff">¡Carta Épica! '+best.name+'</span>';sfx('stab');}
  else{bn.textContent='Sobre sincronizado. ¡Sigue extrayendo Fragmentos!';sfx('cast');}
  updatePackStats();
}
function clearCatFilter(){['cFac','cSearch','cType','cCost','cKw','cRarity'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});renderCatalog();}
function renderCatalog(){
  const g=document.getElementById('catGrid');g.innerHTML='';
  const f={fac:val('cFac'),q:val('cSearch'),type:val('cType'),cost:val('cCost'),kw:val('cKw'),rar:val('cRarity')};
  const list=Object.keys(CARDS).filter(k=>matchFilter(CARDS[k],f));
  setT('catCount',list.length+' cartas');
  if(list.length===0){g.innerHTML='<div class="noresult">Sin resultados</div>';return;}
  list.forEach(k=>{
    const def=CARDS[k];const d=document.createElement('div');d.className='card gcard '+FAC[def.fac].cls+' r-'+(def.rar||'C')+' t-'+def.type;
    d.innerHTML=cardInnerHTML(def);
    d.addEventListener('mouseenter',()=>showPreviewDef(def));d.addEventListener('mouseleave',hidePreview);
    d.onclick=()=>openDetail(k);
    g.appendChild(d);
  });
}
let cdKey=null,cdSide='A';
function openDetail(key){cdKey=key;cdSide='A';renderDetail();document.getElementById('cardDetail').classList.add('show');}
function closeDetail(){document.getElementById('cardDetail').classList.remove('show');}
function cdToggleSide(){const def=CARDS[cdKey];if(!def.sideB)return;cdSide=cdSide==='A'?'B':'A';renderDetail(true);}
function sideView(def,side){
  if(side==='B'&&def.sideB){const b=def.sideB;return{name:b.name,fac:def.fac,art:def.art,type:def.type,pos:def.pos,cost:def.cost,rar:def.rar,pow:b.pow,hp:b.hp,sync:b.sync,kw:b.kw||[],text:b.text,mutar:b.mutar,asc:def.asc,ascN:def.ascN,sideB:def.sideB};}
  return def;
}
function posExplain(def){
  if(def.type==='directiva')return def.reaction?'<b>Reacción:</b> solo se usa en el turno del rival, ante un ataque/estabilización/directiva.':'<b>Directiva:</b> efecto de un solo uso; va al Vacío tras resolverse.';
  if(def.type==='ancla')return '<b>Ancla:</b> permanente que se juega en el Soporte. No combate ni puede ser atacada.';
  if(def.pos==='front')return '<b>Posición: Frente.</b> Solo se juega en el Frente; puede Estabilizar y Combatir.';
  if(def.pos==='support')return '<b>Posición: Soporte.</b> Solo en el Soporte; no combate ni es atacada normalmente.';
  if(def.pos==='flex')return '<b>Posición: Flexible.</b> Puedes ponerla en el Frente o el Soporte, y moverla libremente entre ambos.';
  return '';
}
function renderDetail(flip){
  const def=CARDS[cdKey];const view=sideView(def,cdSide);
  const card=document.getElementById('cdCard');card.className='card '+FAC[def.fac].cls+' r-'+(def.rar||'C')+' t-'+def.type;card.innerHTML=cardInnerHTML(view);
  if(flip){card.classList.add('flip');setTimeout(()=>card.classList.remove('flip'),520);}
  setT('cdName',view.name+(cdSide==='B'?' — Lado B':(def.sideB?' — Lado A':'')));
  const rl=def.rar==='L'?'Legendaria':def.rar==='E'?'Épica':def.rar==='R'?'Rara':def.rar==='PC'?'Poco Común':def.rar==='C'?'Común':def.rar==='P'?'Promo':def.rar;
  setT('cdMeta',FAC[def.fac].name+' · '+(def.type==='directiva'?'Directiva':def.type==='ancla'?'Ancla':'Entidad')+' · Coste '+def.cost+' · '+rl);
  document.getElementById('cdPos').innerHTML=posExplain(def);
  document.getElementById('cdText').textContent=displayText(def,view.text||def.text,view.kw);
  let kw='';(view.kw||[]).forEach(k=>{if(KW[k])kw+=`<div><b>${KW[k].name}:</b> ${KW[k].desc}</div>`;});
  if(view.mutar)kw+=`<div><b>Mutar:</b> ${view.mutar.map(o=>o.label).join(' · ')}</div>`;
  if(def.asc){const a=def.asc==='victoria'?'destruir en combate y sobrevivir':def.asc==='resistencia'?'recibir daño en combate y sobrevivir':'llegar a '+def.ascN+' PA';kw+=`<div><b>Ascensión:</b> al ${a} → ${def.sideB.name}</div>`;}
  document.getElementById('cdKw').innerHTML=kw;
  const fb=document.getElementById('cdFlip');fb.style.display=def.sideB?'':'none';fb.textContent=cdSide==='A'?'🔄 Ver Lado B':'🔄 Ver Lado A';
}
function cardInnerHTML(def){
  const fac=FAC[def.fac];
  return `<div class="cost">${def.cost}</div>
    <div class="rar">${def.rar==='L'?'👑':def.rar==='E'?'💎':def.rar==='R'?'★':def.rar==='PC'?'◆':def.rar==='T'?'◇':def.rar==='P'?'✨':'●'}</div>
    <div class="art">${def.art}</div>
    <div class="kw">${(def.kw||[]).map(k=>`<span class="kwchip ${k}">${KW[k]?KW[k].name:k}</span>`).join('')}${def.reaction?'<span class="kwchip" style="background:rgba(255,206,58,.3)">Reacción</span>':''}</div>
    <div class="typeband">${def.reaction?'⚡ Reacción':def.type==='directiva'?'Directiva':def.type==='token'?'Token':def.type==='ancla'?'⚓ Ancla':fac.name}</div>
    <div class="name">${def.name}</div>
    ${def.type==='entidad'||def.type==='token'?`<div class="stats"><span class="stat pow">⚔${def.pow}</span><span class="stat hp">❤${def.hp}</span><span class="stat sync">⧗${def.sync}</span></div>`:''}${(def.rar==='L'||def.rar==='E'||def.rar==='P')?'<div class="holo"></div>':''}`;
}

function deckFactions(deck){const s=new Set();Object.keys(deck).forEach(k=>{if(deck[k]>0&&CARDS[k].fac!=='neutral')s.add(CARDS[k].fac);});return s;}
function deckTotal(deck){return Object.values(deck).reduce((a,b)=>a+b,0);}
function canAdd(key){
  if(CARDS[key].promo&&!allowPromos)return false;
  const ct=builderDeck[key]||0;if(ct>=3)return false;
  if(CAMP_EDIT&&ct>=(CAMP.collection[key]||0))return false;
  if(deckTotal(builderDeck)>=40)return false;
  const f=CARDS[key].fac;
  if(f!=='neutral'){const facs=deckFactions(builderDeck);if(!facs.has(f)&&facs.size>=2)return false;}
  return true;
}
function addToDeck(key){
  if(!canAdd(key)){
    const f=CARDS[key].fac;
    if(CARDS[key].promo&&!allowPromos)toast('Activa "Permitir cartas Promo" para usar esta carta');
    else if((builderDeck[key]||0)>=3)toast('Máximo 3 copias por carta');
    else if(deckTotal(builderDeck)>=40)toast('Máximo 40 cartas');
    else toast('Máximo 2 facciones (+ Neutral)');
    return;
  }
  builderDeck[key]=(builderDeck[key]||0)+1;renderGrid();renderDeckPanel();
}
function removeFromDeck(key){
  if(!builderDeck[key])return;builderDeck[key]--;if(builderDeck[key]<=0)delete builderDeck[key];
  renderGrid();renderDeckPanel();
}
function clearDeck(){builderDeck={};renderGrid();renderDeckPanel();}
function loadStarter(key){const st=STARTERS[key];builderDeck={};st.list.forEach(([k,n])=>{builderDeck[k]=n;});renderGrid();renderDeckPanel();toast('Mazo prearmado cargado: '+st.name);}

function renderDeckPanel(){
  const total=deckTotal(builderDeck);const facs=[...deckFactions(builderDeck)];
  const copiesOk=Object.values(builderDeck).every(v=>v<=3);
  const hasPromo=Object.keys(builderDeck).some(k=>CARDS[k].promo);
  const legal=facs.length<=2 && total<=40 && copiesOk && !hasPromo;
  const playable=facs.length<=2 && copiesOk && total>=20 && total<=45;
  const st=document.getElementById('deckStat');
  const tag=hasPromo?'<span style="color:var(--gold)">✦ con Promos (no estándar)</span>':(legal?'<span class="ok">✓ legal</span>':'<span class="bad">✗ ilegal</span>');
  st.innerHTML=`Cartas: <b class="${total>40?'bad':total>=20?'ok':''}">${total}</b>/40 · Facciones: <b>${facs.length?facs.map(f=>FAC[f].name.split(' ').slice(-1)).join(', '):'—'}</b> ${tag} ${total<20?'<span style="color:#9fb0d6">(mín. 20 para jugar)</span>':''}`;
  (function(){var cv={0:0,1:0,2:0,3:0,4:0,5:0,6:0},ty={entidad:0,ancla:0,directiva:0},mx=1;Object.keys(builderDeck).forEach(function(k){var d=CARDS[k],n=builderDeck[k];var c=Math.min(6,d.cost||0);cv[c]+=n;if(ty[d.type]!=null)ty[d.type]+=n;});for(var i=0;i<=6;i++)if(cv[i]>mx)mx=cv[i];var dc=document.getElementById('deckCurve');if(dc){var bars='';for(var c2=0;c2<=6;c2++){var h=cv[c2]?Math.max(4,Math.round(cv[c2]/mx*46)):0;bars+='<div class="cvcol"><span class="cvn">'+(cv[c2]||'')+'</span><div class="cvbar" style="height:'+h+'px"></div><span class="cvx">'+(c2===6?'6+':c2)+'</span></div>';}dc.innerHTML='<div class="cvtitle">Curva de coste</div><div class="cvrow">'+bars+'</div><div class="cvty">\ud83e\udd7e '+ty.entidad+' \u00b7 \u2693 '+ty.ancla+' \u00b7 \u2726 '+ty.directiva+'</div>';}})();
  const list=document.getElementById('deckList');list.innerHTML='';
  const keys=Object.keys(builderDeck).sort((a,b)=>CARDS[a].cost-CARDS[b].cost||CARDS[a].name.localeCompare(CARDS[b].name));
  keys.forEach(k=>{
    const def=CARDS[k];const r=document.createElement('div');r.className='deckrow';
    r.innerHTML=`<span class="cc">${def.cost}</span><span class="em">${def.art}</span><span class="dn">${def.name}</span><span class="qty">×${builderDeck[k]}</span>`;
    r.title='Quitar 1';r.onclick=()=>removeFromDeck(k);
    r.addEventListener('mouseenter',()=>showPreviewDef(def));r.addEventListener('mouseleave',hidePreview);
    list.appendChild(r);
  });
  document.getElementById('playDeckBtn').disabled=!playable;
}

function orderBucket(arr,facSet){
  // prioriza: entidades de facción > otras de facción > entidades neutrales > otras neutrales
  const has=f=>facSet.has?facSet.has(f):facSet===f;
  const fe=[],fo=[],ne=[],no=[];
  arr.forEach(k=>{const d=CARDS[k];const isFac=has(d.fac),isEnt=d.type==='entidad';
    (isFac&&isEnt?fe:isFac?fo:isEnt?ne:no).push(k);});
  [fe,fo,ne,no].forEach(shuffleArr);
  return [...fe,...fo,...ne,...no];
}
function buildAutoDeck(fac,opt){
  opt=opt||{};
  const facSet=new Set([fac]);if(opt.fac2&&opt.fac2!==fac)facSet.add(opt.fac2);
  // Curva de Aether tipo TCG (mana curve) sobre 40 cartas, máx 3 copias.
  const CAP=40,MAX=3;const cnt={};let total=0;
  const add=(k,n)=>{const cur=cnt[k]||0;const room=Math.min(MAX-cur,n,CAP-total);if(room>0){cnt[k]=cur+room;total+=room;}return room;};
  // mínimo 2 directivas de robo nuevas en todo mazo generado
  const draws=shuffleArr(['recalibrar','ultimoRecurso','planContingencia','mercadoEones']);add(draws[0],1);add(draws[1],1);
  const all=Object.keys(CARDS).filter(k=>CARDS[k].type!=='token'&&(opt.promo||!CARDS[k].promo)&&(facSet.has(CARDS[k].fac)||CARDS[k].fac==='neutral'));
  const byCost={};all.forEach(k=>{const c=Math.min(8,CARDS[k].cost);(byCost[c]=byCost[c]||[]).push(k);});
  Object.keys(byCost).forEach(c=>byCost[c]=orderBucket(byCost[c],facSet));
  const target={1:7,2:9,3:8,4:7,5:4,6:3,7:1,8:1}; // suma 40
  for(const cs of Object.keys(target)){
    let got=0;const t=target[cs];const pool=byCost[cs]||[];
    for(const k of pool){if(got>=t||total>=CAP)break;got+=add(k,Math.min(MAX,t-got));}
  }
  // rellenar hasta 40 con lo disponible (de barato a caro), siempre topado a 3
  for(let cs=1;cs<=8;cs++){if(total>=CAP)break;for(const k of(byCost[cs]||[])){if(total>=CAP)break;add(k,MAX);}}
  return cnt;
}
/* ===== Mazos prearmados (Starters, 40) y de demostración (Demo, 15, solo tutorial) ===== */
const STARTERS={
  luzEterna:{name:'Luz Eterna',facs:'Solaris · Cónclave',desc:'Muros de Baluarte, Sanar y filtrado. Nivel inicial: mejóralo con booster.',list:[['valerius',1],['mirai',1],['escudero',3],['infanteria',2],['custodio',3],['arquera',2],['guardiaCiudadela',2],['sentenciaSolar',3],['murallaIones',2],['acolito',3],['observadora',3],['velo',2],['archivista',2],['negacionAstral',2],['estasis',2],['guardiaTorre',1],['botiquin',2],['recalibrar',2],['dronEnt',2]]},
  pulsoNeon:{name:'Pulso de Neón',facs:'Neón · Forja',desc:'Impulso, Glitch e Impacto a nivel inicial. Mejóralo con booster.',list:[['runner',1],['rust',1],['mensajero',3],['duelista',3],['pistolero',2],['proxyFantasma',2],['malware',2],['backdoor',2],['aprendiz',3],['aprendizFund',2],['ninoCenizas',2],['perro',3],['chatarrero',2],['reciclador',2],['nitro',2],['corte',1],['disipador',1],['municion',2],['ultimoRecurso',2],['dronEnt',2]]},
  ecosMutacion:{name:'Ecos de la Mutación',facs:'Gaia · Vacío',desc:'Mutar y el Vacío como recurso. Nivel inicial: mejóralo con booster.',list:[['bodhisattva',1],['nullPaladin',1],['broteSimb',3],['semilla',3],['recolectoraSavia',3],['jardinero',3],['guardianArb',2],['injertador',2],['cicatrizacion',2],['camaraGerm',1],['perroSombrio',2],['sirviente',2],['predicadorFin',2],['espirituVacio',2],['cosechadoraMenor',2],['lamparaVacia',1],['susurro',1],['grito',1],['recalibrar',2],['contrabandista',2],['caravana',2]]},
};
const DEMOS={
  escudoOrden:{name:'Escudo del Orden',facs:'Solaris · Cónclave',desc:'Defensa (Baluarte), Sanar y filtrado.',teach:'las unidades con Baluarte protegen a las demás, y mirar la carta superior ayuda a planificar.',list:[['escudero',3],['custodio',3],['infanteria',2],['arquera',2],['observadora',3],['acolito',2],['velo',2],['sentenciaSolar',1],['botiquin',2]]},
  fiebreDatos:{name:'Fiebre de Datos',facs:'Neón · Forja',desc:'Agresión temprana (Impulso) y control (Glitch).',teach:'usa Impulso para atacar de inmediato y Glitch para que el rival no recupere sus defensas.',list:[['mensajero',3],['duelista',3],['perro',3],['pistolero',2],['aprendiz',2],['malware',2],['backdoor',2],['nitro',1],['dronEnt',2]]},
  raicesAbismo:{name:'Raíces del Abismo',facs:'Gaia · Vacío',desc:'Decisiones tácticas (Mutar) y uso del Vacío.',teach:'Mutar te deja elegir ataque o defensa; el Vacío es un recurso, no el final de la partida.',list:[['broteSimb',3],['semilla',2],['jardinero',3],['guardianArb',2],['recolectoraSavia',2],['sirviente',2],['predicadorFin',2],['cicatrizacion',1],['lamparaVacia',2],['recalibrar',1]]},
};
function shuffleArr(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function deckMapToList(deck){const l=[];Object.keys(deck).forEach(k=>{for(let i=0;i<deck[k];i++)l.push(k);});return l;}

function playWithDeck(){
  const pList=deckMapToList(builderDeck);
  if(pList.length<20){toast('Necesitas al menos 20 cartas');return;}
  const myFacs=[...deckFactions(builderDeck)];
  let aiFac=document.getElementById('aiFacSel').value;
  if(aiFac==='random')aiFac=FAC_ORDER.filter(f=>f!=='neutral')[Math.floor(Math.random()*6)];
  const aiList=deckMapToList(buildAutoDeck(aiFac,{promo:allowPromos}));
  startMatch(pList,myFacs.length?myFacs.map(f=>FAC[f].name.split(' ').slice(-1)).join('/'):'Neutral',aiList,FAC[aiFac].name.split(' ').slice(-1));
}
function quickPlay(){
  const facs=FAC_ORDER.filter(f=>f!=='neutral');
  const pf=facs[Math.floor(Math.random()*6)];let af=facs[Math.floor(Math.random()*6)];
  const pList=deckMapToList(buildAutoDeck(pf,{promo:allowPromos}));
  const aiList=deckMapToList(buildAutoDeck(af,{promo:allowPromos}));
  startMatch(pList,FAC[pf].name.split(' ').slice(-1),aiList,FAC[af].name.split(' ').slice(-1));
}
/* ---- TUTORIAL ---- */
function openTutorial(){
  const wrap=document.getElementById('tutOpts');wrap.innerHTML='';
  Object.keys(DEMOS).forEach(key=>{const d=DEMOS[key];const c=document.createElement('div');c.className='tutCard';
    c.innerHTML=`<div class="tn">${d.name}</div><div class="tf">${d.facs}</div><div class="td">${d.desc}</div>`;
    c.onclick=()=>startTutorial(key);wrap.appendChild(c);});
  document.getElementById('tutSelect').classList.add('show');
}
function closeTutorial(){document.getElementById('tutSelect').classList.remove('show');}
function startTutorial(demoKey){
  closeTutorial();
  const others=Object.keys(DEMOS).filter(k=>k!==demoKey);
  const aiKey=others[Math.floor(Math.random()*others.length)];
  const pList=deckMapToList(Object.fromEntries(DEMOS[demoKey].list));
  const aiList=deckMapToList(Object.fromEntries(DEMOS[aiKey].list));
  startMatch(pList,DEMOS[demoKey].facs,aiList,DEMOS[aiKey].facs,{tutorial:true,deckKey:demoKey});
}
/* ---- ENTRENADOR (coach) ---- */
function showCoachMsg(html,btn,fn){const c=document.getElementById('coach');document.getElementById('coachText').innerHTML=html;const b=document.getElementById('coachBtn');b.textContent=btn;b.onclick=fn;c.classList.add('show');}
function hideCoach(){document.getElementById('coach').classList.remove('show');}
let coachSeq=[],coachI=0,tutQueue=[];
function coachShowSeq(seq,lastLabel){coachSeq=seq;coachI=0;coachLast=lastLabel||'¡Entendido! ✓';coachStep();}
let coachLast='¡Entendido! ✓';
function coachActive(){return document.getElementById('coach').classList.contains('show')&&coachI<coachSeq.length;}
function coachStep(){
  if(coachI>=coachSeq.length){hideCoach();if(tutQueue.length)setTimeout(()=>{const n=tutQueue.shift();coachShowSeq(n.seq,n.last);},350);else if(typeof G!=='undefined'&&G&&G.tut&&G.tut.spot)setTimeout(()=>{spotlight(G.tut.spot);if(G.tut.spotMsg)toast(G.tut.spotMsg);},200);return;}
  showCoachMsg(coachSeq[coachI],coachI===coachSeq.length-1?coachLast:'Siguiente →',()=>{coachI++;coachStep();});
}
/* Encola una lección: si hay una activa, espera su turno; si no, la muestra ya */
function tutEnqueue(seq,last){if(coachActive())tutQueue.push({seq,last});else coachShowSeq(seq,last);}

/* ---- Tutorial guiado por eventos ---- */
function tutRecommendIdx(){var s=PS('player');var best=-1,bestc=99;
  s.hand.forEach(function(c,i){var d=c.def;if(d.reaction)return;if(!canPlace('player',c))return;if(effectiveCost('player',d)>aether('player'))return;var cost=d.cost||0;if(cost<bestc){bestc=cost;best=i;}});
  return best;}
function tutHook(ev){
  if(!G||!G.tutorial||!G.tut)return;
  const T=G.tut,dk=DEMOS[G.deckKey]||{name:'',teach:''};
  clearSpotlight();T.spot=null;T.spotMsg=null;
  switch(ev){
   case 'mulligan':
    if(T.mull)return;T.mull=true;
    tutEnqueue([
     '<b>Mulligan: tu mano inicial</b> \ud83d\udd04<br>Antes de empezar puedes <b>cambiar cartas</b>. Toca las que no te sirvan para barajarlas de vuelta y robar otras.',
     '<b>\u00bfQu\u00e9 conviene cambiar?</b> \ud83d\udca1<br>Cambia cartas de <b>coste alto</b> que tardar\u00e1s en poder pagar. <b>Conserva 1-2 baratas</b> (coste 1-2) para tener jugadas desde el turno 1. Marqu\u00e9 con \ud83d\udca1 las que quiz\u00e1 quieras cambiar.'
    ],'Confirmar mi mano \u2713');
    break;
   case 'intro':
    if(T.intro)return;T.intro=true;T.spot='#chargeBtn';
    tutEnqueue([
     '<b>¡Hola! Soy tu guía.</b> 🧙<br>Te acompaño paso a paso en tu primera partida. No tienes que memorizar nada: te avisaré justo cuando toque hacer algo.<br><br>Tu meta es muy simple: ser el primero en llegar a <b>20 Puntos AION (PA)</b>.',
     '<b>Cómo leer una carta</b> 🃏<br>• Arriba a la izquierda, el círculo es el <b>coste</b>: lo que cuesta jugarla.<br>• En las Entidades, abajo verás 3 números:<br>&nbsp;&nbsp;⚔ <b>POW</b> = daño que hace.<br>&nbsp;&nbsp;❤ <b>HP</b> = daño que aguanta antes de morir.<br>&nbsp;&nbsp;⧗ <b>SYNC</b> = Puntos AION que da al Estabilizar.',
     '<b>Hay 3 tipos de carta:</b><br>• <b>Entidad</b> 🦾 — tus combatientes; van al tablero.<br>• <b>Directiva</b> ✦ — un efecto de un solo uso; se gasta y se descarta.<br>• <b>Ancla</b> ⚓ — una estructura que se queda ayudándote.<br>Te explico cada una cuando juegues la primera. 😉',
     '<b>¿Con qué pago las cartas?</b> 💠<br>Con un recurso llamado <b>Aether</b>. Para tenerlo necesitas tu <b>Timeline</b>.<br>El Timeline es tu motor de energía: cada carta que pongas ahí te dará <b>+1 Aether cada turno</b>, de forma permanente.',
     '<b>Los puntitos del Timeline</b> ✨<br>Tu Timeline se ve como una fila de <b>puntitos</b> al lado de tu avatar.<br>• Puntito <b>con luz</b> 🔵 = carta de pie (lista) → te da Aether.<br>• Puntito <b>apagado</b> ⚫ = carta girada (ya usada) → gastó su Aether este turno.<br>Eso es lo mismo que en las cartas físicas: <b>de pie = lista</b>, <b>girada = usada</b>. Cada turno se vuelven a encender solos.',
     'Tu mazo de práctica <b>'+dk.name+'</b> está hecho para enseñarte: '+dk.teach,
     '<b>¡Tu primera acción!</b> 🙌<br>Una vez por turno puedes alimentar tu Timeline.<br>👉 Pulsa el botón <b>⏳ Cargar Timeline</b> (arriba) y elige cualquier carta de tu mano para enviarla ahí.<br>Tranquilo: no la pierdes, se convierte en energía.'
    ],'¡Voy a cargar! ✓');
    break;
   case 'charged':
    if(T.charged)return;T.charged=true;{var _ri=(typeof tutRecommendIdx==='function')?tutRecommendIdx():-1;T.spot=_ri>=0?('#playerHand .card:nth-child('+(_ri+1)+')'):'#playerHand';T.spotMsg=_ri>=0?('\ud83d\udca1 Te recomiendo jugar '+PS('player').hand[_ri].def.name+' \u2014 la puedes pagar ya'):null;}
    tutEnqueue([
     '<b>¡Genial! Cargaste tu Timeline.</b> 🎉<br>¿Ves el nuevo <b>puntito con luz</b> 🔵 junto a tu avatar? Ese es <b>1 Aether</b> disponible ahora mismo.',
     '<b>Cómo se paga</b> 💠<br>Si una carta cuesta <b>2</b>, necesitas <b>2 puntitos con luz</b>. Al jugarla, esos puntitos se <b>apagan</b> ⚫ (las cartas del Timeline se giran para pagar).<br>Al empezar tu próximo turno se vuelven a encender, así tu Aether crece turno a turno.',
     '<b>Ahora juega tu primera carta.</b> 🖐️<br>Toca una carta de tu mano que puedas pagar (mira su coste arriba a la izquierda) y pulsa <b>Jugar</b>.<br>Te explico qué hace según el tipo que elijas.'
    ],'¡A jugar! ✓');
    break;
   case 'playedEntidad':
    if(T.entidad)return;T.entidad=true;
    tutEnqueue([
     '<b>¡Jugaste una Entidad!</b> 🦾<br>Las Entidades son tus luchadoras. Tu tablero tiene dos filas:<br>• <b>Frente</b> (arriba) — desde aquí <b>atacan</b> y <b>Estabilizan</b>.<br>• <b>Soporte</b> (abajo) — zona de apoyo, habilidades y resguardo.',
     '<b>Inestabilidad de Entrada</b> 💤<br>La Entidad recién jugada lleva un símbolo de "dormida". Quiere decir que <b>no puede atacar ni Estabilizar el turno en que entra</b>.<br>El próximo turno despertará y ya podrá actuar. (La keyword <b>Impulso</b> se salta esta regla.)'
    ]);
    break;
   case 'playedDirectiva':
    if(T.directiva)return;T.directiva=true;
    tutEnqueue([
     '<b>¡Jugaste una Directiva!</b> ✦<br>Las Directivas son efectos de <b>un solo uso</b>: pagas su coste, ocurre su efecto y la carta se va al <b>Vacío</b> (tu pila de descarte).<br>No se quedan en el tablero — úsalas en el momento justo.'
    ]);
    break;
   case 'playedAncla':
    if(T.ancla)return;T.ancla=true;
    tutEnqueue([
     '<b>¡Jugaste un Ancla!</b> ⚓<br>Las Anclas son estructuras que se quedan en tu <b>Soporte</b> ayudándote turno tras turno.<br>No tienen POW/HP/SYNC, no atacan ni pueden ser atacadas: permanecen hasta que algo las destruya.'
    ]);
    break;
   case 'flexInPlay':
    if(T.flex)return;T.flex=true;
    tutEnqueue([
     '<b>Esa Entidad es Flexible</b> ↔️<br>Las Flexibles pueden moverse entre <b>Frente</b> y <b>Soporte</b> <b>sin gastar su turno</b>.<br>Para moverla: tócala en el tablero y elige <b>↔ Mover</b>.<br>En el Frente pelea; en el Soporte se resguarda y usa habilidades.'
    ]);
    break;
   case 'attackMode':
    if(T.attackMode)return;T.attackMode=true;
    tutEnqueue([
     '<b>¡Vas a Combatir!</b> ⚔<br>Tu Entidad atacará a una enemiga. Verás resaltadas en <b>rojo</b> las que puedes atacar.<br>Por defecto solo puedes atacar enemigas <b>agotadas</b> (giradas) o con <b>Baluarte</b>.<br>👉 Toca una enemiga resaltada para atacarla.'
    ]);
    break;
   case 'combatDone':
    if(T.combat)return;T.combat=true;
    tutEnqueue([
     '<b>Así funciona el golpe</b> 💥<br>Ambas Entidades se hacen daño a la vez igual a su <b>POW</b>.<br>Ese <b>Daño</b> permanece sobre ellas entre turnos y no se cura solo.<br>Si el Daño iguala o supera su <b>HP</b>, la Entidad es destruida y va al <b>Vacío</b>.'
    ]);
    break;
   case 'stabilized':
    if(T.stab)return;T.stab=true;T.spot='#endBtn';
    tutEnqueue([
     '<b>¡Estabilizaste!</b> ⧗<br>Ganaste <b>Puntos AION</b> igual al <b>SYNC</b> de esa Entidad. Esta es la forma principal de avanzar hacia los <b>20 PA</b> para ganar.<br>Ojo: al Estabilizar, la Entidad se <b>agota</b> (gira) y no podrá atacar este turno.',
     '<b>¡Ya dominas lo básico!</b> 🏆<br>Carga Timeline, juega cartas, Estabiliza para sumar PA y Combate para frenar a tu rival.<br>Cuando acabes tus jugadas pulsa <b>Terminar Turno ⏩</b>. Si necesitas la guía completa, pulsa <b>?</b> abajo a la derecha. ¡Suerte, arquitecto!'
    ],'¡A jugar! ✓');
    break;
  }
}
function coachBoard(){tutHook('intro');}
