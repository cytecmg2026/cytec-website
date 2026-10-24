/* CyTec Variante 2 — Lusion-inspirierte Fluidität
   Echte 2D-Fluid-Simulation (Stable Fluids / Jos Stam): rotes Gas verwirbelt
   unter dem Cursor. Dazu: Lade-Intro, Custom-Cursor, magnetische Buttons,
   Buchstaben-Reveal. Alles ohne Libraries, Netlify-tauglich. */
(function(){
'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(pointer:fine)').matches;
const noLoader=(document.currentScript&&document.currentScript.dataset.loader==='off');

/* ===== 1. Lade-Intro (Lusion-Prinzip: Zähler + Reveal) ===== */
if(noLoader){document.body.classList.add('loaded');}
else{
const loader=document.createElement('div');
loader.id='ld';
loader.innerHTML='<div class="ld-inner"><div class="ld-logo"><img src="assets/media/cytec-logo.png" alt="CyTec" style="height:64px;filter:brightness(1.28)"></div>'+
  '<div class="ld-bar"><i></i></div><div class="ld-num">0%</div>'+
  '<div class="ld-sub">CYLINDER TECHNOLOGIES · MÖNCHENGLADBACH</div></div>';
document.body.appendChild(loader);
const num=loader.querySelector('.ld-num'),bar=loader.querySelector('.ld-bar i');
const t0=performance.now(),DUR=reduced?50:1500;
(function tick(t){
  const p=Math.min(1,(t-t0)/DUR);
  const v=Math.round(p*100);
  num.textContent=v+'%';bar.style.width=v+'%';
  if(p<1)requestAnimationFrame(tick);
  else{
    loader.classList.add('done');
    document.body.classList.add('loaded');
    setTimeout(()=>loader.remove(),900);
  }
})(t0);
}

/* ===== 2. Buchstaben-Reveal für die Hero-Headline ===== */
document.querySelectorAll('.reveal-line span').forEach((line,li)=>{
  const txt=line.textContent;line.textContent='';line.style.transform='none';line.style.animation='none';
  [...txt].forEach((ch,i)=>{
    const s=document.createElement('i');
    s.className='ch';s.textContent=ch;
    s.style.transitionDelay=(0.9+li*.12+i*.045)+'s';
    line.appendChild(s);
  });
});

/* ===== 3. Custom-Cursor + magnetische Buttons ===== */
if(fine&&!reduced){
  document.body.classList.add('has-cursor');
  const dot=document.createElement('div');dot.id='cur-dot';
  const ring=document.createElement('div');ring.id='cur-ring';
  document.body.append(dot,ring);
  let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
  addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;
    dot.style.transform='translate('+(mx-3)+'px,'+(my-3)+'px)'});
  (function loop(){
    rx+=(mx-rx)*.14;ry+=(my-ry)*.14;
    ring.style.transform='translate('+(rx-19)+'px,'+(ry-19)+'px)';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a,button,summary,[data-tilt]').forEach(el=>{
    el.addEventListener('mouseenter',()=>ring.classList.add('big'));
    el.addEventListener('mouseleave',()=>ring.classList.remove('big'));
  });
  /* magnetisch */
  document.querySelectorAll('.btn').forEach(b=>{
    b.addEventListener('mousemove',e=>{
      const r=b.getBoundingClientRect();
      const dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);
      b.style.transform='translate('+dx*.22+'px,'+dy*.22+'px)';
    });
    b.addEventListener('mouseleave',()=>{b.style.transform=''});
  });
}

/* ===== 4. Fluid-Simulation (Stable Fluids) ===== */
const cv=document.getElementById('fluid');
if(cv){
  const ctx=cv.getContext('2d');
  const N=104,SZ=N*N;
  const vx=new Float32Array(SZ),vy=new Float32Array(SZ),
        vx0=new Float32Array(SZ),vy0=new Float32Array(SZ),
        den=new Float32Array(SZ),den0=new Float32Array(SZ),
        p=new Float32Array(SZ),div=new Float32Array(SZ);
  const IX=(x,y)=>x+y*N;
  const off=document.createElement('canvas');off.width=N;off.height=N;
  const octx=off.getContext('2d');
  const img=octx.createImageData(N,N);
  let W=0,H=0;
  function size(){W=innerWidth;H=innerHeight;cv.width=W;cv.height=H;ctx.imageSmoothingEnabled=true}
  size();addEventListener('resize',size);

  function lin_solve(x,x0,a,c){
    for(let k=0;k<10;k++)
      for(let j=1;j<N-1;j++)for(let i=1;i<N-1;i++)
        x[IX(i,j)]=(x0[IX(i,j)]+a*(x[IX(i-1,j)]+x[IX(i+1,j)]+x[IX(i,j-1)]+x[IX(i,j+1)]))/c;
  }
  function project(){
    for(let j=1;j<N-1;j++)for(let i=1;i<N-1;i++){
      div[IX(i,j)]=-.5*(vx[IX(i+1,j)]-vx[IX(i-1,j)]+vy[IX(i,j+1)]-vy[IX(i,j-1)])/N;
      p[IX(i,j)]=0;
    }
    lin_solve(p,div,1,4);
    for(let j=1;j<N-1;j++)for(let i=1;i<N-1;i++){
      vx[IX(i,j)]-=.5*N*(p[IX(i+1,j)]-p[IX(i-1,j)]);
      vy[IX(i,j)]-=.5*N*(p[IX(i,j+1)]-p[IX(i,j-1)]);
    }
  }
  function advect(d,d0,u,v,dt){
    const dt0=dt*N;
    for(let j=1;j<N-1;j++)for(let i=1;i<N-1;i++){
      let x=i-dt0*u[IX(i,j)],y=j-dt0*v[IX(i,j)];
      if(x<.5)x=.5;if(x>N-1.5)x=N-1.5;
      if(y<.5)y=.5;if(y>N-1.5)y=N-1.5;
      const i0=x|0,j0=y|0,i1=i0+1,j1=j0+1,s1=x-i0,s0=1-s1,t1=y-j0,t0=1-t1;
      d[IX(i,j)]=s0*(t0*d0[IX(i0,j0)]+t1*d0[IX(i0,j1)])+s1*(t0*d0[IX(i1,j0)]+t1*d0[IX(i1,j1)]);
    }
  }
  /* Maus → Kraft + Farbstoff */
  let pmx=-1,pmy=-1;
  function inject(cx,cy,fx,fy,amount){
    const gx=Math.max(2,Math.min(N-3,cx/W*N|0)),gy=Math.max(2,Math.min(N-3,cy/H*N|0));
    for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){
      const idx=IX(gx+dx,gy+dy),fall=1-(Math.abs(dx)+Math.abs(dy))/5;
      vx[idx]+=fx*fall;vy[idx]+=fy*fall;den[idx]=Math.min(1.6,den[idx]+amount*fall);
    }
  }
  addEventListener('mousemove',e=>{
    if(pmx>=0)inject(e.clientX,e.clientY,(e.clientX-pmx)*.09,(e.clientY-pmy)*.09,.42);
    pmx=e.clientX;pmy=e.clientY;
  });
  addEventListener('touchmove',e=>{
    const t=e.touches[0];
    if(pmx>=0)inject(t.clientX,t.clientY,(t.clientX-pmx)*.09,(t.clientY-pmy)*.09,.42);
    pmx=t.clientX;pmy=t.clientY;
  },{passive:true});

  /* Ambient: pulsierende Einströmungen, damit es auch ohne Maus lebt */
  let tglob=0;
  function ambient(){
    tglob+=.016;
    const a1=tglob*.7,a2=tglob*.43+2;
    inject(W*(.5+.35*Math.cos(a1)),H*(.55+.3*Math.sin(a1*1.3)),Math.cos(a2)*.55,Math.sin(a2)*.55,.1);
    inject(W*(.5+.4*Math.sin(a2)),H*(.4+.35*Math.cos(a2*.8)),-Math.sin(a1)*.5,Math.cos(a1)*.5,.08);
  }
  /* Farb-Rampe: dunkel → stahl → cytec-rot → hell */
  const ramp=[];
  for(let i=0;i<256;i++){
    const t=i/255;let r,g,b;
    if(t<.35){const u=t/.35;r=19+u*60;g=21+u*40;b=25+u*48}
    else if(t<.7){const u=(t-.35)/.35;r=79+u*122;g=61-u*3;b=73-u*23}
    else{const u=(t-.7)/.3;r=201+u*54;g=58+u*100;b=50+u*80}
    ramp.push([r|0,g|0,b|0]);
  }
  function render(){
    const d=img.data;
    for(let i=0;i<SZ;i++){
      const v=Math.min(255,den[i]*220|0),c=ramp[v];
      d[i*4]=c[0];d[i*4+1]=c[1];d[i*4+2]=c[2];
      d[i*4+3]=Math.min(255,den[i]*470|0);
    }
    octx.putImageData(img,0,0);
    ctx.clearRect(0,0,W,H);
    ctx.drawImage(off,0,0,W,H);
  }
  function step(){
    ambient();
    /* Impuls dämpfen + advektieren */
    vx0.set(vx);vy0.set(vy);
    advect(vx,vx0,vx0,vy0,.016);
    advect(vy,vy0,vx0,vy0,.016);
    project();
    den0.set(den);
    advect(den,den0,vx,vy,.016);
    for(let i=0;i<SZ;i++){den[i]*=.985;vx[i]*=.995;vy[i]*=.995}
    render();
    if(!reduced)requestAnimationFrame(step);
  }
  if(reduced){for(let k=0;k<90;k++){ambient();vx0.set(vx);vy0.set(vy);advect(vx,vx0,vx0,vy0,.016);advect(vy,vy0,vx0,vy0,.016);project();den0.set(den);advect(den,den0,vx,vy,.016);for(let i=0;i<SZ;i++)den[i]*=.985}render()}
  else step();
}
})();
