// ===== 블록 세계 (2026-11-27): 학교 전체를 1m 블록으로(마인크래프트처럼). 고양이 찾기 같은 놀이용 =====
// map.blockWorld({on:true}) 를 부르면 원래 지도(땅·건물·나무)를 숨기고, 같은 자리에 블록으로 지은 학교를 보여 준다.
// - 땅: 지형 높이를 1m 계단으로. 맨 윗칸은 잔디/길/찻길/계단 색, 그 아래는 흙·돌
// - 건물: 바닥 외곽을 바둑판 방향에 맞춰 살짝 돌린 뒤 외벽(층마다 창 줄)·지붕·바닥, 출입구는 뚫음. 속은 비어 있음
// - 나무: 지도의 나무 위치·높이·수관 크기로 줄기 + 잎 덩어리
// 1인칭 걷기(voxelFly)는 globalThis.__BW 로 이 세계의 블록을 밟고 부딪힌다. 한 칸(1m)은 저절로 올라선다.
if(globalThis.CUK_MODE==='embed'){(()=>{
const CH=32,COL={grass:'#6aa84f',grassOut:'#5f9446',dirt:'#8b6b47',stone:'#8a8d8f',path:'#cdbd9d',road:'#7d7f82',steps:'#b3a68d',glass:'#a9cde0',trunk:'#6b4a2b',floor:'#bfb6a3'};
const LEAF=['#3f7d3a','#4f8f3e','#467f35','#5a9a44','#c9772a','#d9a43a','#b8452c'];
let W0=null; // 세계 자료
const key=(i,j,k)=>i+','+j+','+k,ckey=(a,b,c)=>a+','+b+','+c;
const hex=c=>{const n=parseInt(c.slice(1),16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]};
const RGB=new Map(),rgbOf=c=>{let v=RGB.get(c);if(!v){v=hex(c);RGB.set(c,v)}return v};
function setup(){if(W0)return W0;const VG=globalThis.__VGRID,G=VG.G,CO=VG.CO,SI=VG.SI;
  const camp=(DATA.campus&&DATA.campus.length>2)?DATA.campus:[[-320,-320],[320,-320],[320,320],[-320,320]];
  let gi0=1e9,gi1=-1e9,gk0=1e9,gk1=-1e9;for(const p of camp){const g=G(p[0],p[1]);gi0=Math.min(gi0,g[0]);gi1=Math.max(gi1,g[0]);gk0=Math.min(gk0,g[1]);gk1=Math.max(gk1,g[1])}
  gi0=Math.floor(gi0)-24;gk0=Math.floor(gk0)-24;gi1=Math.ceil(gi1)+24;gk1=Math.ceil(gk1)+24;const NI=gi1-gi0,NK=gk1-gk0;
  const toW=(gx,gz)=>[gx*CO-gz*SI,gx*SI+gz*CO];
  const HT=new Int16Array(NI*NK),SUR=new Uint8Array(NI*NK);
  // 캠퍼스 안팎
  const campG=camp.map(p=>G(p[0],p[1]));
  for(let r=0;r<NK;r++){const zc=gk0+r+.5,xs=[];for(let a=0,b=campG.length-1;a<campG.length;b=a++){const p=campG[a],q=campG[b];if((p[1]>zc)!==(q[1]>zc))xs.push(p[0]+(zc-p[1])*(q[0]-p[0])/(q[1]-p[1]))}xs.sort((a,b)=>a-b);
    for(let c=0;c<NI;c++){const xc=gi0+c+.5;let inside=false;for(let t=0;t+1<xs.length;t+=2)if(xc>=xs[t]&&xc<=xs[t+1])inside=true;SUR[r*NI+c]=inside?0:4;const w=toW(xc,zc);HT[r*NI+c]=Math.round(H(w[0],w[1]))}}
  // 길: 종류별 폭으로 칠함
  const WID={service:5,pedestrian:4,footway:2.2,steps:2.4},ST={service:2,pedestrian:1,footway:1,steps:3};
  for(const [ty,pts] of DATA.roads||[]){const w=(WID[ty]||2)/2,sv=ST[ty]||1;for(let a=0;a+1<pts.length;a++){const p=G(pts[a][0],pts[a][1]),q=G(pts[a+1][0],pts[a+1][1]),L=Math.hypot(q[0]-p[0],q[1]-p[1]),n=Math.max(1,Math.ceil(L/.5));
    for(let t=0;t<=n;t++){const x=p[0]+(q[0]-p[0])*t/n,z=p[1]+(q[1]-p[1])*t/n;for(let dx=-Math.ceil(w);dx<=Math.ceil(w);dx++)for(let dz=-Math.ceil(w);dz<=Math.ceil(w);dz++){if(dx*dx+dz*dz>w*w+.3)continue;const c=Math.floor(x+dx)-gi0,r=Math.floor(z+dz)-gk0;if(c>=0&&r>=0&&c<NI&&r<NK&&SUR[r*NI+c]!==4&&!(SUR[r*NI+c]===2&&sv===1))SUR[r*NI+c]=sv}}}}
  // 땅 아래 채울 깊이: 이웃보다 낮은 곳까지(절벽에 구멍이 안 보이게)
  const LOW=new Int16Array(NI*NK);for(let r=0;r<NK;r++)for(let c=0;c<NI;c++){const q=r*NI+c;let m=HT[q];if(c>0)m=Math.min(m,HT[q-1]);if(c<NI-1)m=Math.min(m,HT[q+1]);if(r>0)m=Math.min(m,HT[q-NI]);if(r<NK-1)m=Math.min(m,HT[q+NI]);LOW[q]=m-2}
  // 건물
  const BI=new Map(),put=e=>{for(let a=Math.floor(e.i0/16);a<=Math.floor((e.i0+e.ni)/16);a++)for(let c=Math.floor(e.k0/16);c<=Math.floor((e.k0+e.nk)/16);c++){const K=a+','+c;if(!BI.has(K))BI.set(K,[]);BI.get(K).push(e)}};
  const raster=rings=>{let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const r of rings)for(const p of r){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1])}
    const i0=Math.floor(x0)-1,k0=Math.floor(z0)-1,ni=Math.floor(x1)+2-i0,nk=Math.floor(z1)+2-k0,m=new Uint8Array(ni*nk);
    for(let r=0;r<nk;r++){const zc=k0+r+.5,xs=[];for(const R of rings)for(let a=0,b=R.length-1;a<R.length;b=a++){const p=R[a],q=R[b];if((p[1]>zc)!==(q[1]>zc))xs.push(p[0]+(zc-p[1])*(q[0]-p[0])/(q[1]-p[1]))}xs.sort((a,b)=>a-b);
      for(let t=0;t+1<xs.length;t+=2){const ia=Math.ceil(xs[t]-.5)-i0,ib=Math.floor(xs[t+1]-.5)-i0;for(let c=Math.max(0,ia);c<=Math.min(ni-1,ib);c++)m[r*ni+c]=1}}
    for(let r=0;r<nk;r++)for(let c=0;c<ni;c++){const q=r*ni+c;if(!m[q])continue;if(c===0||r===0||c===ni-1||r===nk-1||!m[q-1]||!m[q+1]||!m[q-ni]||!m[q+ni])m[q]=2}return {i0,k0,ni,nk,m}};
  const BL=[];
  for(const b of B){if(!b.poly||b.poly.length<3)continue;const [sx,sy]=(()=>{let a=0,c=0;const P=b.poly;for(let t=0;t<P.length;t++){const p=P[t],q=P[(t+1)%P.length],dx=q[0]-p[0],dz=q[1]-p[1],L=Math.hypot(dx,dz),th=Math.atan2(dz,dx)*4;a+=Math.cos(th)*L;c+=Math.sin(th)*L}return [a,c]})();
    let d=Math.atan2(sy,sx)/4-VG.TH;d-=Math.PI/2*Math.round(d/(Math.PI/2));const cd=Math.cos(-d),sd=Math.sin(-d),cx=b.cx,cz=b.cz,sn=p=>[cx+(p[0]-cx)*cd-(p[1]-cz)*sd,cz+(p[0]-cx)*sd+(p[1]-cz)*cd],gp=p=>G(...sn(p));
    const parts=[],sp=b.spec;try{if(sp&&sp.parts&&sp.parts.length){const lvl1=sp.datum!=null?sp.datum:Math.min(...b.poly.map(p=>H(p[0],p[1])))+(sp.lift||0);
        for(const pt of sp.parts){const base=lvl1+(pt.base||0),top=base+pt.height,fh=Math.max(2.8,(pt.height-(pt.parapet>0?pt.parapet:0))/Math.max(1,pt.floors||1)),bot=pt.bottom>0?base+pt.bottom:(pt.pilotis?base+pt.pilotis*fh:base);
          parts.push({rings:[pt.poly,...(pt.holes||[])],bot,top,wall:typeof pt.wall==='string'?pt.wall:'#e8e2d4',roof:typeof pt.roofColor==='string'?pt.roofColor:'#9a948a',pil:pt.pilotis?base:null})}}
      else if(isFinite(b.roof))parts.push({rings:[b.poly,...(b.holes||[])],bot:Math.min(...b.poly.map(p=>H(p[0],p[1]))),top:b.roof,wall:'#e8e2d4',roof:'#9a948a'})}catch(e){continue}
    const ents=[];for(const p of parts){const R=raster(p.rings.map(r=>r.map(gp)));const e=Object.assign(R,{b,jb:Math.round(p.bot),jt:Math.max(Math.round(p.bot)+2,Math.round(p.top)-1),wall:p.wall,roof:p.roof,door:null});ents.push(e);put(e)}
    BL.push({b,sn,ents})}
  W0={G,toW,gi0,gk0,NI,NK,HT,SUR,LOW,BI,BL,TREE:new Map(),TB:new Map(),doors:new Set()};
  // 나무: 줄기 + 잎 덩어리(건물 안·찻길 위는 건너뜀)
  const rnd=(x,z)=>Math.abs(Math.sin(x*12.9898+z*78.233)*43758.5453)%1;
  for(const t of (DATA.vegetation&&DATA.vegetation.trees)||[]){const g=G(t[0],t[1]),i=Math.floor(g[0]),k=Math.floor(g[1]),c=i-gi0,r=k-gk0;if(c<1||r<1||c>=NI-1||r>=NK-1)continue;if(SUR[r*NI+c]===2||bStat(i,HT[r*NI+c]+1,k))continue;
    const base=HT[r*NI+c],th=Math.max(3,Math.min(7,Math.round((t[2]||8)*.42))),rr=Math.max(2,Math.min(4,Math.round((t[3]||4)*.55))),ru=rnd(t[0],t[1]),lc=ru<.22?LEAF[4+Math.floor(ru*13)%3]:LEAF[Math.floor(ru*40)%4];
    for(let y=0;y<th;y++)W0.TREE.set(key(i,base+y,k),COL.trunk);
    const cy=base+th;for(let a=-rr;a<=rr;a++)for(let b2=-rr+1;b2<=rr;b2++)for(let e2=-rr;e2<=rr;e2++){if(a*a+b2*b2*1.4+e2*e2>rr*rr+.5)continue;if(rnd(i+a+b2,k+e2*3)<.08)continue;const K=key(i+a,cy+b2,k+e2);if(!W0.TREE.has(K))W0.TREE.set(K,lc)}
    const TK=Math.floor(i/32)+','+Math.floor(k/32);W0.TB.set(TK,Math.max(W0.TB.get(TK)||0,cy+rr+1))}
  loadDoors();return W0}
// 건물 판정: 그 칸이 어느 건물 안이면 {e, m}
function bStat(i,j,k,E){const L=E||(W0&&W0.BI.get(Math.floor(i/16)+','+Math.floor(k/16)));if(!L)return null;for(const e of L){const c=i-e.i0,r=k-e.k0;if(c<0||r<0||c>=e.ni||r>=e.nk)continue;const m=e.m[r*e.ni+c];if(m)return {e,m}}return null}
// 한 칸의 블록 색(없으면 null)
function cellAt(i,j,k,E,noT){const w=W0,c=i-w.gi0,r=k-w.gk0;if(c<0||r<0||c>=w.NI||r>=w.NK)return null;const q=r*w.NI+c,h=w.HT[q];
  const bs=bStat(i,j,k,E);
  if(bs){const e=bs.e;if(j>e.jt)return null;if(j===e.jt)return e.roof;
    if(j>e.jb){if(bs.m!==2)return null;if(w.doors.size&&w.doors.has(key(i,j,k)))return null;const fl=(j-e.jb)%4;return (fl===2||fl===1)&&((i+k)%3!==0)?COL.glass:e.wall}
    if(j===e.jb)return COL.floor;if(j>=Math.min(w.LOW[q],e.jb-3))return COL.dirt;return null}
  const t=!noT&&w.TREE.size?w.TREE.get(key(i,j,k)):null;if(t)return t;
  if(j<h&&j>=w.LOW[q]){if(j===h-1){const s=w.SUR[q];return s===0?COL.grass:s===4?COL.grassOut:s===1?COL.path:s===2?COL.road:COL.steps}return j>=h-3?COL.dirt:COL.stone}
  return null}
// 출입구: 경로망 출입구 위치에 폭 3칸·높이 3칸 구멍
let DL=false;async function loadDoors(){if(DL)return;DL=true;try{const d=await (await fetch('/data/v1/entrances.json')).json();const VG=globalThis.__VGRID;
  for(const e of d.entrances||[]){const bl=W0.BL.find(q=>q.b.code&&q.b.code===e.buildingCode)||W0.BL.find(q=>q.b.name&&e.building&&q.b.name.startsWith(e.building));if(!bl)continue;
    const x0=(e.at[1]-126.8013923)*88270,z0=(37.4867837-e.at[0])*110950;let y=null;try{y=CUKPICK.floorY(bl.b,e.floor)}catch(_){}if(!isFinite(y))y=H(x0,z0);const g=VG.G(...bl.sn([x0,z0])),i=Math.floor(g[0]),k=Math.floor(g[1]),j0=Math.round(y);
    for(let a=-2;a<=2;a++)for(let c=-2;c<=2;c++){if(a*a+c*c>5)continue;for(let j=j0;j<j0+3;j++){W0.doors.add(key(i+a,j,k+c));dirty(ckey(Math.floor((i+a)/CH),Math.floor(j/CH),Math.floor((k+c)/CH)))}}}}catch(e){console.warn('출입구',e)}}
// ---- 덩어리(32m) 메시: 같은 색 면을 크게 합침
const MESH=new Map(),Q=[],QS=new Set();let qh=0;
function dirty(C){if(QS.has(C)||!MESH.has(C))return;QS.add(C);Q.push(C)} // 이미 지은 덩어리만 다시(대기 중이면 그대로 둠)
const N1=CH+2,GC=new Array(N1*N1*N1),mask=new Array(CH*CH);
function rebuild(C){const w=W0,p=C.split(',').map(Number),i0=p[0]*CH,j0=p[1]*CH,k0=p[2]*CH,VG=globalThis.__VGRID,CO=VG.CO,SI=VG.SI;
  const E=[];const seen=new Set();for(let a=Math.floor((i0-1)/16);a<=Math.floor((i0+CH)/16);a++)for(let c=Math.floor((k0-1)/16);c<=Math.floor((k0+CH)/16);c++){const L=w.BI.get(a+','+c);if(L)for(const e of L)if(!seen.has(e)){seen.add(e);E.push(e)}}
  let hasT=false;for(let a=-1;a<=1&&!hasT;a++)for(let c=-1;c<=1;c++)if((w.TB.get((p[0]+a)+','+(p[2]+c))||-1e9)>=j0-1){hasT=true;break}
  let any=false;for(let a=0;a<N1;a++)for(let b=0;b<N1;b++)for(let c=0;c<N1;c++){const v=cellAt(i0+a-1,j0+b-1,k0+c-1,E,!hasT);GC[(a*N1+b)*N1+c]=v;if(v&&a&&b&&c&&a<N1-1&&b<N1-1&&c<N1-1)any=true}
  const old=MESH.get(C);if(old&&old.buffer)gl.deleteBuffer(old.buffer);
  if(!any){MESH.set(C,{n:0});return}
  const m=[],ST=[N1*N1,N1,1],B0=N1*N1+N1+1,base=[i0,j0,k0];
  for(let d=0;d<3;d++){const u=(d+1)%3,v=(d+2)%3,su=ST[u],sv=ST[v],sd=ST[d];for(const sg of [1,-1]){const nx=d===0?sg:0,ny=d===1?sg:0,nz=d===2?sg:0,wnx=nx*CO-nz*SI,wnz=nx*SI+nz*CO;
    for(let x=0;x<CH;x++){let has=false;const bx=B0+x*sd;for(let a=0;a<CH;a++)for(let b=0;b<CH;b++){const q=bx+a*su+b*sv,mi=a*CH+b;const g=GC[q];if(!g||GC[q+sg*sd]){mask[mi]=null;continue}mask[mi]=g;has=true}
      if(!has)continue;const pl=x+(sg>0?1:0);
      for(let a=0;a<CH;a++)for(let b=0;b<CH;){const col=mask[a*CH+b];if(!col){b++;continue}let wd=1;while(b+wd<CH&&mask[a*CH+b+wd]===col)wd++;let h=1;grow:while(a+h<CH){for(let t=0;t<wd;t++)if(mask[(a+h)*CH+b+t]!==col)break grow;h++}
        for(let y=0;y<h;y++)for(let t=0;t<wd;t++)mask[(a+y)*CH+b+t]=null;
        const rgb=rgbOf(col),sh=d===1?(sg>0?1.04:.7):(d===0?.92:.86),cr=rgb[0]*sh,cg=rgb[1]*sh,cb=rgb[2]*sh;
        const P=[[a,b],[a+h,b],[a+h,b+wd],[a,b],[a+h,b+wd],[a,b+wd]];for(const [au,bv] of P){const Q3=[0,0,0];Q3[d]=pl;Q3[u]=au;Q3[v]=bv;const gx=base[0]+Q3[0],gy=base[1]+Q3[1],gz=base[2]+Q3[2];m.push(gx*CO-gz*SI,gy,gx*SI+gz*CO,wnx,ny,wnz,cr,cg,cb,0,0)}
        b+=wd}}}}
  const o=upload(m);o.src=undefined;o.__keep=1;o.cx=(p[0]+.5)*CH;o.cz=(p[2]+.5)*CH;MESH.set(C,o)}
function planChunks(px,pz,R){const w=W0,out=[];const g=w.G(px,pz);R=R||1e9;
  for(let a=Math.floor(w.gi0/CH);a<=Math.floor((w.gi0+w.NI)/CH);a++)for(let c=Math.floor(w.gk0/CH);c<=Math.floor((w.gk0+w.NK)/CH);c++){let lo=1e9,hi=-1e9;
    for(let i=a*CH;i<(a+1)*CH;i+=2)for(let k=c*CH;k<(c+1)*CH;k+=2){const cc=i-w.gi0,r=k-w.gk0;if(cc<0||r<0||cc>=w.NI||r>=w.NK)continue;const q=r*w.NI+cc;lo=Math.min(lo,w.LOW[q]);hi=Math.max(hi,w.HT[q])}
    if(lo>hi)continue;for(let bb=Math.floor((a*CH-1)/16);bb<=Math.floor(((a+1)*CH)/16);bb++)for(let dd=Math.floor((c*CH-1)/16);dd<=Math.floor(((c+1)*CH)/16);dd++)for(const e of w.BI.get(bb+','+dd)||[]){hi=Math.max(hi,e.jt+1);lo=Math.min(lo,e.jb-4)}
    hi=Math.max(hi,w.TB.get(a+','+c)||0);
    const dist=Math.hypot((a+.5)*CH-g[0],(c+.5)*CH-g[1]);if(dist>R)continue;for(let j=Math.floor((lo-1)/CH);j<=Math.floor((hi+1)/CH);j++)out.push({C:ckey(a,j,c),d:dist})}
  out.sort((x,y)=>x.d-y.d);return out}
let on=false,lastPlan=0;const NEAR=new Set();
function plan(px,pz){for(const {C} of planChunks(px,pz,190))if(!MESH.has(C)&&!QS.has(C)){QS.add(C);Q.push(C)}}
const prevC=globalThis.__CAN;globalThis.__CAN=()=>{prevC&&prevC();if(!on)return;const t0=performance.now();while(qh<Q.length&&performance.now()-t0<10){const C=Q[qh++];QS.delete(C);rebuild(C);NEAR.delete(C)}
  if(t0-lastPlan>2000){lastPlan=t0;const e=camera.eye;if(e)plan(e[0],e[2])}if(qh>=Q.length&&qh){Q.length=0;qh=0}
  const ey=camera.eye||[0,0,0],eg=W0.G(ey[0],ey[2]);for(const o of MESH.values()){if(!o.n)continue;if(Math.abs(o.cx-eg[0])>230||Math.abs(o.cz-eg[1])>230)continue;renderObj(o,camera.mvp,0)}};
// 1인칭 걷기가 쓰는 판정
const api={solid(x,y,z){if(!W0)return false;const g=W0.G(x,z);return cellAt(Math.floor(g[0]),Math.floor(y),Math.floor(g[1]))!=null},
  top(x,z,yMax){if(!W0)return H(x,z);const g=W0.G(x,z),i=Math.floor(g[0]),k=Math.floor(g[1]);for(let j=Math.floor(yMax+.01)-1,n=0;n<80;j--,n++)if(cellAt(i,j,k)!=null)return j+1;const c=i-W0.gi0,r=k-W0.gk0;return c>=0&&r>=0&&c<W0.NI&&r<W0.NK?W0.HT[r*W0.NI+c]:H(x,z)}};
function blockWorld(o){o=o||{};
  if(o.on===false){on=false;globalThis.__BW=null;for(const m of MESH.values())if(m.buffer)gl.deleteBuffer(m.buffer);MESH.clear();Q.length=0;qh=0;QS.clear();return {on:false}}
  if(!on){setup();on=true;globalThis.__BW=api;const sh=globalThis.__SHOFF;globalThis.__SHOFF=()=>globalThis.__BW?true:!!(sh&&sh());
    let px=+o.x,pz=+o.z;if(!(isFinite(px)&&isFinite(pz))){const b=CUKPICK.findB(o.building||'니콜스관');px=b?b.cx:0;pz=b?b.cz:0}
    for(const {C,d} of planChunks(px,pz,190)){QS.add(C);Q.push(C);if(d<64)NEAR.add(C)}lastPlan=performance.now()}
  return {on:true,chunks:Q.length-qh,built:MESH.size,near:NEAR.size}}
Object.assign(globalThis.__KIT||{},{blockWorld});
globalThis.__BWDBG={cellAt:(...a)=>cellAt(...a),get W(){return W0},MESH,left:()=>Q.length-qh};
})()}
