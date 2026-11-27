// ===== 블록 쌓기 (지도 부품용) — 2026-11-26 =====
// 지도 위에 25cm 블록을 쌓고·지우고·칠한다. 기본 지도 데이터는 바꾸지 않고 위에 얹기만 한다.
// 칸 좌표: i = floor(x/0.25), j = floor(y/0.25), k = floor(z/0.25). y는 지도 높이(m) 그대로.
// 명령: voxelMode({tool:'add'|'remove'|'paint'|'stamp'|null, color, size, stamp:[[di,dj,dk,'#hex'],…]}),
//       voxelApply([[i,j,k,'#hex'|null],…]), voxelReset([[i,j,k,'#hex'],…]), voxelInfo()
// 이벤트: 'voxel' {cells:[[i,j,k,c|null]], before:[[i,j,k,c|null]]} — 사람이 직접 바꾼 것만. 받은 쪽이 서버에 올린다.
if(globalThis.CUK_MODE==='embed'){(()=>{
const S=.25,CH=16,MAX=250000;
const VOX=new Map(),CHUNK=new Map(),DIRTY=new Set(),MESH=new Map();
const key=(i,j,k)=>i+','+j+','+k,ck=(i,j,k)=>Math.floor(i/CH)+','+Math.floor(j/CH)+','+Math.floor(k/CH);
const hex=c=>{const n=parseInt(c.slice(1),16);return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]};
const post=m=>{try{parent.postMessage(Object.assign({cukmap:1},m),'*')}catch(e){}};
function setCell(i,j,k,c){const K=key(i,j,k),C=ck(i,j,k);if(c){if(!VOX.has(K)&&VOX.size>=MAX)return false;VOX.set(K,c==='air'?{i,j,k,c,air:true}:{i,j,k,c,rgb:hex(c)});if(!CHUNK.has(C))CHUNK.set(C,new Set());CHUNK.get(C).add(K)}else{VOX.delete(K);const s=CHUNK.get(C);if(s)s.delete(K)}
  DIRTY.add(C);// 이웃 덩어리의 맞닿은 면도 다시
  for(const [a,b,d] of [[i-1,j,k],[i+1,j,k],[i,j-1,k],[i,j+1,k],[i,j,k-1],[i,j,k+1]]){const C2=ck(a,b,d);if(C2!==C)DIRTY.add(C2)}return true}
const F=[[1,0,0,[[1,0,0],[1,1,0],[1,1,1],[1,0,1]]],[-1,0,0,[[0,0,1],[0,1,1],[0,1,0],[0,0,0]]],[0,1,0,[[0,1,0],[0,1,1],[1,1,1],[1,1,0]]],[0,-1,0,[[0,0,0],[1,0,0],[1,0,1],[0,0,1]]],[0,0,1,[[1,0,1],[1,1,1],[0,1,1],[0,0,1]]],[0,0,-1,[[0,0,0],[0,1,0],[1,1,0],[1,0,0]]]];
function cube(m,i,j,k,rgb,all,grow){const g=grow||0;for(const [nx,ny,nz,q] of F){if(!all&&VOX.has(key(i+nx,j+ny,k+nz)))continue;const v=q.map(([a,b,d])=>[(i+a)*S+(a?g:-g),(j+b)*S+(b?g:-g),(k+d)*S+(d?g:-g)]);
  for(const t of [0,1,2,0,2,3])m.push(v[t][0],v[t][1],v[t][2],nx,ny,nz,rgb[0],rgb[1],rgb[2],0,0)}}
// ===== 건물도 블록으로 (2026-11-27) =====
// 1인칭에서 가까운 건물부터 25cm 블록으로 바꿔 그린다: 외벽 한 겹 + 지붕 + 바닥, 출입구는 뚫어 둔다.
// 실내 도면이 있는 건물은 층마다 바닥판과 벽을 도면대로 세우고, 없는 건물은 속이 빈 공간이다.
// 건물 블록은 계산으로 만들고 저장하지 않는다. 사람이 부수거나 칠한 칸만 VOX에 남는다('air' = 부순 건물 칸).
const BCOL={floor:'#cfc8b8',iwall:'#efeae0',roof:'#bdb8ad',wall:'#e8e2d4'};
let BIDX=null;const VSKIP=globalThis.__VSKIP=[];
function rasterPoly(rings){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const r of rings)for(const p of r){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1])}
  const i0=Math.floor(x0/S)-1,k0=Math.floor(z0/S)-1,ni=Math.floor(x1/S)+2-i0,nk=Math.floor(z1/S)+2-k0,m=new Uint8Array(ni*nk);
  for(let r=0;r<nk;r++){const zc=(k0+r+.5)*S,xs=[];for(const R of rings)for(let a=0,b=R.length-1;a<R.length;b=a++){const p=R[a],q=R[b];if((p[1]>zc)!==(q[1]>zc))xs.push(p[0]+(zc-p[1])*(q[0]-p[0])/(q[1]-p[1]))}xs.sort((a,b)=>a-b);
    for(let t=0;t+1<xs.length;t+=2){const ia=Math.ceil(xs[t]/S-.5)-i0,ib=Math.floor(xs[t+1]/S-.5)-i0;for(let c=Math.max(0,ia);c<=Math.min(ni-1,ib);c++)m[r*ni+c]=1}}
  for(let r=0;r<nk;r++)for(let c=0;c<ni;c++){const q=r*ni+c;if(!m[q])continue;if(c===0||r===0||c===ni-1||r===nk-1||!m[q-1]||!m[q+1]||!m[q-ni]||!m[q+ni])m[q]=2}
  return {i0,k0,ni,nk,m}}
function rasterSegs(w){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let t=0;t+3<w.length;t+=4){x0=Math.min(x0,w[t],w[t+2]);x1=Math.max(x1,w[t],w[t+2]);z0=Math.min(z0,w[t+1],w[t+3]);z1=Math.max(z1,w[t+1],w[t+3])}
  const i0=Math.floor(x0/S)-1,k0=Math.floor(z0/S)-1,ni=Math.floor(x1/S)+2-i0,nk=Math.floor(z1/S)+2-k0,m=new Uint8Array(ni*nk);
  for(let t=0;t+3<w.length;t+=4){const L=Math.hypot(w[t+2]-w[t],w[t+3]-w[t+1]),n=Math.max(1,Math.ceil(L/(S/3)));for(let q=0;q<=n;q++){const x=w[t]+(w[t+2]-w[t])*q/n,z=w[t+1]+(w[t+3]-w[t+1])*q/n;m[(Math.floor(z/S)-k0)*ni+Math.floor(x/S)-i0]=2}}
  return {i0,k0,ni,nk,m}}
function bvAll(){if(BIDX)return;BIDX=new Map();
  const put=e=>{for(let a=Math.floor(e.i0/32);a<=Math.floor((e.i0+e.ni)/32);a++)for(let c=Math.floor(e.k0/32);c<=Math.floor((e.k0+e.nk)/32);c++){const K=a+','+c;if(!BIDX.has(K))BIDX.set(K,[]);BIDX.get(K).push(e)}};
  for(const b of B){if(!b.poly||b.poly.length<3)continue;const ents=[],parts=[];b._bents=ents;b._door=new Set();const sp=b.spec;
    try{if(sp&&sp.parts&&sp.parts.length){const lvl1=sp.datum!=null?sp.datum:Math.min(...b.poly.map(p=>H(p[0],p[1])))+(sp.lift||0);
      for(const pt of sp.parts){const base=lvl1+(pt.base||0),top=base+pt.height,fh=Math.max(2.8,(pt.height-(pt.parapet>0?pt.parapet:0))/Math.max(1,pt.floors||1)),bot=pt.bottom>0?base+pt.bottom:(pt.pilotis?base+pt.pilotis*fh:base);
        parts.push({rings:[pt.poly,...(pt.holes||[])],bot,top,wall:typeof pt.wall==='string'?pt.wall:BCOL.wall,roof:typeof pt.roofColor==='string'?pt.roofColor:BCOL.roof})}}
     else if(isFinite(b.roof)){parts.push({rings:[b.poly,...(b.holes||[])],bot:Math.min(...b.poly.map(p=>H(p[0],p[1]))),top:b.roof,wall:BCOL.wall,roof:BCOL.roof})}}catch(e){continue}
    for(const p of parts){const e=Object.assign(rasterPoly(p.rings),{b,t:'p',jb:Math.floor(p.bot/S),jt:Math.ceil(p.top/S)-1,wall:p.wall,roof:p.roof});ents.push(e);put(e)}
    const ib=typeof IB!=='undefined'&&IB.find(q=>q.bv===b);
    if(ib)try{const d=ib.d,lv=b.lv,top=Math.max(b.floors||0,...d.floors.map(f=>{const m=/^(\d+)F$/.exec(f.id);return m?+m[1]:0}));
      const fl=d.floors.map(f=>({f,y:lv?lvFloorY(lv,f.id,top):ib.base+f.y})).filter(q=>isFinite(q.y)).sort((a,c)=>a.y-c.y);
      fl.forEach((q,n)=>{const sj=Math.floor(q.y/S)-1,nj=n+1<fl.length?Math.floor(fl[n+1].y/S)-1:sj+Math.round(3.6/S);
        for(const sl of q.f.slabs||[])if(sl&&sl.length>2){const e=Object.assign(rasterPoly([sl]),{b,t:'s',j:sj,col:BCOL.floor});ents.push(e);put(e)}
        if(q.f.walls&&q.f.walls.length>=4){const e=Object.assign(rasterSegs(q.f.walls),{b,t:'w',j0:sj+1,j1:nj-1,col:BCOL.iwall});ents.push(e);put(e)}})}catch(e){console.warn('실내 블록',e)}}}
// 건물이 그 칸에 두는 블록 색(없으면 null). 켜진(가까이 간) 건물만
function bcell(i,j,k){if(!BIDX)return null;const L=BIDX.get(Math.floor(i/32)+','+Math.floor(k/32));if(!L)return null;let out=null;
  for(const e of L){if(!e.b._act)continue;const c=i-e.i0,r=k-e.k0;if(c<0||r<0||c>=e.ni||r>=e.nk)continue;const m=e.m[r*e.ni+c];if(!m)continue;
    if(e.t==='p'){if(j<e.jb||j>e.jt)continue;if(m===2||j===e.jt||j===e.jb){if(e.b._door.size&&e.b._door.has(key(i,j,k)))continue;return j===e.jt?e.roof:(m===2?e.wall:BCOL.floor)}}
    else if(e.t==='s'){if(j===e.j&&!out)out=e.col}
    else if(e.j0<=j&&j<=e.j1&&!out&&!(e.b._door.size&&e.b._door.has(key(i,j,k))))out=e.col}
  return out}
const eff=(i,j,k)=>{const u=VOX.get(key(i,j,k));if(u)return u.air?null:u.c;return bcell(i,j,k)};
// 출입구 뚫기(경로망 출입구 자료). 폭 약 2.5m, 높이 2.4m
let DOORS=false;
async function loadDoors(){if(DOORS)return;DOORS=true;try{const d=await (await fetch('/data/v1/entrances.json')).json();
  for(const e of d.entrances||[]){const b=B.find(q=>q.code&&q.code===e.buildingCode&&q._bents)||B.find(q=>q._bents&&q.name&&e.building&&q.name.startsWith(e.building));if(!b)continue;
    const x=(e.at[1]-126.8013923)*88270,z=(37.4867837-e.at[0])*110950;let y=null;try{y=CUKPICK.floorY(b,e.floor)}catch(_){}if(!isFinite(y))y=H(x,z);
    const ci=Math.floor(x/S),ck2=Math.floor(z/S),j0=Math.floor((y+.01)/S),j1=Math.floor((y+2.4)/S);
    for(let a=-5;a<=5;a++)for(let c=-5;c<=5;c++){if(a*a+c*c>25)continue;for(let j=j0;j<=j1;j++){b._door.add(key(ci+a,j,ck2+c));if(b._act)DIRTY.add(ck(ci+a,j,ck2+c))}}}}catch(e){console.warn('출입구',e)}}
// 켜기: 그 건물이 걸친 덩어리들을 가까운 것부터 만들고, 다 만들면 원래 건물 모양은 숨긴다
const BQ=[];let BQh=0;
function activate(b,px,pz){if(b._act||!b._bents||!b._bents.length)return;b._act=true;const cs=new Set();
  for(const e of b._bents){const J=e.t==='p'?[e.jb,e.jt]:e.t==='s'?[e.j,e.j]:[e.j0,e.j1];
    for(let r=0;r<e.nk;r++)for(let c=0;c<e.ni;c++){const m=e.m[r*e.ni+c];if(!m)continue;const i=e.i0+c,k=e.k0+r;
      if(e.t==='p'&&m===1){cs.add(ck(i,J[0],k));cs.add(ck(i,J[1],k))}else{for(let j=J[0];j<=J[1];j+=CH)cs.add(ck(i,j,k));cs.add(ck(i,J[1],k))}}}
  const L=[...cs].map(C=>{const p=C.split(',').map(Number);return {C,b,d:Math.hypot((p[0]+.5)*CH*S-px,(p[2]+.5)*CH*S-pz)}}).sort((a,c)=>a.d-c.d);
  b._pending=L.length;for(const q of L)BQ.push(q);if(!L.length)VSKIP.push(b)}
function nearBuildings(px,pz,R){bvAll();for(const b of B){if(!b._bents||b._act)continue;const e=b._bents[0];if(!e)continue;const x0=e.i0*S,z0=e.k0*S,x1=(e.i0+e.ni)*S,z1=(e.k0+e.nk)*S;
  const dx=Math.max(x0-px,0,px-x1),dz=Math.max(z0-pz,0,pz-z1);if(Math.hypot(dx,dz)<R)activate(b,px,pz)}}
const N1=CH+2,GC=new Array(N1*N1*N1),GK=new Uint8Array(N1*N1*N1),RGB=new Map();
const rgbOf=c=>{let v=RGB.get(c);if(!v){v=hex(c);RGB.set(c,v)}return v};
function rebuild(C){const p=C.split(',').map(Number),i0=p[0]*CH,j0=p[1]*CH,k0=p[2]*CH;
  let hasU=false;for(const [a,b,c] of [[0,0,0],[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){const s2=CHUNK.get((p[0]+a)+','+(p[1]+b)+','+(p[2]+c));if(s2&&s2.size){hasU=true;break}}
  // 이 덩어리에 걸친 건물 조각만 미리 추림(칸마다 문자열 키를 만들지 않게)
  const E=[];if(BIDX){const seen=new Set();for(let a=Math.floor((i0-1)/32);a<=Math.floor((i0+CH)/32);a++)for(let c=Math.floor((k0-1)/32);c<=Math.floor((k0+CH)/32);c++){const L=BIDX.get(a+','+c);if(L)for(const e of L){if(seen.has(e)||!e.b._act)continue;seen.add(e);
    const ja=e.t==='p'?e.jb:e.t==='s'?e.j:e.j0,jz=e.t==='p'?e.jt:e.t==='s'?e.j:e.j1;if(jz<j0-1||ja>j0+CH||e.i0>i0+CH||e.i0+e.ni<i0-1||e.k0>k0+CH||e.k0+e.nk<k0-1)continue;E.push(e)}}}
  const old=MESH.get(C);if(old){if(old.b)gl.deleteBuffer(old.b.buffer);if(old.u)gl.deleteBuffer(old.u.buffer);MESH.delete(C)}
  if(!E.length&&!hasU)return;
  let any=false;
  for(let a=0;a<N1;a++){const i=i0+a-1;for(let b2=0;b2<N1;b2++){const j=j0+b2-1;for(let c=0;c<N1;c++){const k=k0+c-1,q=(a*N1+b2)*N1+c;let v=null,kd=0;
    const u=hasU?VOX.get(key(i,j,k)):null;
    if(u){if(!u.air){v=u.c;kd=1}}
    else if(E.length){let o=null;for(const e of E){const cc=i-e.i0,r=k-e.k0;if(cc<0||r<0||cc>=e.ni||r>=e.nk)continue;const m=e.m[r*e.ni+cc];if(!m)continue;
        if(e.t==='p'){if(j<e.jb||j>e.jt)continue;if(m===2||j===e.jt||j===e.jb){if(e.b._door.size&&e.b._door.has(key(i,j,k)))continue;o=j===e.jt?e.roof:(m===2?e.wall:BCOL.floor);break}}
        else if(e.t==='s'){if(j===e.j&&!o)o=e.col}else if(e.j0<=j&&j<=e.j1&&!o&&!(e.b._door.size&&e.b._door.has(key(i,j,k))))o=e.col}
      if(o){v=o;kd=2}}
    GC[q]=v;GK[q]=kd;if(kd&&a&&b2&&c&&a<N1-1&&b2<N1-1&&c<N1-1)any=true}}}
  if(!any)return;const mb=[],mu=[],base=[i0,j0,k0],mask=new Array(CH*CH),ST=[N1*N1,N1,1],B0=N1*N1+N1+1;
  for(let d=0;d<3;d++){const u=(d+1)%3,v=(d+2)%3,su=ST[u],sv=ST[v],sd=ST[d];for(const sg of [1,-1]){const nrm=[0,0,0];nrm[d]=sg;
    for(let x=0;x<CH;x++){let has=false;const bx=B0+x*sd;
      for(let a=0;a<CH;a++)for(let b2=0;b2<CH;b2++){const q=bx+a*su+b2*sv,mi=a*CH+b2;if(!GK[q]||GK[q+sg*sd]){mask[mi]=null;continue}mask[mi]=GK[q]+GC[q];has=true}
      if(!has)continue;const pl=x+(sg>0?1:0);
      for(let a=0;a<CH;a++)for(let b2=0;b2<CH;){const m=mask[a*CH+b2];if(!m){b2++;continue}let w=1;while(b2+w<CH&&mask[a*CH+b2+w]===m)w++;let h=1;grow:while(a+h<CH){for(let t=0;t<w;t++)if(mask[(a+h)*CH+b2+t]!==m)break grow;h++}
        for(let y=0;y<h;y++)for(let t=0;t<w;t++)mask[(a+y)*CH+b2+t]=null;
        const cor=(au,bv)=>{const P=[0,0,0];P[d]=pl;P[u]=au;P[v]=bv;return [(base[0]+P[0])*S,(base[1]+P[1])*S,(base[2]+P[2])*S]};
        const c0=cor(a,b2),c1=cor(a+h,b2),c2=cor(a+h,b2+w),c3=cor(a,b2+w),rgb=rgbOf(m.slice(1)),arr=m[0]==='1'?mu:mb;
        for(const V of [c0,c1,c2,c0,c2,c3])arr.push(V[0],V[1],V[2],nrm[0],nrm[1],nrm[2],rgb[0],rgb[1],rgb[2],0,0);b2+=w}}}}
  const o={b:null,u:null};if(mb.length){o.b=upload(mb);o.b.src=undefined}if(mu.length){o.u=upload(mu);o.u.src=undefined;o.u.__keep=1}MESH.set(C,o)}
// ---- 누른 곳 찾기: 화면의 한 점에서 카메라 방향으로 조금씩 나아가며 블록·땅·건물에 처음 닿는 곳
function inv(a){const o=new Float32Array(16);const b00=a[0]*a[5]-a[1]*a[4],b01=a[0]*a[6]-a[2]*a[4],b02=a[0]*a[7]-a[3]*a[4],b03=a[1]*a[6]-a[2]*a[5],b04=a[1]*a[7]-a[3]*a[5],b05=a[2]*a[7]-a[3]*a[6],b06=a[8]*a[13]-a[9]*a[12],b07=a[8]*a[14]-a[10]*a[12],b08=a[8]*a[15]-a[11]*a[12],b09=a[9]*a[14]-a[10]*a[13],b10=a[9]*a[15]-a[11]*a[13],b11=a[10]*a[15]-a[11]*a[14];let det=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;if(!det)return null;det=1/det;
  o[0]=(a[5]*b11-a[6]*b10+a[7]*b09)*det;o[1]=(a[2]*b10-a[1]*b11-a[3]*b09)*det;o[2]=(a[13]*b05-a[14]*b04+a[15]*b03)*det;o[3]=(a[10]*b04-a[9]*b05-a[11]*b03)*det;o[4]=(a[6]*b08-a[4]*b11-a[7]*b07)*det;o[5]=(a[0]*b11-a[2]*b08+a[3]*b07)*det;o[6]=(a[14]*b02-a[12]*b05-a[15]*b01)*det;o[7]=(a[8]*b05-a[10]*b02+a[11]*b01)*det;o[8]=(a[4]*b10-a[5]*b08+a[7]*b06)*det;o[9]=(a[1]*b08-a[0]*b10-a[3]*b06)*det;o[10]=(a[12]*b04-a[13]*b02+a[15]*b00)*det;o[11]=(a[9]*b02-a[8]*b04-a[11]*b00)*det;o[12]=(a[5]*b07-a[4]*b09-a[6]*b06)*det;o[13]=(a[0]*b09-a[1]*b07+a[2]*b06)*det;o[14]=(a[13]*b01-a[12]*b03-a[14]*b00)*det;o[15]=(a[8]*b03-a[9]*b01+a[11]*b00)*det;return o}
const tr=(m,x,y,z)=>{const w=m[3]*x+m[7]*y+m[11]*z+m[15];return [(m[0]*x+m[4]*y+m[8]*z+m[12])/w,(m[1]*x+m[5]*y+m[9]*z+m[13])/w,(m[2]*x+m[6]*y+m[10]*z+m[14])/w]};
let BB=null;
function solidB(x,y,z){if(!BB)BB=B.filter(b=>b.poly&&b.poly.length>2&&b.roof>-1e8).map(b=>{const xs=b.poly.map(q=>q[0]),zs=b.poly.map(q=>q[1]);return {b,x0:Math.min(...xs),x1:Math.max(...xs),z0:Math.min(...zs),z1:Math.max(...zs)}});
  for(const o of BB){if(x<o.x0||x>o.x1||z<o.z0||z>o.z1||y>o.b.roof)continue;const P=o.b.poly;let c=false;for(let a=0,d=P.length-1;a<P.length;d=a++){const p=P[a],q=P[d];if((p[1]>z)!==(q[1]>z)&&x<(q[0]-p[0])*(z-p[1])/(q[1]-p[1])+p[0])c=!c}if(c)return true}return false}
function pickAt(cx,cy,o){o=o||{};const r=canvas.getBoundingClientRect(),nx=(cx-r.left)/r.width*2-1,ny=1-(cy-r.top)/r.height*2,I=camera.mvp&&inv(camera.mvp);if(!I)return null;
  const a=tr(I,nx,ny,-1),b=tr(I,nx,ny,1);let dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];const L=Math.hypot(dx,dy,dz);dx/=L;dy/=L;dz/=L;
  const st=.04,max=Math.min(L,o.max||600);let prev=null;
  for(let t=0;t<max;t+=t<80?st:st*3){const x=a[0]+dx*t,y=a[1]+dy*t,z=a[2]+dz*t,c=[Math.floor(x/S),Math.floor(y/S),Math.floor(z/S)];
    if(prev&&c[0]===prev[0]&&c[1]===prev[1]&&c[2]===prev[2])continue;
    if(FL?eff(c[0],c[1],c[2])!=null:VOX.has(key(c[0],c[1],c[2])))return {hit:'vox',cell:c,prev};
    if(y<H(x,z)-.02||(!FL&&solidB(x,y,z))||(o.surf&&t<60&&onSurf(x,y,z)))return prev?{hit:'ground',cell:null,prev}:null;
    prev=c}
  return null}
// ---- 도구
let MODE={tool:null,color:'#e8552e',size:1,stamp:null},ghost=null,ghostKey='';
function targets(p){if(!p)return [];const t=MODE.tool,n=Math.max(1,Math.min(4,MODE.size|0)),o=-Math.floor((n-1)/2),out=[];
  if(t==='stamp'){if(!p.prev||!MODE.stamp)return [];const [i,j,k]=p.prev;for(const [a,b,d,c] of MODE.stamp)out.push([i+a,j+b,k+d,c]);return out}
  const base=t==='add'?p.prev:(p.hit==='vox'?p.cell:null);if(!base)return [];
  for(let a=0;a<n;a++)for(let b=0;b<n;b++)for(let d=0;d<n;d++){const i=base[0]+o+a,j=base[1]+(t==='add'?a*0+b:o+b),k=base[2]+o+d;out.push([i,j,k])}return out}
function act(p){const ts=targets(p);if(!ts.length)return;const cells=[],before=[];
  for(const q of ts){const [i,j,k]=q,K=key(i,j,k),had=VOX.get(K),was=had?had.c:null;let c;
    if(MODE.tool==='add'){if(had)continue;c=MODE.color}else if(MODE.tool==='stamp'){c=q[3]}else if(MODE.tool==='remove'){if(!had)continue;c=null}else if(MODE.tool==='paint'){if(!had||had.c===MODE.color)continue;c=MODE.color}else continue;
    if(c===was)continue;if(!setCell(i,j,k,c))break;cells.push([i,j,k,c]);before.push([i,j,k,was])}
  if(cells.length)post({event:'voxel',cells,before})}
function setGhost(p){const ts=targets(p),K=ts.map(t=>t.join()).join('|')+MODE.tool+MODE.color;if(K===ghostKey)return;ghostKey=K;if(ghost){gl.deleteBuffer(ghost.buffer);ghost=null}if(!ts.length)return;
  const m=[],rgb=MODE.tool==='remove'?[.9,.25,.2]:MODE.tool==='stamp'?null:hex(MODE.color);for(const q of ts)cube(m,q[0],q[1],q[2],rgb||hex(q[3]),true,.012);ghost=upload(m);ghost.__keep=1}
let down=null,mt=0;
canvas.addEventListener('pointerdown',e=>{if(MODE.tool&&e.button===0)down=[e.clientX,e.clientY]},true);
canvas.addEventListener('pointerup',e=>{if(!MODE.tool||!down)return;const moved=Math.hypot(e.clientX-down[0],e.clientY-down[1]);down=null;if(moved<6){act(pickAt(e.clientX,e.clientY));ghostKey='';setGhost(pickAt(e.clientX,e.clientY))}},true);
canvas.addEventListener('pointermove',e=>{if(!MODE.tool||e.buttons)return;const now=performance.now();if(now-mt<45)return;mt=now;setGhost(pickAt(e.clientX,e.clientY))});
canvas.addEventListener('pointerleave',()=>{ghostKey='';if(ghost){gl.deleteBuffer(ghost.buffer);ghost=null}});
// ---- 그리기: 프레임마다 바뀐 덩어리만 다시 만들고 전부 그린다
const prevC=globalThis.__CAN;globalThis.__CAN=()=>{prevC&&prevC();const t0=performance.now();for(const C of DIRTY){rebuild(C);DIRTY.delete(C);if(performance.now()-t0>6)break}
  while(BQh<BQ.length&&performance.now()-t0<8){const q=BQ[BQh++];rebuild(q.C);if(--q.b._pending===0&&!VSKIP.includes(q.b))VSKIP.push(q.b)}if(BQh>=BQ.length&&BQh){BQ.length=0;BQh=0}
  for(const o of MESH.values()){if(o.b)renderObj(o.b,camera.mvp,0);if(o.u)renderObj(o.u,camera.mvp,0)}
  if(ghost){gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-1,-2);renderObj(ghost,camera.mvp,0);gl.disable(gl.POLYGON_OFFSET_FILL)}
  if(outline)renderObj(outline,camera.mvp,0)};
function voxelMode(o){o=o||{};MODE=Object.assign({},MODE,o);if(o.stamp)MODE.stamp=o.stamp.filter(q=>Array.isArray(q)&&q.length>=4).slice(0,4000);ghostKey='';if(ghost){gl.deleteBuffer(ghost.buffer);ghost=null}
  if(MODE.tool)globalThis.__NOPICK=true;canvas.style.cursor=MODE.tool?'crosshair':'';return {tool:MODE.tool}}
const okC=c=>c===null||c==='air'||/^#[0-9a-f]{6}$/i.test(c);

// ===== 1인칭 만들기 모드 (마인크래프트 크리에이티브처럼) =====
// WASD 이동 · 마우스 시점 · 스페이스 점프(두 번 누르면 날기, 날 때 스페이스 위/쉬프트 아래) · Ctrl 달리기
// 왼쪽 클릭 부수기 · 오른쪽 클릭 놓기 · 휠 클릭 색 집기 · 1~9/휠 손에 든 것 바꾸기 · E 색 고르기 · Esc 메뉴
// 발밑: 등고선 땅만이 아니라 계단·옥상·턱·캐노피 같은 실제로 그려진 윗면과 블록 위를 밟는다
const EYE=1.62,STEP=.6,RAD=.28,REACH=8;
let SURF=null;const BKT=4;
function surfBuild(){SURF=new Map();const objs=[typeof build!=='undefined'?build:null,typeof roofObj!=='undefined'?roofObj:null,typeof extObj!=='undefined'?extObj:null,typeof cadObj!=='undefined'?cadObj:null].filter(o=>o&&o.src);for(const o of globalThis.__SHX||[])if(o&&o.src)objs.push(o);
  const inB=(x,z)=>{for(const b of B){const P=b.poly;if(!P||P.length<3)continue;let c=false;for(let a=0,d=P.length-1;a<P.length;d=a++){const p=P[a],q=P[d];if((p[1]>z)!==(q[1]>z)&&x<(q[0]-p[0])*(z-p[1])/(q[1]-p[1])+p[0])c=!c}if(c)return true}return false};
  for(const o of objs){const a=o.src,bl=(typeof build!=='undefined'&&o===build)||(typeof roofObj!=='undefined'&&o===roofObj);for(let t=0;t+32<a.length;t+=33){const x0=a[t],y0=a[t+1],z0=a[t+2],x1=a[t+11],y1=a[t+12],z1=a[t+13],x2=a[t+22],y2=a[t+23],z2=a[t+24];
    const ux=x1-x0,uy=y1-y0,uz=z1-z0,vx=x2-x0,vy=y2-y0,vz=z2-z0,nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,l=Math.hypot(nx,ny,nz);if(!l||Math.abs(ny)/l<.55)continue;if(bl&&inB((x0+x1+x2)/3,(z0+z1+z2)/3))continue;
    const T=[x0,y0,z0,x1,y1,z1,x2,y2,z2],bx0=Math.floor(Math.min(x0,x1,x2)/BKT),bx1=Math.floor(Math.max(x0,x1,x2)/BKT),bz0=Math.floor(Math.min(z0,z1,z2)/BKT),bz1=Math.floor(Math.max(z0,z1,z2)/BKT);
    if((bx1-bx0+1)*(bz1-bz0+1)>400)continue;for(let bx=bx0;bx<=bx1;bx++)for(let bz=bz0;bz<=bz1;bz++){const K=bx+','+bz;if(!SURF.has(K))SURF.set(K,[]);SURF.get(K).push(T)}}}}
// (x,z)에서 높이 yMax 이하에 있는 가장 높은 디딤면
function surfAt(x,z,yMax){if(!SURF)surfBuild();let h=H(x,z);const L=SURF.get(Math.floor(x/BKT)+','+Math.floor(z/BKT));
  if(L)for(const T of L){const d=(T[5]-T[8])*(T[0]-T[6])+(T[6]-T[3])*(T[2]-T[8]);if(!d)continue;const a=((T[5]-T[8])*(x-T[6])+(T[6]-T[3])*(z-T[8]))/d,b=((T[8]-T[2])*(x-T[6])+(T[0]-T[6])*(z-T[8]))/d,c=1-a-b;if(a<-1e-4||b<-1e-4||c<-1e-4)continue;const y=a*T[1]+b*T[4]+c*T[7];if(y<=yMax+.002&&y>h)h=y}
  const i=Math.floor(x/S),k=Math.floor(z/S);for(let j=Math.floor((yMax+.002)/S),n=0;n<64;j--,n++){if(eff(i,j,k)!=null){const top=(j+1)*S;if(top<=yMax+.002&&top>h)h=top;break}}
  return h}
function onSurf(x,y,z){const g=surfAt(x,z,y+.02);return y<=g+.02&&y>g-.35}
// 몸이 들어갈 수 없는 곳(건물 안, 블록)
function blocked(x,y,z){for(const [dx,dz] of [[0,0],[RAD,0],[-RAD,0],[0,RAD],[0,-RAD]]){const px=x+dx,pz=z+dz;
    for(const hy of [.3,1,1.7]){const py=y+hy;if(eff(Math.floor(px/S),Math.floor(py/S),Math.floor(pz/S))!=null)return true}}return false}
let FL=null;const held={};
function slotItem(){return FL&&FL.slots[FL.slot]||{color:'#c0392b'}}
function center(){const r=canvas.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]}
function aim(){const [cx,cy]=center();return pickAt(cx,cy,{max:REACH,surf:true})}
function bodyHits(c){if(!FL)return false;const x0=c[0]*S,y0=c[1]*S,z0=c[2]*S;return x0<FL.x+RAD&&x0+S>FL.x-RAD&&z0<FL.z+RAD&&z0+S>FL.z-RAD&&y0<FL.y+1.8&&y0+S>FL.y}
function doBreak(){const p=aim();if(!p||p.hit!=='vox')return;const [i,j,k]=p.cell,u=VOX.get(key(i,j,k)),was=u?u.c:null,c=bcell(i,j,k)?'air':null;if(c===was)return;setCell(i,j,k,c);post({event:'voxel',cells:[[i,j,k,c]],before:[[i,j,k,was]]})}
function doPlace(){const p=aim();if(!p||!p.prev)return;const it=slotItem(),cells=[],before=[];
  if(it.stamp){const [i,j,k]=p.prev;for(const [a,b,d,c] of it.stamp){const q=[i+a,j+b,k+d],h=VOX.get(key(...q));if(h&&h.c===c)continue;if(!setCell(q[0],q[1],q[2],c))break;cells.push([...q,c]);before.push([...q,h?h.c:null])}}
  else{const q=p.prev;if(bodyHits(q)||eff(...q)!=null)return;const u=VOX.get(key(...q));setCell(q[0],q[1],q[2],it.color);cells.push([...q,it.color]);before.push([...q,u?u.c:null])}
  if(cells.length)post({event:'voxel',cells,before})}
function doPick(){const p=aim();if(!p||p.hit!=='vox')return;const c=eff(...p.cell);if(!c)return;FL.slots[FL.slot]={color:c};post({event:'fly',slot:FL.slot,slots:FL.slots.map(s=>s.color?{color:s.color}:{stamp:true,name:s.name})})}
let outline=null,outKey='',aimT=0;
function box(m,x0,y0,z0,x1,y1,z1,rgb){for(const [nx,ny,nz,q] of F){const v=q.map(([a,b,d])=>[a?x1:x0,b?y1:y0,d?z1:z0]);for(const t of [0,1,2,0,2,3])m.push(v[t][0],v[t][1],v[t][2],nx,ny,nz,rgb[0],rgb[1],rgb[2],0,0)}}
function setOutline(c,rgb){const K=c?c.join()+rgb.join():'';if(K===outKey)return;outKey=K;if(outline){gl.deleteBuffer(outline.buffer);outline=null}if(!c)return;const m=[],e=.012,x0=c[0]*S-e,y0=c[1]*S-e,z0=c[2]*S-e,x1=x0+S+2*e,y1=y0+S+2*e,z1=z0+S+2*e,w=.014;
  for(const [a,b] of [[y0,z0],[y1,z0],[y0,z1],[y1,z1]])box(m,x0,a-w,b-w,x1,a+w,b+w,rgb);for(const [a,b] of [[x0,z0],[x1,z0],[x0,z1],[x1,z1]])box(m,a-w,y0,b-w,a+w,y1,b+w,rgb);for(const [a,b] of [[x0,y0],[x1,y0],[x0,y1],[x1,y1]])box(m,a-w,b-w,z0,a+w,b+w,z1,rgb);
  outline=upload(m);outline.__keep=1}
const locked=()=>document.pointerLockElement===canvas||!!globalThis.__FLYTEST; // __FLYTEST: 자동 시험용
let lastSpace=0,hold=null,holdT=0;
function step(now){if(!FL)return;const dt=Math.min(.1,(now-(FL.t||now))/1000);FL.t=now;requestAnimationFrame(step);
  const L=locked()||FL.active,f=L?((held.w?1:0)-(held.s?1:0)):0,sd=L?((held.d?1:0)-(held.a?1:0)):0,sp=FL.fly?(held.control?21:10.9):(held.control?5.6:4.3);
  const fx=Math.sin(FL.yaw),fz=-Math.cos(FL.yaw),rx=Math.cos(FL.yaw),rz=Math.sin(FL.yaw);let mx=(fx*f+rx*sd),mz=(fz*f+rz*sd);const ml=Math.hypot(mx,mz);if(ml){mx=mx/ml*sp*dt;mz=mz/ml*sp*dt}
  // 옆으로: 막히면 그 축만 멈춤. 걷는 중엔 STEP 높이까지는 올라섬(계단)
  for(const [ax,az] of [[mx,0],[0,mz]]){if(!ax&&!az)continue;const nx=FL.x+ax,nz=FL.z+az;let ny=FL.y;
    if(!FL.fly){const g=surfAt(nx,nz,FL.y+STEP);if(g>FL.y&&FL.ground)ny=g}
    if(!blocked(nx,ny,nz)){FL.x=nx;FL.z=nz;FL.y=ny}}
  const g=surfAt(FL.x,FL.z,FL.y+.05);
  if(FL.fly){const v=L?((held[' ']?1:0)-(held.shift?1:0)):0;const ny=FL.y+v*8*dt;if(!blocked(FL.x,Math.max(ny,g),FL.z))FL.y=Math.max(ny,g);if(FL.y<=g+.001&&held.shift)FL.fly=false;FL.vy=0;FL.ground=FL.y<=g+.001}
  else{if(FL.y>g+.001||FL.vy>0){FL.vy-=25*dt;const ny=FL.y+FL.vy*dt;if(FL.vy>0&&blocked(FL.x,ny,FL.z))FL.vy=0;else FL.y=ny;if(FL.y<=g){FL.y=g;FL.vy=0}}else{FL.y=g;FL.vy=0}FL.ground=FL.y<=g+.001}
  if(FL.y<-200){FL.y=H(FL.x,FL.z);FL.vy=0}
  if(!FL.nb||now-FL.nb>700){FL.nb=now;nearBuildings(FL.x,FL.z,60)}
  camera.mode='walk';camera.pos=[FL.x,0,FL.z];camera.yaw=FL.yaw;camera.pitch=FL.pitch;globalThis.__FLY.y=FL.y+EYE;
  if(hold&&now-holdT>220){holdT=now;hold==='break'?doBreak():doPlace()}
  if(now-aimT>60){aimT=now;const p=L?aim():null;if(p&&p.hit==='vox')setOutline(p.cell,[.1,.12,.14]);else if(p&&p.prev)setOutline(p.prev,[.95,.95,.95]);else setOutline(null)}}
addEventListener('keydown',e=>{if(!FL||!(locked()||FL.active))return;const k=e.key.toLowerCase();e.preventDefault();e.stopImmediatePropagation();
  if(k===' '&&!e.repeat){const now=performance.now();if(now-lastSpace<300){FL.fly=!FL.fly;FL.vy=0;post({event:'fly',flying:FL.fly})}else if(!FL.fly&&FL.ground)FL.vy=7.7;lastSpace=now}
  if(/^[1-9]$/.test(k)){FL.slot=+k-1;post({event:'fly',slot:FL.slot})}
  if(k==='e'){document.exitPointerLock();post({event:'fly',menu:'palette'})}
  held[k]=true},true);
addEventListener('keyup',e=>{if(!FL)return;held[e.key.toLowerCase()]=false;if(locked()){e.stopImmediatePropagation()}},true);
addEventListener('blur',()=>{for(const k in held)held[k]=false});
for(const t of ['pointerdown','pointerup','pointermove','click','dblclick'])canvas.addEventListener(t,e=>{if(!FL)return;e.stopImmediatePropagation();e.preventDefault();
  if(t==='pointerdown'){try{window.focus()}catch(_){}if(!locked()&&!FL.active){try{const r=canvas.requestPointerLock();if(r&&r.catch)r.catch(()=>{})}catch(_){}return}if(e.button===0){doBreak();hold='break';holdT=performance.now()}else if(e.button===2){doPlace();hold='place';holdT=performance.now()}else if(e.button===1)doPick()}
  if(t==='pointerup')hold=null},true);
// 화면을 누르면 '들어가 있음'. 마우스 잠금이 막혀도 키보드로 움직이고, 마우스는 끌어서 둘러볼 수 있게
canvas.addEventListener('pointerdown',()=>{if(FL&&!FL.active){FL.active=true;post({event:'fly',locked:true})}},true);
let drag=null;canvas.addEventListener('pointermove',e=>{if(!FL||locked())return;if(e.buttons&1){if(drag){FL.yaw+=(e.clientX-drag[0])*.004;FL.pitch=Math.max(-1.55,Math.min(1.55,FL.pitch-(e.clientY-drag[1])*.004))}drag=[e.clientX,e.clientY]}else drag=null},true);
canvas.addEventListener('mousemove',e=>{if(!FL||!locked())return;FL.yaw+=e.movementX*.0024;FL.pitch=Math.max(-1.55,Math.min(1.55,FL.pitch-e.movementY*.0024))},true);
canvas.addEventListener('wheel',e=>{if(!FL||!locked())return;e.preventDefault();e.stopImmediatePropagation();FL.slot=(FL.slot+(e.deltaY>0?1:-1)+FL.slots.length)%FL.slots.length;post({event:'fly',slot:FL.slot})},{capture:true,passive:false});
document.addEventListener('pointerlockchange',()=>{if(!FL)return;for(const k in held)held[k]=false;hold=null;if(!locked()){FL.active=false;setOutline(null)}post({event:'fly',locked:locked()||FL.active})});
addEventListener('keydown',e=>{if(FL&&e.key==='Escape'&&FL.active&&!locked()){FL.active=false;for(const k in held)held[k]=false;setOutline(null);post({event:'fly',locked:false})}},true);
function spawn(o){let x=+o.x,z=+o.z,b=null;if(!(isFinite(x)&&isFinite(z))){b=CUKPICK.findB(o.building||'니콜스관');x=b?b.cx:0;z=b?b.cz:0}
  // 탁 트인 곳 찾기: 반지름 3m 안에 벽·블록이 없고, 머리 위가 비어 있고, 평평한 곳
  const open=(px,pz)=>{const g=surfAt(px,pz,H(px,pz)+.2);if(surfAt(px,pz,g+30)>g+.6)return false;for(let a=0;a<8;a++){const qx=px+Math.cos(a*.785)*3,qz=pz+Math.sin(a*.785)*3;if(blocked(qx,g,qz)||Math.abs(surfAt(qx,qz,g+.6)-g)>.6)return false}return !blocked(px,g,pz)};
  let fx=x,fz=z;search:for(let r=16;r<160;r+=2)for(let a=0;a<16;a++){const px=x+Math.cos(a*.3927)*r,pz=z+Math.sin(a*.3927)*r;if(open(px,pz)){fx=px;fz=pz;break search}}
  const yaw=b?Math.atan2(b.cx-fx,-(b.cz-fz)):0;return [fx,fz,yaw]}
// 1인칭일 땐 지도 화면의 버튼·작은 지도·속도 막대를 숨긴다(건물 이름표만 남김)
let HID=[];const cst=document.createElement('style');cst.textContent='body.cukfly #wspd,body.cukfly #mode,body.cukfly #intro{display:none!important}';document.head.appendChild(cst);
function chrome(hide){document.body.classList.toggle('cukfly',hide);if(hide){HID=[];for(const el of document.body.querySelectorAll('*')){if(el===canvas||el.contains(canvas)||el.closest('#pins,#kpins,#cukcredit')||HID.some(h=>h[0].contains(el)))continue;const cs=getComputedStyle(el);if((cs.position==='absolute'||cs.position==='fixed')&&cs.display!=='none'){HID.push([el,el.style.display]);el.style.display='none'}}}else{for(const [el,d] of HID)el.style.display=d;HID=[]}}
function voxelFly(o){o=o||{};
  if(o.on===false){if(FL){FL=null;chrome(false);globalThis.__FLY=null;if(locked())document.exitPointerLock();setOutline(null);const ob=document.getElementById('orbitBtn');if(ob)ob.click()}return {on:false}}
  if(o.on&&!FL){bvAll();loadDoors();{let bx=+o.x,bz=+o.z;if(!(isFinite(bx)&&isFinite(bz))){const b=CUKPICK.findB(o.building||'니콜스관');bx=b?b.cx:0;bz=b?b.cz:0}nearBuildings(bx,bz,45)}const [x,z,yw]=spawn(o);chrome(true);FL={x,z,y:surfAt(x,z,H(x,z)+.1),vy:0,yaw:isFinite(+o.yaw)?+o.yaw:yw,pitch:-.15,fly:false,ground:true,slot:0,slots:[{color:'#c0392b'}],t:0};globalThis.__FLY={y:FL.y+EYE};MODE.tool=null;if(ghost){gl.deleteBuffer(ghost.buffer);ghost=null}requestAnimationFrame(step)}
  if(FL&&o.slots)FL.slots=o.slots.map(s=>s.stamp?{stamp:s.stamp.filter(q=>Array.isArray(q)&&q.length>=4&&okC(q[3])).slice(0,4000),name:s.name}:{color:okC(s.color)?s.color:'#c0392b'});
  if(FL&&isFinite(+o.slot))FL.slot=Math.max(0,Math.min(FL.slots.length-1,+o.slot|0));
  return FL?{on:true,x:FL.x,y:FL.y,z:FL.z,slot:FL.slot,flying:FL.fly,locked:locked()}:{on:false}}

function voxelApply(cells){let n=0;for(const q of cells||[]){if(!Array.isArray(q)||!okC(q[3]))continue;const [i,j,k]=q.map(v=>v|0);if(setCell(i,j,k,q[3]))n++}return {count:VOX.size,applied:n}}
function voxelReset(cells){for(const C of CHUNK.keys())DIRTY.add(C);VOX.clear();CHUNK.clear();return voxelApply(cells)}
function voxelInfo(){return {count:VOX.size,size:S,max:MAX}}
Object.assign(globalThis.__KIT||{},{voxelMode,voxelApply,voxelReset,voxelInfo,voxelFly});
globalThis.__VOXDBG={surfAt,blocked,get FL(){return FL},aim,doPlace,doBreak,eff,bcell,VSKIP,MESH,BQ:()=>BQ.length-BQh,findB:n=>CUKPICK.findB(n)};
})()}
