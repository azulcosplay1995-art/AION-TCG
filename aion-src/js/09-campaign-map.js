/* MODULO: 09-campaign-map.js
   Campania ACTIVA — ramificada "Los Fragmentos de Kaelen": nodos CAMP_NODES2, estado CAMP (cur/visited/pending/relics/crystals), reliquias RELICS, eventos, recompensas, render del mapa y dificultad. Por orden de carga SOBRESCRIBE definiciones homonimas previas (es la version viva).
   (Detalle completo y guia para extender: aion-src/ARCHITECTURE.md) */
/* ============ CAMPAÑA RAMIFICADA + EVENTOS + RELIQUIAS (lore AION) ============ */
var CAMP_SAVE2='aion_camp_v2';
function campSave(){try{localStorage.setItem(CAMP_SAVE2,JSON.stringify(CAMP));}catch(e){}}
function campLoad(){try{var s=localStorage.getItem(CAMP_SAVE2);if(s)return JSON.parse(s);}catch(e){}return null;}
var RELICS={
 logos:{name:'Esquirla del Lógos',ic:'🔮',desc:'Robas 1 carta extra al inicio de cada combate.'},
 nara:{name:'Ancla de Nara',ic:'⚓',desc:'El desgaste de Xul-Than se reduce a 1 carta por turno.'},
 aether:{name:'Cristal de Aether Puro',ic:'💠',desc:'+40 Cristales por cada victoria.'},
 sync:{name:'Eco de Sincronía',ic:'🎵',desc:'Empiezas cada combate con +2 Puntos AION.'}
};
function hasRelic(id){return !!(CAMP&&CAMP.relics&&CAMP.relics.indexOf(id)>=0);}
function addRelic(id){if(!CAMP.relics)CAMP.relics=[];if(CAMP.relics.indexOf(id)>=0){CAMP.crystals+=80;toast('Reliquia duplicada → +80 Cristales');return;}CAMP.relics.push(id);toast('🏺 Reliquia: '+RELICS[id].name);}
function randomRelic(){var all=Object.keys(RELICS).filter(function(r){return !hasRelic(r);});return all.length?all[Math.floor(Math.random()*all.length)]:null;}
var CAMP_NODES2=[
 {id:'n0',row:0,name:'Despertar del Fragmento',region:'El Umbral',fac:'solaris',diff:'easy',type:'combat',flavor:'Tu conciencia se reensambla entre los restos del Colapso. Una sombra hostil bloquea el primer paso.',next:['n1a','n1b']},
 {id:'n1a',row:1,name:'Ciudadela Blanca',region:'Solaris',fac:'solaris',diff:'easy',type:'combat',flavor:'Isla flotante de luz cegadora. Los Centinelas no reconocen a un Fragmento como aliado.',next:['n2a','n2b']},
 {id:'n1b',row:1,name:'Zona Muerta',region:'Gaia',fac:'gaia',diff:'easy',type:'combat',flavor:'Selva de carne y raíces que asimila el metal. Las bestias crecen con cada turno que les concedes.',next:['n2a','n2b']},
 {id:'n2a',row:2,name:'Eco de Kaelen',region:'Intersticio',type:'event',ev:'kaelen',flavor:'Una esquirla de tu propia conciencia flota ante ti, susurrando futuros que nunca llegaron a ser.',next:['n3']},
 {id:'n2b',row:2,name:'Ciudad Neón',region:'Neón',fac:'neon',diff:'easy',type:'combat',flavor:'Metrópolis eléctrica donde la atención es moneda y la realidad se hackea.',next:['n3']},
 {id:'n3',row:3,name:'Mercado de Eones',region:'Intersticio',type:'shop',flavor:'Un cruce de realidades donde se canjean reliquias de futuros muertos.',next:['n4a','n4b']},
 {id:'n4a',row:4,name:'Yermos de Hierro',region:'Forja',fac:'forja',diff:'normal',type:'combat',flavor:'Infierno industrial de chatarra ardiente. La Forja se fortalece al recibir daño.',next:['n5']},
 {id:'n4b',row:4,name:'Torre de la Melodia',region:'Conclave',fac:'conclave',diff:'normal',type:'combat',flavor:'El tiempo no fluye: se calcula mediante musica. Los Cronomantes te roban la iniciativa si tardas.',next:['n5']},
 {id:'n5',row:5,name:'El Trato del Mercader',region:'Intersticio',type:'event',ev:'mercader',flavor:'El Mercader de Eones, sin rostro, despliega ante ti un trato dificil de rechazar... o tal vez deberias.',next:['n6a','n6b']},
 {id:'n6a',row:6,name:'Vanguardia de la Ciudadela',region:'Solaris (Elite)',fac:'solaris',diff:'normal',type:'elite',flavor:'La guardia de elite de Lord Solaria, Paladines Ascendidos, cierra el paso. Vencerlos otorga una reliquia.',next:['n7']},
 {id:'n6b',row:6,name:'Fisuras de Nada — Yami',region:'Vacio',fac:'vacio',diff:'normal',type:'boss-yami',flavor:'El sonido muere y la realidad se vuelve gris. Yami, Oscuridad Encarnada, guarda el umbral del Vacio.',next:['n7']},
 {id:'n7',row:7,name:'Mercado de Eones',region:'Intersticio',type:'shop',flavor:'Ultima parada antes del horizonte. Reabastece tus Fragmentos para lo que viene.',next:['n8']},
 {id:'n8',row:8,name:'Protocolo Xul-Than',region:'Horizonte de Eventos',fac:'vacio',diff:'hard',type:'boss-xul',flavor:'La Estrella Muerta aguarda. No ataca: consume tu tiempo. Vence antes de que tu mazo se desvanezca.',next:[]}
];
function campNodeById(id){for(var i=0;i<CAMP_NODES2.length;i++)if(CAMP_NODES2[i].id===id)return CAMP_NODES2[i];return null;}
function campNew(){var col={};Object.keys(CAMP_BASIC_DECK).forEach(function(k){col[k]=CAMP_BASIC_DECK[k];});
  CAMP={cur:'n0',pending:[],visited:{},crystals:0,deck:Object.assign({},CAMP_BASIC_DECK),collection:col,losses:{},relics:[],done:false};campSave();}
function openCampaign(){CAMP_PREV_DIFF=DIFF;show('campaign');if(!CAMP)CAMP=campLoad();if(!CAMP){campIntro();return;}renderCampaign();}
function campComplete(){var node=campNodeById(CAMP.cur);if(!node)return;CAMP.visited[node.id]=true;CAMP.pending=(node.next||[]).slice();CAMP.cur=null;campSave();}
function campSelect(id){var node=campNodeById(id);if(!node)return;var okSel=(CAMP.cur===id)||(CAMP.pending&&CAMP.pending.indexOf(id)>=0);if(!okSel)return;
  CAMP.cur=id;CAMP.pending=[];campSave();campEnter(node);}
function campEnter(node){
  if(node.type==='shop')return campShopOpen(node);
  if(node.type==='event')return campEventOpen(node);
  var adv=(CAMP.losses[node.id]||0)>=2?('<br><br><b>💡 Consejo:</b> '+campChallengeTip(node)):'';
  showCoachMsg('<b>'+node.name+'</b><br>'+(node.flavor||'')+adv,'⚔️ Enfrentar →',function(){hideCoach();campStartCombat(node);});
}
function campStartCombat(node){
  var pl=deckMapToList(CAMP.deck);if(pl.length<20){toast('Tu mazo necesita al menos 20 cartas');return;}
  CAMP_PREV_DIFF=DIFF;DIFF=node.diff||'normal';
  var rival=deckMapToList(buildAutoDeck(node.fac,{promo:false}));
  var lbl=node.type==='boss-xul'?'Xul-Than':node.type==='boss-yami'?'Yami':node.type==='elite'?('Elite '+FAC[node.fac].name.split(' ').slice(-1)[0]):FAC[node.fac].name.split(' ').slice(-1)[0];
  startMatch(pl,'Kaelen',rival,lbl,{campaign:true,nodeId:node.id,boss:node.type==='boss-xul'?'xul':null});
  if(hasRelic('logos')){try{drawCard('player',true);}catch(e){}}
  if(hasRelic('sync')){try{PS('player').pa+=2;}catch(e){}}
  try{render();}catch(e){}
}
function campResolve(win){var node=campNodeById(CAMP.cur);if(!node)return;
  var e=document.getElementById('endBtns');
  function setBtn(label,fn){if(!e)return;e.innerHTML='';var b=document.createElement('button');b.className='bigbtn';b.textContent=label;
    b.onclick=function(){var o=document.getElementById('endover');if(o)o.classList.remove('show','win','lose');fn();};e.appendChild(b);}
  if(win){
    if(node.type==='boss-xul'){CAMP.crystals+=250;CAMP.visited[node.id]=true;CAMP.cur=null;CAMP.done=true;campSave();setBtn('Ver desenlace →',campVictory);return;}
    var rew=({easy:60,normal:110,hard:160})[node.diff||'normal'];
    if(node.type==='boss-yami')rew=200;
    var bonus=node.type==='elite'?120:0;
    if(hasRelic('aether'))rew+=40;
    CAMP.crystals+=rew+bonus;
    if(node.type==='elite'){var r=randomRelic();if(r)addRelic(r);}
    campComplete();
    setBtn('+'+(rew+bonus)+' 💎 · Recompensa →',function(){campRewardOpen();});
  }else{CAMP.losses[node.id]=(CAMP.losses[node.id]||0)+1;campSave();setBtn('Reintentar →',campBack);}
}
function campBossTick(){if(typeof G==='undefined'||!G||G.over)return;
  var n=hasRelic('nara')?1:2;for(var i=0;i<n;i++)millCard('player');
  toast('🌑 Xul-Than consume tu linea temporal (−'+n+(n===1?' carta':' cartas')+' al Vacio)');
  G.xulTurns=(G.xulTurns||0)+1;
  if(G.xulTurns%2===0){var ents=entitiesOf('player').filter(function(c){return c&&c.def.type==='entidad'&&c.kw&&c.kw.length;});
    ents.sort(function(a,b){return (powOf(b)+(hasKw(b,'baluarte')?2:0))-(powOf(a)+(hasKw(a,'baluarte')?2:0));});
    if(ents.length){ents[0].kw=[];toast('🔇 Silencio: '+sideName(ents[0])+' pierde sus palabras clave');}}
  render();}
function campShopContinue(){campComplete();campHideHud();show('campaign');renderCampaign();}
// recompensa (acepta callback de continuación)
var CAMP_REWARD_AFTER=null;
function campRewardOpen(after){CAMP_REWARD_AFTER=after||campBack;
  var picks=[],seen={},guard=0;while(picks.length<3&&guard++<60){var k=rewardRandomCard();if(!seen[k]){seen[k]=1;picks.push(k);}}
  var box=document.getElementById('rewardCards');if(box){box.innerHTML='';
   picks.forEach(function(k){var d=CARDS[k];var w=document.createElement('div');w.className='card '+FAC[d.fac].cls+' r-'+(d.rar||'C')+' t-'+d.type;w.style.cssText='cursor:pointer;width:150px';w.innerHTML=cardInnerHTML(d);
    w.onclick=function(){addToColl(k,1);campSave();var m=document.getElementById('campReward');if(m)m.classList.remove('show');toast('Recompensa: '+d.name);(CAMP_REWARD_AFTER||campBack)();};
    w.addEventListener('mouseenter',function(){showPreviewDef(d);});w.addEventListener('mouseleave',hidePreview);box.appendChild(w);});}
  var m=document.getElementById('campReward');if(m)m.classList.add('show');}
function campRewardSkip(){var m=document.getElementById('campReward');if(m)m.classList.remove('show');(CAMP_REWARD_AFTER||campBack)();}
// eventos con flavor del lore
function campEventOpen(node){
  var title=document.getElementById('eventTitle');if(title)title.innerHTML='🌟 '+node.name;
  var choices=[];
  if(node.ev==='kaelen'){choices=[
    {label:'Meditar en la vision',sub:'Reliquia: Esquirla del Logos',fn:function(){addRelic('logos');campEventDone();}},
    {label:'Seguir adelante',sub:'+70 Cristales',fn:function(){CAMP.crystals+=70;toast('+70 Cristales');campEventDone();}},
    {label:'Tocar el eco (riesgo)',sub:'60%: reliquia Sincronia · 40%: −30 Cristales',fn:function(){if(Math.random()<0.6){addRelic('sync');}else{CAMP.crystals=Math.max(0,CAMP.crystals-30);toast('El Vacio consume 30 Cristales');}campEventDone();}}
  ];}else if(node.ev==='mercader'){var canPay=CAMP.crystals>=90;choices=[
    {label:'Pagar 90 Cristales por una reliquia',sub:canPay?'Reliquia aleatoria':'Cristales insuficientes',disabled:!canPay,fn:function(){CAMP.crystals-=90;var r=randomRelic();if(r){addRelic(r);}else{CAMP.crystals+=90;toast('No quedan reliquias; recuperas tus Cristales');}campEventDone();}},
    {label:'Cambiar un recuerdo',sub:'Elige 1 carta de recompensa',fn:function(){campEventClose();campRewardOpen(function(){campComplete();renderCampaign();});}},
    {label:'Rechazar el trato',sub:'+50 Cristales',fn:function(){CAMP.crystals+=50;toast('+50 Cristales');campEventDone();}}
  ];}
  var box=document.getElementById('eventBody');
  if(box){box.innerHTML='<p style="color:#bcc9ec;font-size:13px">'+(node.flavor||'')+'</p>';
    choices.forEach(function(c){var b=document.createElement('button');b.className='bigbtn';b.style.cssText='display:block;width:100%;margin:8px 0;text-align:left';
      b.innerHTML=c.label+(c.sub?(' <small style="opacity:.7">— '+c.sub+'</small>'):'');if(c.disabled)b.disabled=true;else b.onclick=c.fn;box.appendChild(b);});}
  var m=document.getElementById('campEvent');if(m)m.classList.add('show');
}
function campEventClose(){var m=document.getElementById('campEvent');if(m)m.classList.remove('show');}
function campEventDone(){campEventClose();campComplete();campSave();renderCampaign();}
// render del mapa ramificado
function renderCampaign(){
  var cc=document.getElementById('campCrystals');
  if(cc){cc.innerHTML='💎 '+CAMP.crystals+' Cristales';}
  var rq=document.getElementById('reliquary');
  if(rq){var rs=(CAMP.relics||[]);
    rq.innerHTML='<span class="rqlabel">🏺 Reliquias</span>'+(rs.length?rs.map(function(r){return RELICS[r]?('<span class="relicpip" title="'+RELICS[r].name+': '+RELICS[r].desc+'">'+RELICS[r].ic+'</span>'):'';}).join(''):'<span class="rqempty">Aún no has hallado reliquias en esta travesía.</span>');}
  var m=document.getElementById('campMap');if(!m)return;m.innerHTML='';
  var DN={easy:'Facil',normal:'Normal',hard:'Dificil'};
  var rows={};CAMP_NODES2.forEach(function(n){(rows[n.row]=rows[n.row]||[]).push(n);});
  Object.keys(rows).sort(function(a,b){return a-b;}).forEach(function(rk){
    var rowDiv=document.createElement('div');rowDiv.className='camprow';
    rows[rk].forEach(function(node){
      var sel=(CAMP.cur===node.id)||(CAMP.pending&&CAMP.pending.indexOf(node.id)>=0);
      var state=CAMP.visited[node.id]?'done':((sel&&!CAMP.done)?'current':'locked');
      var tcls=node.type==='shop'?'t-shop':node.type==='event'?'t-event':node.type==='elite'?'t-elite':(node.type&&node.type.indexOf('boss')===0?'t-boss':'t-combat');
      var row=document.createElement('div');row.className='campnode '+state+' '+tcls;
      var ic=node.type==='shop'?'🛒':node.type==='event'?'🌟':node.type==='elite'?'⭐':node.type==='boss-xul'?'🌑':node.type==='boss-yami'?'🕳️':'⚔️';
      var tag=state==='done'?'✔ ':state==='current'?'▶ ':'';
      var diffChip=node.diff?'<div class="cn-diff">'+DN[node.diff]+(CAMP.losses[node.id]?' · '+CAMP.losses[node.id]+' int.':'')+'</div>':'';
      row.innerHTML='<div class="cn-ic">'+ic+'</div><div class="cn-name">'+tag+node.name+'</div><div class="cn-reg">'+node.region+'</div>'+diffChip;
      if(state==='current'){var b=document.createElement('button');b.className='minibtn';
        b.textContent=node.type==='shop'?'Entrar':node.type==='event'?'Explorar':(node.type.indexOf('boss')===0?'Enfrentar':node.type==='elite'?'Combate Elite':'Combatir');
        b.onclick=function(){campSelect(node.id);};row.appendChild(b);}
      rowDiv.appendChild(row);
    });
    m.appendChild(rowDiv);
  });
  if(CAMP.done){var d=document.createElement('div');d.className='campnode current';d.innerHTML='<div class="cn-body"><div class="cn-name">🏆 Travesia completada — has detenido la Paradoja Total</div></div>';m.appendChild(d);}
}

/* ============ Dificultad en Ajustes (movida desde el menú) ============ */
function setDiff(d){DIFF=d;try{localStorage.setItem('aion_diff',d);}catch(e){}var s=document.getElementById('settings');if(s&&s.classList&&s.classList.contains('show')&&typeof openSettings==='function')openSettings();}
(function(){try{var _d=localStorage.getItem('aion_diff');if(_d==='easy'||_d==='normal'||_d==='hard')DIFF=_d;}catch(e){}})();
function openSettings(){
  var b=document.getElementById('settingsBody');
  if(b){var on=function(c){return c?'on':'';};var st=loadStats();
    var facLines=Object.keys(st.byFac).map(function(f){return f+': '+st.byFac[f].w+'V / '+st.byFac[f].l+'D';}).join('<br>')||'Aún sin partidas registradas';
    b.innerHTML=
      '<div class="setrow"><b>Dificultad de la IA</b><span><button class="pill '+on(DIFF==='easy')+'" onclick="setDiff(\'easy\')">Fácil</button><button class="pill '+on(DIFF==='normal')+'" onclick="setDiff(\'normal\')">Normal</button><button class="pill '+on(DIFF==='hard')+'" onclick="setDiff(\'hard\')">Difícil</button></span></div>'+
      '<div class="setrow"><b>Reducir movimiento</b><span><button class="pill '+on(!SETTINGS.motion)+'" onclick="setMotion(false)">Sí</button><button class="pill '+on(SETTINGS.motion)+'" onclick="setMotion(true)">No</button></span></div>'+
      '<div class="setrow"><b>Alto contraste</b><span><button class="pill '+on(SETTINGS.contrast)+'" onclick="setContrast(true)">Sí</button><button class="pill '+on(!SETTINGS.contrast)+'" onclick="setContrast(false)">No</button></span></div>'+
      '<div class="setrow"><b>Tamaño de interfaz</b><span><button class="pill '+on(SETTINGS.scale==1)+'" onclick="setScale(1)">Normal</button><button class="pill '+on(SETTINGS.scale==1.15)+'" onclick="setScale(1.15)">Grande</button><button class="pill '+on(SETTINGS.scale==1.3)+'" onclick="setScale(1.3)">Enorme</button></span></div>'+
      '<div class="setrow"><b>Audio</b><span><button class="pill" onclick="toggleMute();openSettings()">'+(SFX.muted?'🔇 Activar sonido':'🔊 Silenciar')+'</button><button class="pill" onclick="toggleMusic();openSettings()">🎵 Música: '+(MUSIC.on?'On':'Off')+'</button></span></div>'+
      '<hr style="border-color:#243154;margin:10px 0">'+
      '<div class="setrow"><b>📊 Estadísticas</b><span>'+st.total.w+' victorias / '+st.total.l+' derrotas</span></div>'+
      '<div class="gk" style="font-size:12px;color:#9fb0d6;margin-top:4px">'+facLines+'</div>';
  }
  var s=document.getElementById('settings');if(s)s.classList.add('show');
}
