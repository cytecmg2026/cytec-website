/* CyTec Site JS — Effekte, Navigation, Scrollytelling */
(function(){
'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);

/* Nav + Progress */
const nav=$('nav.main'),prog=$('#progress');
addEventListener('scroll',()=>{
  if(nav)nav.classList.toggle('scrolled',scrollY>40);
  if(prog){const d=document.documentElement;prog.style.width=(scrollY/(d.scrollHeight-innerHeight)*100)+'%'}
},{passive:true});

/* Burger + Mobile-Submenü */
const burger=$('#burger');
if(burger)burger.addEventListener('click',()=>nav.classList.toggle('open'));
$$('.nav-links>li.has-sub>a').forEach(a=>{
  a.addEventListener('click',e=>{
    if(matchMedia('(max-width:960px)').matches){e.preventDefault();a.parentElement.classList.toggle('subopen')}
  });
});

/* Cursor-Glow */
const glow=$('#glow');
if(glow)addEventListener('mousemove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'});

/* Reveals */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target)}}),{threshold:.15});
$$('.io').forEach(el=>io.observe(el));

/* Count-up */
const cio=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;cio.unobserve(e.target);
  const el=e.target,end=+el.dataset.count,dur=1400,t0=performance.now();
  (function tick(t){const p=Math.min((t-t0)/dur,1),v=Math.round(end*(1-Math.pow(1-p,3)));el.textContent=v;if(p<1)requestAnimationFrame(tick)})(t0);
}),{threshold:.6});
$$('[data-count]').forEach(el=>cio.observe(el));

/* 3D-Moleküle als fixer Hintergrund */
const cv=$('#particles');
if(cv){
  const ctx=cv.getContext('2d');
  let w=0,h=0,mols=[],dust=[],mouse={x:-1e4,y:-1e4};
  function size(){
    const dpr=Math.min(devicePixelRatio||1,2);
    w=innerWidth;h=innerHeight;
    cv.width=w*dpr;cv.height=h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function seed(){
    mols=[];dust=[];
    const N=Math.max(8,Math.min(15,w/115|0));
    for(let i=0;i<N;i++){
      const z=.35+Math.random()*.65,R=(15+Math.random()*25)*z,na=2+(Math.random()*3|0),atoms=[];
      for(let a=0;a<na;a++)atoms.push({ang:Math.random()*Math.PI*2,speed:(.004+Math.random()*.006)*(Math.random()<.5?1:-1),dist:R*(1.5+Math.random()*.9),r:R*(.4+Math.random()*.3),red:Math.random()<.4});
      mols.push({x:(i+.5)/N*w+(Math.random()-.5)*w*.06,y:Math.random()*h,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,R,z,atoms,red:Math.random()<.3});
    }
    const D=Math.min(60,w/24|0);
    for(let i=0;i<D;i++)dust.push({x:Math.random()*w,y:Math.random()*h,r:.6+Math.random()*1.4,vy:.05+Math.random()*.15,a:.12+Math.random()*.28});
  }
  function sphere(x,y,r,red,z){
    if(r<.5)return;
    const g=ctx.createRadialGradient(x-r*.35,y-r*.42,r*.08,x,y,r);
    if(red){g.addColorStop(0,'rgba(244,132,122,'+(.95*z)+')');g.addColorStop(.45,'rgba(201,58,50,'+(.9*z)+')');g.addColorStop(1,'rgba(96,20,16,'+(.75*z)+')')}
    else{g.addColorStop(0,'rgba(215,225,240,'+(.9*z)+')');g.addColorStop(.45,'rgba(122,134,152,'+(.8*z)+')');g.addColorStop(1,'rgba(42,48,60,'+(.65*z)+')')}
    ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fillStyle=g;ctx.fill();
  }
  function frame(){
    ctx.clearRect(0,0,w,h);
    for(const d of dust){
      d.y-=d.vy;if(d.y<-4)d.y=h+4;
      ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,7);ctx.fillStyle='rgba(170,180,195,'+d.a+')';ctx.fill();
    }
    mols.sort((a,b)=>a.z-b.z);
    for(const m of mols){
      const dx=m.x-mouse.x,dy=m.y-mouse.y,d2=dx*dx+dy*dy;
      if(d2<52000&&d2>1){const f=Math.min(2600/d2,.12);m.vx+=dx*f*.02;m.vy+=dy*f*.02}
      m.vx=Math.max(-.7,Math.min(.7,m.vx*.992));
      m.vy=Math.max(-.7,Math.min(.7,m.vy*.992));
      m.x+=m.vx*m.z;m.y+=m.vy*m.z;
      const M=m.R*3;
      if(m.x<-M)m.x=w+M;if(m.x>w+M)m.x=-M;
      if(m.y<-M)m.y=h+M;if(m.y>h+M)m.y=-M;
      const pos=m.atoms.map(a=>{a.ang+=a.speed;return{a,ax:m.x+Math.cos(a.ang)*a.dist,ay:m.y+Math.sin(a.ang)*a.dist*.45,front:Math.sin(a.ang)>0}});
      for(const p of pos){
        ctx.beginPath();ctx.moveTo(m.x,m.y);ctx.lineTo(p.ax,p.ay);
        ctx.strokeStyle='rgba(170,180,195,'+(.28*m.z)+')';ctx.lineWidth=Math.max(1,m.R*.09);ctx.stroke();
      }
      for(const p of pos)if(!p.front)sphere(p.ax,p.ay,p.a.r*.85,p.a.red,m.z*.8);
      sphere(m.x,m.y,m.R,m.red,m.z);
      for(const p of pos)if(p.front)sphere(p.ax,p.ay,p.a.r,p.a.red,m.z);
    }
    if(!reduced)requestAnimationFrame(frame);
  }
  addEventListener('mousemove',e=>{mouse.x=e.clientX;mouse.y=e.clientY});
  addEventListener('resize',()=>{size();seed();if(reduced)frame()});
  size();seed();frame();
}

/* Manometer-Scrollytelling (nur Startseite) */
const outer=$('#gauge-outer');
if(outer){
  const num=$('#gauge-num'),needle=$('#needle'),arcBg=$('#arc-bg'),arcFill=$('#arc-fill'),phase=$('#gauge-phase'),ticks=$('#ticks');
  const CX=150,CY=150,R=118,START=150,SWEEP=240;
  const pt=(deg,r)=>{const a=deg*Math.PI/180;return[CX+Math.cos(a)*r,CY+Math.sin(a)*r]};
  const arc=(from,to,r)=>{const[x1,y1]=pt(from,r),[x2,y2]=pt(to,r);return'M '+x1+' '+y1+' A '+r+' '+r+' 0 '+((to-from)%360>180?1:0)+' 1 '+x2+' '+y2};
  arcBg.setAttribute('d',arc(START,START+SWEEP,R));
  let t='';
  for(let i=0;i<=8;i++){const d=START+i*30,[x1,y1]=pt(d,R-16),[x2,y2]=pt(d,R-26);t+='<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'"/>'}
  ticks.innerHTML=t;
  function update(){
    const r=outer.getBoundingClientRect(),total=r.height-innerHeight;
    const p=Math.min(1,Math.max(0,-r.top/total)),bar=Math.round(p*1000);
    num.textContent=bar;
    const deg=START+SWEEP*p,[x2,y2]=pt(deg,106);
    needle.setAttribute('x2',x2);needle.setAttribute('y2',y2);
    arcFill.setAttribute('d',p>.003?arc(START,deg,R):'');
    phase.textContent=bar<300?'Druck steigt …':bar<640?'TPED-Bereich: bis 640 bar':bar<1000?'PED-Bereich: bis 1000 bar …':'✓ 1000 bar — ausgelegt für das Maximum';
  }
  addEventListener('scroll',update,{passive:true});update();
}

/* Kinetische Typografie */
const kin=$('#kin1');
if(kin&&!reduced){
  function upd(){
    const r=kin.parentElement.getBoundingClientRect();
    const p=Math.min(1,Math.max(0,(innerHeight-r.top)/(innerHeight+r.height)));
    kin.style.transform='translateX('+(-5-p*20)+'%)';
  }
  addEventListener('scroll',upd,{passive:true});upd();
}

/* Tilt */
if(!reduced&&matchMedia('(pointer:fine)').matches){
  $$('[data-tilt]').forEach(card=>{
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const rx=((e.clientY-r.top)/r.height-.5)*-7,ry=((e.clientX-r.left)/r.width-.5)*7;
      card.style.transform='rotateX('+rx+'deg) rotateY('+ry+'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave',()=>{card.style.transform=''});
  });
}
})();
