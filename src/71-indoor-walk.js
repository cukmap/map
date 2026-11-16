// ===== 실내 지상 시점 (1인칭) — 벽 충돌, 문 통과, 계단·엘리베이터 층 이동, 출입구로 들고 나기 =====
const IW={ib:null,fi:0,x:0,z:0,y:0};
const iwSt=document.createElement('style');iwSt.textContent=`#iwAct{position:absolute;left:50%;bottom:28px;transform:translateX(-50%);display:none;gap:8px;z-index:31;flex-wrap:wrap;justify-content:center}
#iwAct button{font-size:13.5px;font-weight:800;padding:11px 16px;background:#1f3b2c;color:#fff;border:0;border-radius:12px;box-shadow:0 6px 16px #0003}#iwAct button.go{background:#e8552e}
#iwFl{position:absolute;left:16px;bottom:22px;background:#1f3b2ce6;color:#fff;border-radius:12px;padding:8px 12px;font-size:12px;font-weight:700;z-index:31;display:none}
.iwOn #pins{display:none}#ibar .iwb{font-size:10.5px;font-weight:800;background:#e8552e;color:#fff;border-color:#e8552e;width:auto;padding:7px 4px}`;document.head.appendChild(iwSt);
const iwAct=document.createElement('div');iwAct.id='iwAct';world.appendChild(iwAct);const iwFl=document.createElement('div');iwFl.id='iwFl';world.appendChild(iwFl);
function iwPM(rt,fi,x,z){const gx=Math.round((x-rt.X0)/rt.FG.res),gy=Math.round((z-rt.Z0)/rt.FG.res);if(gx<0||gy<0||gx>=rt.FG.w||gy>=rt.FG.h)return 0;const k=gy*rt.FG.w+gx;return (rt.PM[fi][k>>3]>>(7-(k&7)))&1}
function iwSegs(ib,fi){const rt=ib.rt;rt._seg=rt._seg||[];if(rt._seg[fi])return rt._seg[fi];const H2=new Map(),C=2,key=(i,j)=>i*100003+j;
 for(const e of ib.d.floors[fi].graph.edges){const pl=e[3];if(!pl)continue;for(let i=0;i+3<pl.length;i+=2){const s=[pl[i],pl[i+1],pl[i+2],pl[i+3]];const i0=Math.floor(Math.min(s[0],s[2])/C)-1,i1=Math.floor(Math.max(s[0],s[2])/C)+1,j0=Math.floor(Math.min(s[1],s[3])/C)-1,j1=Math.floor(Math.max(s[1],s[3])/C)+1;
  for(let a=i0;a<=i1;a++)for(let b=j0;b<=j1;b++){const k=key(a,b);if(!H2.has(k))H2.set(k,[]);H2.get(k).push(s)}}}
 return rt._seg[fi]={H2,C,key}}
function iwNearSeg(S,x,z,r){const L=S.H2.get(S.key(Math.floor(x/S.C),Math.floor(z/S.C)));if(!L)return false;for(const s of L){const dx=s[2]-s[0],dz=s[3]-s[1],l2=dx*dx+dz*dz||1e-9;let t=((x-s[0])*dx+(z-s[1])*dz)/l2;t=t<0?0:t>1?1:t;if(Math.hypot(s[0]+dx*t-x,s[1]+dz*t-z)<r)return true}return false}
function iwBit(M,rt,x,z){const gx=Math.round((x-rt.X0)/rt.FG.res),gy=Math.round((z-rt.Z0)/rt.FG.res);if(gx<0||gy<0||gx>=rt.FG.w||gy>=rt.FG.h)return 0;const k=gy*rt.FG.w+gx;return (M[k>>3]>>(7-(k&7)))&1}
function iwOKf(ib,fi,x,z){const rt=ib.rt,cm=rt.CM&&rt.CM[fi];if(cm)return iwBit(cm,rt,x,z);return iwPM(rt,fi,x,z)||iwNearSeg(iwSegs(ib,fi),x,z,.32)}
function iwOK(x,z){return iwOKf(IW.ib,IW.fi,x,z)}
function iwFix(ib,fi,p){if(iwOKf(ib,fi,p[0],p[1]))return p;for(let r=.2;r<5;r+=.2)for(let a=0;a<6.283;a+=.35){const q=[p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r];if(iwOKf(ib,fi,q[0],q[1]))return q}return p}
async function iwLoadCM(ib){const rt=ib.rt;if(!rt.CM)rt.CM=await Promise.all(ib.d.floors.map(f=>f.cmask?inflateB64(f.cmask):null));return rt.CM}
function iwSpawn(ib,fi){const rt=ib.rt,d=ib.d;const a=rt.att.find(q=>q.fi===fi);if(a)return {p:a.p,face:[a.p[0]-a.n.x,a.p[1]-a.n.z]};
 for(const x of d.xlinks){const n=x.fa===fi?x.na:x.fb===fi?x.nb:null;if(n!=null){const p=d.floors[fi].graph.nodes[n];return {p,face:null}}}
 const [X0,Z0,X1,Z1]=d.bounds,cx=(X0+X1)/2,cz=(Z0+Z1)/2;let best=null,bd=1e9;d.floors[fi].graph.nodes.forEach(p=>{const dd=Math.hypot(p[0]-cx,p[1]-cz);if(dd<bd){bd=dd;best=p}});return best?{p:best,face:null}:null}
async function iwStart(ib,fi,at){await buildIndoor(ib);await iwLoadCM(ib);if(IN.b!==ib)await enterIndoor(ib,ib.d.floors[fi].id,true);const sp=at||iwSpawn(ib,fi);if(!sp){return}
 const fp=iwFix(ib,fi,sp.p);IW.ib=ib;IW.fi=fi;IW.y=ib.rt.floors[fi].y;IW.x=fp[0];IW.z=fp[1];setIndoorFloor(fi);globalThis.__INW=IW;document.body.classList.add('iwOn');
 camera.mode='walk';camera.pos=[IW.x,IW.y+1.6,IW.z];const [X0,Z0,X1,Z1]=ib.d.bounds;const f=sp.face||[(X0+X1)/2-IW.x,(Z0+Z1)/2-IW.z];camera.yaw=Math.atan2(f[0],-f[1]);camera.pitch=0;
 if(typeof setMode==='function')setMode();else if(typeof modeUI==='function')modeUI();iwFloorTag();iwButtons()}
function iwStop(){globalThis.__INW=null;IW.ib=null;document.body.classList.remove('iwOn');iwAct.style.display='none';iwFl.style.display='none';iwButtons()}
function iwFloorTag(){if(!IW.ib)return;iwFl.style.display='block';iwFl.textContent=`${IW.ib.d.name.split('(')[0]} ${IFN(IW.ib.d.floors[IW.fi].id)} · 실내 지상 시점`}
let iwVel=[0,0];
globalThis.__INWU=dt=>{const typing=document.activeElement&&['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName);
 const f=typing?0:(held.w||held.arrowup?1:0)-(held.s||held.arrowdown?1:0),sd=typing?0:(held.d||held.arrowright?1:0)-(held.a||held.arrowleft?1:0);
 if(!typing){if(held.q)camera.yaw-=1.8*dt;if(held.e)camera.yaw+=1.8*dt}
 const max=5,a=camera.yaw,tx=Math.sin(a)*f+Math.cos(a)*sd,tz=-Math.cos(a)*f+Math.sin(a)*sd,l=Math.hypot(tx,tz)||1,tv=[f||sd?tx/l*max:0,f||sd?tz/l*max:0],k=1-Math.exp(-dt*(f||sd?8:12));
 iwVel=[iwVel[0]+(tv[0]-iwVel[0])*k,iwVel[1]+(tv[1]-iwVel[1])*k];let vx=iwVel[0]*dt,vz=iwVel[1]*dt;
 if(Math.abs(vx)+Math.abs(vz)>1e-5){const n=Math.ceil(Math.hypot(vx,vz)/.08);vx/=n;vz/=n;for(let i=0;i<n;i++){if(iwOK(IW.x+vx,IW.z+vz)){IW.x+=vx;IW.z+=vz}else if(iwOK(IW.x+vx,IW.z)){IW.x+=vx;iwVel[1]=0}else if(iwOK(IW.x,IW.z+vz)){IW.z+=vz;iwVel[0]=0}else{iwVel=[0,0];break}}}
 camera.pos=[IW.x,IW.y+1.6,IW.z]};
// ---- nearby actions (stairs / exits / outdoor entrances)
let iwNear={};
function iwLinks(){const ib=IW.ib,rt=ib.rt,out={};for(const x of ib.d.xlinks){for(const [fa,na,fb,nb] of [[x.fa,x.na,x.fb,x.nb],[x.fb,x.nb,x.fa,x.na]]){if(fa!==IW.fi)continue;const p=rt.NP[rt.OFF[fa]+na],d=Math.hypot(p[0]-IW.x,p[1]-IW.z);if(d>2.6)continue;const dir=fb>fa?'up':'down';if(!out[dir]||d<out[dir].d)out[dir]={d,fi:fb,p:rt.NP[rt.OFF[fb]+nb]}}}return out}
function iwFloor(dir){const L=iwNear[dir];if(!L)return;const fp=iwFix(IW.ib,L.fi,L.p);IW.fi=L.fi;IW.y=IW.ib.rt.floors[L.fi].y;IW.x=fp[0];IW.z=fp[1];iwVel=[0,0];setIndoorFloor(L.fi);camera.pos=[IW.x,IW.y+1.6,IW.z];iwFloorTag();globalThis.__onIWFloor&&globalThis.__onIWFloor()}
function iwExit(){const a=iwNear.exit;if(!a)return;const ib=IW.ib,b=ib.bv;iwStop();exitIndoor();let ox=a.n.x-(b?b.cx:a.p[0]),oz=a.n.z-(b?b.cz:a.p[1]);const l=Math.hypot(ox,oz)||1;ox/=l;oz/=l;
 const x=a.n.x+ox*2.2,z=a.n.z+oz*2.2;camera.mode='walk';camera.pos=[x,H(x,z)+1.8,z];camera.yaw=Math.atan2(ox,-oz);camera.pitch=0;if(typeof setMode==='function')setMode()}
let iwPrep=null;function iwPrepare(){return iwPrep||(iwPrep=(async()=>{for(const ib of IB)if(ib.ents.length)await buildIndoor(ib)})())}
function iwOutdoorNear(){if(!iwPrep){iwPrepare();return null}const x=camera.pos[0],z=camera.pos[2];let best=null;for(const ib of IB){if(!ib.rt)continue;for(const a of ib.rt.att){const d=Math.hypot(a.n.x-x,a.n.z-z);if(d<4.5&&(!best||d<best.d))best={d,ib,a}}}return best}
function iwEnter(){const e=iwNear.enter;if(!e)return;iwStart(e.ib,e.a.fi,{p:e.a.p,face:[e.a.p[0]-e.a.n.x,e.a.p[1]-e.a.n.z]})}
const iwRunPh=()=>globalThis.__CR&&globalThis.__CR.CR&&globalThis.__CR.CR.phase;const iwBusy=()=>{const p=iwRunPh();return !!p&&p!=='indoor'};const iwInRun=()=>iwRunPh()==='indoor';
function iwTick(){requestAnimationFrame(iwTick);if(IW.ib&&(camera.mode!=='walk'||IN.b!==IW.ib)){iwStop()}
 if(iwBusy()){iwAct.style.display='none';return}
 let html='';iwNear={};
 if(IW.ib){const L=iwLinks();iwNear.up=L.up;iwNear.down=L.down;const rt=IW.ib.rt;for(const a of rt.att){if(a.fi!==IW.fi)continue;const d=Math.hypot(a.p[0]-IW.x,a.p[1]-IW.z);if(d<2.6&&(!iwNear.exit||d<iwNear.exit.d))iwNear.exit={...a,d}}
  if(L.up)html+=`<button data-k="up">[R] ${IFN(IW.ib.d.floors[L.up.fi].id)}으로 ↑</button>`;if(L.down)html+=`<button data-k="down">[F] ${IFN(IW.ib.d.floors[L.down.fi].id)}으로 ↓</button>`;
  if(iwNear.exit&&!iwInRun())html+=`<button class="go" data-k="exit">[Space] 밖으로 · ${iwNear.exit.n.nm}</button>`}
 else if(camera.mode==='walk'){const e=iwOutdoorNear();if(e){iwNear.enter=e;html=`<button class="go" data-k="enter">[Space] ${e.ib.d.name.split('(')[0]} 들어가기 · ${IFN(e.a.n.fl)}</button>`}}
 if(html!==iwAct._h){iwAct._h=html;iwAct.innerHTML=html;iwAct.querySelectorAll('button').forEach(b=>b.onclick=()=>iwDo(b.dataset.k))}iwAct.style.display=html?'flex':'none'}
function iwDo(k){if(k==='up'||k==='down')iwFloor(k);else if(k==='exit')iwExit();else if(k==='enter')iwEnter()}
requestAnimationFrame(iwTick);
addEventListener('keydown',e=>{if(iwBusy()||['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;const k=e.key.toLowerCase();
 if(k===' '&&!iwInRun()&&(iwNear.exit||iwNear.enter)){e.preventDefault();e.stopImmediatePropagation();iwDo(iwNear.exit?'exit':'enter')}
 else if(IW.ib&&k==='r'){e.preventDefault();e.stopImmediatePropagation();iwFloor('up')}else if(IW.ib&&k==='f'){e.preventDefault();e.stopImmediatePropagation();iwFloor('down')}},true);
// ---- buttons: floor bar & top "지상 시점"
function iwButtons(){const old=ibar.querySelector('.iwb');if(old)old.remove();if(!IN.b||iwBusy())return;const b=document.createElement('button');b.className='iwb';
 if(IW.ib){b.textContent='위에서 보기';b.onclick=()=>{const ib=IW.ib,fi=IW.fi;iwStop();if(document.pointerLockElement)document.exitPointerLock();enterIndoor(ib,ib.d.floors[fi].id,true)}}
 else{b.textContent='지상 시점';b.onclick=()=>{iwStart(IN.b,IN.cur);try{const r=canvas.requestPointerLock();if(r&&r.catch)r.catch(()=>{})}catch(e){}}}
 const x=ibar.querySelector('.x');ibar.insertBefore(b,x||null)}
{const _ei=enterIndoor;enterIndoor=async function(...a){const r=await _ei(...a);iwButtons();return r}}
{const _sf=setIndoorFloor;setIndoorFloor=function(i){_sf(i);if(IW.ib&&i!==IW.fi){/* floor button while walking → respawn there */const sp=iwSpawn(IW.ib,i);if(sp&&!iwInRun()){const fp=iwFix(IW.ib,i,sp.p);IW.fi=i;IW.y=IW.ib.rt.floors[i].y;IW.x=fp[0];IW.z=fp[1];camera.pos=[IW.x,IW.y+1.6,IW.z];iwFloorTag()}}}}
{const wb=$('walkBtn');setTimeout(()=>{const prev=wb.onclick;wb.onclick=e=>{if(IN.b&&IN.b.rt&&!iwBusy()){iwStart(IN.b,IN.cur);try{const r=canvas.requestPointerLock();if(r&&r.catch)r.catch(()=>{})}catch(er){}}else if(prev)prev(e)}},0)}
globalThis.__IW={IW,iwStart,iwStop,iwOK,iwFloor,iwExit,iwEnter,near:()=>iwNear};

// ---- 문 표시: 복도 쪽에서 보이는 문짝 + 호실 번호판 (방 내부는 구현하지 않음)
function iwDoorsOf(ib,fi){const f=ib.d.floors[fi];const out=[];for(const d of (f.doors||[])){if(!out.some(q=>Math.hypot(q[0]-d[0],q[1]-d[1])<1.2))out.push(d)}return out}
function iwDoorMesh(ib){const rt=ib.rt;if(rt.DM)return rt.DM;rt.DM=ib.d.floors.map((f,fi)=>{const m=[],y=rt.floors[fi].y;for(const d of iwDoorsOf(ib,fi)){const nx=d[2]-d[0],nz=d[3]-d[1],nl=Math.hypot(nx,nz)||1,ux=-nz/nl,uz=nx/nl,hw=Math.min(.75,d[4]*.5),ox=nx/nl*.06,oz=nz/nl*.06;
  const a=[d[0]-ux*hw+ox,d[1]-uz*hw+oz],b=[d[0]+ux*hw+ox,d[1]+uz*hw+oz];quad(m,[a[0],y,a[1]],[b[0],y,b[1]],[b[0],y+2.1,b[1]],[a[0],y+2.1,a[1]],[.58,.40,.26]);
  const fr=.07;for(const [p,q] of [[[a[0]-ux*fr,a[1]-uz*fr],a],[b,[b[0]+ux*fr,b[1]+uz*fr]]])quad(m,[p[0]+ox,y,p[1]+oz],[q[0]+ox,y,q[1]+oz],[q[0]+ox,y+2.2,q[1]+oz],[p[0]+ox,y+2.2,p[1]+oz],[.30,.30,.32]);
  quad(m,[a[0]-ux*fr+ox,y+2.1,a[1]-uz*fr+oz],[b[0]+ux*fr+ox,y+2.1,b[1]+uz*fr+oz],[b[0]+ux*fr+ox,y+2.2,b[1]+uz*fr+oz],[a[0]-ux*fr+ox,y+2.2,a[1]-uz*fr+oz],[.30,.30,.32])}
  return m.length?upload(m):null});return rt.DM}
globalThis.__IWD=(f,i,rt)=>{const ib=IN.b;if(!ib||ib.rt!==rt)return;const DM=iwDoorMesh(ib);if(DM[i])renderObj(DM[i],camera.mvp,0)};
const iwDL=document.createElement('div');iwDL.style.cssText='position:absolute;inset:0;pointer-events:none;overflow:hidden';world.appendChild(iwDL);
const iwDS=document.createElement('style');iwDS.textContent='.iwdt{position:absolute;transform:translate(-50%,-100%);white-space:nowrap;font-size:11px;font-weight:800;background:#23412ff0;color:#fff;border-radius:6px;padding:2px 6px;line-height:1.2;text-align:center}.iwdt small{display:block;font-weight:600;font-size:9.5px;color:#cfe3d4}.iwdt.dst{background:#e8552e}';document.head.appendChild(iwDS);
let iwDT={key:'',els:[]};
function iwDoorTags(){const ib=IW.ib;if(!ib){if(iwDT.key){iwDL.textContent='';iwDT={key:'',els:[]}}return}const key=ib.bi+':'+IW.fi+':'+(IN.dst?IN.dst.id:'');
 if(iwDT.key!==key){iwDL.textContent='';const f=ib.d.floors[IW.fi];iwDT={key,els:iwDoorsOf(ib,IW.fi).map(d=>{const l=f.labels[d[5]];const el=document.createElement('div');el.className='iwdt'+(IN.dst===l?' dst':'');el.innerHTML=`${l.id}${l.name?'<small>'+l.name.replace(/[<>&]/g,'')+'</small>':''}`;iwDL.appendChild(el);return {el,p:[d[2],ib.rt.floors[IW.fi].y+2.45,d[3]]}})}}
 for(const t of iwDT.els){const dd=Math.hypot(t.p[0]-IW.x,t.p[2]-IW.z);const p=dd<22?project(t.p):null;if(p){t.el.style.display='block';t.el.style.left=p[0]+'px';t.el.style.top=p[1]+'px';t.el.style.opacity=dd<12?1:.6}else t.el.style.display='none'}}
(function iwDLoop(){requestAnimationFrame(iwDLoop);iwDoorTags()})();


