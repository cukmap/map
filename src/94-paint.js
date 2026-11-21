// ===== 건물 벽 칠하기 (지도 부품용) — 2026-11-21 =====
// 건물 외곽을 바라보는 방향(북·동·남·서)으로 「면」을 나누고, 층마다 한 칸씩 색을 덮는다.
// 학과 땅따먹기·공동 그림판 같은 하위 주소 프로젝트가 쓴다. 기본 지도 데이터는 바꾸지 않고 위에 얇은 판만 얹는다.
if(globalThis.CUK_MODE==='embed'){(()=>{
const PK=CUKPICK,SIDES=['북','동','남','서'];
// 면 나누기: 바깥쪽 방향(지도 북쪽 = -z)으로 네 갈래
function sidesOf(b){const poly=b.poly,sg=ringSign(poly),out={};
 for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],L=Math.hypot(q[0]-p[0],q[1]-p[1]);if(L<1.5)continue;
  const nx=sg*(q[1]-p[1])/L,nz=-sg*(q[0]-p[0])/L,a=Math.atan2(nx,-nz),k=((Math.round(a/(Math.PI/2))%4)+4)%4,s=SIDES[k];
  (out[s]=out[s]||[]).push({p,q,n:[nx,nz],L})}
 return out}
function lvOf(b){if(b.lv)return b.lv;const fl=b.floors||3;return {datum:(b.ground!=null?b.ground+.4:H(b.cx,b.cz))+((b.spec&&b.spec.lift)||0),fh:Math.max(3,(b.h||fl*3.6)/fl)}}
function floorsOf(b){const n=b.floors||3,a=[];if(b.basementFloors)for(let i=b.basementFloors;i>=1;i--)a.push('B'+i);for(let i=1;i<=n;i++)a.push(i+'F');return a}
function band(b,fl){const lv=lvOf(b),y0=fl[0]==='B'?lv.datum-(+fl.slice(1))*lv.fh:lv.datum+(parseInt(fl)-1)*lv.fh;return [y0,y0+lv.fh]}
let obj=null;const cells=new Map();
function rebuild(){const m=[];for(const c of cells.values()){const b=c.b,sd=sidesOf(b)[c.side];if(!sd)continue;const [y0,y1]=band(b,c.floor),top=b.roof||1e9;
  const ya=y0+.15,yb=Math.min(y1-.15,top-.1);if(yb<=ya)continue;
  for(const e of sd){const o=.22,P=(pt,y)=>[pt[0]+e.n[0]*o,y,pt[1]+e.n[1]*o];quad(m,P(e.p,ya),P(e.q,ya),P(e.q,yb),P(e.p,yb),c.rgb)}}
 obj=m.length?upload(m):null}
const prev=globalThis.__CAN;globalThis.__CAN=()=>{prev&&prev();if(obj&&!hide){gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-2,-4);renderObj(obj,camera.mvp,0);gl.disable(gl.POLYGON_OFFSET_FILL)}};
let hide=false;
const rgb=h=>{const m=/^#?([0-9a-f]{6})$/i.exec(h||'');if(!m)throw new Error('색은 #rrggbb 모양으로 알려 주세요.');return [0,2,4].map(i=>parseInt(m[1].slice(i,i+2),16)/255)};
const info=b=>({id:b.id||null,code:b.code||null,name:b.name});
// 명령: 면 목록, 칠하기, 지우기, 칠 숨기기
function faces(name){const b=PK.findB(name);if(!b)throw new Error('건물을 찾지 못했어요: '+name);const s=sidesOf(b);
 return {building:info(b),sides:SIDES.filter(k=>s[k]).map(k=>({side:k,width:+s[k].reduce((a,e)=>a+e.L,0).toFixed(1)})),floors:floorsOf(b)}}
function paint(list){for(const it of [].concat(list||[])){const b=PK.findB(it.building);if(!b)throw new Error('건물을 찾지 못했어요: '+it.building);
  if(!SIDES.includes(it.side))throw new Error('면은 북·동·남·서 중 하나예요.');if(!floorsOf(b).includes(it.floor))throw new Error(`${b.name}에는 ${it.floor} 층이 없어요.`);
  const k=b.name+'|'+it.side+'|'+it.floor;if(it.color==null)cells.delete(k);else cells.set(k,{b,side:it.side,floor:it.floor,rgb:rgb(it.color)})}
 rebuild();return cells.size}
function clearPaint(){cells.clear();rebuild();return 0}
function showPaint(on){hide=on===false;return !hide}
// 3D에서 누른 점이 어느 면·몇 층인지 (클릭 알림에 덧붙임)
globalThis.__FACEAT=(b,x,y,z)=>{if(!b||!isFinite(y))return null;const s=sidesOf(b);let best=null;
 for(const k in s)for(const e of s[k]){const dx=e.q[0]-e.p[0],dz=e.q[1]-e.p[1],t=Math.max(0,Math.min(1,((x-e.p[0])*dx+(z-e.p[1])*dz)/(e.L*e.L))),d=Math.hypot(e.p[0]+dx*t-x,e.p[1]+dz*t-z);if(!best||d<best.d)best={d,side:k}}
 let fl=null;for(const f of floorsOf(b)){const [a,c]=band(b,f);if(y>=a-.05&&y<c)fl=f}
 return best&&best.d<4?{side:best.side,level:fl}:null};
Object.assign(globalThis.__KIT||{},{faces,paint,clearPaint,showPaint});
})()}
