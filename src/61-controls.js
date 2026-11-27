// ===== v23: 지도 앱식 조작 (왼쪽 드래그 이동 · 오른쪽 드래그 회전/기울기 · 휠 커서 확대 · 관성 · 부드러운 전환) =====
const CTL={goal:null,applied:null,vel:[0,0],ptrs:new Map(),mode:null,grab:null,last:0,moved:0,downAt:null,walkV:[0,0],pinch:null};
const DMIN=8,DMAX=1300,PMIN=.14,PMAX=1.47,BOUND=335;
const camSnap=()=>({t:camera.target.slice(),yaw:camera.yaw,pitch:camera.pitch,dist:camera.dist});
function inv4(m){const a=m,o=new Float32Array(16);const a00=a[0],a01=a[1],a02=a[2],a03=a[3],a10=a[4],a11=a[5],a12=a[6],a13=a[7],a20=a[8],a21=a[9],a22=a[10],a23=a[11],a30=a[12],a31=a[13],a32=a[14],a33=a[15];
 const b00=a00*a11-a01*a10,b01=a00*a12-a02*a10,b02=a00*a13-a03*a10,b03=a01*a12-a02*a11,b04=a01*a13-a03*a11,b05=a02*a13-a03*a12,b06=a20*a31-a21*a30,b07=a20*a32-a22*a30,b08=a20*a33-a23*a30,b09=a21*a32-a22*a31,b10=a21*a33-a23*a31,b11=a22*a33-a23*a32;
 let det=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;if(!det)return null;det=1/det;
 o[0]=(a11*b11-a12*b10+a13*b09)*det;o[1]=(a02*b10-a01*b11-a03*b09)*det;o[2]=(a31*b05-a32*b04+a33*b03)*det;o[3]=(a22*b04-a21*b05-a23*b03)*det;o[4]=(a12*b08-a10*b11-a13*b07)*det;o[5]=(a00*b11-a02*b08+a03*b07)*det;o[6]=(a32*b02-a30*b05-a33*b01)*det;o[7]=(a20*b05-a22*b02+a23*b01)*det;
 o[8]=(a10*b10-a11*b08+a13*b06)*det;o[9]=(a01*b08-a00*b10-a03*b06)*det;o[10]=(a30*b04-a31*b02+a33*b00)*det;o[11]=(a21*b02-a20*b04-a23*b00)*det;o[12]=(a11*b07-a10*b09-a12*b06)*det;o[13]=(a00*b09-a01*b07+a02*b06)*det;o[14]=(a31*b01-a30*b03-a32*b00)*det;o[15]=(a20*b03-a21*b01+a22*b00)*det;return o}
function unproj(m,x,y,z){const w=m[3]*x+m[7]*y+m[11]*z+m[15];return [(m[0]*x+m[4]*y+m[8]*z+m[12])/w,(m[1]*x+m[5]*y+m[9]*z+m[13])/w,(m[2]*x+m[6]*y+m[10]*z+m[14])/w]}
function screenRay(cx,cy){if(!camera.mvp)return null;const r=canvas.getBoundingClientRect(),nx=(cx-r.left)/r.width*2-1,ny=1-(cy-r.top)/r.height*2,iv=inv4(camera.mvp);if(!iv)return null;const a=unproj(iv,nx,ny,-1),b=unproj(iv,nx,ny,1),d=norm(sub(b,a));return {o:a,d}}
function rayPlane(ray,y){if(!ray||Math.abs(ray.d[1])<1e-4)return null;const t=(y-ray.o[1])/ray.d[1];if(t<0)return null;return [ray.o[0]+ray.d[0]*t,y,ray.o[2]+ray.d[2]*t]}
function rayGround(ray){if(!ray)return null;let t0=0,p=ray.o,step=2;for(let t=step;t<3200;t+=step){const q=[ray.o[0]+ray.d[0]*t,ray.o[1]+ray.d[1]*t,ray.o[2]+ray.d[2]*t];if(q[1]<=H(q[0],q[2])){let lo=t-step,hi=t;for(let k=0;k<14;k++){const m=(lo+hi)/2,r=[ray.o[0]+ray.d[0]*m,ray.o[1]+ray.d[1]*m,ray.o[2]+ray.d[2]*m];if(r[1]<=H(r[0],r[2]))hi=m;else lo=m}const m=hi;return [ray.o[0]+ray.d[0]*m,ray.o[1]+ray.d[1]*m,ray.o[2]+ray.d[2]*m]}if(t>60)step=Math.min(8,step*1.02)}return null}
const groundAt=(cx,cy)=>{const r=screenRay(cx,cy);return rayGround(r)||rayPlane(r,camera.target[1])};
const CB=EXT.bounds,clampT=t=>[clamp(t[0],CB[0],CB[1]),t[1],clamp(t[2],CB[2],CB[3])];
function ctlUpdate(dt){if(globalThis.__FLY)return;
 if(camera.mode==='walk'){walkUpdate(dt);CTL.goal=null;return}
 if(!CTL.goal){CTL.goal=camSnap();CTL.applied=camSnap();if(camera.target===undefined)return}
 // external writes (건물 선택, 전체 보기, 경로 보기 등) → 부드럽게 따라가기
 const ap=CTL.applied,g=CTL.goal;
 if(camera.target[0]!==ap.t[0]||camera.target[1]!==ap.t[1]||camera.target[2]!==ap.t[2]){g.t=camera.target.slice();camera.target=ap.t.slice();CTL.ext=true}
 if(camera.yaw!==ap.yaw){g.yaw=camera.yaw;camera.yaw=ap.yaw}if(camera.pitch!==ap.pitch){g.pitch=camera.pitch;camera.pitch=ap.pitch}if(camera.dist!==ap.dist){g.dist=camera.dist;camera.dist=ap.dist;CTL.ext=true}if(CTL.mode)CTL.ext=false
 // keyboard pan / rotate / zoom
 if(!(document.activeElement&&['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName))){
  const f=(held.w||held.arrowup?1:0)-(held.s||held.arrowdown?1:0),sd=(held.d||held.arrowright?1:0)-(held.a||held.arrowleft?1:0),sp=g.dist*.9*dt*(held.shift?2.2:1);
  if(f||sd){const a=g.yaw;g.t=clampT([g.t[0]+(-Math.sin(a)*f+Math.cos(a)*sd)*sp,g.t[1],g.t[2]+(-Math.cos(a)*f-Math.sin(a)*sd)*sp]);g.t[1]=H(g.t[0],g.t[2])}
  if(held.q)g.yaw+=1.6*dt;if(held.e)g.yaw-=1.6*dt;if(held.r)g.pitch=clamp(g.pitch+.9*dt,PMIN,PMAX);if(held.f)g.pitch=clamp(g.pitch-.9*dt,PMIN,PMAX);
  if(held['=']||held['+'])g.dist=clamp(g.dist*Math.exp(-1.6*dt),DMIN,DMAX);if(held['-']||held._)g.dist=clamp(g.dist*Math.exp(1.6*dt),DMIN,DMAX)}
 // inertia after a drag
 if(!CTL.mode&&(Math.abs(CTL.vel[0])+Math.abs(CTL.vel[1])>.01)){g.t=clampT([g.t[0]+CTL.vel[0]*dt,g.t[1],g.t[2]+CTL.vel[1]*dt]);g.t[1]=H(g.t[0],g.t[2]);const k=Math.exp(-dt*7);CTL.vel=[CTL.vel[0]*k,CTL.vel[1]*k]}
 // smoothing
 const k=CTL.ext?1-Math.exp(-dt*4.2):CTL.mode==='pan'?1-Math.exp(-dt*14):CTL.mode==='rot'?1-Math.exp(-dt*8):1-Math.exp(-dt*7.5);
 if(CTL.ext&&Math.hypot(g.t[0]-camera.target[0],g.t[2]-camera.target[2])<.3&&Math.abs(Math.log(g.dist/camera.dist))<.01)CTL.ext=false;camera.target=camera.target.map((v,i)=>v+(g.t[i]-v)*k);
 let dy=((g.yaw-camera.yaw+Math.PI*3)%(Math.PI*2))-Math.PI;camera.yaw+=dy*k;g.yaw=camera.yaw+(dy-dy*k);
 camera.pitch+=(g.pitch-camera.pitch)*k;camera.dist=Math.exp(Math.log(camera.dist)+(Math.log(g.dist)-Math.log(camera.dist))*k);
 // 카메라가 땅 아래로 가지 않게
 if(camera.mode==='orbit'){for(let i=0;i<40;i++){const a=camera.yaw,p=camera.pitch,d=camera.dist,ex=camera.target[0]+d*Math.sin(a)*Math.cos(p),ez=camera.target[2]+d*Math.cos(a)*Math.cos(p),ey=camera.target[1]+d*Math.sin(p);if(ey>H(ex,ez)+3||camera.pitch>=PMAX)break;camera.pitch=Math.min(PMAX,camera.pitch+.015);g.pitch=Math.max(g.pitch,camera.pitch)}}
 CTL.applied=camSnap()}
function walkUpdate(dt){if(walker)return;if(globalThis.__INW){globalThis.__INWU(dt);return}const typing=document.activeElement&&['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName);
 const f=typing?0:(held.w||held.arrowup?1:0)-(held.s||held.arrowdown?1:0),sd=typing?0:(held.d||held.arrowright?1:0)-(held.a||held.arrowleft?1:0);
 if(!typing){if(held.q)camera.yaw-=1.8*dt;if(held.e)camera.yaw+=1.8*dt}
 const max=6.5*(globalThis.__WSPD||1)*(held.shift?2:1),a=camera.yaw,tx=(Math.sin(a)*f+Math.cos(a)*sd),tz=(-Math.cos(a)*f+Math.sin(a)*sd),l=Math.hypot(tx,tz)||1,tv=[f||sd?tx/l*max:0,f||sd?tz/l*max:0],k=1-Math.exp(-dt*(f||sd?7:10));
 CTL.walkV=[CTL.walkV[0]+(tv[0]-CTL.walkV[0])*k,CTL.walkV[1]+(tv[1]-CTL.walkV[1])*k];const vx=CTL.walkV[0]*dt,vz=CTL.walkV[1]*dt;if(Math.abs(vx)+Math.abs(vz)<1e-5)return;
 const blocked=(x,z)=>!TMASK_IJ((x+320)/4|0,(z+320)/4|0)||B.some(b=>inside(x,z,b.poly)&&!(b.holes||[]).some(h=>inside(x,z,h)));
 let x=camera.pos[0],z=camera.pos[2];if(!blocked(x+vx,z+vz)){x+=vx;z+=vz}else if(!blocked(x+vx,z)){x+=vx;CTL.walkV[1]=0}else if(!blocked(x,z+vz)){z+=vz;CTL.walkV[0]=0}else CTL.walkV=[0,0];camera.pos=[x,H(x,z)+1.8,z]}
// ----- pointer input -----
canvas.style.cursor='grab';
canvas.addEventListener('pointerdown',e=>{$('intro').style.display='none';canvas.setPointerCapture(e.pointerId);CTL.ptrs.set(e.pointerId,[e.clientX,e.clientY]);CTL.vel=[0,0];CTL.downAt=[e.clientX,e.clientY];CTL.moved=0;CTL.last=performance.now();
 if(CTL.ptrs.size===2){const p=[...CTL.ptrs.values()];CTL.mode='pinch';CTL.pinch={d:Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]),ang:Math.atan2(p[1][1]-p[0][1],p[1][0]-p[0][0]),mid:[(p[0][0]+p[1][0])/2,(p[0][1]+p[1][1])/2]};return}
 if(camera.mode==='walk'){CTL.mode='look';return}
 const rot=e.button===2||e.button===1||e.ctrlKey||e.shiftKey||e.altKey;
 if(rot&&camera.mode!=='top'){CTL.mode='rot';canvas.style.cursor='move'}else{CTL.mode='pan';const r=screenRay(e.clientX,e.clientY);CTL.grab=rayGround(r)||rayPlane(r,camera.target[1]);canvas.style.cursor='grabbing'}});
canvas.addEventListener('pointermove',e=>{if(!CTL.ptrs.has(e.pointerId))return;const prev=CTL.ptrs.get(e.pointerId);CTL.ptrs.set(e.pointerId,[e.clientX,e.clientY]);const dx=e.clientX-prev[0],dy=e.clientY-prev[1];CTL.moved=Math.max(CTL.moved,Math.hypot(e.clientX-CTL.downAt[0],e.clientY-CTL.downAt[1]));
 const now=performance.now(),dtm=Math.max(1,now-CTL.last);CTL.last=now;const g=CTL.goal;
 if(CTL.mode==='look'){camera.yaw-=dx*.0042;camera.pitch=clamp(camera.pitch+dy*.0032,-1.1,1.1);return}
 if(!g)return;
 if(CTL.mode==='rot'){g.yaw-=dx*.0042;g.pitch=clamp(g.pitch+dy*.0029,PMIN,PMAX);return}
 if(CTL.mode==='pan'){const ch=canvas.getBoundingClientRect().height||800,ppx=g.dist*1.03/ch,a=g.yaw,fs=Math.min(2.2,1/Math.max(.45,Math.sin(camera.pitch)));/* 화면 1픽셀당 지면 이동량(거리 비례, 낮은 시점 앞뒤 이동 상한) */
  const rx=Math.cos(a),rz=-Math.sin(a),fx=-Math.sin(a),fz=-Math.cos(a),mx=(-dx*rx+dy*fx*fs)*ppx,mz=(-dx*rz+dy*fz*fs)*ppx;
  const nt=clampT([g.t[0]+mx,g.t[1],g.t[2]+mz]);nt[1]=H(nt[0],nt[2]);const mv=[nt[0]-g.t[0],nt[2]-g.t[2]];g.t=nt;CTL.vel=[CTL.vel[0]*.6+mv[0]/dtm*1000*.4,CTL.vel[1]*.6+mv[1]/dtm*1000*.4];return}
 if(CTL.mode==='pinch'&&CTL.ptrs.size===2){const p=[...CTL.ptrs.values()],d=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]),ang=Math.atan2(p[1][1]-p[0][1],p[1][0]-p[0][0]),mid=[(p[0][0]+p[1][0])/2,(p[0][1]+p[1][1])/2],q=CTL.pinch;
  if(camera.mode==='walk'){camera.yaw-=(mid[0]-q.mid[0])*.004}else{zoomAt(mid[0],mid[1],q.d/d,true);if(camera.mode!=='top'){g.yaw+=(ang-q.ang);g.pitch=clamp(g.pitch+(mid[1]-q.mid[1])*.004,PMIN,PMAX)}}CTL.pinch={d,ang,mid}}});
function endPtr(e){if(!CTL.ptrs.has(e.pointerId))return;CTL.ptrs.delete(e.pointerId);if(CTL.mode==='pinch'){if(CTL.ptrs.size===1){const p=[...CTL.ptrs.values()][0];CTL.mode=camera.mode==='walk'?'look':'pan';const r=screenRay(p[0],p[1]);CTL.grab=rayGround(r)||rayPlane(r,camera.target[1])}else if(!CTL.ptrs.size)CTL.mode=null;CTL.vel=[0,0];return}
 if(CTL.ptrs.size)return;const wasPan=CTL.mode==='pan';CTL.mode=null;CTL.grab=null;canvas.style.cursor='grab';
 if(performance.now()-CTL.last>80||!wasPan)CTL.vel=[0,0];
 if(CTL.moved<5&&e.type==='pointerup'){CTL.vel=[0,0];if(!(globalThis.__netPick&&globalThis.__netPick(e))&&!globalThis.__NOPICK)pick(e)}}
canvas.addEventListener('pointerup',endPtr);canvas.addEventListener('pointercancel',endPtr);canvas.addEventListener('contextmenu',e=>e.preventDefault());
function zoomAt(cx,cy,f,instant){const g=CTL.goal;if(!g)return;const nd=clamp(g.dist*f,DMIN,DMAX),r=nd/g.dist;const P=groundAt(cx,cy);if(P&&camera.mode!=='walk'){g.t=clampT([P[0]+(g.t[0]-P[0])*r,P[1]+(g.t[1]-P[1])*r,P[2]+(g.t[2]-P[2])*r])}g.dist=nd;if(instant){camera.target=g.t.slice();camera.dist=g.dist;CTL.applied=camSnap()}}
canvas.addEventListener('wheel',e=>{e.preventDefault();if(camera.mode==='walk')return;const dy=e.deltaMode===1?e.deltaY*33:e.deltaY;zoomAt(e.clientX,e.clientY,Math.exp(clamp(dy,-200,200)*.0012),false)},{passive:false});
canvas.addEventListener('dblclick',e=>{if(camera.mode==='walk')return;zoomAt(e.clientX,e.clientY,e.shiftKey?2:.45,false)});
const zbtn=f=>{if(camera.mode==='walk')return;const r=canvas.getBoundingClientRect();zoomAt(r.left+r.width/2,r.top+r.height/2,f,false)};
$('zoomIn').onclick=()=>zbtn(.6);$('zoomOut').onclick=()=>zbtn(1.65);
let ctlT=0;function ctlLoop(now){const dt=Math.min(.05,ctlT?(now-ctlT)/1000:1/60);ctlT=now;ctlUpdate(dt);requestAnimationFrame(ctlLoop)}requestAnimationFrame(ctlLoop);

