// ===== 건물 벽 칠하기 (지도 부품용) — 2026-11-21 =====
// 건물 외곽을 바라보는 방향(북·동·남·서)으로 「면」을 나누고, 층마다 한 칸씩 색을 덮는다.
// 학과 땅따먹기·공동 그림판 같은 하위 주소 프로젝트가 쓴다. 기본 지도 데이터는 바꾸지 않고 위에 얇은 판만 얹는다.
if(globalThis.CUK_MODE==='embed'){(()=>{
const PK=CUKPICK,SIDES=['북','동','남','서'],COLW=4; // 칸 너비: 면을 약 4m 폭의 세로 줄(col)로도 나눌 수 있다
// 면 나누기: 바깥쪽 방향(지도 북쪽 = -z)으로 네 갈래
function sidesOf(b){const poly=b.poly,sg=ringSign(poly),out={};
 for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],L=Math.hypot(q[0]-p[0],q[1]-p[1]);if(L<1.5)continue;
  const nx=sg*(q[1]-p[1])/L,nz=-sg*(q[0]-p[0])/L,a=Math.atan2(nx,-nz),k=((Math.round(a/(Math.PI/2))%4)+4)%4,s=SIDES[k];
  (out[s]=out[s]||[]).push({p,q,n:[nx,nz],L})}
 for(const k in out){let c=0;for(const e of out[k]){e.s0=c;c+=e.L}out[k].total=c;out[k].cols=Math.max(1,Math.round(c/COLW))}
 return out}
function lvOf(b){if(b.lv)return b.lv;const fl=b.floors||3;return {datum:(b.ground!=null?b.ground+.4:H(b.cx,b.cz))+((b.spec&&b.spec.lift)||0),fh:Math.max(3,(b.h||fl*3.6)/fl)}}
function floorsOf(b){const n=b.floors||3,a=[];if(b.basementFloors)for(let i=b.basementFloors;i>=1;i--)a.push('B'+i);for(let i=1;i<=n;i++)a.push(i+'F');return a}
function band(b,fl){const lv=lvOf(b),y0=fl[0]==='B'?lv.datum-(+fl.slice(1))*lv.fh:lv.datum+(parseInt(fl)-1)*lv.fh;return [y0,y0+lv.fh]}
let obj=null;const cells=new Map();
function rebuild(){const m=[];for(const c of cells.values()){const b=c.b,sd=sidesOf(b)[c.side];if(!sd)continue;const [y0,y1]=band(b,c.floor),top=b.roof||1e9;
  const ya=y0+.15,yb=Math.min(y1-.15,top-.1);if(yb<=ya)continue;
  const w=sd.total/sd.cols,a0=c.col==null?0:c.col*w,a1=c.col==null?sd.total:(c.col+1)*w;
  for(const e of sd){const u0=Math.max(a0,e.s0),u1=Math.min(a1,e.s0+e.L);if(u1-u0<.05)continue;const t0=(u0-e.s0)/e.L,t1=(u1-e.s0)/e.L,g=c.col==null?0:.06;
   const o=.22,A=t=>[e.p[0]+(e.q[0]-e.p[0])*t,e.p[1]+(e.q[1]-e.p[1])*t],pa=A(t0+(u0===a0?g/e.L:0)),pb=A(t1-(u1===a1?g/e.L:0)),P=(pt,y)=>[pt[0]+e.n[0]*o,y,pt[1]+e.n[1]*o];
   quad(m,P(pa,ya),P(pb,ya),P(pb,yb),P(pa,yb),c.rgb)}}
 obj=m.length?upload(m):null}
const prev=globalThis.__CAN;globalThis.__CAN=()=>{prev&&prev();if(obj&&!hide){gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-2,-4);renderObj(obj,camera.mvp,0);gl.disable(gl.POLYGON_OFFSET_FILL)}};
let hide=false;
const rgb=h=>{const m=/^#?([0-9a-f]{6})$/i.exec(h||'');if(!m)throw new Error('색은 #rrggbb 모양으로 알려 주세요.');return [0,2,4].map(i=>parseInt(m[1].slice(i,i+2),16)/255)};
const info=b=>({id:b.id||null,code:b.code||null,name:b.name});
// 명령: 면 목록, 칠하기, 지우기, 칠 숨기기
function faces(name){const b=PK.findB(name);if(!b)throw new Error('건물을 찾지 못했어요: '+name);const s=sidesOf(b);
 return {building:info(b),sides:SIDES.filter(k=>s[k]).map(k=>({side:k,width:+s[k].total.toFixed(1),cols:s[k].cols})),floors:floorsOf(b)}}
function paint(list){for(const it of [].concat(list||[])){const b=PK.findB(it.building);if(!b)throw new Error('건물을 찾지 못했어요: '+it.building);
  if(!SIDES.includes(it.side))throw new Error('면은 북·동·남·서 중 하나예요.');if(!floorsOf(b).includes(it.floor))throw new Error(`${b.name}에는 ${it.floor} 층이 없어요.`);
  const col=it.col==null?null:+it.col,sd=sidesOf(b)[it.side];if(!sd)throw new Error(`${b.name}에는 ${it.side}쪽 면이 없어요.`);if(col!=null&&!(col>=0&&col<sd.cols&&Number.isInteger(col)))throw new Error(`${b.name} ${it.side}쪽 면의 칸(col)은 0~${sd.cols-1}이에요.`);
  const k=b.name+'|'+it.side+'|'+it.floor+'|'+(col==null?'':col);if(it.color==null)cells.delete(k);else cells.set(k,{b,side:it.side,floor:it.floor,col,rgb:rgb(it.color)})}
 rebuild();return cells.size}
function clearPaint(){cells.clear();rebuild();return 0}
function showPaint(on){hide=on===false;return !hide}
// 3D에서 누른 점이 어느 면·몇 층인지 (클릭 알림에 덧붙임)
globalThis.__FACEAT=(b,x,y,z)=>{if(!b||!isFinite(y))return null;const s=sidesOf(b);let best=null;
 for(const k in s)for(const e of s[k]){const dx=e.q[0]-e.p[0],dz=e.q[1]-e.p[1],t=Math.max(0,Math.min(1,((x-e.p[0])*dx+(z-e.p[1])*dz)/(e.L*e.L))),d=Math.hypot(e.p[0]+dx*t-x,e.p[1]+dz*t-z);if(!best||d<best.d)best={d,side:k,col:Math.min(s[k].cols-1,Math.floor((e.s0+t*e.L)/(s[k].total/s[k].cols)))}}
 let fl=null;for(const f of floorsOf(b)){const [a,c]=band(b,f);if(y>=a-.05&&y<c)fl=f}
 return best&&best.d<4?{side:best.side,level:fl,col:best.col}:null};
// 지형·건물 모양 내보내기: 하위 주소 프로젝트가 자기만의 화면(예: 블록 세상)을 만들 때 쓴다. 본 지도가 고쳐지면 같이 바뀐다
function shape(o){o=o||{};const x0=+o.x0,z0=+o.z0,x1=+o.x1,z1=+o.z1,st=Math.max(.5,+o.step||1);if(![x0,z0,x1,z1].every(isFinite))throw new Error('범위(x0, z0, x1, z1)를 알려 주세요.');
 const nx=Math.min(800,Math.floor((x1-x0)/st)+1),nz=Math.min(800,Math.floor((z1-z0)/st)+1),h=new Array(nx*nz);for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)h[j*nx+i]=+H(x0+i*st,z0+j*st).toFixed(2);
 const inBox=b=>b.poly.some(p=>p[0]>=x0-20&&p[0]<=x1+20&&p[1]>=z0-20&&p[1]<=z1+20),out=[];
 for(const b of B){if(!b.poly||!inBox(b))continue;const parts=[];
  if(b.spec){const lift=b.spec.lift||0,lvl1=b.spec.datum!=null?b.spec.datum:Math.min(...b.poly.map(p=>H(...p)))+lift;
   for(const pt of b.spec.parts){const base=lvl1+(pt.base||0),top=base+pt.height,fh=Math.max(2.8,(pt.height-(pt.parapet>0?pt.parapet:0))/pt.floors);parts.push({poly:pt.poly,holes:pt.holes||[],bottom:pt.bottom>0?base+pt.bottom:(pt.pilotis?base+pt.pilotis*fh:null),top:+top.toFixed(2),wall:pt.wall||null,roof:pt.roofColor||null})}}
  else parts.push({poly:b.poly,holes:b.holes||[],bottom:null,top:+(b.roof||0).toFixed(2),wall:null,roof:null});
  out.push({name:b.name,code:b.code||null,parts})}
 // 실내(도면이 있는 건물만): 층마다 벽·창·문 선분과 바닥 외곽, 방 이름. 화면에 보여 주는 지도와 같은 자료다
 let indoor=null;if(o.indoor&&typeof IB!=='undefined'){const bb=PK.findB(o.indoor),ib=bb&&IB.find(q=>q.bv===bb);if(ib){const d=ib.d,_lv=bb.lv,_top=Math.max(bb.floors||0,...d.floors.map(f=>{const m=/^(\d+)F$/.exec(f.id);return m?+m[1]:0}));
  indoor={building:bb.name,bounds:d.bounds,floors:d.floors.map(f=>({id:f.id,y:+(_lv?lvFloorY(_lv,f.id,_top):ib.base+f.y).toFixed(2),walls:f.walls,wins:f.wins||[],doors:(f.doors||[]).map(q=>q.slice(0,5)),slab:(f.slabs||[])[0]||null,stairs:f.stairs||[],labels:(f.labels||[]).map(l=>({id:l.id,name:l.name,x:l.x,z:l.z}))}))}}}
 return {x0,z0,step:st,nx,nz,heights:h,buildings:out,indoor}}
Object.assign(globalThis.__KIT||{},{faces,paint,clearPaint,showPaint,shape});
})()}
