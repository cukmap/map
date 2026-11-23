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
// ===== 벽 도화지 (2026-11-23): 건물 외벽을 「크게 꺾이는 모서리」에서 잘라 펼친 긴 띠. 띠 하나 = 도화지 한 장 =====
// 외벽은 바닥 외곽을 위로 세운 모양이라, 휘거나 들쭉날쭉해도 찢지 않고 평평하게 펼칠 수 있다(u = 띠를 따라 간 거리, v = 높이).
// 그림은 벽 바로 앞(3cm)에 얇게 입히고, 창·차양·기둥은 그 앞에 그대로 남는다.
const SHEETS=new Map();let sheetOn=false;const SHOFF=.03,CUT=60*Math.PI/180;
function sheetsOf(b){if(b._sheets)return b._sheets;const out=[];if(!b.poly)return b._sheets=out;
 const groups=new Map();
 if(b.spec){const lift=b.spec.lift||0,lvl1=b.spec.datum!=null?b.spec.datum:Math.min(...b.poly.map(p=>H(...p)))+lift;
  for(const pt of b.spec.parts){const key=JSON.stringify(pt.poly.map(p=>[+p[0].toFixed(1),+p[1].toFixed(1)])),base=lvl1+(pt.base||0),top=base+pt.height,foot=Math.min(...pt.poly.map(p=>H(...p)))-.4,bot=pt.bottom>0?base+pt.bottom:foot;
   const g=groups.get(key);if(g){g.y0=Math.min(g.y0,bot);g.y1=Math.max(g.y1,top)}else groups.set(key,{poly:pt.poly,y0:bot,y1:top})}}
 else groups.set('0',{poly:b.poly,y0:(b.ground!=null?b.ground:Math.min(...b.poly.map(p=>H(...p)))-.4),y1:b.roof||((b.ground||0)+(b.h||10))});
 let gi=0;for(const g of groups.values()){const P=g.poly,n=P.length,sg=ringSign(P),E=[];
  for(let i=0;i<n;i++){const p=P[i],q=P[(i+1)%n],L=Math.hypot(q[0]-p[0],q[1]-p[1]);if(L<.05)continue;E.push({p,q,L,d:[(q[0]-p[0])/L,(q[1]-p[1])/L]})}
  if(!E.length)continue;const turn=(a,c)=>Math.acos(Math.max(-1,Math.min(1,a.d[0]*c.d[0]+a.d[1]*c.d[1])));
  // 크게 꺾이는 곳에서 시작하도록 돌린 뒤 자른다
  let st=E.findIndex((e,i)=>turn(E[(i-1+E.length)%E.length],e)>CUT);if(st<0)st=0;const R=E.slice(st).concat(E.slice(0,st));
  let cur=[];const flush=()=>{if(!cur.length)return;let c=0;const segs=cur.map(e=>{const o={...e,s0:c};c+=e.L;return o});if(c>=3)out.push({id:`${b.code||b.name}-${gi}-${out.length}`,b,segs,L:c,y0:g.y0,y1:g.y1,sg});cur=[]};
  R.forEach((e,i)=>{if(i&&turn(R[i-1],e)>CUT)flush();cur.push(e)});flush();gi++}
 return b._sheets=out}
function sheetMesh(S){const m=[],H0=S.y1-S.y0;for(const e of S.segs){const nx=S.sg*e.d[1],nz=-S.sg*e.d[0],P=(pt,y)=>[pt[0]+nx*SHOFF,y,pt[1]+nz*SHOFF],u0=e.s0/S.L,u1=(e.s0+e.L)/S.L;
  const A=P(e.p,S.y0),Bq=P(e.q,S.y0),C=P(e.q,S.y1),D=P(e.p,S.y1),N=[nx,0,nz],c=[1,1,1];
  for(const [v,uv] of [[A,[u0,0]],[Bq,[u1,0]],[C,[u1,1]],[A,[u0,0]],[C,[u1,1]],[D,[u0,1]]])m.push(...v,...N,...c,...uv)}
 return upload(m)}
function texFrom(img,clear){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
 if(img)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array(clear?[0,0,0,0]:[250,250,248,255]));gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);return t}
let WHITE=null,CLEAR=null,blank=false; // blank: 그림 없는 도화지를 흰 벽으로 보여 줄지
const prevC=globalThis.__CAN;globalThis.__CAN=()=>{prevC&&prevC();if(!sheetOn||!SHEETS.size)return;if(!WHITE){WHITE=texFrom(null);CLEAR=texFrom(null,true)}
 gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-1,-2);gl.activeTexture(gl.TEXTURE0);
 for(const S of SHEETS.values()){if(!S.obj)S.obj=sheetMesh(S);if(!S.tex&&!blank)continue;gl.bindTexture(gl.TEXTURE_2D,S.tex||WHITE);renderObj(S.obj,camera.mvp,2.05)} // 2.05 = 벽 도화지 전용(투명한 곳은 버림)
 gl.disable(gl.POLYGON_OFFSET_FILL)};
const floorLines=S=>{const b=S.b,lv=b.lv;if(!lv)return[];const a=[];for(let k=-(b.basementFloors||0);k<=(b.floors||0);k++){const y=lv.datum+(k-(k>0?1:0))*lv.fh;if(k===0)continue;const v=y-S.y0;if(v>0&&v<S.y1-S.y0)a.push({floor:k>0?k+'F':'B'+(-k),v:+v.toFixed(2)})}return a};
const sheetInfo=S=>({id:S.id,building:S.b.name,length:+S.L.toFixed(2),height:+(S.y1-S.y0).toFixed(2),folds:S.segs.slice(1).filter((e,i)=>Math.acos(Math.max(-1,Math.min(1,S.segs[i].d[0]*e.d[0]+S.segs[i].d[1]*e.d[1])))>.25).map(e=>+e.s0.toFixed(2)),floors:floorLines(S)});
// 명령: 도화지 목록·보이기·그림 입히기
function sheets(o){o=o||{};const names=[].concat(o.buildings||o.building||[]),res=[];for(const n of names){const b=PK.findB(n);if(!b)throw new Error('건물을 찾지 못했어요: '+n);for(const S of sheetsOf(b)){SHEETS.set(S.id,S);res.push(sheetInfo(S))}}
 if(o.show!==false)sheetOn=true;return res}
function sheetPaint(id,url){const S=SHEETS.get(id);if(!S)throw new Error('도화지를 찾지 못했어요: '+id);return new Promise((ok,no)=>{const im=new Image();im.onload=()=>{if(S.tex)gl.deleteTexture(S.tex);S.tex=texFrom(im);ok(true)};im.onerror=()=>no(new Error('그림을 읽지 못했어요.'));im.src=url})}
function showSheets(on,o){sheetOn=on!==false;if(o&&'blank' in o)blank=!!o.blank;return sheetOn}
// 3D에서 누른 점이 어느 도화지의 어디(u, v m)인지
globalThis.__SHEETAT=(b,x,y,z)=>{if(!sheetOn||!b||!isFinite(y))return null;let best=null;for(const S of sheetsOf(b)){if(!SHEETS.has(S.id))continue;for(const e of S.segs){const t=Math.max(0,Math.min(1,((x-e.p[0])*e.d[0]+(z-e.p[1])*e.d[1])/e.L)),d=Math.hypot(e.p[0]+e.d[0]*e.L*t-x,e.p[1]+e.d[1]*e.L*t-z);if(!best||d<best.d)best={d,S,u:e.s0+t*e.L}}}
 if(!best||best.d>3)return null;return {sheet:best.S.id,su:+best.u.toFixed(2),sv:+Math.max(0,Math.min(best.S.y1-best.S.y0,y-best.S.y0)).toFixed(2)}};
Object.assign(globalThis.__KIT||{},{faces,paint,clearPaint,showPaint,shape,sheets,sheetPaint,showSheets});
})()}
