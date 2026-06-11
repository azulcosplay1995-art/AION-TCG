/* MODULO: 05-ai.js
   Cerebro de IA COMPARTIDO (lo usan el juego Y el simulador aionsim3.js): const AI={...} con funciones puras y sincronas (scoreCard, chargePick, peekKeep, mutarScore, forjaSetup, frontPlan...). Graduado por DIFF (easy/normal/hard).
   (Detalle completo y guia para extender: aion-src/ARCHITECTURE.md) */
/* ============================================================
   IA (con dificultad)
   ============================================================ */
/* ===== Cerebro de IA compartido (juego + simulador) — funciones puras y síncronas ===== */
const AI={
  facCount(side,which){const s=PS(side),m={};const add=def=>{if(def&&def.fac&&def.fac!=='neutral')m[def.fac]=(m[def.fac]||0)+1;};
    if(which!=='hand')permanentsOf(side).forEach(c=>add(c.def));
    if(which!=='board')s.hand.forEach(c=>add(c.def));
    return m;},
  archetype(side){const m=AI.facCount(side,'all');let best=null,bv=0;Object.keys(m).forEach(f=>{if(m[f]>bv){bv=m[f];best=f;}});return bv>=2?best:null;},
  drawValue(side){const h=PS(side).hand.length;if(h<=2)return 2.4;if(h<=3)return 1.9;if(h<=4)return 1.4;if(h>=7)return 0.3;return 1.0;},
  glitchScore(side){const en=opp(side);let v=0;PS(en).front.forEach(c=>{if(c&&c.def.type==='entidad'&&c.tapped)v=Math.max(v,1+(powOf(c)>=3?0.8:0)+(syncOf(c)>=2?0.6:0));});
    if(PS(en).timeline.some(t=>t.tapped&&!t.glitch))v=Math.max(v,0.9);return v;},
  scoreCard(side,card){const d=card.def;
    if(effectiveCost(side,d)>aether(side))return -1;
    if(d.reaction)return -1;
    const arch=AI.archetype(side);let sc;
    if(d.type==='directiva'){const e=d.effect||{},t=e.t;sc=0.4;
      const dmgT=['damage','dmgScaled','destroyOrDmg'];
      const markedEnemy=entitiesOf(opp(side)).some(x=>x.marked>0);
      if(dmgT.includes(t))sc=targetList(e.scope||'enemyEntityNoToken',side).length?(2.5+(markedEnemy?0.4:0)):0;
      else if(t==='debuff')sc=targetList(e.scope||'enemyEntity',side).length?(e.scaled?2.4:1.0):0;
      else if(t==='destroy')sc=targetList(e.scope||'enemyMarked',side).length?2.8:0;
      else if(t==='glitch')sc=targetList('enemyTapped',side).length?(1.2+AI.glitchScore(side)+(AI.hasGlitchPayoff(side)?0.8:0)):0;
      else if(t==='heal')sc=entitiesOf(side).some(x=>x.marked>0)?1.6:0.1;
      else if(t==='draw')sc=AI.drawValue(side);
      else if(t==='peek'||t==='drawDiscard')sc=AI.drawValue(side)*0.8;
      else if(t==='token')sc=1.5;
      else if(t==='destroyAnclaOrPeek')sc=targetList('enemyAncla',side).length?1.8:AI.drawValue(side)*0.7;
      else if(t==='bounceAlly')sc=entitiesOf(side).length?1.0:0.2;
      else if(t==='buff'||t==='buffThenAscend')sc=entitiesOf(side).length?1.0:0;
      else if(t==='destroyTokens')sc=PS(opp(side)).front.some(x=>x&&isToken(x.def))?2.0:0;
      else if(t==='multi')sc=1.4;
    }else if(d.type==='ancla'){if(!canPlace(side,card))return -1;sc=d.cost+1;}
    else{if(!canPlace(side,card))return -1;sc=d.cost*1.5+(d.pow||0)*0.4+(d.hp||0)*0.2;
      if(d.kw&&d.kw.indexOf('glitch')>=0&&AI.glitchScore(side)>0)sc+=0.6;
      if(d.fac==='vacio'&&PS(side).void.length>=5)sc+=0.5;}
    if(arch&&d.fac===arch)sc+=0.6;
    if(d.fac==='forja'){const fset=AI.forjaSetup(side);if(fset){const g=fset.g;
      if(d.entrada&&d.entrada.t==='selfDmgThenDmg'&&(fset.recover||fset.convert))sc+=1.0*g;
      if(d.type==='ancla'&&fset.bodies>=1)sc+=0.8*g;
      if(d.type==='entidad'&&d.activa&&d.activa.t==='overheat')sc+=0.4*g;
      if(d.kw&&d.kw.indexOf('impacto')>=0)sc+=0.4*g;}}
    if(DIFF==='easy')sc+=Math.random();
    return sc;},
  chargePick(side){const s=PS(side);if(s.charged||!s.hand.length||s.timeline.length>=7)return -1;
    if(DIFF==='easy'&&Math.random()<0.3)return -1;
    let idx=-1,worst=1e9;
    s.hand.forEach((c,i)=>{const d=c.def;const isDraw=d.type==='directiva'&&['draw','drawDiscard','peek'].includes((d.effect||{}).t);
      let v=Math.max(0,AI.scoreCard(side,c));if(isDraw)v+=2;
      if(v<worst){worst=v;idx=i;}});
    return idx;},
  attackWorth(side,atk,target,fset){const weDie=atk.marked+powOf(target)>=hpOf(atk);const weKill=powOf(atk)>=(hpOf(target)-target.marked);
    if(fset&&atk.def.fac==='forja'){
      if(weKill)return true;
      if(fset.recover&&!weDie)return true;
      if(fset.recover&&weDie&&(fset.convert||fset.impact))return powOf(target)>=2;
      if((fset.convert||fset.wantTap)&&!weDie)return true;}
    if(DIFF==='hard')return weKill||!weDie;
    if(DIFF==='easy')return weKill||(!weDie&&powOf(target)>=2);
    return weKill||(!weDie&&(powOf(target)>=2||syncOf(target)>=2));},
  abilityPriority(a){if(!a)return 0;const t=a.t;
    if(['buff','buffSelf','heal','sanarSelf','grantForjaAttack'].includes(t))return 3;
    if(['damage','dmgScaled','reactorPulse','ferrousActiva','glitch','glitchTimeline','debuff'].includes(t))return 2;
    return 1;},
  peekKeep(side,topKey){const def=CARDS[topKey];if(!def)return true;const s=PS(side);const cost=def.cost||0;
    const arch=AI.archetype(side);const castableSoon=cost<=aether(side)+2;const archMatch=arch&&def.fac===arch;
    const copies=s.hand.filter(c=>c.key===topKey).length;
    if(copies>=2)return false;
    if(s.hand.length>=6&&!castableSoon)return false;
    if(!castableSoon&&!archMatch&&cost>=5)return false;
    return true;},
  mutarScore(side,e,opt){const ef=opt.eff||{};const arch=AI.archetype(side);let s=0;
    if(ef.t==='buffSelf')s=(ef.pow||0)*1.2+(ef.hp||0);
    else if(ef.t==='gainKw'&&ef.kw==='impulso')s=3;
    else if(ef.t==='gainKw'&&ef.kw==='baluarte')s=hasKw(e,'baluarte')?0.5:1.7;
    else if(ef.t==='token')s=2.2+(arch==='gaia'?0.5:0);
    else if(ef.t==='drawDiscard')s=AI.drawValue(side);
    else if(ef.t==='sanarSelf')s=e.marked>0?2:0.2;
    else if(ef.t==='thorns')s=1;
    else if(ef.t==='damage')s=targetList(ef.scope||'enemyEntity',side).length?2.0:0.2;
    else s=0.8;
    return s;},
  hasGlitchPayoff(side){return permanentsOf(side).some(c=>{const sd=getSide(c);return !!(sd.onEvent&&sd.onEvent.some(h=>h.ev==='glitchApplied'));});},
  forjaSetup(side){if(DIFF==='easy')return null;
    const bodies=entitiesOf(side).filter(c=>c.def.fac==='forja');if(!bodies.length)return null;
    let recover=false,convert=false,impact=false,wantTap=false;
    permanentsOf(side).forEach(c=>{const sd=getSide(c),k=c.key,a=sd.activa;
      if(a&&(a.t==='heal'||a.t==='healElse'||a.t==='healElsePeek'||(a.t==='multi'&&(a.list||[]).some(e=>/heal/i.test(e.t||'')))))recover=true;
      if(sd.onTurnStart&&sd.onTurnStart.t==='heal')recover=true;
      if(sd.aura&&sd.aura.fac==='forja'&&sd.aura.shield)recover=true;
      if(sd.auraDmgReduce||sd.auraLethalSave)recover=true;
      if(sd.onEvent&&sd.onEvent.some(h=>h.ev==='damaged'&&(h.fac==='forja'||h.rel==='self')))convert=true;
      if(k==='ferrous'||k==='rust'||k==='reactor')convert=true;
      if(k==='cantinaMinero'||k==='cantinaCenizas')wantTap=true;
      if(k==='trak'&&hasKw(c,'impacto'))wantTap=true;
      if(hasKw(c,'impacto'))impact=true;});
    if(!(recover||convert||impact||wantTap))return null;
    return {recover,convert,impact,wantTap,bodies:bodies.length,g:DIFF==='hard'?1:0.6};},
  frontPlan(side,c){let target=null,kills=false,valuable=false;
    const fset=(c.def.fac==='forja')?AI.forjaSetup(side):null;
    if(canAttack(c,side)){const tg=validTargets(side,c);
      if(tg.length){target=tg.find(t=>powOf(c)>=hpOf(t)-t.marked);if(!target){const s2=tg.slice().sort((a,b)=>powOf(b)-powOf(a));target=s2[0];}
        kills=!!(target&&powOf(c)>=hpOf(target)-target.marked);
        valuable=!!(target&&(powOf(target)>=3||syncOf(target)>=2));
        if(!AI.attackWorth(side,c,target,fset))target=null;}}
    const sync=syncOf(c);const imp=hasKw(c,'impacto');
    const weDie=target?(c.marked+powOf(target)>=hpOf(c)):false;
    if(fset&&target&&(fset.recover||fset.convert||fset.wantTap||imp)){
      if(sync>=2&&!imp&&!valuable&&!kills)return{act:'stabilize'};
      return{act:'attack',target:target};}
    if(target&&kills&&valuable)return{act:'attack',target:target};
    if(target&&kills&&imp)return{act:'attack',target:target};
    if(target&&valuable&&!weDie)return{act:'attack',target:target};
    if(sync>0&&!imp)return{act:'stabilize'};
    if(target&&kills)return{act:'attack',target:target};
    if(target&&imp&&!weDie)return{act:'attack',target:target};
    if(sync>0)return{act:'stabilize'};
    if(target)return{act:'attack',target:target};
    return{act:'none'};}
};
let aiQueue=[];
function aiTurn(){busy=false;aiQueue=[{t:'charge'},{t:'plays'},{t:'actions'},{t:'end'}];if(Math.random()<0.22)setTimeout(()=>emoteBubble('ai',['😎','🤖 calculando...','👀','🔥','😏 mmm'][Math.floor(Math.random()*5)]),500);aiStep();}
function aiStep(){
  if(G.over||G.active!=='ai'||busy||aiQueue.length===0)return;
  const step=aiQueue[0];
  if(step.t==='charge'){aiQueue.shift();aiCharge();setTimeout(aiStep,650);}
  else if(step.t==='plays'){const d=aiPlayOne();if(d==='async')return;if(d)setTimeout(aiStep,850);else{aiQueue.shift();setTimeout(aiStep,170);}}
  else if(step.t==='actions'){const r=aiActOne();if(r==='async')return;if(r)setTimeout(aiStep,700);else{aiQueue.shift();setTimeout(aiStep,170);}}
  else if(step.t==='end'){aiQueue.shift();setTimeout(aiEndTurn,400);}
}
/* resume after an async action (combat / estabilizar / directiva con ventana de reacción) */
function resumeFlow(){busy=false;render();if(G.active==='ai'&&!G.over)setTimeout(aiStep,700);}
function aiCharge(){
  const s=PS('ai');
  const idx=AI.chargePick('ai');if(idx<0)return;
  const card=s.hand.splice(idx,1)[0];
  s.timeline.push({uid:uidc++,key:card.key,def:card.def,tapped:false,glitch:false});
  s.charged=true;render();sfx('charge');toast('IA carga su Timeline');
}
function aiPlayOne(){
  const s=PS('ai');
  if(DIFF==='easy'&&Math.random()<0.2)return false;
  let bi=-1,bs=-1;
  s.hand.forEach((c,i)=>{const sc=AI.scoreCard('ai',c);if(sc>bs){bs=sc;bi=i;}});
  if(bi<0||bs<=0)return false;
  const t0=s.hand[bi].def.type;
  const ok=playFromHand('ai',bi);
  if(!ok)return false;
  return t0!=='ancla'?'async':true;
}
function aiActOne(){
  const s=PS('ai');
  // activated abilities (buff/heal antes que daño para encadenar combos de Forja)
  const actors=permanentsOf('ai').filter(c=>!c.tapped&&!c.sick&&getSide(c).activa)
    .sort((a,b)=>AI.abilityPriority(getSide(b).activa)-AI.abilityPriority(getSide(a).activa));
  for(const c of actors){
    const a=getSide(c).activa;
    if(a.noTap&&c.used&&c.used.activa)continue;
    const needTgt=['glitch','damage','debuff','debuffKw','move','bounce','destroyAncla','heal'].includes(a.t);
    const sc=a.scope||(a.t==='glitch'?'enemyTapped':a.t==='heal'?'allyMarked':'enemyEntity');
    if(a.t==='reanimate'){if(!PS('ai').void.some(k=>CARDS[k]&&CARDS[k].type==='entidad'&&CARDS[k].cost<=(a.maxCost||1)))continue;}
    else if(a.t==='glitchTimeline'){if(!PS('player').timeline.some(t=>t.tapped&&!t.glitch))continue;}
    else if(a.t==='overheat'){if(!(PS('ai').front.includes(c)&&canAttack(c,'ai')&&validTargets('ai',c).length>0))continue;}
    else if(needTgt){if(targetList(sc,'ai').length===0)continue;}
    else continue;
    if(a.noTap){(c.used=c.used||{}).activa=true;}else c.tapped=true;
    toast('IA usa habilidad de '+sideName(c));
    applyEffect(a,'ai',c,()=>{if(a.destroySelf)removePermanent('ai',c);render();});
    return true;
  }
  // frente: plan de carrera (matar amenaza real → si no, Estabilizar PA → si no, chip)
  const fronts=s.front.filter(c=>c&&!c.tapped&&!c.sick);
  for(const atk of fronts){
    const plan=AI.frontPlan('ai',atk);
    if(plan.act==='attack'){var _ae=cardDom(atk.uid),_te=cardDom(plan.target.uid);if(_ae)_ae.classList.add('selected');if(_te)_te.classList.add('target');toast('IA ataca con '+sideName(atk)+' \u2192 '+sideName(plan.target));setTimeout(function(){if(_ae)_ae.classList.remove('selected');if(_te)_te.classList.remove('target');doCombat('ai',atk,plan.target);},750);return 'async';}
    if(plan.act==='stabilize'){var _se=cardDom(atk.uid);if(_se)_se.classList.add('selected');toast('IA estabiliza con '+sideName(atk));setTimeout(function(){if(_se)_se.classList.remove('selected');estabilizar('ai',atk);},650);return 'async';}
  }
  return false;
}

