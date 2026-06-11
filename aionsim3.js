// ===== AION advanced meta sim: per-card win-rate, impact & effect-fizzle =====
const fs=require('fs');const vm=require('vm');
let html=fs.readFileSync('output/AION TCG.html','utf8');
let js=html.slice(html.indexOf('<script>')+8,html.lastIndexOf('</script>'));
function rep(from,to,label){if(!js.includes(from)){console.error('MISS '+label);process.exit(1);}js=js.split(from).join(to);}

// ---- auto-resolve transforms (same as base sim) ----
rep("if(controller==='ai'||fa||list.length===1){wrap(aiPickTarget(scope,list));return;}","if(true){wrap(aiPickTarget(scope,list));return;}",'pickTarget auto');
rep("if(p==='ai'){ // la IA decide sola, sin ventana","if(true){ // SIM",'doPeek auto');
rep("if(p==='ai'){applyEffect(options[aiMutarPick(e,options)].eff,p,e,()=>render());return;}","if(true){applyEffect(options[aiMutarPick(e,options)].eff,p,e,()=>render());return;}",'doMutar auto');
rep("  if(def==='ai'){\n    const choice=aiChooseReaction(usable,event);\n    if(choice)resolveReaction(choice,def,event,onContinue);else onContinue({});\n  }else{\n    promptReaction(usable,event,chosen=>{if(chosen)resolveReaction(chosen,def,event,onContinue);else onContinue({});});\n  }","  { const choice=aiChooseReaction(usable,event); if(choice)resolveReaction(choice,def,event,onContinue);else onContinue({}); }",'reactionWindow auto');
rep("  if(p==='ai')setTimeout(aiTurn,700);else updatePhaseUI();","  updatePhaseUI();",'disable auto-AI');
rep("function endGame(win,title,sub){if(G.over)return;G.over=true;","function endGame(win,title,sub){if(G.over)return;G.over=true;G.winnerSide=win?'player':'ai';G.endTitle=title;",'endGame winner');
rep("function render(){\n  if(!G||G.over)return;\n  recomputeAuras();\n","function render(){\n  if(!G||G.over)return;\n  recomputeAuras();return;\n",'gut render');

rep("if(p==='ai'){cb(mandatory?aiWorstIdx(p):aiDiscardPick(p));return;}","if(true){cb(mandatory?aiWorstIdx(p):aiDiscardPick(p));return;}",'chooseHandCard auto');
rep("else confirmYesNo('¿Hacer que '+sideName(source)+' reciba '+eff.n+' Daño para activar su efecto?',_go);","else _go(aiSelfDmgWant(p,source,eff));",'selfDmg confirm auto');
rep("if(eff.opt&&p==='player'","if(false&&p==='player'",'opt gate auto');
// ---- instrumentation transforms ----
rep("const list=targetList(scope,controller,source);",
    "const list=targetList(scope,controller,source);__tgt(source,list.length===0,scope);",'instr pickTarget attempt');
rep("s.hand.splice(idx,1);payAether(p,cost);consumeCostReducers(p,def);s.cardsThisTurn=(s.cardsThisTurn||0)+1;",
    "s.hand.splice(idx,1);payAether(p,cost);consumeCostReducers(p,def);s.cardsThisTurn=(s.cardsThisTurn||0)+1;__rec(card.key,'played');__rec(card.key,'effInvoke');__S.CUR=card.key;",'instr play');
rep("G.tlbCtx={};G.lastTarget=null;G.dirCaster=p;","G.tlbCtx={};G.lastTarget=null;G.dirCaster=p;__S.CUR=card.key;__S.DIR=card.key;",'instr resolveDir');
rep("function applyEffect(eff,p,source,done,fa){","function applyEffect(eff,p,source,done,fa){if(source&&source.key)__S.CUR=source.key;",'instr applyEffect CUR');
rep("gainPA(p,amt);floatOver(card.uid,'+'+amt+' PA','var(--gold)');","gainPA(p,amt);__rec(card.key,'pa',amt);__rec(card.key,'stab');floatOver(card.uid,'+'+amt+' PA','var(--gold)');",'instr stab PA');
rep("target.marked+=aDmg;attacker.marked+=dDmg;","target.marked+=aDmg;attacker.marked+=dDmg;__rec(attacker.key,'dmg',aDmg);__rec(target.key,'dmg',dDmg);",'instr combat dmg');
rep("if(tDead)destroyEntity(opp(p),target);","if(tDead){__rec(attacker.key,'kills');destroyEntity(opp(p),target);}",'instr kill A');
rep("if(aDead)destroyEntity(p,attacker);","if(aDead){__rec(target.key,'kills');destroyEntity(p,attacker);}",'instr kill B');
rep("function destroyEntity(p,card){","function destroyEntity(p,card){__rec(card.key,'died');",'instr died');
rep("if(!d.length){if(p==='player')toast('Tu mazo está vacío');after(false);return;}",
    "if(!d.length){__fz('emptyDeck');if(p==='player')toast('Tu mazo está vacío');after(false);return;}",'instr peek empty');
rep("else toast('Sin objetivo en el Vacío');","else __fz('emptyVoid');",'instr reanimate empty');

// ---- driver + stats ----
js+=`
DIFF='normal';
var __S={card:{},why:{noTarget:0,emptyDeck:0,emptyVoid:0},scopeAtt:{},scopeFiz:{},CUR:null,DIR:null};
var __M={cardsPlayed:0,turns:0,games:0,held3:0,lastResort:0,glitchApplied:0,glitchConv:0,conclavePeek:0,conclaveBottom:0,voidGen:0,vfvSum:0,vfvGames:0,baluarteDmg:0,heal:0,seraSaves:0,lordHP:0,keyHits:{},keyKills:[],facInHand:{},facDead:{}};
var __lastScore=null;
var KEYSOL={seraphina:1,lordSolaria:1,valerius:1,jerico:1,caballero:1,guardiaCiudadela:1,paladin:1};
(function(){
  var _draw=drawCard;drawCard=function(p,init){var b=PS(p).hand.length;var r=_draw(p,init);var h=PS(p).hand;if(h.length>b){var card=h[h.length-1];card._enter=G.turn;G._drawn=G._drawn||{};(G._drawn[p]=G._drawn[p]||{})[card.key]=1;}return r;};
  if(typeof heal==='function'){var _heal=heal;heal=function(c,n){__M.heal+=(n||0);return _heal(c,n);};}
  var _ag=applyGlitch;applyGlitch=function(c,by){var ok=_ag(c,by);if(ok)__M.glitchApplied++;return ok;};
  if(typeof millCard==='function'){var _mill=millCard;millCard=function(p){__M.voidGen++;return _mill(p);};}
  var _fe=fireEvent;fireEvent=function(ev,actor,ctx){if(ev==='glitchBlocked')__M.glitchConv++;return _fe(ev,actor,ctx);};
  var _dd=dealDamage;dealDamage=function(c,n,kind){if(c&&hasKw(c,'baluarte'))__M.baluarteDmg+=(n||0);if(c&&KEYSOL[c.key])__M.keyHits[c.uid]=(__M.keyHits[c.uid]||0)+1;var cur=__S.CUR;if(cur&&CARDS[cur]&&CARDS[cur].fac==='vacio'&&(n||0)>0&&G._vfv==null)G._vfv=G.turn;return _dd(c,n,kind);};
  var _de=destroyEntity;destroyEntity=function(p,card){if(card&&KEYSOL[card.key]&&__M.keyHits[card.uid]){__M.keyKills.push(__M.keyHits[card.uid]);delete __M.keyHits[card.uid];}return _de(p,card);};
  if(AI&&AI.peekKeep){var _pk=AI.peekKeep;AI.peekKeep=function(side,topKey){var r=_pk(side,topKey);var cur=__S.CUR;if(cur&&CARDS[cur]&&CARDS[cur].fac==='conclave'){__M.conclavePeek++;if(!r)__M.conclaveBottom++;}return r;};}
  if(typeof combatLethalHeal==='function'){var _clh=combatLethalHeal;combatLethalHeal=function(c){var lethal=c.marked>=hpOf(c);var r=_clh(c);if(lethal&&c.marked<hpOf(c))__M.seraSaves++;return r;};}
  var _st=startTurn;startTurn=function(side,first){var r=_st(side,first);['player','ai'].forEach(function(sd){if(permanentsOf(sd).some(function(x){return x&&x.key==='lordSolaria';})){var n=PS(sd).front.filter(function(x){return x&&x.def.fac==='solaris'&&hasKw(x,'baluarte')&&x.key!=='lordSolaria';}).length;__M.lordHP+=n;}});return r;};
})();
function __rec(key,f,n){if(!key)return;var c=__S.card[key]||(__S.card[key]={played:0,tgtAttempt:0,tgtFizzle:0,pa:0,dmg:0,kills:0,died:0,stab:0,present:0,win:0});c[f]=(c[f]||0)+(n||1);}
function __fz(reason){if(__S.why[reason]!=null)__S.why[reason]++;}                 // solo motivos globales no-objetivo
function __tgt(source,empty,scope){var ck=(source&&source.key)||__S.DIR;if(scope){__S.scopeAtt[scope]=(__S.scopeAtt[scope]||0)+1;if(empty)__S.scopeFiz[scope]=(__S.scopeFiz[scope]||0)+1;}if(!ck)return;__rec(ck,'tgtAttempt');if(empty){__rec(ck,'tgtFizzle');__S.why.noTarget++;}}
function __pool(){var bf={};Object.keys(CARDS).forEach(function(k){var d=CARDS[k];if(d.type==='token'||d.rar==='T'||d.promo)return;(bf[d.fac]=bf[d.fac]||[]).push(k);});return bf;}
var __BF=__pool();var __FACS=Object.keys(__BF).filter(function(f){return f!=='neutral';});
function __randomDeck(){
  var f1=__FACS[Math.floor(Math.random()*__FACS.length)];var pool=__BF[f1].slice();
  if(Math.random()<0.45){var f2=__FACS[Math.floor(Math.random()*__FACS.length)];if(f2!==f1)pool=pool.concat(__BF[f2]);}
  if(__BF.neutral)pool=pool.concat(__BF.neutral);
  var cnt={},list=[],g=0;while(list.length<40&&g++<3000){var k=pool[Math.floor(Math.random()*pool.length)];if((cnt[k]||0)>=3)continue;cnt[k]=(cnt[k]||0)+1;list.push(k);}
  return list;
}
function __charge(side){var s=PS(side);var idx=AI.chargePick(side);if(idx<0)return;var card=s.hand.splice(idx,1)[0];s.timeline.push({uid:uidc++,key:card.key,def:card.def,tapped:false,glitch:false});s.charged=true;}
function __playOne(side){var s=PS(side),bi=-1,bs=-1;
  s.hand.forEach(function(c,i){var sc=AI.scoreCard(side,c);if(sc>bs){bs=sc;bi=i;}});
  if(bi<0||bs<=0)return false;__lastScore=bs;
  var card=s.hand[bi],enter=(card&&card._enter!=null)?card._enter:G.turn,key=card&&card.key;
  var ok=!!playFromHand(side,bi);
  if(ok&&key){G._played=G._played||{};(G._played[side]=G._played[side]||{})[key]=1;__M.cardsPlayed++;if((G.turn-enter)>=3)__M.held3++;if(bs<1.0)__M.lastResort++;}
  return ok;}
function __actOne(side){var s=PS(side);
  var actors=permanentsOf(side).filter(function(c){return !c.tapped&&!c.sick&&getSide(c).activa;})
    .sort(function(a,b){return AI.abilityPriority(getSide(b).activa)-AI.abilityPriority(getSide(a).activa);});
  for(var i=0;i<actors.length;i++){var c=actors[i],a=getSide(c).activa;
    if(a.noTap&&c.used&&c.used.activa)continue;
    var needTgt=['glitch','damage','debuff','debuffKw','move','bounce','destroyAncla','heal'].includes(a.t);
    var sc=a.scope||(a.t==='glitch'?'enemyTapped':a.t==='heal'?'allyMarked':'enemyEntity');
    if(a.t==='reanimate'){if(!PS(side).void.some(function(k){return CARDS[k]&&CARDS[k].type==='entidad'&&CARDS[k].cost<=(a.maxCost||1);}))continue;}
    else if(a.t==='glitchTimeline'){if(!PS(opp(side)).timeline.some(function(t){return t.tapped&&!t.glitch;}))continue;}
    else if(needTgt){if(targetList(sc,side).length===0)continue;}
    else continue;
    __rec(c.key,'effInvoke');if(a.noTap){(c.used=c.used||{}).activa=true;}else c.tapped=true;
    __S.CUR=c.key;applyEffect(a,side,c,function(){if(a.destroySelf)removePermanent(side,c);});return 'acted';}
  var fronts=s.front.filter(function(c){return c&&!c.tapped&&!c.sick;});
  for(var j=0;j<fronts.length;j++){var atk=fronts[j];var plan=AI.frontPlan(side,atk);
    if(plan.act==='attack'){doCombat(side,atk,plan.target);return 'attack';}
    if(plan.act==='stabilize'){estabilizar(side,atk);return 'stab';}}
  return false;}
function __takeTurn(side){__charge(side);var g=0;while(g++<24){if(!__playOne(side))break;if(G.over)return;}g=0;while(g++<40){var r=__actOne(side);if(!r)break;if(G.over)return;}}
function __uniq(list){var s={};list.forEach(function(k){s[k]=1;});return Object.keys(s);}
function __runGame(d1,d2){uidc=1;busy=false;
  G={turn:1,active:'player',first:'player',player:mkPlayer(),ai:mkPlayer(),mode:null,over:false,live:true,tut:{},tlbCtx:{},winnerSide:null};
  G._drawn={};G._played={};G._vfv=null;
  G.player.deck=shuffleArr(d1.slice());G.ai.deck=shuffleArr(d2.slice());
  for(var i=0;i<6;i++){drawCard('player',true);drawCard('ai',true);}
  G.first=Math.random()<0.5?'player':'ai';G.active=G.first;
  startTurn(G.first,true);var active=G.first,guard=0;
  while(!G.over&&guard++<400){__takeTurn(active);if(G.over)break;fireTurnEnd(active);applyEndDamage(active);var s=PS(active);if(s.hand.length>7)s.hand.length=7;if(G.over)break;active=opp(active);G.active=active;G.turn++;startTurn(active,false);}
  // ---- per-game tallies ----
  __M.turns+=G.turn;__M.games++;
  if(G._vfv!=null){__M.vfvSum+=G._vfv;__M.vfvGames++;}
  ['player','ai'].forEach(function(sd){
    var win=G.winnerSide===sd;
    var deck=__uniq(sd==='player'?d1:d2);
    var drawn=G._drawn[sd]||{},played=G._played[sd]||{},handEnd={};
    PS(sd).hand.forEach(function(c){handEnd[c.key]=1;});
    deck.forEach(function(k){__rec(k,'present');if(win)__rec(k,'win');});
    Object.keys(drawn).forEach(function(k){__rec(k,'drawnG');if(win)__rec(k,'winDrawn');
      var fac=CARDS[k].fac;__M.facInHand[fac]=(__M.facInHand[fac]||0)+1;});
    Object.keys(played).forEach(function(k){__rec(k,'playedG');if(win)__rec(k,'winPlayed');});
    Object.keys(drawn).forEach(function(k){if(!played[k]&&handEnd[k]){__rec(k,'unplayedG');if(win)__rec(k,'winUnplayed');var fac=CARDS[k].fac;__M.facDead[fac]=(__M.facDead[fac]||0)+1;}});
  });
  return {winner:G.winnerSide,reason:G.endTitle,turns:G.turn};
}
try{globalThis.__sim={run:__runGame,randomDeck:__randomDeck,S:__S,M:__M,CARDS:CARDS};}catch(e){globalThis.__e=e.message;}
`;

// ---- DOM stub ----
const noop=()=>{};const ctx2d=new Proxy({},{get:()=>noop,set:()=>true});const STUB={};
STUB.classList={add:noop,remove:noop,contains:()=>false,toggle:noop};STUB.style=new Proxy({},{get:()=>'',set:()=>true});
STUB.dataset={};STUB.children=[];STUB.childNodes=[];STUB.width=300;STUB.height=150;
STUB.getBoundingClientRect=()=>({left:0,top:0,right:0,bottom:0,width:0,height:0});STUB.getContext=()=>ctx2d;STUB.animate=()=>({set onfinish(f){if(f)f();}});
const el=new Proxy(STUB,{get:(t,p)=>{if(typeof p==='symbol')return ()=>'';if(p in t)return t[p];return noop;},set:()=>true});
STUB.querySelector=()=>el;STUB.querySelectorAll=()=>[];STUB.appendChild=()=>el;STUB.cloneNode=()=>el;
const document={getElementById:()=>el,querySelector:()=>el,querySelectorAll:()=>[],createElement:()=>el,createTextNode:()=>el,addEventListener:noop,removeEventListener:noop,body:el,documentElement:el};
const sb={document,requestAnimationFrame:()=>0,setTimeout:(f)=>{try{if(typeof f==='function')f();}catch(e){}return 0},clearTimeout:noop,setInterval:()=>0,clearInterval:noop,console:{log:noop,warn:noop,error:noop},Audio:function(){return el;},Math,Date,localStorage:{getItem:()=>null,setItem:noop},innerWidth:1200,innerHeight:800,addEventListener:noop,removeEventListener:noop,matchMedia:()=>({matches:false,addEventListener:noop,addListener:noop}),navigator:{userAgent:'node'}};
sb.window=sb;sb.globalThis=sb;sb.self=sb;vm.createContext(sb);
try{vm.runInContext(js,sb);}catch(e){console.log('LOAD ERR:',e.message);process.exit(1);}
if(sb.__e){console.log('SIM ERR:',sb.__e);process.exit(1);}
const SIM=sb.__sim,C=SIM.CARDS,S=SIM.S;

const GAMES=parseInt(process.argv[2]||'4000',10);
let par=0,dom=0,turnsSum=0;const durB={'1-5':0,'6-8':0,'9-11':0,'12+':0};
for(let i=0;i<GAMES;i++){const r=SIM.run(SIM.randomDeck(),SIM.randomDeck());turnsSum+=r.turns;
  const rounds=Math.ceil(r.turns/2);
  if(rounds<=5)durB['1-5']++;else if(rounds<=8)durB['6-8']++;else if(rounds<=11)durB['9-11']++;else durB['12+']++;
  if(/Paradoja/i.test(r.reason||''))par++;else if(/Dominio/i.test(r.reason||''))dom++;}

// ---- build report (20 métricas solicitadas) ----
const M=SIM.M;
const facName={solaris:'Solaris',neon:'Neón',gaia:'Gaia',forja:'Forja',conclave:'Cónclave',vacio:'Vacío',neutral:'Neutral'};
const FACS=['solaris','neon','gaia','forja','conclave','vacio','neutral'];
const all=Object.keys(S.card).map(k=>{const c=S.card[k];const d=C[k];return{
  k,name:d.name,fac:d.fac,type:d.type,rar:d.rar,
  present:c.present||0,win:c.win||0,
  drawnG:c.drawnG||0,winDrawn:c.winDrawn||0,
  playedG:c.playedG||0,winPlayed:c.winPlayed||0,
  unplayedG:c.unplayedG||0,winUnplayed:c.winUnplayed||0,
  att:c.tgtAttempt||0,fizz:c.tgtFizzle||0
};}).filter(x=>C[x.k]&&C[x.k].type!=='token'&&!C[x.k].promo);
const pct=(a,b)=>b?(a/b*100):0;
const f1=n=>n.toFixed(1),f2=n=>n.toFixed(2);
const L=[];const P=s=>L.push(s);
P('================ AION CORE SET 2.1 — REPORTE DE 20 MÉTRICAS ================');
P(GAMES+' partidas · mazos aleatorios · bot simétrico (cerebro compartido) · DIFF=normal');
P('Fin: Dominio='+(dom/GAMES*100).toFixed(0)+'% · Paradoja='+(par/GAMES*100).toFixed(0)+'% · duración media '+(turnsSum/GAMES).toFixed(1)+' turnos');
P('');
// 1
P('--- 1. Tasa de cartas muertas en mano por facción (quedaron en mano al final, sin jugarse) ---');
FACS.forEach(f=>{const ih=M.facInHand[f]||0,dd=M.facDead[f]||0;P('   '+facName[f].padEnd(9)+' '+f1(pct(dd,ih)).padStart(5)+'%  ('+dd+' muertas / '+ih+' que pasaron por mano)');});
P('');
// 2
P('--- 2. Promedio de cartas jugadas por turno ---');
P('   '+f2(M.cardsPlayed/M.turns)+'  ('+M.cardsPlayed+' jugadas / '+M.turns+' turnos)');
P('');
// 3
P('--- 3. Promedio de cartas retenidas 3+ turnos antes de jugarse ---');
P('   '+f2(M.held3/M.games)+' por partida  ('+M.held3+' cartas con retención ≥3 turnos)');
P('');
// 4
const tot=all.reduce((a,x)=>a+x.att,0),totF=all.reduce((a,x)=>a+x.fizz,0);
P('--- 4. Tasa de efectos sin objetivo válido (fizzle global) ---');
P('   '+f1(pct(totF,tot))+'%  ('+totF+' de '+tot+' intentos de objetivo sin objetivo válido)');
P('');
// 5
P('--- 5. Tasa de cartas jugadas solo como último recurso (score IA < 1.0) ---');
P('   '+f1(pct(M.lastResort,M.cardsPlayed))+'%  ('+M.lastResort+' de '+M.cardsPlayed+' jugadas)');
P('');
// 6
P('--- 6. Tasa de activación de Glitch ---');
P('   '+f2(M.glitchApplied/M.games)+' Glitch aplicados por partida  (total '+M.glitchApplied+')');
P('');
// 7
P('--- 7. Tasa de conversión de Glitch en ventaja (negó enderezar / disparó payoff) ---');
P('   '+f1(pct(M.glitchConv,M.glitchApplied))+'%  ('+M.glitchConv+' de '+M.glitchApplied+' Glitch convirtieron en tempo/valor)');
P('');
// 8
P('--- 8. Tasa de cartas Cónclave que reemplazan/filtran (peek→fondo por fuente Cónclave) ---');
P('   '+f1(pct(M.conclaveBottom,M.conclavePeek))+'%  ('+M.conclaveBottom+' al fondo / '+M.conclavePeek+' filtrados por Cónclave)');
P('');
// 9
P('--- 9. Tasa de generación de Vacío por partida (cartas enviadas mazo→Vacío) ---');
P('   '+f2(M.voidGen/M.games)+' cartas/partida  (total '+M.voidGen+')');
P('');
// 10
P('--- 10. Turno promedio en que Vacío obtiene valor positivo (primer daño de fuente Vacío) ---');
P('   '+(M.vfvGames?f2(M.vfvSum/M.vfvGames):'n/a')+'  (en '+M.vfvGames+' partidas con daño de Vacío)');
P('');
// 11
P('--- 11. Daño prevenido/absorbido por Baluarte (daño recibido por entidades Baluarte) ---');
P('   '+f2(M.baluarteDmg/M.games)+' daño/partida absorbido por muros Baluarte  (total '+M.baluarteDmg+')');
P('');
// 12
P('--- 12. Sanación total por partida ---');
P('   '+f2(M.heal/M.games)+' HP sanados/partida  (total '+M.heal+')');
P('');
// 13
P('--- 13. Veces que Seraphina evita destrucción (salvado letal con Seraphina en mesa) ---');
P('   '+M.seraSaves+' saves totales · '+f2(M.seraSaves/M.games)+' por partida');
P('');
// 14
P('--- 14. Bonus de HP otorgado por Lord Solaria (entidad·turno con +1 HP de su aura) ---');
P('   '+M.lordHP+' beneficios entidad·turno totales · '+f2(M.lordHP/M.games)+' por partida');
P('');
// 15
const kk=M.keyKills,kkAvg=kk.length?kk.reduce((a,b)=>a+b,0)/kk.length:0;
P('--- 15. Acciones necesarias para destruir una pieza Solaris clave ---');
P('   '+f2(kkAvg)+' golpes de daño en promedio  (n='+kk.length+' piezas clave destruidas)');
P('   piezas: Seraphina, Lord Solaria, Valerius, Jericó, Caballero, Guardia Ciudadela, Paladín');
P('');
// 16-20 per-card table
P('=========== MÉTRICAS POR CARTA (16-20) ===========');
P('16 Inclusión%  17 WR-robada  18 WR-jugada  19 WR-no-jugada  20 Δ(WR-mazo − WR-jugada)');
function row(x){
  const incl=pct(x.present,2*GAMES);
  const wrDeck=pct(x.win,x.present), wrDrawn=pct(x.winDrawn,x.drawnG), wrPlay=pct(x.winPlayed,x.playedG), wrUn=pct(x.winUnplayed,x.unplayedG);
  const delta=wrDeck-wrPlay;
  return x.name.slice(0,26).padEnd(26)+' '+facName[x.fac].slice(0,4).padEnd(4)+' incl'+f1(incl).padStart(5)+'% | rob '+f1(wrDrawn).padStart(5)+' jug '+f1(wrPlay).padStart(5)+' noJug '+f1(wrUn).padStart(5)+' Δ '+(delta>=0?'+':'')+f1(delta);
}
const byPres=all.slice().sort((a,b)=>b.present-a.present);
P('');P('> TOP 25 por INCLUSIÓN (métrica 16) con WR robada/jugada/no-jugada y Δ <');
byPres.slice(0,25).forEach((x,i)=>P('  '+String(i+1).padStart(2)+'. '+row(x)));
P('');P('> LEGENDARIAS (todas) <');
all.filter(x=>x.rar==='L').sort((a,b)=>pct(b.winPlayed,b.playedG)-pct(a.winPlayed,a.playedG)).forEach(x=>P('   '+row(x)));
P('');P('> MAYOR Δ POSITIVO (carta rinde MEJOR en mazo que jugada → relleno/situacional) <');
all.filter(x=>x.playedG>=GAMES*0.02&&x.present>=GAMES*0.04).map(x=>({x,d:pct(x.win,x.present)-pct(x.winPlayed,x.playedG)})).sort((a,b)=>b.d-a.d).slice(0,12).forEach(o=>P('   '+row(o.x)));
P('');P('> MAYOR Δ NEGATIVO (carta rinde MEJOR jugada que en mazo → motor real) <');
all.filter(x=>x.playedG>=GAMES*0.02&&x.present>=GAMES*0.04).map(x=>({x,d:pct(x.win,x.present)-pct(x.winPlayed,x.playedG)})).sort((a,b)=>a.d-b.d).slice(0,12).forEach(o=>P('   '+row(o.x)));
// ===================== ANÁLISIS PROFUNDO (insights) =====================
P('');P('================== DISTRIBUCIÓN DE DURACIÓN (rondas/jugador) ==================');
['1-5','6-8','9-11','12+'].forEach(b=>P('   '+b.padEnd(5)+' '+f1(pct(durB[b],GAMES)).padStart(5)+'%  ('+durB[b]+')'));

// ---- WR + fizzle por facción (con presencia/uso) ----
P('');P('================== FACCIONES: WR · USO · FIZZLE ==================');
P('   Facción    WR     incl%   fizzle%  (att)');
FACS.forEach(f=>{const pool=all.filter(x=>x.fac===f);
  const pr=pool.reduce((a,x)=>a+x.present,0),wn=pool.reduce((a,x)=>a+x.win,0);
  const att=pool.reduce((a,x)=>a+x.att,0),fz=pool.reduce((a,x)=>a+x.fizz,0);
  const inclAvg=pool.length?pool.reduce((a,x)=>a+pct(x.present,2*GAMES),0)/pool.length:0;
  P('   '+facName[f].padEnd(10)+f1(pct(wn,pr)).padStart(5)+'%  '+f1(inclAvg).padStart(5)+'%  '+f1(pct(fz,att)).padStart(5)+'%   ('+att+')');});

// ---- fizzle por tipo de objetivo (raíz del problema) ----
P('');P('================== FIZZLE POR TIPO DE OBJETIVO (dónde fallan los efectos) ==================');
const scopeLbl={enemyEntity:'Entidad enemiga',enemyEntityNoToken:'Enemiga no-Token',enemyTapped:'Enemiga agotada',enemyMarked:'Enemiga dañada',enemyNoTokenUnmarked:'Enemiga sana no-Token',enemyAncla:'Ancla enemiga',enemyBaluarte:'Enemiga Baluarte',ally:'Aliada',allyMarked:'Aliada dañada',allyOther:'Otra aliada',allyLowCost:'Aliada coste≤2',allyLowCost3:'Aliada coste≤3'};
Object.keys(S.scopeAtt).sort((a,b)=>S.scopeAtt[b]-S.scopeAtt[a]).forEach(sc=>{const a=S.scopeAtt[sc],fz=S.scopeFiz[sc]||0;if(a<GAMES*0.05)return;P('   '+((scopeLbl[sc]||sc)).padEnd(22)+f1(pct(fz,a)).padStart(5)+'%  falla  ('+fz+'/'+a+')');});
P('   Otros motivos: mazo vacío='+S.why.emptyDeck+' · Vacío vacío al reanimar='+S.why.emptyVoid);

// ---- candidatas a NERF / BUFF / auto-include ----
const MINP=Math.max(80,GAMES*0.03);
const wrPool=all.filter(x=>x.present>=MINP);
const wr=x=>pct(x.win,x.present);
P('');P('================== CANDIDATAS A NERF (mayor WR, incl≥'+MINP.toFixed(0)+') ==================');
wrPool.slice().sort((a,b)=>wr(b)-wr(a)).slice(0,15).forEach((x,i)=>P('  '+String(i+1).padStart(2)+'. '+x.name.slice(0,26).padEnd(26)+' '+facName[x.fac].slice(0,4).padEnd(4)+x.rar.padEnd(2)+' WR '+f1(wr(x)).padStart(5)+'%  incl '+f1(pct(x.present,2*GAMES)).padStart(4)+'%  jug '+f1(pct(x.winPlayed,x.playedG)).padStart(5)+'%'));
P('');P('================== CANDIDATAS A BUFF (menor WR, incl≥'+MINP.toFixed(0)+') ==================');
wrPool.slice().sort((a,b)=>wr(a)-wr(b)).slice(0,15).forEach((x,i)=>P('  '+String(i+1).padStart(2)+'. '+x.name.slice(0,26).padEnd(26)+' '+facName[x.fac].slice(0,4).padEnd(4)+x.rar.padEnd(2)+' WR '+f1(wr(x)).padStart(5)+'%  fizzle '+f1(pct(x.fizz,x.att)).padStart(4)+'%  muere '+f1(x.playedG?pct((S.card[x.k].died||0),x.playedG):0).padStart(4)+'%'));
P('');P('================== AUTO-INCLUDE (alta incl + WR>52%) ==================');
all.filter(x=>pct(x.present,2*GAMES)>=38&&wr(x)>52).sort((a,b)=>wr(b)-wr(a)).slice(0,12).forEach(x=>P('   '+x.name.slice(0,28).padEnd(28)+facName[x.fac].slice(0,4).padEnd(4)+' incl '+f1(pct(x.present,2*GAMES)).padStart(4)+'%  WR '+f1(wr(x)).padStart(5)+'%'));

// ---- impacto por jugada (entidades) ----
const imp=all.filter(x=>x.playedG>=GAMES*0.02&&C[x.k].type==='entidad').map(x=>{const c=S.card[x.k];const pl=c.played||1;return{...x,imp:(c.pa/pl)+(c.dmg/pl)*0.6+(c.kills/pl)*2-(c.died/pl),paPP:c.pa/pl,dmgPP:c.dmg/pl,killsPP:c.kills/pl,diedR:c.died/pl};});
P('');P('================== ENTIDADES MAYOR IMPACTO/jugada (PA+0.6·daño+2·kills−muerte) ==================');
imp.sort((a,b)=>b.imp-a.imp).slice(0,12).forEach((x,i)=>P('  '+String(i+1).padStart(2)+'. '+x.name.slice(0,24).padEnd(24)+x.rar.padEnd(2)+' imp '+f2(x.imp).padStart(5)+'  PA/j '+f2(x.paPP)+' dmg/j '+f1(x.dmgPP)+' kill/j '+f2(x.killsPP)+' muere '+f1(x.diedR*100)+'%'));
P('');P('================== ENTIDADES MENOR IMPACTO/jugada ==================');
imp.sort((a,b)=>a.imp-b.imp).slice(0,12).forEach((x,i)=>P('  '+String(i+1).padStart(2)+'. '+x.name.slice(0,24).padEnd(24)+x.rar.padEnd(2)+' imp '+f2(x.imp).padStart(5)+'  PA/j '+f2(x.paPP)+' dmg/j '+f1(x.dmgPP)+' kill/j '+f2(x.killsPP)+' muere '+f1(x.diedR*100)+'%'));

// ---- nunca jugadas / cartas muertas ----
const dead=all.filter(x=>x.present>=MINP&&pct(x.playedG,x.drawnG||1)<40).sort((a,b)=>pct(a.playedG,a.drawnG||1)-pct(b.playedG,b.drawnG||1));
P('');P('================== CARTAS POCO JUGADAS (robadas pero rara vez jugadas, incl≥'+MINP.toFixed(0)+') ==================');
dead.slice(0,12).forEach(x=>P('   '+x.name.slice(0,28).padEnd(28)+facName[x.fac].slice(0,4).padEnd(4)+' jugada/robada '+f1(pct(x.playedG,x.drawnG||1)).padStart(5)+'%  WR-mazo '+f1(wr(x)).padStart(5)+'%'));

// ---- INSIGHTS de raíz por facción ----
P('');P('================== INSIGHTS DE RAÍZ (driver dominante por facción) ==================');
FACS.forEach(f=>{if(f==='neutral')return;const pool=all.filter(x=>x.fac===f);
  const pr=pool.reduce((a,x)=>a+x.present,0),wn=pool.reduce((a,x)=>a+x.win,0);const W=pct(wn,pr);
  const att=pool.reduce((a,x)=>a+x.att,0),fz=pool.reduce((a,x)=>a+x.fizz,0);const F=pct(fz,att);
  let pl=0,died=0,plays=0;pool.forEach(x=>{const c=S.card[x.k];pl+=(c.played||0);died+=(c.died||0);});const D=pct(died,pl);
  const drivers=[];
  if(F>=30)drivers.push('fizzle alto '+f1(F)+'% (efectos sin objetivo)');
  if(D>=55)drivers.push('mortalidad alta '+f1(D)+'%');
  if(W<48)drivers.push('reloj lento: no cierra la carrera de PA a tiempo');
  if(W>54)drivers.push('sobre-rinde: motor de valor/PA demasiado eficiente');
  P('   '+facName[f].padEnd(9)+' WR '+f1(W).padStart(5)+'% → '+(drivers.length?drivers.join(' · '):'estable, sin driver dominante'));});

const out=L.join('\n');
console.log(out);
try{fs.writeFileSync('output/aion-2.1-metricas.txt',out+'\n');}catch(e){}
