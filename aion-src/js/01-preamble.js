/* ╔══ MÓDULO: 01-preamble.js ══╗
   Constantes globales (KW=keywords, FAC=facciones), audio sintetizado (SFX/MUSIC) y capa de partículas (FX). Sin dependencias; se carga PRIMERO.
   (Detalle completo y guía para extender: aion-src/ARCHITECTURE.md) */

/* ============================================================
   AION TCG Simulador 2.0 — Sandbox de rulings
   ============================================================ */
const KW={
  ascension:{name:'Ascensión',desc:'Se voltea a su Lado B (más fuerte) al cumplir su condición: Victoria, Resistencia o Dominio N.'},
  impulso:{name:'Impulso',desc:'Ignora la Inestabilidad de Entrada: puede actuar el turno que entra.'},
  baluarte:{name:'Baluarte',desc:'Puede ser atacada aunque esté preparada; los ataques deben elegirla si es posible.'},
  aereo:{name:'Aéreo',desc:'Puede atacar entidades preparadas del Frente y agotadas del Soporte enemigo.'},
  impacto:{name:'Impacto',desc:'Al destruir una Entidad en combate, ganas PA (1 si coste ≤4, 2 si ≥5).'},
  mutar:{name:'Mutar',desc:'Al entrar, eliges y aplicas UNA de sus opciones impresas.'},
  glitch:{name:'Glitch',desc:'Estado en cartas agotadas: no se preparan en su próximo Inicio; luego se remueve. No acumulable.'},
  sanar:{name:'Sanar X',desc:'Remueve hasta X de Daño de una Entidad.'},
};
const FAC={
  solaris:{cls:'f-solaris',name:'Imperio Solaris',color:'var(--solaris)',art:'☀️'},
  neon:{cls:'f-neon',name:'Sindicato Neón',color:'var(--neon)',art:'🌃'},
  gaia:{cls:'f-gaia',name:'Dinastía Gaia',color:'var(--gaia)',art:'🌿'},
  forja:{cls:'f-forja',name:'Forja de Hierro',color:'var(--forja)',art:'⚙️'},
  conclave:{cls:'f-conclave',name:'Cónclave Aether',color:'var(--conclave)',art:'🔮'},
  vacio:{cls:'f-vacio',name:'Vacío Estelar',color:'var(--vacio)',art:'🌌'},
  neutral:{cls:'f-neutral',name:'Neutral',color:'var(--neutral)',art:'⚪'},
};
const FAC_ORDER=['solaris','neon','gaia','forja','conclave','vacio','neutral'];

/* ===== Audio sintetizado (Web Audio API, sin archivos externos) ===== */
const SFX={ctx:null,muted:false,
  init(){if(this.ctx)return;try{this.ctx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){}},
  beep(o){if(this.muted||!this.ctx)return;const t=this.ctx.currentTime+(o.delay||0);const osc=this.ctx.createOscillator(),g=this.ctx.createGain();osc.type=o.type||'sine';osc.frequency.setValueAtTime(o.freq,t);if(o.slide)osc.frequency.exponentialRampToValueAtTime(o.slide,t+o.dur);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(o.vol||0.12,t+0.006);g.gain.exponentialRampToValueAtTime(0.0001,t+o.dur);osc.connect(g).connect(this.ctx.destination);osc.start(t);osc.stop(t+o.dur+0.02);},
  noise(o){if(this.muted||!this.ctx)return;const t=this.ctx.currentTime+(o.delay||0);const len=Math.floor(this.ctx.sampleRate*o.dur);const buf=this.ctx.createBuffer(1,len,this.ctx.sampleRate);const d=buf.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;const s=this.ctx.createBufferSource();s.buffer=buf;const f=this.ctx.createBiquadFilter();f.type=o.ftype||'bandpass';f.frequency.value=o.freq||1000;const g=this.ctx.createGain();g.gain.setValueAtTime(o.vol||0.12,t);g.gain.exponentialRampToValueAtTime(0.0001,t+o.dur);s.connect(f).connect(g).connect(this.ctx.destination);s.start(t);s.stop(t+o.dur);},
  play(n){this.init();if(this.muted||!this.ctx)return;
    switch(n){
      case 'play':this.beep({freq:300,slide:440,dur:0.12,type:'triangle',vol:0.12});break;
      case 'cast':this.beep({freq:520,slide:780,dur:0.14,type:'sawtooth',vol:0.09});break;
      case 'charge':this.beep({freq:200,slide:520,dur:0.1,type:'sine',vol:0.1});break;
      case 'stab':this.beep({freq:523,dur:0.1,type:'sine',vol:0.13});this.beep({freq:784,dur:0.14,type:'sine',vol:0.12,delay:0.08});break;
      case 'hit':this.noise({freq:700,dur:0.13,vol:0.16});this.beep({freq:120,slide:60,dur:0.12,type:'square',vol:0.08});break;
      case 'glitch':this.noise({freq:2200,dur:0.16,vol:0.12,ftype:'highpass'});this.beep({freq:880,slide:140,dur:0.1,type:'sawtooth',vol:0.07,delay:0.04});break;
      case 'ascend':[523,659,784,1046].forEach((f,i)=>this.beep({freq:f,dur:0.25,type:'triangle',vol:0.11,delay:i*0.07}));break;
      case 'turn':this.beep({freq:392,slide:523,dur:0.16,type:'sine',vol:0.1});break;
      case 'win':[523,659,784,1046,1318].forEach((f,i)=>this.beep({freq:f,dur:0.3,type:'triangle',vol:0.13,delay:i*0.1}));break;
      case 'lose':[440,349,262].forEach((f,i)=>this.beep({freq:f,dur:0.35,type:'sine',vol:0.12,delay:i*0.14}));break;
      case 'draw':this.beep({freq:680,slide:520,dur:0.06,type:'square',vol:0.05});break;
      case 'hover':this.beep({freq:1200,dur:0.03,type:'sine',vol:0.025});break;
      case 'click':this.beep({freq:440,dur:0.045,type:'triangle',vol:0.06});break;
    }
  }
};
/* ===== Música de fondo ambiental (sintetizada en bucle) ===== */
const MUSIC={on:true,playing:false,timer:null,gain:null,step:0,
  start(){if(this.playing)return;SFX.init();if(!SFX.ctx)return;if(SFX.ctx.state==='suspended')SFX.ctx.resume();
    if(!this.gain){this.gain=SFX.ctx.createGain();this.gain.gain.value=0.5;this.gain.connect(SFX.ctx.destination);}
    this.playing=true;this.schedule();},
  stop(){this.playing=false;if(this.timer)clearTimeout(this.timer);},
  schedule(){if(!this.playing)return;this.chord();this.timer=setTimeout(()=>this.schedule(),4200);},
  chord(){const ctx=SFX.ctx,t=ctx.currentTime;
    const prog=[[220,277,330],[196,247,294],[174,220,262],[246,311,370]];const ch=prog[this.step++%prog.length];
    ch.forEach(f=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=f;o.detune.value=(Math.random()-0.5)*6;
      g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(0.11,t+1.3);g.gain.exponentialRampToValueAtTime(0.0001,t+4.0);
      o.connect(g).connect(this.gain);o.start(t);o.stop(t+4.2);});
    const b=ctx.createOscillator(),bg=ctx.createGain();b.type='triangle';b.frequency.value=ch[0]/2;
    bg.gain.setValueAtTime(0.0001,t);bg.gain.exponentialRampToValueAtTime(0.09,t+0.9);bg.gain.exponentialRampToValueAtTime(0.0001,t+3.8);
    b.connect(bg).connect(this.gain);b.start(t);b.stop(t+4);}
};
function toggleMusic(){MUSIC.on=!MUSIC.on;const b=document.getElementById('musicBtn');if(b)b.style.opacity=MUSIC.on?'1':'.4';if(MUSIC.on&&G&&!G.over)MUSIC.start();else MUSIC.stop();}
function sfx(n){try{SFX.play(n);}catch(e){}}
window.addEventListener('pointerdown',function once(){SFX.init();if(SFX.ctx&&SFX.ctx.state==='suspended')SFX.ctx.resume();},{once:true});
function toggleMute(){SFX.muted=!SFX.muted;const b=document.getElementById('muteBtn');if(b)b.textContent=SFX.muted?'🔇':'🔊';if(SFX.muted)MUSIC.stop();else{sfx('turn');if(MUSIC.on&&typeof G!=='undefined'&&G&&!G.over)MUSIC.start();}}

/* ===== Capa de partículas (Canvas) y efectos de pantalla ===== */
const FACHEX={solaris:'#f5b942',neon:'#ff3ea5',gaia:'#46d36b',forja:'#ff7733',conclave:'#39d3ff',vacio:'#a45cff',neutral:'#9aa6b2'};
const FX={canvas:null,ctx:null,parts:[],raf:null,
  init(){if(this.ctx)return;this.canvas=document.getElementById('fx');if(!this.canvas)return;this.ctx=this.canvas.getContext('2d');this.resize();window.addEventListener('resize',()=>this.resize());},
  resize(){if(this.canvas){this.canvas.width=innerWidth;this.canvas.height=innerHeight;}},
  add(p){this.init();if(!this.ctx)return;this.parts.push(p);if(!this.raf)this.loop();},
  loop(){this.raf=requestAnimationFrame(()=>this.loop());const c=this.ctx;c.clearRect(0,0,this.canvas.width,this.canvas.height);
    for(let i=this.parts.length-1;i>=0;i--){const p=this.parts[i];p.life--;if(p.life<=0){this.parts.splice(i,1);continue;}
      p.x+=p.vx;p.y+=p.vy;p.vy+=(p.g||0);p.vx*=(p.fr||1);p.vy*=(p.fr||1);
      const a=Math.max(0,p.life/p.max);c.globalAlpha=a;c.fillStyle=p.color;
      if(p.shape==='rect'){c.save();c.translate(p.x,p.y);c.rotate(p.rot||0);c.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.62);c.restore();p.rot=(p.rot||0)+(p.vr||0);}
      else{c.beginPath();c.arc(p.x,p.y,Math.max(0.4,p.size*a),0,6.283);c.fill();}
    }
    c.globalAlpha=1;if(this.parts.length===0){cancelAnimationFrame(this.raf);this.raf=null;}
  }
};
function cardCenter(uid){const el=cardDom(uid);if(!el)return null;const r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};}
function fxBurst(p,color,n){if(!p)return;n=n||18;for(let i=0;i<n;i++){const a=Math.random()*6.283,s=2+Math.random()*4;FX.add({x:p.x,y:p.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,g:0.05,fr:0.93,life:28+Math.random()*16,max:44,size:2+Math.random()*3,color});}}
function fxShatter(p,color){if(!p)return;for(let i=0;i<16;i++){FX.add({x:p.x+(Math.random()-0.5)*42,y:p.y+(Math.random()-0.5)*54,vx:(Math.random()-0.5)*5,vy:-2-Math.random()*3,g:0.25,fr:1,life:34+Math.random()*22,max:56,size:4+Math.random()*5,color,shape:'rect',rot:Math.random()*6.283,vr:(Math.random()-0.5)*0.45});}}
function fxSpark(p){if(!p)return;for(let i=0;i<14;i++){const a=Math.random()*6.283,s=3+Math.random()*5;FX.add({x:p.x,y:p.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,g:0.08,fr:0.9,life:12+Math.random()*10,max:22,size:1.5+Math.random()*2,color:i%2?'#ffffff':'#ffd56b'});}}
function fxHeal(p){if(!p)return;for(let i=0;i<12;i++){FX.add({x:p.x+(Math.random()-0.5)*36,y:p.y+18,vx:(Math.random()-0.5)*1,vy:-1-Math.random()*1.4,g:-0.012,fr:1,life:30+Math.random()*16,max:46,size:2+Math.random()*2,color:'#7af0d0'});}}
function fxAscend(p){if(!p)return;for(let i=0;i<26;i++){FX.add({x:p.x+(Math.random()-0.5)*32,y:p.y+28,vx:(Math.random()-0.5)*2,vy:-2-Math.random()*3,g:-0.02,fr:1,life:34+Math.random()*22,max:56,size:2+Math.random()*3,color:i%2?'#ffd56b':'#ffffff'});}}
function shakeScreen(){const b=document.getElementById('board');if(b){b.classList.add('shaking');setTimeout(()=>b.classList.remove('shaking'),360);}}
function flashScreen(o){const f=document.getElementById('flash');if(!f)return;f.style.background=o||'#fff';f.classList.add('show');setTimeout(()=>f.classList.remove('show'),140);}
window.addEventListener('load',()=>FX.init());

/* Effect shorthand: {t:'...'} */
