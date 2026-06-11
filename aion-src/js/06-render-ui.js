/* MODULO: 06-render-ui.js
   RENDER + UI del tablero: pinta mano/zonas/contadores, menus de accion, seleccion de objetivos, banners y la pantalla de fin (endGame + barra de PA + confeti + resumen de travesia).
   (Detalle completo y guia para extender: aion-src/ARCHITECTURE.md) */
/* ============================================================
   RENDER + UI
   ============================================================ */
function render(){
  if(!G||G.over)return;
  recomputeAuras();
  setT('aiPA',PS('ai').pa);setT('pPA',PS('player').pa);
  const _pr=document.getElementById('pPAring'),_ar=document.getElementById('aiPAring');
  if(_pr)_pr.style.background='conic-gradient(var(--gold) '+Math.min(360,PS('player').pa/20*360)+'deg,#2a3559 0deg)';
  if(_ar)_ar.style.background='conic-gradient(var(--gold) '+Math.min(360,PS('ai').pa/20*360)+'deg,#2a3559 0deg)';
  setT('aiDeck',PS('ai').deck.length);setT('pDeck',PS('player').deck.length);
  setT('aiHandCt',PS('ai').hand.length);setT('aiTL',PS('ai').timeline.length);setT('pTL',PS('player').timeline.length);
  setT('pVoid',PS('player').void.length);setT('aiVoid',PS('ai').void.length);
  setT('pExile',PS('player').exile.length);setT('aiExile',PS('ai').exile.length);
  setT('turnNum',G.turn);
  const ap=document.getElementById('pAether');ap.innerHTML='';
  const tot=PS('player').timeline.length,av=PS('player').timeline.filter(t=>!t.tapped).length,tmp=PS('player').tempAether||0;
  for(let i=0;i<tot;i++){const d=document.createElement('span');d.className='pip'+(i<av?' full':'');ap.appendChild(d);}
  for(let i=0;i<tmp;i++){const d=document.createElement('span');d.className='pip full';d.style.background='radial-gradient(circle at 30% 30%,#fff,var(--gold))';ap.appendChild(d);}
  const ah=document.getElementById('aiHand');ah.innerHTML='';
  PS('ai').hand.forEach(()=>{const b=document.createElement('div');b.className='aicard-back';b.textContent='⏳';ah.appendChild(b);});
  renderRow('aiSupport','ai','support','IA · Soporte');renderRow('aiFront','ai','front','IA · Frente');
  renderRow('pFront','player','front','Tú · Frente');renderRow('pSupport','player','support','Tú · Soporte');
  renderHand();updatePhaseUI();applyModeHighlights();renderSolonPeek();
}
/* ---- Solón: carta del tope revelada y jugable ---- */
function renderSolonPeek(){
  const el=document.getElementById('solonPeek');if(!el)return;
  const hasSolon=permanentsOf('player').some(c=>getSide(c).topReveal);
  const deck=PS('player').deck;
  if(!hasSolon||!deck.length){el.classList.remove('show');el.innerHTML='';return;}
  const def=CARDS[deck[0]];
  const isConclaveDir=def.type==='directiva'&&def.fac==='conclave'&&!def.reaction;
  const cost=effectiveCost('player',def);
  const yourTurn=G&&G.active==='player'&&!G.over&&!busy;
  const canPlay=isConclaveDir&&!PS('player').solonUsed&&yourTurn&&cost<=aether('player');
  let btnLabel;
  if(def.type==='directiva'&&def.fac==='conclave'&&def.reaction)btnLabel='Las Reacciones no se juegan desde el tope';
  else if(!isConclaveDir)btnLabel='Solo Directivas Cónclave';
  else if(PS('player').solonUsed)btnLabel='Ya jugado este turno';
  else if(!yourTurn)btnLabel='Espera tu turno';
  else if(cost>aether('player'))btnLabel='Aether insuficiente ('+cost+')';
  else btnLabel='▶ Jugar desde el tope ('+cost+')';
  el.innerHTML=`<div class="splabel">🌌 SOLÓN — Tope del mazo revelado</div>
    <div class="spwrap"><div class="card ${FAC[def.fac].cls}" id="solonCard">${cardInnerHTML(def)}</div></div>
    <button class="spplay" id="solonPlayBtn" ${canPlay?'':'disabled'}>${btnLabel}</button>`;
  el.classList.add('show');
  const cardEl=document.getElementById('solonCard');
  if(cardEl){cardEl.addEventListener('mouseenter',()=>showPreviewDef(def));cardEl.addEventListener('mouseleave',hidePreview);}
  const btn=document.getElementById('solonPlayBtn');
  if(btn&&canPlay)btn.onclick=()=>playSolonTop();
}
function playSolonTop(){
  if(busy||G.over||G.active!=='player')return;
  const s=PS('player');const deck=s.deck;if(!deck.length)return;
  const def=CARDS[deck[0]];
  if(def.type!=='directiva'||def.fac!=='conclave'){toast('Solo puedes jugar Directivas Cónclave desde el tope');return;}
  if(def.reaction){toast('Las Directivas de Reacción no se juegan desde el tope');return;}
  if(s.solonUsed){toast('Solón ya jugó desde el tope este turno');return;}
  const cost=0;
  {const lim=globalCardLimit();if(lim!=null&&(s.cardsThisTurn||0)>=lim){toast('Límite de '+lim+' cartas por turno (Árbitro)');return;}}
  const key=deck.shift();s.solonUsed=true;
  payAether('player',cost);consumeCostReducers('player',def);
  s.cardsThisTurn=(s.cardsThisTurn||0)+1;fireEvent('cardPlayed','player',{count:s.cardsThisTurn});
  s.dirThisTurn=(s.dirThisTurn||0)+1;G.fromTop=true; // marca: jugada DESDE EL TOPE (no desde la mano)
  s.void.push(key);toast('🌌 Solón juega desde el tope: '+def.name);sfx('cast');busy=true;render();
  const card={uid:uidc++,key,def,fromTop:true};
  reactionWindow({type:'directiva',directiveCard:card},'player',(res)=>{
    if(res.cancelled){toast(def.name+' fue cancelada');resumeFlow();return;}
    busy=false;render();resolveDirectiva('player',card);
  });
}
function setT(id,v){const e=document.getElementById(id);if(e)e.textContent=v;}
function renderRow(elId,p,zone,label){
  const el=document.getElementById(elId);el.innerHTML='<span class="zonelabel">'+label+'</span>';
  PS(p)[zone].forEach((c,i)=>{
    if(c)el.appendChild(boardCard(c,p,zone,i));
    else{const s=document.createElement('div');s.className='slot';el.appendChild(s);}
  });
}
function statMod(cur,base){return cur>base?'up':cur<base?'down':'';}
function hasAvailableAction(c,zone){
  if(!G||G.active!=='player'||busy||G.over)return false;
  const front=zone==='front',canAct=!c.tapped&&!c.sick;
  if(front&&canAct&&syncOf(c)>0)return true;                                  // Estabilizar
  if(front&&canAct&&canAttack(c,'player')&&validTargets('player',c).length>0)return true; // Combatir
  const act=getSide(c).activa;
  if(act){const noTap=!!act.noTap,usedA=c.used&&c.used.activa;const canUse=(noTap?(!c.sick&&!usedA):(!c.tapped&&!c.sick))&&!(isAncla(c)&&anclaActivaBlocked('player'));if(canUse)return true;}
  if(c.def.pos==='flex'&&c.def.type==='entidad'&&freeSlot('player',zone==='front'?'support':'front')>=0)return true; // Mover Flexible
  return false;
}
function actionKinds(c,zone){
  if(!G||G.active!=='player'||busy||G.over)return null;
  var front=zone==='front',canAct=!c.tapped&&!c.sick;var k={atk:false,stab:false,ability:false,move:false};
  if(front&&canAct&&syncOf(c)>0)k.stab=true;
  if(front&&canAct&&canAttack(c,'player')&&validTargets('player',c).length>0)k.atk=true;
  var act=getSide(c).activa;
  if(act){var noTap=!!act.noTap,usedA=c.used&&c.used.activa;var canUse=(noTap?(!c.sick&&!usedA):(!c.tapped&&!c.sick))&&!(isAncla(c)&&anclaActivaBlocked('player'));if(canUse)k.ability=true;}
  if(c.def.pos==='flex'&&c.def.type==='entidad'&&freeSlot('player',zone==='front'?'support':'front')>=0)k.move=true;
  if(!k.atk&&!k.stab&&!k.ability&&!k.move)return null;return k;
}
function boardCard(c,owner,zone,idx){
  const def=c.def;const side=getSide(c);const fac=FAC[def.fac];const an=isAncla(c);
  const d=document.createElement('div');
  const _ak=(owner==='player')?actionKinds(c,zone):null;const _mc=_ak?((_ak.atk||_ak.stab)?'act-attack':(_ak.ability?'act-ability':'act-move')):'';
  d.className='card bcard '+fac.cls+' r-'+(def.rar||'C')+' t-'+def.type+(an?' ancla':'')+(c.tapped?' tapped':'')+(c.sick?' sick':'')+(c.glitch?' glitched':'')+(_mc?' '+_mc:'');
  d.dataset.uid=c.uid;
  const pg=an?'':(def.pos==='front'?'⬆ ':def.pos==='support'?'⬇ ':'⇅ ');
  const ptitle=def.pos==='front'?'Frente':def.pos==='support'?'Soporte':'Flexible';
  const bp=side.pow||0,bh=side.hp||0,bs=side.sync||0;
  const pm=statMod(powOf(c),bp);
  const hm=c.marked>0?'down':statMod(hpOf(c),bh);
  const sm=statMod(syncOf(c),bs);
  d.innerHTML=`<div class="cost ${c.side==='B'?'sideB':''}" title="${ptitle}">${c.side==='B'?'↑':def.cost}</div>
    <div class="art">${def.art}</div>
    <div class="kw">${c.kw.map(k=>`<span class="kwchip ${k}">${KW[k]?KW[k].name:k}</span>`).join('')}</div>
    <div class="typeband" title="Posición: ${ptitle}">${an?'⚓ ANCLA':pg+fac.name}</div>
    <div class="name">${side.name}</div>
    ${an?'':`<div class="stats"><span class="stat pow ${pm}" title="POW (base ${bp})">⚔${powOf(c)}</span><span class="stat hp ${hm}" title="HP restante (máx ${hpOf(c)}, base ${bh}${c.marked?', daño '+c.marked:''})">❤${hpOf(c)-c.marked}</span><span class="stat sync ${sm}" title="SYNC (base ${bs})">⧗${syncOf(c)}</span></div>`}${(def.rar==='L'||def.rar==='E'||def.rar==='P')?'<div class="holo"></div>':''}`;
  if(_ak){var _hh=document.createElement('div');_hh.className='acthints';_hh.innerHTML=(_ak.atk?'<span title="Puede atacar">\u2694</span>':'')+(_ak.stab?'<span title="Puede Estabilizar">\u29d7</span>':'')+(_ak.ability?'<span title="Puede activar efecto">\u2728</span>':'')+(_ak.move?'<span title="Puede moverse">\u2194</span>':'');d.appendChild(_hh);}
  d.addEventListener('mouseenter',()=>showPreview(c));d.addEventListener('mouseleave',hidePreview);
  d.addEventListener('click',e=>{e.stopPropagation();onBoardClick(c,owner,zone,idx,d);});
  return d;
}
function renderHand(){
  const h=document.getElementById('playerHand');h.innerHTML='';
  const hand=PS('player').hand;const n=hand.length;const mid=(n-1)/2;
  hand.forEach((c,i)=>{
    const def=c.def;const fac=FAC[def.fac];
    const d=document.createElement('div');d.className='card hcard '+fac.cls+' r-'+(def.rar||'C')+' t-'+def.type;
    const afford=effectiveCost('player',def)<=aether('player');
    if(!afford)d.style.filter='grayscale(.5) brightness(.7)';
    else if(G.active==='player'&&!busy&&!G.over&&!def.reaction&&canPlace('player',c))d.classList.add('playable');
    d.innerHTML=cardInnerHTML(def);
    // mano en arco (fan)
    const off=i-mid;const rot=n>1?off*Math.min(4,16/n):0;const ty=n>1?Math.abs(off)*Math.min(7,26/n):0;
    const base='translateY('+ty.toFixed(1)+'px) rotate('+rot.toFixed(1)+'deg)';
    d.dataset.base=base;d.style.transform=base;
    d.addEventListener('mouseenter',()=>{sfx('hover');showPreviewDef(def);d.style.transform='translateY(-46px) scale(1.16)';d.style.zIndex=30;});
    d.addEventListener('mousemove',e=>{const r=d.getBoundingClientRect();const px=(e.clientX-r.left)/r.width-0.5,py=(e.clientY-r.top)/r.height-0.5;d.style.transform='translateY(-46px) scale(1.16) rotateY('+(px*16).toFixed(1)+'deg) rotateX('+(-py*16).toFixed(1)+'deg)';});
    d.addEventListener('mouseleave',()=>{d.style.transform=d.dataset.base;d.style.zIndex='';hidePreview();});
    d.addEventListener('click',e=>{e.stopPropagation();onHandClick(i,d);});
    h.appendChild(d);
    if(G&&G.drawAnim&&G.drawAnim.includes(c.uid))animateDrawIn(d);
  });
  if(G)G.drawAnim=[];
}
function animateDrawIn(d){
  const deck=document.getElementById('pDeck');if(!deck)return;const dr=deck.getBoundingClientRect();
  requestAnimationFrame(()=>{const cr=d.getBoundingClientRect();const dx=dr.left-cr.left,dy=dr.top-cr.top;
    d.animate([{transform:'translate('+dx+'px,'+dy+'px) scale(.25)',opacity:0},{opacity:1,offset:.35},{transform:d.dataset.base||'none'}],{duration:400,easing:'cubic-bezier(.2,.8,.3,1.1)'});});
}
function ghostDissolve(uid){
  const el=cardDom(uid);if(!el)return;const r=el.getBoundingClientRect();const g=el.cloneNode(true);
  g.style.cssText='position:fixed;left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px;margin:0;z-index:58;pointer-events:none;transform:none';
  document.body.appendChild(g);
  g.animate([{opacity:1,filter:'brightness(1)'},{opacity:0,transform:'scale(.7) translateY(14px)',filter:'brightness(2.2) blur(3px)'}],{duration:420,easing:'ease-in'});
  setTimeout(()=>g.remove(),440);
}

/* ---- interactions ---- */
function onHandClick(i,el){
  if(busy||G.over||G.active!=='player')return;
  if(G.mode&&G.mode.type==='charge'){doCharge(i);return;}
  if(G.mode){G.mode=null;applyModeHighlights();}
  const card=PS('player').hand[i];const def=card.def;
  const ec=effectiveCost('player',def);
  const afford=ec<=aether('player');
  const costTxt=ec<def.cost?`Coste ${ec} (−${def.cost-ec})`:`Coste ${def.cost}`;
  const opts=[];
  if(def.type==='directiva'){
    if(def.reaction)opts.push({label:'⚡ Reacción',sub:'Se usa en el turno rival',cls:'play',disabled:true,fn:()=>{}});
    else opts.push({label:'▶ Jugar',sub:`Directiva · ${costTxt}`,cls:'play',disabled:!afford,fn:()=>{closeMenu();playFromHand('player',i);}});
  }else{
    const frontOk=(def.pos==='front'||def.pos==='flex')&&freeSlot('player','front')>=0;
    const supOk=(def.pos==='support'||def.pos==='flex'||def.type==='ancla')&&freeSlot('player','support')>=0;
    if(def.pos==='flex'){
      opts.push({label:'▶ Jugar → Frente',sub:frontOk?costTxt:'Frente lleno',cls:'play',disabled:!afford||!frontOk,fn:()=>{closeMenu();playFromHand('player',i,'front');}});
      opts.push({label:'▶ Jugar → Soporte',sub:supOk?costTxt:'Soporte lleno',cls:'play',disabled:!afford||!supOk,fn:()=>{closeMenu();playFromHand('player',i,'support');}});
    }else{
      const zoneTxt=def.type==='ancla'||def.pos==='support'?'Soporte':'Frente';
      const zoneOk=def.type==='ancla'||def.pos==='support'?supOk:frontOk;
      opts.push({label:`▶ Jugar → ${zoneTxt}`,sub:zoneOk?costTxt:`${zoneTxt} lleno`,cls:'play',disabled:!afford||!zoneOk,fn:()=>{closeMenu();playFromHand('player',i);}});
    }
  }
  opts.push({label:'⏳ Cargar al Timeline',sub:PS('player').charged?'Ya cargaste este turno':'+1 Aether permanente',cls:'tl',disabled:PS('player').charged,fn:()=>{closeMenu();doCharge(i);}});
  opts.push({label:'✕ Cancelar',cls:'cancel',fn:closeMenu});
  openMenu(el,opts);
}
function beginCharge(){
  if(busy||G.over||G.active!=='player')return;
  if(PS('player').charged){toast('Ya cargaste el Timeline este turno');return;}
  G.mode={type:'charge'};toast('Elige una carta de tu mano para el Timeline');applyModeHighlights();
}
function doCharge(i){
  const s=PS('player');if(s.charged){toast('Ya cargaste este turno');return;}
  const card=s.hand.splice(i,1)[0];s.timeline.push({uid:uidc++,key:card.key,def:card.def,tapped:false,glitch:false});
  s.charged=true;G.mode=null;render();sfx('charge');toast('Timeline +1 Aether');
  if(G.tutorial)setTimeout(()=>tutHook('charged'),400);
}
function onBoardClick(c,owner,zone,idx,el){
  if(busy||G.over||G.active!=='player')return;
  if(G.mode&&G.mode.type==='target'){if(G.mode.valid.includes(c)){const cb=G.mode.cb;G.mode=null;cb(c);applyModeHighlights();}else toast('Objetivo no válido');return;}
  if(G.mode&&G.mode.type==='attack'){if(G.mode.valid.includes(c))doCombat('player',G.mode.attacker,c);else toast('Objetivo no válido');return;}
  if(owner!=='player')return;
  const front=zone==='front';const canAct=!c.tapped&&!c.sick;
  const opts=[];
  if(syncOf(c)>0)opts.push({label:'⧗ Estabilizar',sub:front?(canAct?`+${syncOf(c)} PA`:(c.sick?'Inestabilidad':'Agotada')):'Solo desde el Frente',cls:'stab',disabled:!front||!canAct,fn:()=>{closeMenu();estabilizar('player',c);}});
  if(front){const tg=validTargets('player',c);const ca=canAttack(c,'player');opts.push({label:'⚔ Combatir',sub:!canAct?(c.sick?'Inestabilidad':'Agotada'):!ca?'No puede atacar (restricción)':(tg.length?`${tg.length} objetivo(s)`:'Sin objetivos'),cls:'atk',disabled:!canAct||!ca||tg.length===0,fn:()=>{closeMenu();G.mode={type:'attack',attacker:c,valid:tg};toast('Elige enemiga para atacar');applyModeHighlights();if(G.tutorial)tutHook('attackMode');}});}
  const act=getSide(c).activa;
  if(act){
    const noTap=!!act.noTap;const usedA=c.used&&c.used.activa;
    const blocked=isAncla(c)&&anclaActivaBlocked('player');
    const canUse=(noTap?(!c.sick&&!usedA):(!c.tapped&&!c.sick))&&!blocked;
    const sub=blocked?'Bloqueada por el rival':(!canUse?(c.sick?'Inestabilidad':(usedA?'Ya usada este turno':'Agotada')):(noTap?'No la agota · puede atacar':(act.destroySelf?'Agota y destruye':'Agota esta carta')));
    opts.push({label:'✨ Usar habilidad',sub,cls:'play',disabled:!canUse,fn:()=>{closeMenu();if(noTap){(c.used=c.used||{}).activa=true;}else c.tapped=true;toast('Habilidad de '+sideName(c));applyEffect(act,'player',c,()=>{if(act.destroySelf)removePermanent('player',c);render();});render();}});
  }
  if(c.def.pos==='flex'&&c.def.type==='entidad'){
    const toZone=zone==='front'?'support':'front';const zn=toZone==='front'?'Frente':'Soporte';
    const can=freeSlot('player',toZone)>=0;
    opts.push({label:'↔ Mover a '+zn,sub:can?'Flexible · no la agota':zn+' lleno',cls:'tl',disabled:!can,fn:()=>{closeMenu();movePlayerEntity('player',c,zone,toZone);}});
  }
  opts.push({label:'✕ Cancelar',cls:'cancel',fn:closeMenu});
  openMenu(el,opts);
}
function applyModeHighlights(){
  document.querySelectorAll('.card.target,.card.selectable,.card.healtgt,.card.selected,.card.dimmed').forEach(e=>e.classList.remove('target','selectable','healtgt','selected','dimmed'));
  var tb=document.getElementById('targetBanner');
  if(!G||!G.mode){if(tb)tb.className='';return;}
  if(G.mode.type==='charge'){document.querySelectorAll('#playerHand .card').forEach(e=>e.classList.add('selectable'));if(tb)tb.className='';return;}
  var isEnemy=(G.mode.type==='attack')||!!(G.mode.scope&&G.mode.scope.indexOf('enemy')===0);
  var cls=isEnemy?'target':'healtgt';
  (G.mode.valid||[]).forEach(function(c){var e=cardDom(c.uid);if(e)e.classList.add(cls);});
  var attUid=null;
  if(G.mode.type==='attack'&&G.mode.attacker){var ae=cardDom(G.mode.attacker.uid);if(ae)ae.classList.add('selected');attUid=String(G.mode.attacker.uid);}
  var valid={};(G.mode.valid||[]).forEach(function(c){valid[String(c.uid)]=1;});
  document.querySelectorAll('#board .card').forEach(function(e){var u=e.dataset.uid;if(!valid[u]&&u!==attUid)e.classList.add('dimmed');});
  if(tb){tb.className='show '+(isEnemy?'enemy':'ally');var t=tb.querySelector('.tbtext');if(t)t.textContent=targetBannerLabel(G.mode);}
}
function targetBannerLabel(m){
  if(m.type==='attack')return '\u2694 Elige una Entidad enemiga para atacar';
  var s=m.scope||'';
  var map={enemyTapped:'\u2694 Elige una Entidad enemiga agotada',enemyMarked:'\u2694 Elige una Entidad enemiga dañada',enemyAncla:'\u2694 Elige un Ancla enemiga',enemyBaluarte:'\u2694 Elige una Entidad enemiga con Baluarte',enemyEntity:'\u2694 Elige una Entidad enemiga',enemyEntityNoToken:'\u2694 Elige una Entidad enemiga',enemyNoTokenUnmarked:'\u2694 Elige una Entidad enemiga sin daño',allyMarked:'\u271a Elige una Entidad aliada dañada',allyOther:'\u271a Elige otra Entidad aliada',ally:'\u271a Elige una Entidad aliada'};
  if(map[s])return map[s];
  if(s.indexOf('allyFac')===0)return '\u271a Elige una Entidad Forja aliada';
  if(s.indexOf('ally')===0)return '\u271a Elige una Entidad aliada';
  return '\u2694 Elige un objetivo enemigo';
}
function cancelTarget(){if(!G||!G.mode)return;var m=G.mode;G.mode=null;if(m.type==='target'&&m.cb)m.cb(null);if(typeof applyModeHighlights==='function')applyModeHighlights();if(typeof render==='function')render();}
function cardDom(uid){return document.querySelector('.card[data-uid="'+uid+'"]');}

/* ---- action menu ---- */
function openMenu(anchor,opts){
  const m=document.getElementById('actionMenu');m.innerHTML='';
  opts.forEach(o=>{const b=document.createElement('button');b.className='amBtn '+(o.cls||'');b.innerHTML=o.label+(o.sub?`<small>${o.sub}</small>`:'');if(o.disabled)b.disabled=true;else b.onclick=()=>{sfx('click');o.fn();};m.appendChild(b);});
  m.classList.add('show');
  const r=anchor.getBoundingClientRect();let x=r.right+8,y=r.top;const mw=200,mh=opts.length*48;
  if(x+mw>innerWidth)x=r.left-mw-8;if(y+mh>innerHeight)y=innerHeight-mh-10;if(y<6)y=6;
  m.style.left=x+'px';m.style.top=y+'px';
}
function closeMenu(){document.getElementById('actionMenu').classList.remove('show');}
document.addEventListener('click',e=>{if(!e.target.closest('#actionMenu')&&!e.target.closest('.card'))closeMenu();});

/* ---- preview ---- */
function showPreview(c){const def=c.def;const side=getSide(c);const st=isAncla(c)?null:{pow:powOf(c),hp:hpOf(c)-c.marked,sync:syncOf(c)};previewHtml(side.name,FAC[def.fac].name+' · '+(isAncla(c)?'Ancla':(c.side==='B'?'Lado B':'Lado A')),def.art,st,side.text||def.text,c.kw,def);}
function showPreviewDef(def){previewHtml(def.name,FAC[def.fac].name+' · '+(def.type==='directiva'?'Directiva':def.type==='token'?'Token':'Entidad'),def.art,(def.type==='entidad'||def.type==='token')?{pow:def.pow,hp:def.hp,sync:def.sync}:null,def.text,def.kw||[],def);}
/* Texto explicativo para mostrar: usa el texto canónico; si la carta no tiene texto de reglas,
   genera una explicación simple basada en su tipo/keywords (no altera el dato canónico). */
function displayText(def,text,kws){
  if(text&&String(text).trim())return text;
  if(def.type==='token')return 'Ficha (Token) creada por un efecto. Si sale del campo deja de existir y no va al Vacío.';
  if(def.type==='ancla')return 'Estructura de Soporte: permanece en juego hasta que un efecto la destruya. Sin habilidad de texto propia.';
  const k=(kws&&kws.length?kws:(def.kw||[]));
  if(k.length)return 'Entidad de combate sin habilidad de texto: su valor está en sus atributos y en su keyword (explicada abajo).';
  return 'Entidad de combate básica, sin habilidad de texto: su valor está en sus atributos POW / HP / SYNC.';
}
function previewHtml(name,meta,art,stats,text,kws,def){
  const p=document.getElementById('preview');let kwHtml='';
  (kws||[]).forEach(k=>{if(KW[k])kwHtml+=`<div><b>${KW[k].name}:</b> ${KW[k].desc}</div>`;});
  if(def.mutar)kwHtml+=`<div><b>Mutar:</b> elige — ${def.mutar.map(o=>o.label).join(' · ')}</div>`;
  if(def.asc){const a=def.asc==='victoria'?'Destruir en combate y sobrevivir':def.asc==='resistencia'?'Recibir daño en combate y sobrevivir':'Llegar a '+def.ascN+' PA';kwHtml+=`<div><b>Ascensión (${a}):</b> → ${def.sideB?def.sideB.name:''}</div>`;}
  if(def.type==='ancla')kwHtml+='<div><b>📍 Posición:</b> Soporte (Ancla — no combate)</div>';
  else if(def.type!=='directiva'){const pl=def.pos==='front'?'⬆ Frente (combate/estabiliza)':def.pos==='support'?'⬇ Soporte (no combate)':'⇅ Flexible (Frente o Soporte; muévela libremente)';kwHtml+='<div><b>📍 Posición:</b> '+pl+'</div>';}
  if(def.reaction)kwHtml+='<div><b>⚡ Reacción:</b> solo se usa en el turno del rival. Se paga con tu Timeline preparado.</div>';
  p.innerHTML=`<div class="ptitle" style="color:${FAC[def.fac].color}">${name}</div>
    <div class="pmeta">${meta} · Coste ${def.cost}</div><div class="pbig">${art}</div>
    ${stats?`<div class="pstats"><span class="s" style="background:var(--pow);color:#fff">⚔ ${stats.pow}</span><span class="s" style="background:var(--hp);color:#fff">❤ ${stats.hp}</span><span class="s" style="background:var(--sync);color:#3a2600">⧗ ${stats.sync}</span></div>`:''}
    <div class="ptext">${displayText(def,text,kws)}</div>${kwHtml?`<div class="pkw">${kwHtml}</div>`:''}`;
  p.classList.add('show');positionPreview();
}
function hidePreview(){document.getElementById('preview').classList.remove('show');}
let mx=0,my=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;if(document.getElementById('preview').classList.contains('show'))positionPreview();});
function positionPreview(){
  const p=document.getElementById('preview');const w=p.offsetWidth||240,h=p.offsetHeight||200;
  let x=mx+20,y=my+16;
  if(x+w>innerWidth-8)x=mx-w-20;
  if(x<8)x=8;
  if(y+h>innerHeight-8)y=innerHeight-h-8;
  if(y<8)y=8;
  p.style.left=x+'px';p.style.top=y+'px';
}

/* ---- FX ---- */
function floatOver(uid,txt,color){const el=cardDom(uid);if(!el)return;const r=el.getBoundingClientRect();const f=document.createElement('div');f.className='float';f.textContent=txt;f.style.color=color;f.style.left=(r.left+r.width/2-14)+'px';f.style.top=(r.top+10)+'px';document.body.appendChild(f);setTimeout(()=>f.remove(),1100);}
function shake(uid){const el=cardDom(uid);if(el){el.classList.add('hitshake');setTimeout(()=>el.classList.remove('hitshake'),360);}}
function flashSummon(uid){const el=cardDom(uid);if(el)el.animate([{transform:'translateY(120px) scale(.5)',opacity:0},{transform:'translateY(-6px) scale(1.08)',opacity:1,offset:.7},{transform:'none'}],{duration:420,easing:'cubic-bezier(.2,.85,.3,1.2)'});}
function ascendFx(uid){
  const el=cardDom(uid);if(!el)return;
  sfx('ascend');fxAscend(cardCenter(uid));
  el.classList.add('ascended');
  const g=document.createElement('div');g.className='ascGlow';el.appendChild(g);
  const r=el.getBoundingClientRect();
  const lab=document.createElement('div');lab.className='ascLabel';lab.textContent='✦ ASCENSIÓN ✦';
  lab.style.left=(r.left+r.width/2)+'px';lab.style.top=r.top+'px';
  document.body.appendChild(lab);
  setTimeout(()=>{el.classList.remove('ascended');g.remove();},1150);
  setTimeout(()=>lab.remove(),1450);
}
function openZone(p,zone){
  if(!G)return;const list=PS(p)[zone]||[];const el=document.getElementById('voidList');el.innerHTML='';
  const zn=zone==='exile'?'EXILIO':'VACÍO';
  document.getElementById('voidTitle').textContent=(p==='player'?'TU ':'IA · ')+zn+' · '+list.length+' cartas';
  if(list.length===0)el.innerHTML='<div class="empty">Zona vacía.</div>';
  else{
    const cnt={};list.forEach(k=>cnt[k]=(cnt[k]||0)+1);
    Object.keys(cnt).sort((a,b)=>CARDS[a].cost-CARDS[b].cost).forEach(k=>{
      const def=CARDS[k];const d=document.createElement('div');d.className='card gcard '+FAC[def.fac].cls+' r-'+(def.rar||'C')+' t-'+def.type;
      d.innerHTML=cardInnerHTML(def)+(cnt[k]>1?`<div class="qbadge">×${cnt[k]}</div>`:'');
      d.addEventListener('mouseenter',()=>showPreviewDef(def));d.addEventListener('mouseleave',hidePreview);
      el.appendChild(d);
    });
  }
  document.getElementById('voidView').classList.add('show');
}
function closeVoid(){document.getElementById('voidView').classList.remove('show');}
function animateAttack(aUid,tUid,done){
  const a=cardDom(aUid),t=cardDom(tUid);if(!a||!t){done();return;}if(typeof SETTINGS!=='undefined'&&SETTINGS&&SETTINGS.motion===false){setTimeout(done,180);return;}
  const ra=a.getBoundingClientRect(),rt=t.getBoundingClientRect();const dx=rt.left-ra.left+(rt.width-ra.width)/2,dy=rt.top-ra.top;
  a.style.zIndex=40;
  a.animate([{transform:a.classList.contains('tapped')?'rotate(82deg)':'none'},{transform:`translate(${dx*0.7}px,${dy*0.7}px) scale(1.1)`,offset:.5},{transform:'none'}],{duration:420,easing:'cubic-bezier(.5,0,.5,1)'}).onfinish=()=>{a.style.zIndex='';done();};
}
function pulsePA(p){const o=document.getElementById(p==='player'?'pPAorb':'aiPAorb');o.classList.add('pulse');setTimeout(()=>o.classList.remove('pulse'),600);}
function toast(msg){logEvent(msg);const t=document.getElementById('toast');const d=document.createElement('div');d.className='tmsg';d.textContent=msg;t.appendChild(d);setTimeout(()=>d.remove(),2500);while(t.children.length>4)t.removeChild(t.firstChild);}
function spotlight(sel){var el=document.querySelector(sel);var sp=document.getElementById('tutSpot');if(!el||!sp){if(sp)sp.classList.remove('show');return;}var r=el.getBoundingClientRect();var pad=8;sp.style.left=(r.left-pad)+'px';sp.style.top=(r.top-pad)+'px';sp.style.width=(r.width+pad*2)+'px';sp.style.height=(r.height+pad*2)+'px';sp.classList.add('show');}
function clearSpotlight(){var sp=document.getElementById('tutSpot');if(sp)sp.classList.remove('show');}
function showBanner(txt){const b=document.getElementById('banner'),x=document.getElementById('bannerTxt');x.textContent=txt;b.className='show '+(/IA/.test(txt)?'foe':'you');sfx('turn');setTimeout(()=>{b.classList.remove('show','foe','you');},1500);}
function updatePhaseUI(){const yt=G&&G.active==='player'&&!G.over;setT('phaseTxt',yt?'Tu Fase Principal':'Turno de la IA');const cb=document.getElementById('chargeBtn'),eb=document.getElementById('endBtn');if(cb)cb.disabled=!yt||PS('player').charged||busy;if(eb)eb.disabled=!yt||busy;if(cb)cb.classList.toggle('hint',!!(yt&&!PS('player').charged&&!busy&&PS('player').hand.length>0&&PS('player').timeline.length<7));var _pI=document.getElementById('pInfo'),_aI=document.getElementById('aiInfo'),_act=(G&&!G.over)?G.active:null;if(_pI){_pI.classList.toggle('active',_act==='player');_pI.classList.toggle('dim',_act==='ai');}if(_aI){_aI.classList.toggle('active',_act==='ai');_aI.classList.toggle('dim',_act==='player');}}
function endGame(win,title,sub){if(G.over)return;G.over=true;recordStat(win);busy=true;aiQueue=[];MUSIC.stop();{const sp=document.getElementById('solonPeek');if(sp)sp.classList.remove('show');}sfx(win?'win':'lose');const o=document.getElementById('endover');o.classList.add('show',win?'win':'lose');document.getElementById('endTitle').textContent=win?'¡VICTORIA!':'DERROTA';document.getElementById('endSub').textContent=title+' — '+sub;document.getElementById('endStats').textContent='Turnos jugados: '+G.turn+' · Tu PA: '+PS('player').pa+' · IA PA: '+PS('ai').pa;endPABar(PS('player').pa,PS('ai').pa);endRunSummary();if(win)winConfetti();if(G&&G.campaign){setTimeout(function(){campResolve(win);},60);}else{endNormalBtns();}}
function endPABar(youPA,foePA){var b=document.getElementById('endPAbar');if(!b)return;var goal=20;
  var yw=Math.max(2,Math.min(100,(youPA/goal)*100)),fw=Math.max(2,Math.min(100,(foePA/goal)*100));
  b.innerHTML='<div class="pabrow"><span class="pabname">Tú</span><span class="pabtrack"><span class="pabfill you" id="pabYou"></span></span><span class="pabval">'+youPA+' PA</span></div>'+
    '<div class="pabrow"><span class="pabname">IA</span><span class="pabtrack"><span class="pabfill foe" id="pabFoe"></span></span><span class="pabval">'+foePA+' PA</span></div>'+
    '<div class="pabgoal">Meta: '+goal+' Puntos AION</div>';
  setTimeout(function(){var y=document.getElementById('pabYou'),f=document.getElementById('pabFoe');if(y)y.style.width=yw+'%';if(f)f.style.width=fw+'%';},90);}
function endRunSummary(){var s=document.getElementById('endRunSummary');if(!s)return;
  if(!(G&&G.campaign)||typeof CAMP==='undefined'||!CAMP){s.classList.remove('show');s.innerHTML='';return;}
  var cleared=Object.keys(CAMP.visited||{}).length;var relics=(CAMP.relics||[]);var DN={easy:'Fácil',normal:'Normal',hard:'Difícil'};
  var rstr=relics.length?relics.map(function(r){return RELICS[r]?('<span title="'+RELICS[r].name+': '+RELICS[r].desc+'">'+RELICS[r].ic+'</span>'):'';}).join(''):'<span style="font-size:12px;color:#7a6a9c">aún ninguna</span>';
  s.innerHTML='<div class="rsh">Travesía — Los Fragmentos de Kaelen</div>'+
    '<div class="rsrow"><span>Nodos superados</span><b>'+cleared+'</b></div>'+
    '<div class="rsrow"><span>Cristales</span><b>💎 '+CAMP.crystals+'</b></div>'+
    '<div class="rsrow"><span>Dificultad</span><b>'+(DN[DIFF]||DIFF)+'</b></div>'+
    '<div class="rsrelics">'+rstr+'</div>';
  s.classList.add('show');}
function winConfetti(){var reduce=(typeof SETTINGS!=='undefined'&&SETTINGS&&SETTINGS.motion===false);if(reduce)return;
  var cv=document.getElementById('fx');if(!cv||!cv.getContext)return;var ctx=cv.getContext('2d');if(!ctx)return;
  cv.width=window.innerWidth;cv.height=window.innerHeight;var prevZ=cv.style.zIndex;cv.style.zIndex='91';
  var cols=['#ffd56b','#39d3ff','#ff3ea5','#46d36b','#f5b942','#a45cff'];var P=[],N=150;
  for(var i=0;i<N;i++)P.push({x:Math.random()*cv.width,y:-20-Math.random()*cv.height*0.5,vx:(Math.random()-0.5)*2.4,vy:2+Math.random()*3.6,s:5+Math.random()*7,rot:Math.random()*6.28,vr:(Math.random()-0.5)*0.3,c:cols[(Math.random()*cols.length)|0]});
  var t0=Date.now(),dur=2600;
  function frame(){var el=Date.now()-t0;ctx.clearRect(0,0,cv.width,cv.height);
    for(var i=0;i<P.length;i++){var p=P[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.04;p.rot+=p.vr;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.globalAlpha=el>dur-600?Math.max(0,(dur-el)/600):1;
      ctx.fillStyle=p.c;ctx.fillRect(-p.s/2,-p.s/2,p.s,p.s*0.6);ctx.restore();}
    if(el<dur)requestAnimationFrame(frame);else{ctx.clearRect(0,0,cv.width,cv.height);cv.style.zIndex=prevZ||'';}}
  requestAnimationFrame(frame);}


/* ---- help ---- */
document.getElementById('helpBox').innerHTML=`<h2>AION TCG · CÓMO JUGAR</h2>
<p><b>Meta:</b> 20 Puntos AION (PA). También ganas si el rival roba con el mazo vacío (Paradoja Total).</p>
<h3>Inicio de partida</h3><p>Ambos roban <b>6 cartas</b> y pueden hacer <b>Mulligan</b> (barajar cualquier cantidad de su mano y robar de nuevo). Se decide <b>quién empieza</b> (tú, la IA o aleatorio). El jugador que empieza <b>no roba carta en su primer turno</b>.</p>
<h3>Timeline / Aether</h3><ul><li>1 vez por turno: <b>Cargar Timeline</b> (envías 1 carta boca abajo = +1 Aether permanente).</li><li>Al jugar, el Aether se gasta agotando tu Timeline. Se restaura cada turno.</li></ul>
<h3>Acciones (clic en tus cartas)</h3><ul><li><b>Estabilizar:</b> agota una Entidad del Frente → ganas PA = SYNC.</li><li><b>Combatir:</b> ataca a enemigas <b>agotadas</b> o con Baluarte.</li><li><b>Usar habilidad:</b> entidades con Activa (agótala para su efecto).</li><li>💤 Inestabilidad de Entrada: no actúan el turno que entran (salvo Impulso).</li></ul>
<h3>Los 8 Keywords</h3><ul>
<li><b>Ascensión:</b> voltea al Lado B por Victoria / Resistencia / Dominio N.</li>
<li><b>Impulso:</b> ignora la Inestabilidad de Entrada.</li>
<li><b>Baluarte:</b> atacable aunque esté preparada; obliga a atacarla.</li>
<li><b>Aéreo:</b> ataca Soporte enemigo y entidades preparadas.</li>
<li><b>Impacto:</b> al destruir en combate, ganas PA extra.</li>
<li><b>Mutar:</b> al entrar eliges una opción impresa (sale un menú).</li>
<li><b>Glitch:</b> aplicado a una carta agotada, no se endereza en su próximo Inicio.</li>
<li><b>Sanar X:</b> remueve Daño.</li></ul>
<h3>⚡ Reacciones</h3><p>Algunas Directivas son <b>Reacciones</b>: solo se usan en el turno del rival, cuando declara un <b>ataque</b>, una <b>estabilización</b> o juega una <b>directiva</b>. Cuando ocurra, aparecerá una ventana para usarlas. <b>Se pagan con tu Timeline preparado</b>, así que para poder reaccionar debes terminar tu turno dejando cartas de Timeline sin agotar.</p>
<button class="closebtn" onclick="toggleHelp()">Entendido</button>`;
function toggleHelp(){document.getElementById('help').classList.toggle('show');}
/* ---- Emotes ---- */
function toggleEmoteBar(){document.getElementById('emoteBar').classList.toggle('show');sfx('click');}
function playerEmote(txt){document.getElementById('emoteBar').classList.remove('show');emoteBubble('player',txt);sfx('click');}
function emoteBubble(who,txt){const av=document.getElementById(who==='player'?'pAva':'aiAva');if(!av)return;const r=av.getBoundingClientRect();const b=document.createElement('div');b.className='emoteBubble';b.textContent=txt;b.style.left=(r.left+r.width/2)+'px';b.style.top=(r.top-6)+'px';document.body.appendChild(b);setTimeout(()=>b.remove(),1800);}


