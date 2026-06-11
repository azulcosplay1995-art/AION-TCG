/* MODULO: 04-engine.js
   MOTOR DE JUEGO (núcleo de reglas): estado global G, jugadores via PS(side), zonas, jugar/cargar cartas, combate, y el switch applyEffect (~130 tipos de efecto) con sus disparadores (entrada/onStab/onKill/onAscend/asc/tlb).
   (Detalle completo y guia para extender: aion-src/ARCHITECTURE.md) */
/* ============================================================
   MOTOR DE JUEGO
   ============================================================ */
let G,uidc=1,busy=false;
function mkPlayer(){return{pa:0,deck:[],hand:[],front:[null,null,null],support:[null,null,null],timeline:[],charged:false,tempAether:0,void:[],exile:[],facLbl:'',endDmg:[],bans:[]};}
function inst(key){const def=CARDS[key];return{uid:uidc++,key,def,side:'A',marked:0,tapped:false,sick:true,glitch:false,tempPow:0,tempHp:0,auraPow:0,auraHp:0,auraShield:0,kw:[...(def.kw||[])],tempKw:[],thorns:0,endDmg:0,used:{}};}
function canAttack(attacker,controller){
  if(getSide(attacker).cantAttack)return false;
  if(getSide(attacker).cantAttackUnlessMarked&&attacker.marked<=0)return false;if(getSide(attacker).cantAttackUnlessVoid!=null&&PS(controller).void.length<getSide(attacker).cantAttackUnlessVoid)return false;
  const en=opp(controller);
  for(const c of permanentsOf(en)){const a=getSide(c).aura;if(!a)continue;
    if(a.attackBanMaxCost!=null&&attacker.def.cost<=a.attackBanMaxCost)return false;
    if(a.attackBanKw&&hasKw(attacker,a.attackBanKw))return false;}
  for(const b of(PS(en).bans||[]))if(b.powMin!=null&&powOf(attacker)>=b.powMin)return false;
  return true;
}
function directiveTargetsEnemy(def){
  const ENEMY=new Set(['damage','glitch','debuff','debuffKw','destroy','bounce','stripKw','move','exileEnemyVoid','millThenDmg']);
  function scan(e){if(!e)return false;if(e.t==='multi')return(e.list||[]).some(scan);if(ENEMY.has(e.t))return true;if(e.scope&&String(e.scope).indexOf('enemy')===0)return true;return false;}
  return scan(def.effect);
}
function effectiveCost(p,def){
  let cost=def.cost;
  for(const c of permanentsOf(p)){
    const cr=getSide(c).costReduce;if(!cr)continue;
    if(c.used&&c.used.costReduce)continue;
    if(cr.cardType&&def.type!==cr.cardType)continue;
    if(cr.fac&&def.fac!==cr.fac)continue;
    cost=Math.max(cr.min!=null?cr.min:1,cost-cr.amount);break;
  }
  // A7: reducción de coste condicional sobre la propia carta (p.ej. Kraken si 8+ en Vacío)
  const crs=def.costReduceSelf;
  if(crs&&PS(p).void.length>=(crs.voidMin||0))cost=Math.max(0,cost-(crs.n||1));
  // A5: las Directivas enemigas que pueden elegir a tus Entidades cuestan +1 por cada Entidad con targetTax
  if(def.type==='directiva'&&directiveTargetsEnemy(def)){
    let tax=0;permanentsOf(opp(p)).forEach(c=>{const tt=getSide(c).targetTax;if(tt)tax+=(typeof tt==='number'?tt:1);});
    cost+=tax;
  }
  return cost;
}
function consumeCostReducers(p,def){
  for(const c of permanentsOf(p)){
    const cr=getSide(c).costReduce;if(!cr)continue;if(c.used&&c.used.costReduce)continue;
    if(cr.cardType&&def.type!==cr.cardType)continue;if(cr.fac&&def.fac!==cr.fac)continue;
    if(effectiveCost(p,def)<def.cost){(c.used=c.used||{}).costReduce=true;break;}
  }
}
function getSide(c){return c.side==='A'?c.def:(c.def.sideB||c.def);}
function powOf(c){return Math.max(0,(getSide(c).pow||0)+(c.tempPow||0)+(c.auraPow||0));}
function hpOf(c){return (getSide(c).hp||0)+(c.tempHp||0)+(c.auraHp||0);}
function syncOf(c){return getSide(c).sync||0;}
function isAncla(c){return c.def.type==='ancla';}
function permanentsOf(p){return [...PS(p).front,...PS(p).support].filter(c=>c);}
function anclasOf(p){return [...PS(p).front,...PS(p).support].filter(c=>c&&c.def.type==='ancla');}
function recomputeAuras(){
  ['player','ai'].forEach(p=>{permanentsOf(p).forEach(c=>{c.auraPow=0;c.auraHp=0;c.auraShield=0;});});
  ['player','ai'].forEach(p=>{
    permanentsOf(p).forEach(src=>{
      const a=getSide(src).aura;if(!a)return;
      if(!(a.pow||a.hp||a.shield))return;
      if(a.srcFrontReady&&(PS(p).front.indexOf(src)<0||src.tapped))return;
      const allies=entitiesOf(p);
      allies.forEach(c=>{
        let ok=true;
        if(a.kw&&!hasKw(c,a.kw))ok=false;
        if(a.fac&&c.def.fac!==a.fac)ok=false;
        if(a.rar&&c.def.rar!==a.rar)ok=false;
        if(a.zone&&PS(p).front.indexOf(c)<0&&a.zone==='front')ok=false;
        if(a.tokenOnly&&!isToken(c.def))ok=false;
        if(a.other&&c===src)ok=false;
        if(ok){c.auraPow+=a.pow||0;c.auraHp+=a.hp||0;c.auraShield+=a.shield||0;}
      });
    });
    // auras que afectan a las Entidades ENEMIGAS (debuffs de reglas)
    permanentsOf(p).forEach(src=>{
      const a=getSide(src).auraEnemy;if(!a)return;
      if(a.srcFrontReady&&(PS(p).front.indexOf(src)<0||src.tapped))return;
      const en=opp(p);
      entitiesOf(en).forEach(c=>{
        let ok=true;
        if(a.zone==='front'&&PS(en).front.indexOf(c)<0)ok=false;
        if(a.tappedOnly&&!c.tapped)ok=false;
        if(a.kw&&!hasKw(c,a.kw))ok=false;
        if(ok){c.auraPow+=a.pow||0;c.auraHp+=a.hp||0;}
      });
    });
  });
}
/* límite global de cartas por turno (apsArbitro) */
function globalCardLimit(){let lim=null;['player','ai'].forEach(p=>permanentsOf(p).forEach(c=>{const a=getSide(c).auraRule;if(a&&a.maxCards!=null)lim=(lim==null)?a.maxCards:Math.min(lim,a.maxCards);}));return lim;}
/* ¿el oponente bloquea las habilidades Activa de tus Anclas? (cloudCake) */
function anclaActivaBlocked(p){const en=opp(p);return permanentsOf(en).some(c=>{const a=getSide(c).auraRule;return a&&a.noAnclaActiva&&PS(en).front.indexOf(c)>=0&&!c.tapped;});}
function sideName(c){return getSide(c).name;}
function opp(p){return p==='player'?'ai':'player';}
function PS(p){return G[p];}
function entitiesOf(p){return [...PS(p).front,...PS(p).support].filter(c=>c&&(c.def.type==='entidad'||c.def.type==='token'));}
function hasKw(c,k){return c.kw.includes(k);}
function aether(p){return PS(p).timeline.filter(t=>!t.tapped).length+(PS(p).tempAether||0);}
function freeSlot(p,z){return PS(p)[z].indexOf(null);}

function startMatch(pDeck,pFac,aiDeck,aiFac,opts){
  opts=opts||{};
  LAST_MATCH={pDeck:pDeck,pFac:pFac,aiDeck:aiDeck,aiFac:aiFac,opts:opts};clearGlog();
  G={turn:1,active:'player',first:'player',player:mkPlayer(),ai:mkPlayer(),mode:null,over:false,tutorial:!!opts.tutorial,deckKey:opts.deckKey,campaign:opts.campaign?{nodeId:opts.nodeId}:null,boss:opts.boss||null,tut:{}};
  G.player.deck=shuffleArr(pDeck.slice());G.player.facLbl=pFac;
  G.ai.deck=shuffleArr(aiDeck.slice());G.ai.facLbl=aiFac;
  document.getElementById('pFacLbl').textContent=pFac;
  document.getElementById('aiFacLbl').textContent=aiFac;
  for(let i=0;i<6;i++){drawCard('player',true);drawCard('ai',true);}
  show('board');['helpBtn','muteBtn','musicBtn','emoteBtn'].forEach(id=>document.getElementById(id).classList.remove('hidden'));
  render();
  if(G.tutorial){
    G.first='player';
    showCoachMsg('<b>¡Bienvenido a AION!</b><br>Tu meta: llegar a <b>20 Puntos AION (PA)</b> antes que la IA.<br><br>Primero harás <b>Mulligan</b>: toca las cartas que no te sirvan para cambiarlas y confirma tu mano.','Hacer Mulligan →',()=>{hideCoach();startMulligan();setTimeout(()=>tutHook('mulligan'),300);});
  }else{
    document.getElementById('setupChoice').classList.add('show');
  }
}
function chooseFirst(who){
  let f=who==='random'?(Math.random()<0.5?'player':'ai'):who;
  G.first=f;
  document.getElementById('setupChoice').classList.remove('show');
  toast(f==='player'?'Empiezas tú':'Empieza la IA');
  startMulligan();
}
let mullSel=new Set();
function startMulligan(){mullSel=new Set();renderMulligan();document.getElementById('mulliganView').classList.add('show');}
function renderMulligan(){
  const grid=document.getElementById('mullGrid');grid.innerHTML='';
  PS('player').hand.forEach((c,i)=>{
    const def=c.def;const d=document.createElement('div');
    d.className='card gcard '+FAC[def.fac].cls+' r-'+(def.rar||'C')+' t-'+def.type+(mullSel.has(i)?' mullsel':'');
    d.innerHTML=cardInnerHTML(def)+(mullSel.has(i)?'<div class="mullx">↺</div>':'')+((typeof G!=='undefined'&&G&&G.tutorial&&(def.cost||0)>=4)?'<div class="mulltip">💡 cara</div>':'');
    d.addEventListener('mouseenter',()=>showPreviewDef(def));d.addEventListener('mouseleave',hidePreview);
    d.onclick=()=>{mullSel.has(i)?mullSel.delete(i):mullSel.add(i);renderMulligan();};
    grid.appendChild(d);
  });
  document.getElementById('mullInfo').textContent=mullSel.size?`Cambiarás ${mullSel.size} carta(s) · toca para alternar`:'Toca las cartas que quieras barajar y cambiar';
}
function confirmMulligan(){
  const idxs=[...mullSel].sort((a,b)=>b-a);
  const removed=[];idxs.forEach(i=>removed.push(PS('player').hand.splice(i,1)[0].key));
  removed.forEach(k=>PS('player').deck.push(k));shuffleArr(PS('player').deck);
  for(let i=0;i<removed.length;i++)drawCard('player',true);
  document.getElementById('mulliganView').classList.remove('show');
  if(removed.length)toast('Mulligan: cambiaste '+removed.length+' carta(s)');
  aiMulligan();
  beginFirstTurn();
  if(G.tutorial)setTimeout(coachBoard,700);
}
function aiMulligan(){
  const s=PS('ai');let toMull=[];
  s.hand.forEach((c,i)=>{if(c.def.cost>=6)toMull.push(i);});
  const cheap=s.hand.filter(c=>c.def.cost<=2).length;
  if(cheap<2){
    s.hand.map((c,i)=>({i,cost:c.def.cost})).filter(x=>x.cost>=4&&!toMull.includes(x.i))
      .sort((a,b)=>b.cost-a.cost).slice(0,2).forEach(x=>toMull.push(x.i));
  }
  toMull=[...new Set(toMull)].sort((a,b)=>b-a);
  const removed=[];toMull.forEach(i=>removed.push(s.hand.splice(i,1)[0].key));
  removed.forEach(k=>s.deck.push(k));shuffleArr(s.deck);
  for(let i=0;i<removed.length;i++)drawCard('ai',true);
}
function beginFirstTurn(){
  G.live=true;G.active=G.first;render();
  if(MUSIC.on&&!SFX.muted)MUSIC.start();
  showBanner(G.first==='player'?'TU TURNO':'TURNO IA');
  startTurn(G.first,true);
}
function drawCard(p,silent){
  const s=PS(p);
  if(s.deck.length===0){endGame(opp(p)==='player','Paradoja Total','Tu rival debe robar con el mazo vacío.');return null;}
  const key=s.deck.shift();const c={uid:uidc++,key,def:CARDS[key]};s.hand.push(c);
  if(p==='player'&&G&&G.live){G.drawAnim=G.drawAnim||[];G.drawAnim.push(c.uid);sfx('draw');}
  return c;
}
function millCard(p){const s=PS(p);
  const shield=permanentsOf(p).find(c=>getSide(c).millShield&&!(c.used&&c.used.millShield));
  if(shield){(shield.used=shield.used||{}).millShield=true;heal(shield,1);toast('Reduce el envío al Vacío en 1');return;}
  if(s.deck.length){const k=s.deck.shift();s.void.push(k);fireEvent('cardToVoid',p,{});}}

function startTurn(p,first){
  const s=PS(p);
  ['player','ai'].forEach(pp=>permanentsOf(pp).forEach(c=>{c.used={};}));
  let glitchBlocked=null;
  entitiesOf(p).forEach(c=>{
    if(c.glitch){c.glitch=false;if(!glitchBlocked)glitchBlocked=c;} else c.tapped=false;
    c.sick=false;c.tempPow=0;c.tempHp=0;c.thorns=0;
    if(c.tempKw&&c.tempKw.length){c.kw=c.kw.filter(k=>!c.tempKw.includes(k));c.tempKw=[];}
  });
  s.timeline.forEach(t=>{if(t.glitch){t.glitch=false;}else t.tapped=false;});
  s.charged=false;s.tempAether=(s.nextAether||0);s.nextAether=0;s.bans=[];s.dirThisTurn=0;s.cardsThisTurn=0;s.mutarThisTurn=false;s.solonUsed=false;s.didActTurn=false;
  if(s.tempAether>0)toast('+'+s.tempAether+' Aether (efecto del turno anterior)');
  if(glitchBlocked)fireEvent('glitchBlocked',opp(p),{target:glitchBlocked});
  permanentsOf(p).forEach(c=>{const sd=getSide(c);if(sd.onTurnStart)applyEffect(sd.onTurnStart,p,c,()=>{},true);});
  if(G.boss==='xul'&&p==='player')campBossTick();
  if(!first)drawCard(p);
  if(G.over)return;
  render();
  if(p==='ai')setTimeout(aiTurn,700);else updatePhaseUI();
}
function applyEndDamage(p){
  entitiesOf(p).forEach(c=>{if(c.endDmg){dealDamage(c,c.endDmg);c.endDmg=0;}});
  checkDeaths();
}
function fireTurnEnd(p){
  permanentsOf(p).forEach(c=>{const sd=getSide(c);if(sd.onTurnEnd)applyEffect(sd.onTurnEnd,p,c,()=>{},true);});
  checkDeaths();
}
function endTurn(){if(typeof clearSpotlight==='function')clearSpotlight();
  if(busy||G.over||G.active!=='player')return;
  sfx('click');closeMenu();G.mode=null;fireTurnEnd('player');applyEndDamage('player');
  if(!G.over&&!PS('player').didActTurn){gainPA('ai',1);toast('Inercia Temporal: la IA gana 1 PA');}
  const s=PS('player');if(s.hand.length>7)s.hand.length=7;
  G.active='ai';G.turn++;render();showBanner('TURNO IA');
  setTimeout(()=>{if(!G.over)startTurn('ai',false);},900);
}
function aiEndTurn(){
  fireTurnEnd('ai');applyEndDamage('ai');
  if(!G.over&&!PS('ai').didActTurn){gainPA('player',1);toast('Inercia Temporal: ganas 1 PA');}
  const s=PS('ai');if(s.hand.length>7)s.hand.length=7;
  G.active='player';G.turn++;busy=false;render();showBanner('TU TURNO');
  setTimeout(()=>{if(!G.over)startTurn('player',false);},700);
}

/* ---- placement / play ---- */
function canPlace(p,card){
  if(card.def.type==='directiva')return true;
  const pos=card.def.pos;
  if(pos==='front')return freeSlot(p,'front')>=0;
  if(pos==='support')return freeSlot(p,'support')>=0;
  return freeSlot(p,'front')>=0||freeSlot(p,'support')>=0;
}
function payAether(p,n){
  let need=n;const ready=PS(p).timeline.filter(t=>!t.tapped);
  for(const t of ready){if(need<=0)break;t.tapped=true;need--;}
  if(need>0)PS(p).tempAether=Math.max(0,(PS(p).tempAether||0)-need);
}
function playFromHand(p,idx,preferZone){
  const s=PS(p);const card=s.hand[idx];const def=card.def;
  const cost=effectiveCost(p,def);
  if(cost>aether(p)){toast('Aether insuficiente');return false;}
  {const lim=globalCardLimit();if(lim!=null&&(s.cardsThisTurn||0)>=lim){toast('Límite de '+lim+' cartas por turno (Árbitro)');return false;}}
  if(def.type!=='directiva'&&!canPlace(p,card)){toast('Sin espacio en el tablero');return false;}
  s.hand.splice(idx,1);payAether(p,cost);consumeCostReducers(p,def);s.cardsThisTurn=(s.cardsThisTurn||0)+1;
  fireEvent('cardPlayed',p,{count:s.cardsThisTurn,card:def});
  if(def.type==='directiva'){
    s.dirThisTurn=(s.dirThisTurn||0)+1;G.fromTop=false;
    toast(`${ownerN(p)} usa ${def.name}`);sfx('cast');s.void.push(card.key);busy=true;render();
    if(p==='player'&&G.tutorial)setTimeout(()=>tutHook('playedDirectiva'),500);
    reactionWindow({type:'directiva',directiveCard:card},p,(res)=>{
      if(res.cancelled){toast(`${def.name} fue cancelada`);resumeFlow();return;}
      busy=false;render();resolveDirectiva(p,card);
      if(G.active==='ai'&&!G.over)setTimeout(aiStep,500);
    });
    return true;
  }
  const e=inst(card.key);e.sick=def.type==='entidad'?!hasKw(e,'impulso'):false;
  const __place=()=>{
    let zone;
    if(def.type==='ancla'||def.pos==='support')zone='support';
    else if(def.pos==='front')zone='front';
    else zone=(preferZone&&freeSlot(p,preferZone)>=0)?preferZone:(freeSlot(p,'front')>=0?'front':'support');
    if(freeSlot(p,zone)<0){PS(p).void.push(card.key);render();return;}
    PS(p)[zone][freeSlot(p,zone)]=e;
    render();flashSummon(e.uid);sfx('play');fxBurst(cardCenter(e.uid),FACHEX[def.fac]);toast(`${ownerN(p)} juega: ${def.name}`);
    onEnter(p,e);
    if(def.type==='ancla')fireEvent('anclaPlayed',p,{ancla:e});
    if(p==='player'&&G.tutorial){
      if(def.type==='ancla')setTimeout(()=>tutHook('playedAncla'),500);
      else if(def.type==='entidad'){setTimeout(()=>tutHook('playedEntidad'),500);if(def.pos==='flex')setTimeout(()=>tutHook('flexInPlay'),550);}
      setTimeout(()=>tutKwLesson(def),580);
    }
  };
  if(def.type==='entidad'){
    busy=true;
    reactionWindow({type:'entidad',entityCard:card},p,(res)=>{
      busy=false;
      if(res.cancelled){PS(p).void.push(card.key);toast(`${def.name} fue cancelada`);render();if(G.active==='ai'&&!G.over)setTimeout(aiStep,400);return;}
      __place();
      if(G.active==='ai'&&!G.over)setTimeout(aiStep,400);
    });
    return true;
  }
  __place();
  return true;
}
function onEnter(p,e){
  const def=e.def;
  if(def.mutar)doMutar(p,e,def.mutar);
  else if(def.entrada)applyEffect(def.entrada,p,e,()=>render());
}
function resolveDirectiva(p,card){
  permanentsOf(p).forEach(c=>{const sd=getSide(c);if(sd.onDirective){if(sd.onDirective.once&&c.used&&c.used.directive)return;if(sd.onDirective.dirFac&&card.def.fac!==sd.onDirective.dirFac)return;(c.used=c.used||{}).directive=true;applyEffect(sd.onDirective,p,c,()=>{},true);}});
  G.tlbCtx={};G.lastTarget=null;G.dirCaster=p;
  const tlb=card.def.tlb;
  const preMet=(tlb&&!tlbIsCtxCond(tlb.cond))?tlbCondMet(tlb.cond,p):null;
  applyEffect(card.def.effect,p,null,()=>{applyTLB(card.def,p,()=>{G.dirCaster=null;G.fromTop=false;render();},p==='ai',preMet);});
}

/* ---- TIMELINE BONUS ---- */
function tlbIsCtxCond(c){return !!(c&&(c.k==='ctxTokens'||c.k==='ctxExiledEntity'));}
function applyTLB(def,p,done,fa,preMet){
  done=done||(()=>{});
  const tlb=def&&def.tlb;
  if(!tlb){done();return;}
  const met=(preMet!=null)?preMet:tlbCondMet(tlb.cond,p);
  if(!met){done();return;}
  toast('✦ Timeline Bonus');
  applyTLBEff(tlb.eff,p,done,fa);
}
function tlbCondMet(cond,p){
  if(!cond)return true;
  const en=opp(p);
  switch(cond.k){
    case 'fac':return entitiesOf(p).some(c=>c.def.fac===cond.v);
    case 'facAsc':return entitiesOf(p).some(c=>c.def.fac===cond.v&&c.side==='B');
    case 'facKw':return entitiesOf(p).some(c=>c.def.fac===cond.fac&&hasKw(c,cond.kw));
    case 'kw':return cond.v==='glitch'?entitiesOf(p).some(c=>c.glitch):entitiesOf(p).some(c=>hasKw(c,cond.v));
    case 'tlMin':return PS(p).timeline.length>=cond.v;
    case 'oppTlMore':return PS(en).timeline.length>PS(p).timeline.length;
    case 'oppMoreAnclas':return anclasOf(en).length>anclasOf(p).length;
    case 'oppKw':return entitiesOf(en).some(c=>hasKw(c,cond.v));
    case 'oppDir2':return (PS(en).dirThisTurn||0)>=cond.v;
    case 'allyHadGlitch':return permanentsOf(p).some(c=>c.glitch)||PS(p).timeline.some(t=>t.glitch);
    case 'fromTop':return !!G.fromTop;
    case 'ctxTokens':return ((G.tlbCtx&&G.tlbCtx.tokensDestroyed)||0)>=cond.v;
    case 'ctxExiledEntity':return !!(G.tlbCtx&&G.tlbCtx.exiledEntity);
    default:return false;
  }
}
function applyTLBEff(eff,p,done,fa){
  done=done||(()=>{});
  if(!eff){done();return;}
  if(eff.t==='multi'){let i=0;const run=()=>{if(i>=eff.list.length){done();return;}applyTLBEff(eff.list[i++],p,run,fa);};run();return;}
  switch(eff.t){
    case 'tlbHealLast':{const t=G.lastTarget;if(t)heal(t,eff.n||1);render();done();break;}
    case 'tlbBuffLast':{const t=G.lastTarget;if(t){t.tempPow+=eff.pow||0;t.tempHp+=eff.hp||0;floatOver(t.uid,(eff.pow?'+'+eff.pow+'⚔ ':'')+(eff.hp?'+'+eff.hp+'❤':''),'var(--gold)');}render();done();break;}
    case 'tlbDmgLastIfMarked':{const t=G.lastTarget;if(t&&permanentsOf(opp(p)).includes(t)){dealDamage(t,t.marked>0?2:1);setTimeout(()=>{checkDeaths();render();},340);}render();done();break;}
    case 'tlbDmgLastFlat':{const t=G.lastTarget;if(t&&permanentsOf(opp(p)).includes(t)){dealDamage(t,eff.n||1);setTimeout(()=>{checkDeaths();render();},340);}render();done();break;}
    case 'tlbExileOnDeathLast':{const t=G.lastTarget;if(t){t.exileOnDeath=true;toast('Si esa Entidad muere este turno, será exiliada');}done();break;}
    case 'tlbExileLastVoid':{const v=PS(opp(p)).void;if(v.length){const k=v.pop();PS(opp(p)).exile.push(k);toast('Exiliada en lugar de ir al Vacío');}render();done();break;}
    case 'tlbTokenBaluarte':{const tok=PS(p).front.find(c=>c&&isToken(c.def)&&!hasKw(c,'baluarte'));if(tok){addTempKw(tok,'baluarte');toast('El Token gana Baluarte');}render();done();break;}
    case 'tlbOppCycle':{const en=opp(p);autoDiscard(en);drawCard(en);toast(ownerN(en)+' descarta 1 y roba 1');render();done();break;}
    case 'tlbBuffAllyHp':{pickTarget('ally',p,null,t=>{if(t){t.tempHp+=eff.hp||1;floatOver(t.uid,'+'+(eff.hp||1)+'❤','var(--gaia)');}render();done();},fa);break;}
    default:applyEffect(eff,p,G.lastTarget||null,done,fa);
  }
}

/* ---- BUS DE EVENTOS DE JUEGO ---- */
/* actor = jugador que realizó la acción. Los listeners declaran rel: 'self' (su dueño es el actor),
   'opp' (el actor es su oponente) o 'any'. Por defecto 'self'. */
function fireEvent(ev,actor,ctx){
  ctx=ctx||{};
  ['player','ai'].forEach(pp=>{
    permanentsOf(pp).forEach(c=>{
      const list=getSide(c).onEvent;if(!list)return;
      list.forEach((h,hi)=>{
        if(h.ev!==ev)return;
        const rel=h.rel||'self';
        if(rel==='self'&&pp!==actor)return;
        if(rel==='opp'&&pp!==opp(actor))return;
        if(h.fac&&ctx.target&&ctx.target.def.fac!==h.fac)return;
        if(h.playedFac&&(!ctx.card||ctx.card.fac!==h.playedFac))return;
        if(h.anclaFac&&ctx.ancla&&ctx.ancla.def.fac!==h.anclaFac)return;
        if(h.self&&ctx.target!==c)return;
        if(h.to&&ctx.to!==h.to)return;
        if(h.from&&ctx.from!==h.from)return;
        if(h.count!=null&&ctx.count!==h.count)return;
        const uk='ev_'+ev+'_'+hi;
        if(h.once&&c.used&&c.used[uk])return;
        if(h.onceGame&&c.usedG&&c.usedG[uk])return;
        (c.used=c.used||{})[uk]=true;if(h.onceGame)(c.usedG=c.usedG||{})[uk]=true;
        const src=h.srcTarget?ctx.target:c;
        if(src)applyEffect(h.eff,pp,src,()=>render(),true);
      });
    });
  });
}

/* ---- MOTOR DE EFECTOS ----
   Despachador central: un gran switch(eff.t) con ~130 tipos. Parámetros:
     eff    = objeto de efecto {t:'<tipo>', ...params} (de la carta o de un sub-efecto)
     p      = lado que ejecuta ('player'|'ai')
     source = carta/entidad origen (para scope relativo y riders por POW/Vacío)
     done   = callback al terminar (async: hay efectos que abren ventanas de objetivo)
     fa     = "force-auto": resuelve sin UI (lo usa el simulador y la IA)
   Para apuntar objetivos se usa targetList(scope, side, source) (ver más abajo);
   un efecto sin objetivos válidos hace "fizzle". 'multi' encadena una lista de efectos. */
function applyEffect(eff,p,source,done,fa){
  done=done||(()=>{});
  if(!eff){done();return;}
  if(eff.t==='multi'){let i=0;const run=()=>{if(i>=eff.list.length){done();return;}applyEffect(eff.list[i++],p,source,run,fa);};run();return;}
  switch(eff.t){
    case 'draw':for(let i=0;i<eff.n;i++)drawCard(p);toast(`${ownerN(p)} roba ${eff.n}`);render();done();break;
    case 'mill':{var _domill=function(){for(let i=0;i<eff.n;i++)millCard(p);toast(eff.n+' al Vacío');render();done();};if(eff.opt&&p==='player'){confirmYesNo('¿Enviar '+eff.n+' carta'+(eff.n>1?'s':'')+' de tu mazo al Vacío?',function(y){if(y)_domill();else{render();done();}});}else _domill();break;}
    case 'heal':pickTarget(eff.scope||'ally',p,source,t=>{if(t){heal(t,eff.n);toast(`Sanar ${eff.n}`);}render();done();},fa);break;
    case 'sanarSelf':if(source){heal(source,eff.n);}render();done();break;
    case 'damage':pickTarget(eff.scope||'enemyEntity',p,source,t=>{if(t){dealDamage(t,eff.n);setTimeout(()=>{checkDeaths();render();},360);}render();done();},fa);break;
    case 'dmgScaled':pickTarget(eff.scope||'enemyEntityNoToken',p,source,t=>{if(t){dealDamage(t,t.marked>0?2:1);setTimeout(()=>{checkDeaths();render();},360);}render();done();},fa);break;
    case 'voidToHand':{const v=PS(p).void;const idx=v.findIndex(k=>CARDS[k]&&(eff.fac==null||CARDS[k].fac===eff.fac)&&(eff.maxCost==null||CARDS[k].cost<=eff.maxCost)&&(eff.cls==null||CARDS[k].type===eff.cls));if(idx>=0){const k=v.splice(idx,1)[0];if(eff.toDeck){PS(p).deck.push(k);toast('Al fondo del mazo: '+CARDS[k].name);}else{PS(p).hand.push({uid:uidc++,key:k,def:CARDS[k]});toast('Recuperas: '+CARDS[k].name);}}render();done();break;}
    case 'aoeFront':{const en=opp(p);const fr=PS(en).front.filter(c=>c&&c.def.type==='entidad');if(fr.length){fr.forEach(c=>dealDamage(c,eff.n||1));setTimeout(()=>{checkDeaths();render();},340);render();done();}else{pickTarget('enemyEntity',p,source,t=>{if(t)dealDamage(t,eff.n||1);setTimeout(()=>{checkDeaths();render();},340);render();done();},fa);}break;}
    case 'healElse':{if(targetList(eff.scope||'allyMarked',p).length){pickTarget(eff.scope||'allyMarked',p,source,t=>{if(t)heal(t,eff.n||1);render();done();},fa);}else{applyEffect({t:'drawDiscard'},p,source,()=>{render();done();});}break;}
    case 'healElsePeek':{if(targetList(eff.scope||'allyMarked',p).length){pickTarget(eff.scope||'allyMarked',p,source,t=>{if(t)heal(t,eff.n||1);render();done();},fa);}else{doPeek(p,fa,()=>{render();done();});}break;}
    case 'solonAscend':pickTarget('enemyEntity',p,source,t=>{if(t){if(t.tapped){const en=opp(p);['front','support'].forEach(z=>{const i=PS(en)[z].indexOf(t);if(i>=0)PS(en)[z][i]=null;});if(!isToken(t.def))PS(en).deck.push(t.key);toast(sideName(t)+' al fondo del mazo');}else{dealDamage(t,2);setTimeout(()=>{checkDeaths();render();},340);}}render();done();},fa);break;
    case 'moveAlly':{const cand=entitiesOf(p).filter(c=>c.def.pos==='flex');if(cand.length){const c0=cand[0];const inFront=PS(p).front.indexOf(c0)>=0;const fz=inFront?'front':'support',tz=inFront?'support':'front';if(freeSlot(p,tz)>=0)moveEntity(p,c0,fz,tz);}render();done();break;}
    case 'dmgIfSelfPow':if(source&&powOf(source)>=(eff.pow||3)){pickTarget(eff.scope||'enemyNoTokenUnmarked',p,source,t=>{if(t){dealDamage(t,1);setTimeout(()=>{checkDeaths();render();},340);}render();done();},fa);}else{render();done();}break;
    case 'dmgIfSourceMarked':if(source&&source.marked>0){pickTarget(eff.scope||'enemyEntity',p,source,t=>{if(t){dealDamage(t,1);setTimeout(()=>{checkDeaths();render();},340);}render();done();},fa);}else{render();done();}break;
    case 'destroyOrDmg':pickTarget(eff.scope||'enemyEntityNoToken',p,source,t=>{if(t){if(t.marked>0)dealDamage(t,2);else destroyEntity(opp(p),t);setTimeout(()=>{checkDeaths();render();},360);}render();done();},fa);break;
    case 'glitch':{const sc=eff.scope||'enemyTapped';
      if(targetList(sc,p).length){pickTarget(sc,p,source,t=>{if(t)applyGlitch(t,p);if(eff.then==='draw')drawCard(p);else if(eff.then==='drawDiscard')applyEffect({t:'drawDiscard'},p,source,()=>{render();done();});if(eff.then!=='drawDiscard'){render();done();}},fa);}
      else{if(eff.failDraw)drawCard(p);render();done();}
      break;}
    case 'gainPA':gainPA(p,eff.n||1);render();done();break;
    case 'glitchTimeline':{const tl=PS(opp(p)).timeline.filter(t=>t.tapped&&!t.glitch);if(tl.length){tl[0].glitch=true;toast('Glitch al Timeline enemigo');}else toast('Sin Timeline agotado');render();done();break;}
    case 'buffSelf':if(source){source.tempPow+=eff.pow||0;source.tempHp+=eff.hp||0;floatOver(source.uid,(eff.pow?'+'+eff.pow+'⚔ ':'')+(eff.hp?'+'+eff.hp+'❤':''),'var(--gaia)');}render();done();break;
    case 'gainKw':if(source){addTempKw(source,eff.kw);if(eff.kw==='impulso')source.sick=false;toast('Gana '+(KW[eff.kw]?KW[eff.kw].name:eff.kw));}render();done();break;
    case 'token':createToken(p,eff.id,eff.zone||'front');render();done();break;
    case 'aether':PS(p).tempAether=(PS(p).tempAether||0)+eff.n;toast('+'+eff.n+' Aether temporal');render();done();break;
    case 'aetherIfGlitch':if(entitiesOf(opp(p)).some(c=>c.glitch)){PS(p).tempAether=(PS(p).tempAether||0)+eff.n;toast('+'+eff.n+' Aether temporal');}render();done();break;
    case 'drawDiscard':drawCard(p);if(PS(p).hand.length){chooseHandCard(p,'Elige una carta para descartar',function(idx){if(idx!=null){var k=PS(p).hand.splice(idx,1)[0].key;PS(p).void.push(k);}toast(ownerN(p)+' roba 1 y descarta 1');render();done();},true);}else{render();done();}break;
    case 'discardThenDamage':{if(!PS(p).hand.length){render();done();break;}chooseHandCard(p,'Puedes descartar 1 carta para infligir '+(eff.n||2)+' Daño',function(idx){if(idx!=null){var k=PS(p).hand.splice(idx,1)[0].key;PS(p).void.push(k);pickTarget(eff.scope||'enemyTapped',p,source,function(t){if(t)dealDamage(t,eff.n||2);setTimeout(function(){checkDeaths();render();},300);render();done();},fa);}else{render();done();}},false);break;}
    case 'optDiscardDraw':chooseHandCard(p,'Puedes descartar 1 carta para robar 1',function(idx){if(idx!=null){var k=PS(p).hand.splice(idx,1)[0].key;PS(p).void.push(k);drawCard(p);toast(ownerN(p)+' descarta 1 y roba 1');}else toast(ownerN(p)+' no descarta');render();done();});break;
    case 'caravanaEnd':{var _dmg=entitiesOf(p).filter(function(c){return c.marked>0;});if(_dmg.length){heal(_dmg.sort(function(a,b){return b.marked-a.marked;})[0],1);toast(ownerN(p)+': Caravana sana 1');}else if(PS(p).hand.length<=2){drawCard(p);toast(ownerN(p)+': Caravana roba 1');}render();done();break;}
    case 'buffThenAscend':pickTarget(eff.scope||'allyLowCost3',p,source,t=>{if(t){t.tempPow+=eff.pow||0;t.tempHp+=eff.hp||0;floatOver(t.uid,'+'+(eff.pow||0)+'⚔ +'+(eff.hp||0)+'❤','var(--gold)');if(t.side==='A'&&t.def.sideB)forceAscend(p,t);}render();done();},fa);break;
    case 'destroyAnclaOrPeek':if(targetList('enemyAncla',p,source).length){pickTarget('enemyAncla',p,source,t=>{if(t){removePermanent(opp(p),t);toast('Ancla destruida');}render();done();},fa);}else doPeek(p,fa,()=>{render();done();});break;
    case 'buff':pickTarget(eff.scope||'ally',p,source,t=>{if(t){t.tempPow+=eff.pow||0;t.tempHp+=eff.hp||0;if(eff.impulso){addTempKw(t,'impulso');t.sick=false;}if(eff.healIfBaluarte&&hasKw(t,'baluarte'))heal(t,eff.healIfBaluarte);if(eff.healIfMutar&&t.def.mutar)heal(t,eff.healIfMutar);floatOver(t.uid,'+'+(eff.pow||0)+'⚔','var(--solaris)');}render();done();},fa);break;
    case 'debuff':pickTarget(eff.scope||'enemyEntity',p,source,t=>{if(t){t.tempPow-=eff.pow||0;floatOver(t.uid,'-'+eff.pow+'⚔','var(--vacio)');if(eff.scaled){dealDamage(t,t.marked>0?2:1);setTimeout(()=>{checkDeaths();render();},360);}}render();done();},fa);break;
    case 'debuffKw':pickTarget(eff.scope||'enemyEntity',p,source,t=>{if(t){t.kw=t.kw.filter(k=>k!==eff.kw);if(eff.n)dealDamage(t,eff.n);toast('Pierde '+(KW[eff.kw]?KW[eff.kw].name:eff.kw));setTimeout(()=>{checkDeaths();render();},360);}render();done();},fa);break;
    case 'thorns':if(source)source.thorns=(source.thorns||0)+(eff.n||1);toast('Espinas activadas');render();done();break;
    case 'overheat':if(source){source.tempPow+=eff.pow;source.endDmg=(source.endDmg||0)+1;toast('+'+eff.pow+' POW (recibe 1 al final)');}render();done();break;
    case 'selfDmgThenDmg':{var _go=function(yes){if(!yes){render();done();return;}if(source)dealDamage(source,eff.n);var th=eff.then||'dmgTapped';if(th==='dmgTapped'){pickTarget('enemyTapped',p,source,function(t){if(t)dealDamage(t,eff.n);setTimeout(function(){checkDeaths();render();},340);render();done();},fa);}else if(th==='healForja'){if(targetList('allyFacOther:forja',p,source).length){pickTarget('allyFacOther:forja',p,source,function(t){if(t)heal(t,1);render();done();},fa);}else{render();done();}}else if(th==='token'){createToken(p,eff.tid||'t_chatarra',eff.zone||'support');render();done();}else{render();done();}};if(p==='ai'){_go(aiSelfDmgWant(p,source,eff));}else confirmYesNo('¿Hacer que '+sideName(source)+' reciba '+eff.n+' Daño para activar su efecto?',_go);break;}
    case 'move':pickTarget('enemyMovableFront',p,source,t=>{if(t)moveEntity(opp(p),t,'front','support');render();done();},fa);break;
    case 'bounce':pickTarget('enemyBounceable',p,source,t=>{if(t)bounceToHand(opp(p),t);render();done();},fa);break;
    case 'bounceAlly':if(targetList('allyLowCost',p,source).length){pickTarget('allyLowCost',p,source,t=>{if(t)bounceToHand(p,t);render();done();},fa);}else doPeek(p,fa,()=>{render();done();});break;
    case 'destroyTokens':{let cnt=0;PS(opp(p)).front.forEach((c,i)=>{if(c&&isToken(c.def)){PS(opp(p)).front[i]=null;cnt++;}});if(G.tlbCtx)G.tlbCtx.tokensDestroyed=cnt;toast('Tokens enemigos destruidos');render();done();break;}
    case 'destroyAncla':{const anc=anclasOf(opp(p)).filter(a=>eff.maxCost==null||a.def.cost<=eff.maxCost);if(anc.length){pickTarget('enemyAncla',p,source,t=>{if(t){removePermanent(opp(p),t);toast('Ancla destruida');}render();done();},fa);}else{if(eff.failDraw)drawCard(p);render();done();}break;}
    case 'removeGlitch':{const list=permanentsOf(p).filter(c=>c.glitch).concat(PS(p).timeline.filter(t=>t.glitch));if(list.length){for(let i=0;i<(eff.n||1)&&i<list.length;i++)list[i].glitch=false;toast('Glitch removido');}else if(eff.failGlitch){const en=targetList('enemyTapped',p);if(en.length)applyGlitch(en[0],p);}render();done();break;}
    case 'reanimate':{var _dorea=function(){const v=PS(p).void;let idx=v.findIndex(k=>CARDS[k]&&CARDS[k].type==='entidad'&&CARDS[k].cost<=(eff.maxCost||1));if(idx>=0&&freeSlot(p,'front')>=0){const k=v.splice(idx,1)[0];const e=inst(k);e.tapped=true;e.sick=false;PS(p).front[freeSlot(p,'front')]=e;toast('Reanima: '+CARDS[k].name);}else toast('Sin objetivo en el Vacío');render();done();};var _hasT=PS(p).void.some(function(k){return CARDS[k]&&CARDS[k].type==='entidad'&&CARDS[k].cost<=(eff.maxCost||1);})&&freeSlot(p,'front')>=0;if(eff.opt&&p==='player'&&_hasT){confirmYesNo('¿Reanimar 1 Entidad de tu Vacío?',function(y){if(y)_dorea();else{render();done();}});}else _dorea();break;}
    case 'recycleVoid':{const v=PS(p).void;if(v.length){const k=v.shift();PS(p).deck.push(k);toast('Recicla 1 del Vacío al mazo');fireEvent('voidToDeck',p,{});}render();done();break;}
    case 'aetherDestroySelf':PS(p).tempAether=(PS(p).tempAether||0)+(eff.n||1);if(source)removePermanent(p,source);toast('+'+(eff.n||1)+' Aether temporal');render();done();break;
    case 'prepareTimeline':{const tl=PS(p).timeline.filter(t=>t.tapped);for(let i=0;i<(eff.n||1)&&i<tl.length;i++)tl[i].tapped=false;toast('Timeline preparado');render();done();break;}
    case 'timelineFromDeck':{if(PS(p).deck.length){const k=PS(p).deck.shift();PS(p).timeline.push({uid:uidc++,key:k,def:CARDS[k],tapped:true,glitch:false});toast('Timeline +1 (agotada)');}render();done();break;}
    case 'aetherIfAlly':{if(entitiesOf(p).some(c=>c!==source&&c.def.fac===eff.fac)){PS(p).tempAether=(PS(p).tempAether||0)+eff.n;toast('+'+eff.n+' Aether temporal');}render();done();break;}
    case 'attackBanTemp':{PS(p).bans=PS(p).bans||[];PS(p).bans.push({powMin:eff.powMin});toast('Restricción: enemigas con POW '+eff.powMin+'+ no pueden atacar hasta tu próximo turno');render();done();break;}
    case 'reactorPulse':{if(source)dealDamage(source,1);pickTarget('enemyEntity',p,source,t=>{if(t){if(t.tapped)dealDamage(t,1);else if(source&&source.marked>=3)dealDamage(t,2);}setTimeout(()=>{checkDeaths();render();},360);render();done();},fa);break;}
    case 'millThenDmg':{var _domd=function(){millCard(p);pickTarget(eff.scope||'enemyEntityNoToken',p,source,function(t){if(t)dealDamage(t,t.marked>0?2:1);setTimeout(function(){checkDeaths();render();},360);render();done();},fa);};if(eff.opt&&p==='player'){confirmYesNo('¿Enviar 1 carta al Vacío para infligir Daño?',function(y){if(y)_domd();else{render();done();}});}else _domd();break;}
    case 'destroy':{pickTarget(eff.scope||'enemyMarked',p,source,t=>{if(t)destroyEntity(opp(p),t);render();done();},fa);break;}
    case 'peek':{var _times=eff.n||1;(function _pk(i){if(i>=_times){render();done();return;}doPeek(p,fa,function(tb){if(tb)_pk(i+1);else{render();done();}});})(0);break;}
    case 'exileEnemyVoid':{const v=PS(opp(p)).void;if(v.length){const k=v.shift();PS(opp(p)).exile.push(k);if(G.tlbCtx)G.tlbCtx.exiledEntity=!!(CARDS[k]&&CARDS[k].type==='entidad');toast('Exiliada del Vacío enemigo: '+CARDS[k].name);}else toast('Vacío enemigo vacío');render();done();break;}
    case 'copyEnemyKw':{const kws=['baluarte','aereo','impacto','glitch','mutar'];const en=opp(p);let found=null;for(const k of kws){if(entitiesOf(en).some(c=>hasKw(c,k))){found=k;break;}}if(found&&source){addTempKw(source,found);toast(sideName(source)+' copia '+(KW[found]?KW[found].name:found));}render();done();break;}
    case 'tokenIfSelfMarked':{if(source&&source.marked>0)createToken(p,eff.id,eff.zone||'front');render();done();break;}
    case 'damageAll':{['player','ai'].forEach(pp=>entitiesOf(pp).forEach(c=>dealDamage(c,eff.n)));toast('Daño masivo: '+eff.n+' a todas');setTimeout(()=>{checkDeaths();render();},380);render();done();break;}
    case 'drawLow':{drawCard(p);if(PS(p).hand.length<=(eff.thr||2))drawCard(p);toast(ownerN(p)+' recarga su mano');render();done();break;}
    case 'peekDrawTL':doPeek(p,fa,()=>{if(PS(p).timeline.length>=(eff.min||4)){drawCard(p);toast('Timeline 4+: robas 1');}render();done();});break;
    case 'mercadoEones':{drawCard(p);drawCard(opp(p));if(PS(p).hand.length<PS(opp(p)).hand.length)drawCard(p);toast('Mercado de Eones: ambos roban');render();done();break;}
    case 'stripKw':{pickTarget('enemyEntity',p,source,t=>{if(t){t.kw=[];if(t.side==='B'&&eff.n)dealDamage(t,eff.n);toast('Pierde sus keywords');setTimeout(()=>{checkDeaths();render();},360);}render();done();},fa);break;}
    case 'voidAnclaToHand':{const v=PS(p).void;const idx=v.findIndex(k=>CARDS[k]&&CARDS[k].type==='ancla'&&CARDS[k].fac==='forja'&&CARDS[k].cost<=2);if(idx>=0){const k=v.splice(idx,1)[0];PS(p).hand.push({uid:uidc++,key:k,def:CARDS[k]});toast('Recuperas a tu mano: '+CARDS[k].name);}render();done();break;}
    case 'exileToVoid':{const ex=PS(p).exile;if(ex.length){const k=ex.shift();PS(p).void.push(k);toast('Del Exilio al Vacío: '+CARDS[k].name);}render();done();break;}
    case 'exileToDeck':{const ex=PS(p).exile;if(ex.length){const k=ex.shift();PS(p).deck.push(k);toast('Del Exilio al fondo del mazo');}render();done();break;}
    case 'moveSelfSupport':{if(source&&PS(p).front.indexOf(source)>=0&&freeSlot(p,'support')>=0)movePlayerEntity(p,source,'front','support');render();done();break;}
    case 'moveAllyFlex':{const list=entitiesOf(p).filter(c=>c.def.pos==='flex'&&c.def.type==='entidad');if(list.length){const c=list[0];const from=PS(p).front.indexOf(c)>=0?'front':'support';const to=from==='front'?'support':'front';if(freeSlot(p,to)>=0)movePlayerEntity(p,c,from,to);}render();done();break;}
    case 'moveEnemyToFront':{const en=opp(p);const c=PS(en).support.find(x=>x&&x.def.type==='entidad'&&x.tapped);if(c&&freeSlot(en,'front')>=0){const i=PS(en).support.indexOf(c);PS(en).support[i]=null;PS(en).front[freeSlot(en,'front')]=c;toast(sideName(c)+' movida al Frente');}render();done();break;}
    case 'sacTokenAnclaDmg':{const tok=anclasOf(p).find(c=>isToken(c.def));if(tok){removePermanent(p,tok);toast('Destruyes un Ancla Token aliada');pickTarget('enemyEntity',p,source,t=>{if(t)dealDamage(t,t.tapped?2:1);setTimeout(()=>{checkDeaths();render();},340);render();done();},fa);}else{render();done();}break;}
    case 'buffSelfPerVoid':{if(source){const add=Math.min(eff.max||3,Math.floor(PS(p).void.length/(eff.div||3)));if(add>0){source.tempPow+=add;floatOver(source.uid,'+'+add+'⚔','var(--vacio)');}}render();done();break;}
    case 'discardForPow':{if(PS(p).hand.length){chooseHandCard(p,'Puedes descartar 1 carta para +'+(eff.pow||2)+' POW',function(idx){if(idx!=null){var k=PS(p).hand.splice(idx,1)[0].key;PS(p).void.push(k);if(source){source.tempPow+=eff.pow||2;floatOver(source.uid,'+'+(eff.pow||2)+'⚔','var(--neon)');}}render();done();},false);}else{render();done();}break;}
    case 'enemyTappedToDeck':{pickTarget('enemyTapped',p,source,t=>{if(t){const en=opp(p);['front','support'].forEach(z=>{const i=PS(en)[z].indexOf(t);if(i>=0)PS(en)[z][i]=null;});if(!isToken(t.def))PS(en).deck.push(t.key);toast(sideName(t)+' al fondo del mazo enemigo');}render();done();},fa);break;}
    case 'healFacIfMutar':{if(PS(p).mutarThisTurn){const list=entitiesOf(p).filter(c=>c.def.fac===eff.fac);if(list.length)pickTarget('allyFac:'+eff.fac,p,source,t=>{if(t)heal(t,eff.n||1);render();done();},fa);else{render();done();}}else{render();done();}break;}
    case 'activateAllyMutar':{const list=entitiesOf(p).filter(c=>c!==source&&c.def.fac===(eff.fac||c.def.fac)&&(getSide(c).mutar||c.def.mutar));if(list.length){const tgt=list[0];const opts=(getSide(tgt).mutar||tgt.def.mutar);if(opts){doMutar(p,tgt,opts);}if(eff.mill)millCard(p);}render();done();break;}
    case 'ferrousActiva':{const list=entitiesOf(p).filter(c=>c.def.fac==='forja'&&c.marked>0);if(list.length){const t=list.sort((a,b)=>b.marked-a.marked)[0];dealDamage(t,1,'ally');setTimeout(()=>{if(permanentsOf(p).indexOf(t)>=0){pickTarget('enemyEntity',p,source,x=>{if(x)dealDamage(x,2);checkDeaths();render();done();},fa);}else{checkDeaths();render();done();}},120);}else{toast('Sin Forja con Daño');render();done();}break;}
    case 'nextAether':{PS(p).nextAether=(PS(p).nextAether||0)+(eff.n||1);toast('+'+(eff.n||1)+' Aether tu próximo turno');render();done();break;}
    case 'sanarSelfIfVoid':{if(source&&PS(p).void.length>=(eff.thr||5))heal(source,eff.n||1);render();done();break;}
    case 'recycleHealIfVoid':{if(PS(p).void.length>=(eff.thr||5)){const v=PS(p).void;if(v.length){const k=v.shift();PS(p).deck.push(k);fireEvent('voidToDeck',p,{});}if(source)heal(source,eff.n||1);toast('Reciclas del Vacío y Sanas');}render();done();break;}
    default:done();
  }
}
function isUnmovableByEnemy(c){const u=getSide(c).unmovableByEnemy;if(!u)return false;if(u==='prepared')return !c.tapped;return true;}
function targetList(scope,controller,source){
  const en=opp(controller),me=controller;
  if(scope.indexOf('allyFacOther:')===0){const f=scope.slice(13);return entitiesOf(me).filter(c=>c.def.fac===f&&c!==source);}
  if(scope.indexOf('allyFac:')===0){const f=scope.slice(8);return entitiesOf(me).filter(c=>c.def.fac===f);}
  switch(scope){
    case 'enemyEntity':return entitiesOf(en);
    case 'enemyTapped':return entitiesOf(en).filter(c=>c.tapped);
    case 'enemyTappedFront':return PS(en).front.filter(c=>c&&c.def.type==='entidad'&&c.tapped);
    case 'enemyBounceable':return entitiesOf(en).filter(c=>c.tapped&&!isUnmovableByEnemy(c));
    case 'enemyMovableFront':return PS(en).front.filter(c=>c&&c.def.type==='entidad'&&c.tapped&&!isUnmovableByEnemy(c));
    case 'enemyMarked':return entitiesOf(en).filter(c=>c.marked>0);
    case 'enemyEntityNoToken':return entitiesOf(en).filter(c=>!isToken(c.def));
    case 'enemyNoTokenUnmarked':return entitiesOf(en).filter(c=>!isToken(c.def)&&c.marked===0);
    case 'enemyAncla':return anclasOf(en);
    case 'enemyBaluarte':return entitiesOf(en).filter(c=>hasKw(c,'baluarte'));
    case 'ally':return entitiesOf(me);
    case 'allyOther':return entitiesOf(me).filter(c=>c!==source);
    case 'allyMarked':return entitiesOf(me).filter(c=>c.marked>0);
    case 'allyLowCost':return entitiesOf(me).filter(c=>c.def.cost<=2);
    case 'allyLowCost3':return entitiesOf(me).filter(c=>c.def.cost<=3);
    case 'allyFront':return PS(me).front.filter(c=>c&&(c.def.type==='entidad'||c.def.type==='token'));
    default:return [];
  }
}
function pickTarget(scope,controller,source,cb,fa){
  const wrap=t=>{if(G)G.lastTarget=t;if(t&&G&&G.dirCaster&&(t.def.type==='entidad'||t.def.type==='token')&&ownerOf(t)===opp(G.dirCaster))fireEvent('directiveTargeted',ownerOf(t),{target:t});cb(t);};
  const list=targetList(scope,controller,source);
  if(list.length===0){toast('Sin objetivos válidos');wrap(null);return;}
  if(controller==='ai'||fa||list.length===1){wrap(aiPickTarget(scope,list));return;}
  G.mode={type:'target',valid:list,cb:wrap,scope};
  toast(scope.startsWith('enemy')?'Elige objetivo enemigo':'Elige objetivo aliado');
  applyModeHighlights();
}
function removePermanent(p,c){['front','support'].forEach(z=>{const i=PS(p)[z].indexOf(c);if(i>=0)PS(p)[z][i]=null;});if(!isToken(c.def))PS(p).void.push(c.key);}
/* ---- Filtrar mazo (mirar el tope y decidir tope/fondo) ---- */
let peekQ=[];
function doPeek(p,fa,after){
  const d=PS(p).deck;
  if(!d.length){if(p==='player')toast('Tu mazo está vacío');after(false);return;}
  fireEvent('peeked',p,{});
  if(p==='ai'){ // la IA decide sola, sin ventana
    var _tb=!AI.peekKeep(p,d[0]);if(_tb)d.push(d.shift());after(_tb);return;
  }
  // Jugador humano: SIEMPRE abre la ventana de interacción (encola si ya hay una abierta)
  peekQ.push({d,after});
  if(peekQ.length===1)runPeekQ();
}
function runPeekQ(){
  if(!peekQ.length)return;
  const job=peekQ[0],d=job.d;
  if(!d.length){peekQ.shift();job.after(false);runPeekQ();return;}
  showPeekWin(d[0],toBottom=>{
    if(toBottom)d.push(d.shift());
    toast(toBottom?'Carta enviada al fondo del mazo':'Carta mantenida en el tope');
    peekQ.shift();job.after(toBottom);runPeekQ();
  });
}
function showPeekWin(key,cb){
  const def=CARDS[key];const win=document.getElementById('peekWin');
  const cardEl=document.getElementById('peekCard');
  cardEl.className='card '+FAC[def.fac].cls+' r-'+(def.rar||'C')+' t-'+def.type;cardEl.innerHTML=cardInnerHTML(def);
  cardEl.onmouseenter=()=>showPreviewDef(def);cardEl.onmouseleave=hidePreview;
  document.getElementById('peekKeep').onclick=()=>{win.classList.remove('show');cb(false);};
  document.getElementById('peekBottom').onclick=()=>{win.classList.remove('show');cb(true);};
  win.classList.add('show');
}
function aiPickTarget(scope,list){
  const arr=list.slice();
  if(scope.startsWith('ally'))arr.sort((a,b)=>b.marked-a.marked);
  else arr.sort((a,b)=>(powOf(b))-(powOf(a)));
  return arr[0];
}

/* ---- helpers ---- */
function heal(c,n){c.marked=Math.max(0,c.marked-n);floatOver(c.uid,'+'+n+'❤','var(--gaia)');fxHeal(cardCenter(c.uid));const o=ownerOf(c);if(o)fireEvent('heal',o,{target:c});}
function ownerOf(c){if(PS('player').front.indexOf(c)>=0||PS('player').support.indexOf(c)>=0)return 'player';if(PS('ai').front.indexOf(c)>=0||PS('ai').support.indexOf(c)>=0)return 'ai';return null;}
function auraScopeHit(a,c,src){const scope=a.scope;if(a.other&&c===src)return false;if(!scope||scope==='any')return true;if(scope==='other')return c!==src;if(scope.indexOf('facKw:')===0){const pr=scope.split(':');return c.def.fac===pr[1]&&hasKw(c,pr[2]);}if(scope.indexOf('fac:')===0)return c.def.fac===scope.slice(4);if(scope.indexOf('kw:')===0)return hasKw(c,scope.slice(3));return false;}
function reduceIncoming(c,n,kind){
  if(n<=0)return n;const own=ownerOf(c);if(!own)return n;
  const sr=getSide(c).dmgReduceSelf;
  if(sr&&!(c.used&&c.used.dmgRed)&&(!sr.kind||sr.kind==='any'||sr.kind===kind)){n=Math.max(0,n-(sr.n||1));(c.used=c.used||{}).dmgRed=true;}
  permanentsOf(own).forEach(src=>{const a=getSide(src).auraDmgReduce;if(!a)return;if(src.used&&src.used.auraDmgRed)return;if(a.kind&&a.kind!=='any'&&a.kind!==kind)return;if(!auraScopeHit(a,c,src))return;n=Math.max(0,n-(a.n||1));(src.used=src.used||{}).auraDmgRed=true;});
  return n;
}
function tryLethalSave(c){const own=ownerOf(c);if(!own)return false;let saved=false;permanentsOf(own).forEach(src=>{if(saved)return;const a=getSide(src).auraLethalSave;if(!a)return;if(src.used&&src.used.lethalSave)return;if(!auraScopeHit(a,c,src))return;(src.used=src.used||{}).lethalSave=true;saved=true;});return saved;}
/* Salvación por sanación en combate (Seraphina B): si una aliada que cumple el alcance fuera a morir, sánala antes de comprobar destrucción. */
function combatLethalHeal(c){
  if(c.marked<hpOf(c))return;const own=ownerOf(c);if(!own)return;
  permanentsOf(own).some(src=>{const a=getSide(src).auraLethalHeal;if(!a)return false;if(src.used&&src.used.lethalHeal)return false;if(!auraScopeHit(a,c,src))return false;(src.used=src.used||{}).lethalHeal=true;heal(c,a.n||1);return true;});
}
function dealDamage(c,n,kind){
  n=reduceIncoming(c,n,kind||'any');
  if(n<=0){floatOver(c.uid,'🛡️','var(--conclave)');return;}
  if(c.marked+n>=hpOf(c)&&tryLethalSave(c)){c.marked=Math.max(0,hpOf(c)-1);floatOver(c.uid,'✦ resiste','var(--forja)');shake(c.uid);return;}
  c.marked+=n;floatOver(c.uid,'-'+n,'var(--pow)');shake(c.uid);
  {const o=ownerOf(c);if(o)fireEvent('damaged',o,{target:c});}
}
function applyGlitch(c,by){if(c.tapped&&!c.glitch){c.glitch=true;sfx('glitch');floatOver(c.uid,'GLITCH','var(--neon)');toast('Glitch → '+sideName(c));const gl=by||opp(ownerOf(c));if(gl)fireEvent('glitchApplied',gl,{target:c});return true;}else{toast('Glitch requiere objetivo agotado');return false;}}
function addTempKw(c,kw){if(!c.kw.includes(kw)){c.kw.push(kw);(c.tempKw=c.tempKw||[]).push(kw);}}
function autoDiscard(p){const s=PS(p);if(!s.hand.length)return;let bi=0,bc=-1;s.hand.forEach((c,i)=>{if(c.def.cost>bc){bc=c.def.cost;bi=i;}});s.void.push(s.hand.splice(bi,1)[0].key);}
function aiDiscardPick(p){var s=PS(p);if(s.hand.length<4)return null;var bi=-1,bc=2;s.hand.forEach(function(c,i){var c2=c.def.cost||0;if(c2>bc){bc=c2;bi=i;}});return bi>=0?bi:null;}
function aiWorstIdx(p){var s=PS(p);if(!s.hand.length)return null;var bi=0,bc=-1;s.hand.forEach(function(c,i){var c2=c.def.cost||0;if(c2>bc){bc=c2;bi=i;}});return bi;}
function aiSelfDmgWant(p,src,eff){if(!src)return false;if((hpOf(src)-(src.marked||0))<=(eff.n||1))return false;var th=eff.then||'dmgTapped';if(th==='dmgTapped')return targetList('enemyTapped',p,src).length>0;if(th==='healForja')return entitiesOf(p).some(function(c){return c!==src&&c.def.fac==='forja'&&c.marked>0;});return true;}
function chooseHandCard(p,promptText,cb,mandatory){var s=PS(p);if(!s.hand.length){cb(null);return;}
  if(p==='ai'){cb(mandatory?aiWorstIdx(p):aiDiscardPick(p));return;}
  var box=document.getElementById('handPickCards');var t=document.getElementById('handPickTitle');if(t)t.textContent=promptText||'Elige una carta';
  if(box){box.innerHTML='';s.hand.forEach(function(c,i){var d=c.def;var w=document.createElement('div');w.className='card '+FAC[d.fac].cls+' r-'+(d.rar||'C')+' t-'+d.type;w.style.cssText='cursor:pointer;width:120px';w.innerHTML=cardInnerHTML(d);
    w.onclick=function(){document.getElementById('handPick').classList.remove('show');cb(i);};
    w.addEventListener('mouseenter',function(){showPreviewDef(d);});w.addEventListener('mouseleave',hidePreview);box.appendChild(w);});}
  var sk=document.getElementById('handPickSkip');if(sk){sk.style.display=mandatory?'none':'';sk.onclick=function(){document.getElementById('handPick').classList.remove('show');cb(null);};}
  var m=document.getElementById('handPick');if(m)m.classList.add('show');}
function confirmYesNo(promptText,cb){var t=document.getElementById('confirmText');if(t)t.innerHTML=promptText;var y=document.getElementById('confirmYes'),no=document.getElementById('confirmNo'),mm=document.getElementById('confirmBox');if(y)y.onclick=function(){if(mm)mm.classList.remove('show');cb(true);};if(no)no.onclick=function(){if(mm)mm.classList.remove('show');cb(false);};if(mm)mm.classList.add('show');}
function createToken(p,id,zone){
  let z=zone==='flex'?(freeSlot(p,'front')>=0?'front':'support'):zone;
  if(freeSlot(p,z)<0){toast('Sin espacio para el Token');return;}
  const tk=inst(id);tk.sick=true;PS(p)[z][freeSlot(p,z)]=tk;
  toast('Token creado: '+CARDS[id].name);
}
function moveEntity(p,card,from,to){
  if(freeSlot(p,to)<0){toast('Sin espacio en Soporte');return;}
  const i=PS(p)[from].indexOf(card);if(i<0)return;PS(p)[from][i]=null;PS(p)[to][freeSlot(p,to)]=card;
  toast(sideName(card)+' movida a Soporte');
}
function movePlayerEntity(p,card,from,to){
  if(freeSlot(p,to)<0){toast('Zona llena');return;}
  const i=PS(p)[from].indexOf(card);if(i<0)return;PS(p)[from][i]=null;PS(p)[to][freeSlot(p,to)]=card;
  toast(sideName(card)+' → '+(to==='front'?'Frente':'Soporte')+' (Flexible)');fireEvent('move',p,{target:card,from:from,to:to});render();
}
function bounceToHand(p,card){
  ['front','support'].forEach(z=>{const i=PS(p)[z].indexOf(card);if(i>=0)PS(p)[z][i]=null;});
  if(!isToken(card.def))PS(p).hand.push({uid:uidc++,key:card.key,def:card.def});
  toast(sideName(card)+' → a la mano');
}

/* ---- estabilizar ---- */
function estabilizar(p,card){
  if(card.tapped||card.sick){toast('No puede estabilizar aún');return;}
  card.tapped=true;PS(p).didActTurn=true;busy=true;render();
  reactionWindow({type:'estabilizar',stabCard:card},p,(res)=>{
    const amt=Math.max(0,syncOf(card)-(res.paReduce||0));
    gainPA(p,amt);floatOver(card.uid,'+'+amt+' PA','var(--gold)');
    toast(`${ownerN(p)} estabiliza: +${amt} PA${res.paReduce?' (−'+res.paReduce+' por reacción)':''}`);
    const sd=getSide(card);if(sd.onStab)applyEffect(sd.onStab,p,card,()=>render());
    if(p==='player'&&G.tutorial)setTimeout(()=>tutHook('stabilized'),300);
    resumeFlow();
  });
}
function gainPA(p,n){PS(p).pa+=n;if(n>0)sfx('stab');pulsePA(p);checkDominio(p);if(PS(p).pa>=20)endGame(p==='player','Dominio Temporal',`${ownerN(p)} alcanzó 20 Puntos AION.`);}

/* ---- REACCIONES ---- */
function reactionWindow(event,activeP,onContinue){
  if(G.over){onContinue({});return;}
  const def=opp(activeP);
  const handR=PS(def).hand.filter(c=>isUsableReaction(c,event,def));
  const boardR=permanentsOf(def).filter(c=>isUsableBoardReaction(c,event,def));
  const usable=[...handR,...boardR];
  if(usable.length===0){onContinue({});return;}
  if(def==='ai'){
    const choice=aiChooseReaction(usable,event);
    if(choice)resolveReaction(choice,def,event,onContinue);else onContinue({});
  }else{
    promptReaction(usable,event,chosen=>{if(chosen)resolveReaction(chosen,def,event,onContinue);else onContinue({});});
  }
}
function isUsableReaction(c,event,def){
  const r=c.def.reaction;if(!r)return false;
  if(r.trigger!==event.type)return false;
  if(c.def.cost>aether(def))return false;
  if(r.t==='cancelDirective'&&(!event.directiveCard||event.directiveCard.def.cost>(r.maxCost||99)))return false;
  if(r.t==='cancelEntity'&&(!event.entityCard||event.entityCard.def.cost>(r.maxCost||99)))return false;
  if(r.t==='gainBaluarte'&&!PS(def).front.some(x=>x&&(x.def.type==='entidad'||x.def.type==='token')&&!hasKw(x,'baluarte')))return false;
  if((r.t==='damageAttacker'||r.t==='cancelCombat')&&!event.attacker)return false;
  return true;
}
/* Reacción activada desde el tablero (Entidad con boardReaction, p.ej. Conciliadora) */
function isUsableBoardReaction(c,event,def){
  const r=getSide(c).boardReaction;if(!r)return false;
  if(r.trigger!==event.type)return false;
  if(c.tapped||c.sick)return false;
  if((r.cost||0)>aether(def))return false;
  if(r.once&&c.used&&c.used.boardReact)return false;
  if((r.t==='cancelCombat'||r.t==='damageAttacker')&&!event.attacker)return false;
  return true;
}
function reactionCost(c){return c.def.reaction?c.def.cost:((getSide(c).boardReaction||{}).cost||0);}
function reactionSpec(c){return c.def.reaction||getSide(c).boardReaction;}
function resolveReaction(card,def,event,onContinue){
  const board=!card.def.reaction&&getSide(card).boardReaction;
  if(board){
    const r=getSide(card).boardReaction;const res={};
    card.tapped=true;(card.used=card.used||{}).boardReact=true;payAether(def,r.cost||0);
    toast(`${ownerN(def)} reacciona: ${sideName(card)}`);
    if(r.t==='cancelCombat')res.cancelled=true;
    else if(r.t==='damageAttacker'&&event.attacker)dealDamage(event.attacker,r.n||1);
    else if(r.t==='reducePA')res.paReduce=r.n;
    setTimeout(()=>{checkDeaths();render();onContinue(res);},420);
    return;
  }
  const idx=PS(def).hand.indexOf(card);if(idx>=0)PS(def).hand.splice(idx,1);
  payAether(def,card.def.cost);PS(def).void.push(card.key);
  const r=card.def.reaction;const res={};
  toast(`${ownerN(def)} reacciona: ${card.def.name}`);
  if(r.t==='damageAttacker'&&event.attacker)dealDamage(event.attacker,r.n);
  else if(r.t==='cancelCombat')res.cancelled=true;
  else if(r.t==='cancelDirective')res.cancelled=true;
  else if(r.t==='cancelEntity')res.cancelled=true;
  else if(r.t==='reducePA')res.paReduce=r.n;
  else if(r.t==='gainBaluarte'){const a=PS(def).front.find(x=>x&&(x.def.type==='entidad'||x.def.type==='token')&&!hasKw(x,'baluarte'));if(a)addTempKw(a,'baluarte');}
  const finish=()=>setTimeout(()=>{checkDeaths();render();onContinue(res);},420);
  if(card.def.tlb){G.tlbCtx={};applyTLB(card.def,def,finish,def==='ai');}
  else finish();
}
function aiChooseReaction(usable,event){
  const prob=DIFF==='easy'?0.2:DIFF==='hard'?0.9:0.6;
  let best=null,bs=-1;
  usable.forEach(c=>{const r=reactionSpec(c);let s=0;
    if(r.t==='damageAttacker'){const a=event.attacker;if(a){s=2;if(r.n>=hpOf(a)-a.marked)s=4;}}
    else if(r.t==='cancelCombat'){const a=event.attacker,t=event.target;s=(t&&a&&powOf(a)>=hpOf(t)-t.marked)?3.5:1;}
    else if(r.t==='cancelDirective'){const d=event.directiveCard;const e=d?(d.def.effect||{}):{};s=(e.t&&['damage','glitch','destroyAncla','bounce','debuff','debuffKw'].includes(e.t)||e.list)?3:0.5;}
    else if(r.t==='cancelEntity'){const e=event.entityCard;s=(e&&e.def&&((e.def.pow||0)>=2||(e.def.text||'').length>3))?3:1.5;}
    else if(r.t==='reducePA')s=PS('player').pa>=15?2.5:1;
    else if(r.t==='gainBaluarte')s=0.6;
    if(s>bs){bs=s;best=c;}
  });
  if(best&&bs>=3&&DIFF!=='easy')return best;
  if(best&&bs>=1.5&&Math.random()<prob)return best;
  return null;
}
function promptReaction(usable,event,cb){
  const win=document.getElementById('reactWin');
  const ptxt=event.type==='attack'?'El rival declara un ATAQUE':event.type==='estabilizar'?'El rival va a ESTABILIZAR':'El rival juega una DIRECTIVA';
  document.getElementById('reactPrompt').textContent=ptxt+' — ¿usar una Reacción? (paga con tu Timeline preparado)';
  const wrap=document.getElementById('reactOpts');wrap.innerHTML='';
  usable.forEach(c=>{const b=document.createElement('div');b.className='ropt';const isB=!c.def.reaction&&getSide(c).boardReaction;
    b.innerHTML=`${c.def.art} ${isB?sideName(c):c.def.name} <span style="color:var(--conclave)">(${reactionCost(c)})</span>${isB?' <span style="color:var(--gold);font-size:10px">[tablero]</span>':''}<small>${(c.def.text||'').replace('Reacción — ','')}</small>`;
    b.onclick=()=>{win.classList.remove('show');cb(c);};wrap.appendChild(b);});
  const pass=document.createElement('div');pass.className='ropt pass';pass.innerHTML='✕ Pasar<small>No reaccionar</small>';
  pass.onclick=()=>{win.classList.remove('show');cb(null);};wrap.appendChild(pass);
  win.classList.add('show');
}

/* ---- combat ---- */
function validTargets(p,attacker){
  const e=opp(p);const front=PS(e).front.filter(c=>c&&(c.def.type==='entidad'||c.def.type==='token'));
  const baluartes=front.filter(c=>hasKw(c,'baluarte'));
  let tg=[];
  if(hasKw(attacker,'aereo')){
    front.forEach(c=>tg.push(c));
    PS(e).support.filter(c=>c&&(c.def.type==='entidad'||c.def.type==='token')&&c.tapped).forEach(c=>tg.push(c));
  }else{front.forEach(c=>{if(c.tapped||hasKw(c,'baluarte'))tg.push(c);});}
  if(baluartes.length>0)tg=tg.filter(c=>hasKw(c,'baluarte'));
  return tg;
}
function doCombat(p,attacker,target){
  closeMenu();G.mode=null;attacker.tapped=true;PS(p).didActTurn=true;busy=true;render();
  reactionWindow({type:'attack',attacker,target},p,(res)=>{
    if(res.cancelled){toast('Ataque prevenido por reacción');resumeFlow();return;}
    if(!permanentsOf(p).includes(attacker)){toast('El atacante fue destruido — el ataque falla');resumeFlow();return;}
    if(!permanentsOf(opp(p)).includes(target)){toast('El objetivo ya no está — el ataque falla');resumeFlow();return;}
    resolveCombat(p,attacker,target);
  });
}
function atkBonusApplies(b,att,tgt,p){
  switch(b.vs){
    case 'marked':return tgt.marked>0;
    case 'tapped':return !!tgt.tapped;
    case 'aereo':return hasKw(tgt,'aereo');
    case 'baluarte':return hasKw(tgt,'baluarte');
    case 'token':return isToken(tgt.def);
    case 'support':return PS(opp(p)).support.indexOf(tgt)>=0;
    case 'fromSupport':return PS(p).support.indexOf(att)>=0;
    case 'fromSupportVsSupport':return PS(p).support.indexOf(att)>=0&&PS(opp(p)).support.indexOf(tgt)>=0;
    default:return false;
  }
}
function combatAtkBonus(att,tgt,p,kind){
  const list=getSide(att).atkBonus;if(!list)return 0;let sum=0;
  list.forEach(b=>{if(atkBonusApplies(b,att,tgt,p))sum+=(kind==='hp'?(b.hp||0):(b.pow||0));});
  return sum;
}
function auraAtkBonus(att,tgt,p){
  let sum=0;
  permanentsOf(p).forEach(src=>{const a=getSide(src).auraAtk;if(!a)return;if(a.fac&&att.def.fac!==a.fac)return;if(a.other&&src===att)return;if(a.vs==='marked'&&tgt.marked>0)sum+=a.pow||0;});
  return sum;
}
function resolveCombat(p,attacker,target){
  recomputeAuras();
  {const sd=getSide(attacker);if(sd.onAttack)applyEffect(sd.onAttack,p,attacker,()=>{},true);}
  recomputeAuras();
  let aPow=powOf(attacker);
  let __perro=0;{const ps=getSide(attacker).perroStrike;if(ps){if(target.marked>0)__perro=ps;else dealDamage(target,ps,'precombat');}}aPow+=combatAtkBonus(attacker,target,p,'pow')+auraAtkBonus(attacker,target,p)+__perro;
  {const hb=combatAtkBonus(attacker,target,p,'hp');if(hb){attacker.tempHp+=hb;floatOver(attacker.uid,'+'+hb+'❤','var(--solaris)');}}
  if(attacker.def.bonusVsMarked&&attacker.side==='A'&&target.marked>0)aPow+=attacker.def.bonusVsMarked;
  if(attacker.def.bonusVsToken&&isToken(target.def))aPow+=attacker.def.bonusVsToken;
  const dPow=powOf(target);
  // Habilidad concedida (Autómata Básico B): una Forja aliada en el Frente puede recibir 1 de daño para ganar +1 POW este combate.
  let grantSelfDmg=false;
  if(attacker.def.fac==='forja'&&PS(p).front.indexOf(attacker)>=0&&permanentsOf(p).some(c=>getSide(c).grantForjaAttack)){
    const tNeed=hpOf(target)-target.marked,sh=target.auraShield||0;
    const wouldKill=(aPow-sh)>=tNeed,killWithBonus=(aPow+1-sh)>=tNeed;
    const selfAfter=attacker.marked+Math.max(0,dPow-(attacker.auraShield||0))+1;
    if(killWithBonus&&!wouldKill&&selfAfter<hpOf(attacker)){aPow+=1;grantSelfDmg=true;floatOver(attacker.uid,'+1⚔','var(--forja)');}
  }
  let aDmg=Math.max(0,aPow-(target.auraShield||0)),dDmg=Math.max(0,dPow-(attacker.auraShield||0));
  aDmg=reduceIncoming(target,aDmg,'combat');dDmg=reduceIncoming(attacker,dDmg,'combat');
  animateAttack(attacker.uid,target.uid,()=>{
    sfx('hit');const _tc=cardCenter(target.uid);if(_tc)fxSpark(_tc);if(aDmg>=4||dDmg>=4){shakeScreen();flashScreen('rgba(255,255,255,.22)');}
    target.marked+=aDmg;attacker.marked+=dDmg;
    if(aDmg>0){floatOver(target.uid,'-'+aDmg,'var(--pow)');shake(target.uid);}else if(aPow>0)floatOver(target.uid,'🛡️','var(--conclave)');
    if(dDmg>0){floatOver(attacker.uid,'-'+dDmg,'var(--pow)');shake(attacker.uid);}else if(dPow>0)floatOver(attacker.uid,'🛡️','var(--conclave)');
    combatLethalHeal(target);
    let tDead=target.marked>=hpOf(target),aDead=attacker.marked>=hpOf(attacker);
    if(!aDead&&tDead&&hasKw(attacker,'impacto'))gainImpacto(p,target);
    if(!tDead&&aDead&&hasKw(target,'impacto'))gainImpacto(opp(p),attacker);
    if(target.thorns&&!aDead){attacker.marked+=target.thorns;floatOver(attacker.uid,'-'+target.thorns,'var(--gaia)');}
    {const r=getSide(target).retaliate;if(r&&!aDead){const ok=r.vs==='any'||(r.vs==='aereo'&&hasKw(attacker,'aereo'));if(ok){attacker.marked+=r.n||1;floatOver(attacker.uid,'-'+(r.n||1),'var(--gaia)');}}}
    {const ps=getSide(attacker).postSelfDmg;if(ps){const ok=ps.vs==='any'||(ps.vs==='support'&&PS(opp(p)).support.indexOf(target)>=0);if(ok){attacker.marked+=ps.n||1;floatOver(attacker.uid,'-'+(ps.n||1),'var(--vacio)');}}}
    if(grantSelfDmg){attacker.marked+=1;floatOver(attacker.uid,'-1','var(--vacio)');}
    combatLethalHeal(attacker);
    aDead=attacker.marked>=hpOf(attacker);
    setTimeout(()=>{
      if(!aDead&&tDead){const sd=getSide(attacker);if(sd.onKill)applyEffect(sd.onKill,p,attacker,()=>{});}
      if(!tDead&&aDead){const sd=getSide(target);if(sd.onKill)applyEffect(sd.onKill,opp(p),target,()=>{});}
      if(tDead)destroyEntity(opp(p),target);
      if(aDead)destroyEntity(p,attacker);
      if(!tDead&&aDmg>0){const sd=getSide(target);if(sd.onSurvive)applyEffect(sd.onSurvive,opp(p),target,()=>{});fireEvent('survivedCombat',opp(p),{target:target});tryAscend(opp(p),target,'resistencia');}
      if(!aDead){const sd=getSide(attacker);if(dDmg>0&&sd.onSurvive)applyEffect(sd.onSurvive,p,attacker,()=>{});if(dDmg>0)fireEvent('survivedCombat',p,{target:attacker});if(tDead)tryAscend(p,attacker,'victoria');if(dDmg>0)tryAscend(p,attacker,'resistencia');}
      if(p==='player'&&G.tutorial)setTimeout(()=>tutHook('combatDone'),300);
      resumeFlow();
    },360);
  });
}
function gainImpacto(p,dest){const g=dest.def.cost>=5?2:1;gainPA(p,g);toast(`Impacto: +${g} PA`);}
function destroyEntity(p,card){
  const sd=getSide(card);const cc=cardCenter(card.uid);ghostDissolve(card.uid);
  ['front','support'].forEach(z=>{const i=PS(p)[z].indexOf(card);if(i>=0)PS(p)[z][i]=null;});
  if(cc)fxShatter(cc,FACHEX[card.def.fac]);
  if(!isToken(card.def)){
    if(card.exileOnDeath){PS(p).exile.push(card.key);toast(`${sideName(card)} → Exilio`);}
    else{PS(p).void.push(card.key);if(sd.onDestroy)applyEffect(sd.onDestroy,p,card,()=>{});toast(`${sideName(card)} → al Vacío`);}
  }else toast(`${sideName(card)} deja de existir`);
  permanentsOf(p).forEach(c=>{const s2=getSide(c);if(s2.onAllyDestroyed){if(s2.onAllyDestroyed.once&&c.used&&c.used.allyDeath)return;(c.used=c.used||{}).allyDeath=true;applyEffect(s2.onAllyDestroyed,p,c,()=>{},true);}});
  if(card.def.type==='entidad')fireEvent('enemyMarkedDestroyed',opp(p),{target:card});
}
function checkDeaths(){
  ['player','ai'].forEach(p=>['front','support'].forEach(z=>PS(p)[z].forEach(c=>{if(c&&(c.def.type==='entidad'||c.def.type==='token')&&c.marked>=hpOf(c))destroyEntity(p,c);})));
}

/* ---- ascension ---- */
function forceAscend(p,card){
  if(!card||card.side!=='A'||!card.def.sideB)return;
  const def=card.def;
  card.side='B';card.kw=[...(def.sideB.kw||[])];card.tempKw=[];
  if(def.sideB.ascHeal)card.marked=Math.max(0,card.marked-def.sideB.ascHeal);
  render();ascendFx(card.uid);toast('✦ ASCENSIÓN: '+def.sideB.name);
  if(def.sideB.onAscend)applyEffect(def.sideB.onAscend,p,card,()=>render());
}
function tryAscend(p,card,cond){
  if(!card||card.side!=='A'||!card.def.sideB)return;
  const def=card.def;let ok=def.asc===cond;
  if(def.asc==='dominio'&&cond==='dominio'&&PS(p).pa>=def.ascN)ok=true;
  if(!ok)return;
  card.side='B';card.kw=[...(def.sideB.kw||[])];card.tempKw=[];
  if(def.sideB.ascHeal)card.marked=Math.max(0,card.marked-def.sideB.ascHeal);
  render();ascendFx(card.uid);toast('✦ ASCENSIÓN: '+def.sideB.name);
  if(def.sideB.onAscend)applyEffect(def.sideB.onAscend,p,card,()=>render());
}
function checkDominio(p){entitiesOf(p).forEach(c=>{if(c.side==='A'&&c.def.asc==='dominio'&&PS(p).pa>=c.def.ascN)tryAscend(p,c,'dominio');});}

/* ---- mutar ---- */
function doMutar(p,e,options){
  PS(p).mutarThisTurn=true;
  if(p==='ai'){applyEffect(options[aiMutarPick(e,options)].eff,p,e,()=>render());return;}
  const modal=document.getElementById('mutar');
  document.getElementById('mutarName').textContent=e.def.name;
  const wrap=document.getElementById('mutarOpts');wrap.innerHTML='';
  options.forEach(o=>{const b=document.createElement('div');b.className='mopt';b.textContent=o.label;
    b.onclick=()=>{modal.classList.remove('show');applyEffect(o.eff,p,e,()=>render());};wrap.appendChild(b);});
  modal.classList.add('show');
}
function aiMutarPick(e,options){
  if(DIFF==='easy')return Math.floor(Math.random()*options.length);
  const side=ownerOf(e)||'ai';
  let bi=0,bs=-99;
  options.forEach((o,i)=>{const s=AI.mutarScore(side,e,o);if(s>bs){bs=s;bi=i;}});
  return bi;
}
function ownerN(p){return p==='player'?'Tú':'IA';}
