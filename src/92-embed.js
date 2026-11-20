// ===== 지도 부품(embed): 다른 사이트에 cukmap 지도를 넣고, 핀·층·보기를 명령으로 다룬다 (2026-11-18) =====
// 주소: /embed/?view=3d|2d|walk&focus=<건물>&floor=3F&ui=1|0
// 명령은 postMessage 로 받는다. 직접 쓰기보다 /kit/v1/cukmap.js 를 쓰는 게 쉽다(docs/KIT.md).
if(globalThis.CUK_MODE==='embed'){(()=>{
const Q=new URLSearchParams(location.search),UI=Q.get('ui')!=='0',PK=CUKPICK,world=$('gl').parentElement;
const st=document.createElement('style');st.textContent=`
.top,.side,.hud,.intro,#p2hint{display:none!important}
.body{grid-template-columns:minmax(0,1fr)!important}.world{grid-column:1/-1!important}
${UI?'':'.tools,.miniwrap,#wspd,#p2bar,#p2zoom{display:none!important}'}
.toolgrp{display:none}
#cukcredit a{font-weight:700}
#kpins{position:absolute;inset:0;pointer-events:none;z-index:66;overflow:hidden}
.kpin{position:absolute;transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center;pointer-events:auto;cursor:pointer}
.kpin i{width:14px;height:14px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px #0005;background:var(--c,#e8552e)}
.kpin span{order:-1;margin-bottom:3px;background:#fff;border:1px solid #d7e2db;border-radius:7px;padding:2px 7px;font-size:11.5px;font-weight:700;color:#26392f;white-space:nowrap;box-shadow:0 2px 8px #0002;max-width:220px;overflow:hidden;text-overflow:ellipsis}
.kpin.sel span{border-color:var(--c,#e8552e);color:var(--c,#e8552e)}`;document.head.appendChild(st);
const cr=$('cukcredit');if(cr){cr.textContent='';const a=document.createElement('a');a.href='https://cukmap.com/';a.target='_blank';a.rel='noopener';a.textContent='cukmap';cr.append(a,' · 자료: 국토지리정보원, © OpenStreetMap contributors')}
const layer=document.createElement('div');layer.id='kpins';world.appendChild(layer);
const pins=new Map();let sel=null;
const post=(m)=>{try{parent.postMessage(Object.assign({cukmap:1},m),'*')}catch(e){}};
const bInfo=b=>b?{id:b.id||null,code:b.code,name:(b.name||'').split('(')[0].trim()}:null;
// 핀 위치 정하기: {x,z} 또는 {building, floor} 또는 {room}
function place(p){let x=+p.x,z=+p.z,b=null,floor=p.floor||null,y=null;
 if(p.room){const r=PK.findRoom(p.room);if(!r)throw new Error('방을 찾지 못했어요: '+p.room);x=r.x;z=r.z;b=r.b;floor=r.floor}
 else if(!(isFinite(x)&&isFinite(z))){b=PK.findB(p.building);if(!b)throw new Error('건물을 찾지 못했어요: '+p.building);x=b.cx;z=b.cz}
 if(!b)b=PK.findB(p.building)||PK.bAt(x,z)||null;
 y=floor&&b?PK.floorY(b,floor):(isFinite(+p.y)?+p.y:null);return {x,z,y,b,floor}}
function addPin(p){const id=String(p.id!=null?p.id:'pin'+(pins.size+1)),pl=place(p);removePin(id);
 const d=document.createElement('div');d.className='kpin';d.style.setProperty('--c',/^#[0-9a-f]{3,8}$/i.test(p.color||'')?p.color:'#e8552e');
 const t=document.createElement('span');t.textContent=String(p.label??'').slice(0,80);if(!t.textContent)t.style.display='none';d.append(document.createElement('i'),t);
 d.onclick=e=>{e.stopPropagation();select(id);post({event:'pinClick',id})};layer.appendChild(d);pins.set(id,{id,...pl,el:d});return {id,x:pl.x,z:pl.z,floor:pl.floor,building:bInfo(pl.b)}}
function removePin(id){const p=pins.get(String(id));if(p){p.el.remove();pins.delete(String(id))}}
function select(id){sel=id;for(const p of pins.values())p.el.classList.toggle('sel',p.id===id)}
// 평면 지도에서는 그 층을 보고 있을 때만 층이 있는 핀을 보여 준다
function planFloorOk(p){if(!p.floor||!p.b)return true;const P=globalThis.__P2D;if(!P)return true;const ib=P.ibs.find(q=>q.bv===p.b);if(!ib)return true;
 let fi=P.PL.fl[ib.d.code];if(fi==null){fi=ib.d.floors.findIndex(f=>f.id==='1F');if(fi<0)fi=0}return ib.d.floors[fi].id===p.floor}
(function tick(){for(const p of pins.values()){const ok=!globalThis.__P2ON||planFloorOk(p),s=ok?PK.toScreen(p.x,p.y,p.z):null;if(!s){p.el.style.display='none';continue}p.el.style.display='flex';p.el.style.left=s[0]+'px';p.el.style.top=s[1]+'px'}requestAnimationFrame(tick)})();
function setView(v){const id={'3d':'orbitBtn','2d':'planBtn',walk:'walkBtn'}[v];if(!id)throw new Error('보기는 3d, 2d, walk 중 하나예요.');$(id).click()}
async function focus(o){o=o||{};let x=+o.x,z=+o.z,b=null,floor=o.floor||null;
 if(o.room){const r=PK.findRoom(o.room);if(!r)throw new Error('방을 찾지 못했어요: '+o.room);x=r.x;z=r.z;b=r.b;floor=r.floor}
 else if(o.building){b=PK.findB(o.building);if(!b)throw new Error('건물을 찾지 못했어요: '+o.building);if(!(isFinite(x)&&isFinite(z))){x=b.cx;z=b.cz}}
 if(!(isFinite(x)&&isFinite(z)))throw new Error('위치(x, z)나 건물을 알려 주세요.');
 if(globalThis.__P2ON){const P=globalThis.__P2D,PL=P.PL;PL.cx=x;PL.cz=z;PL.s=+o.zoom||Math.max(PL.s,b?4.5:2.6);
  if(b&&floor){const ib=P.ibs.find(q=>q.bv===b);if(ib){const fi=ib.d.floors.findIndex(f=>f.id===floor);if(fi>=0)PL.fl[ib.d.code]=fi}}PL.dirty=true;return}
 const ib=b&&floor&&typeof IB!=='undefined'?IB.find(q=>q.bv===b):null;
 if(ib&&ib.d.floors.some(f=>f.id===floor)){await enterIndoor(ib,floor);if(isFinite(+o.x)){camera.target=[x,camera.target[1],z]}return}
 if(camera.mode==='walk')$('orbitBtn').click();camera.target=[x,(b?H(b.cx,b.cz)+(b.h||10)*.4:H(x,z)+4),z];camera.dist=+o.zoom||(b?Math.max(120,(b.h||10)*6+90):140)}
// 지상 시점으로 그 자리에 서기: {x,z} 위치에서 look({x,z} 또는 building)을 바라본다 — 「같은 각도로 비교하기」용
function walkAt(o){o=o||{};let x=+o.x,z=+o.z;if(o.building&&!(isFinite(x)&&isFinite(z))){const b=PK.findB(o.building);if(!b)throw new Error('건물을 찾지 못했어요: '+o.building);x=b.cx;z=b.cz}
 if(!(isFinite(x)&&isFinite(z)))throw new Error('위치(x, z)를 알려 주세요.');
 let lx=NaN,lz=NaN;const L=o.look||{};if(L.building){const b=PK.findB(L.building);if(b){lx=b.cx;lz=b.cz}}else{lx=+L.x;lz=+L.z}
 if(globalThis.__P2ON||camera.mode!=='walk')$('walkBtn').click();
 camera.mode='walk';camera.pos=[x,H(x,z)+1.8,z];if(isFinite(lx)&&isFinite(lz)&&(lx!==x||lz!==z))camera.yaw=Math.atan2(lx-x,-(lz-z));camera.pitch=.02;if(typeof setMode==='function')setMode()}
function buildings(){return B.map(b=>Object.assign(bInfo(b),{floors:b.floors||null,indoor:typeof IB!=='undefined'&&IB.some(q=>q.bv===b)?IB.find(q=>q.bv===b).d.floors.map(f=>f.id):[]}))}
const CMD={addPin,walkAt,removePin:id=>removePin(id),clearPins:()=>{for(const id of [...pins.keys()])removePin(id)},selectPin:id=>select(String(id)),setView,focus,buildings,
 view:()=>globalThis.__P2ON?'2d':camera.mode==='walk'?'walk':'3d'};
addEventListener('message',async e=>{const m=e.data;if(!m||m.cukmap!==1||!m.cmd)return;const f=CMD[m.cmd];
 try{if(!f)throw new Error('모르는 명령이에요: '+m.cmd);const data=await f(...(Array.isArray(m.args)?m.args:[m.args]));post({reply:m.id,ok:true,data})}catch(err){post({reply:m.id,ok:false,error:String(err&&err.message||err)})}});
// 지도를 누르면 그 위치를 알려 준다(핀 고르기, 위치 받기 등에 씀)
let downAt=null;world.addEventListener('pointerdown',e=>{downAt=[e.clientX,e.clientY]},true);
world.addEventListener('pointerup',e=>{if(!downAt)return;const mv=Math.hypot(e.clientX-downAt[0],e.clientY-downAt[1]);downAt=null;if(mv>6||e.target.closest('.kpin'))return;
 if(!(e.target===$('gl')||e.target.closest('#p2')))return;const p=globalThis.__P2ON?PK.pickPlan(e.clientX,e.clientY):PK.pick3d(e.clientX,e.clientY);if(!p)return;
 post({event:'click',x:+p.x.toFixed(2),z:+p.z.toFixed(2),floor:p.floor||null,building:bInfo(p.b)})},true);
// 처음 보기
(async()=>{const v=Q.get('view');if(v&&v!=='3d')try{setView(v)}catch(e){}
 if(Q.get('focus'))try{await focus({building:Q.get('focus'),floor:Q.get('floor')||null})}catch(e){}
 post({event:'ready',version:'1',buildings:buildings()})})();
globalThis.__KIT=CMD;})()}
