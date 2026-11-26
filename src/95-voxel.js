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
function setCell(i,j,k,c){const K=key(i,j,k),C=ck(i,j,k);if(c){if(!VOX.has(K)&&VOX.size>=MAX)return false;VOX.set(K,{i,j,k,c,rgb:hex(c)});if(!CHUNK.has(C))CHUNK.set(C,new Set());CHUNK.get(C).add(K)}else{VOX.delete(K);const s=CHUNK.get(C);if(s)s.delete(K)}
  DIRTY.add(C);// 이웃 덩어리의 맞닿은 면도 다시
  for(const [a,b,d] of [[i-1,j,k],[i+1,j,k],[i,j-1,k],[i,j+1,k],[i,j,k-1],[i,j,k+1]]){const C2=ck(a,b,d);if(C2!==C)DIRTY.add(C2)}return true}
const F=[[1,0,0,[[1,0,0],[1,1,0],[1,1,1],[1,0,1]]],[-1,0,0,[[0,0,1],[0,1,1],[0,1,0],[0,0,0]]],[0,1,0,[[0,1,0],[0,1,1],[1,1,1],[1,1,0]]],[0,-1,0,[[0,0,0],[1,0,0],[1,0,1],[0,0,1]]],[0,0,1,[[1,0,1],[1,1,1],[0,1,1],[0,0,1]]],[0,0,-1,[[0,0,0],[0,1,0],[1,1,0],[1,0,0]]]];
function cube(m,i,j,k,rgb,all,grow){const g=grow||0;for(const [nx,ny,nz,q] of F){if(!all&&VOX.has(key(i+nx,j+ny,k+nz)))continue;const v=q.map(([a,b,d])=>[(i+a)*S+(a?g:-g),(j+b)*S+(b?g:-g),(k+d)*S+(d?g:-g)]);
  for(const t of [0,1,2,0,2,3])m.push(v[t][0],v[t][1],v[t][2],nx,ny,nz,rgb[0],rgb[1],rgb[2],0,0)}}
function rebuild(C){const old=MESH.get(C);if(old){gl.deleteBuffer(old.buffer);MESH.delete(C)}const s=CHUNK.get(C);if(!s||!s.size)return;const m=[];for(const K of s){const v=VOX.get(K);cube(m,v.i,v.j,v.k,v.rgb)}if(m.length){const o=upload(m);o.__keep=1;MESH.set(C,o)}}
// ---- 누른 곳 찾기: 화면의 한 점에서 카메라 방향으로 조금씩 나아가며 블록·땅·건물에 처음 닿는 곳
function inv(a){const o=new Float32Array(16);const b00=a[0]*a[5]-a[1]*a[4],b01=a[0]*a[6]-a[2]*a[4],b02=a[0]*a[7]-a[3]*a[4],b03=a[1]*a[6]-a[2]*a[5],b04=a[1]*a[7]-a[3]*a[5],b05=a[2]*a[7]-a[3]*a[6],b06=a[8]*a[13]-a[9]*a[12],b07=a[8]*a[14]-a[10]*a[12],b08=a[8]*a[15]-a[11]*a[12],b09=a[9]*a[14]-a[10]*a[13],b10=a[9]*a[15]-a[11]*a[13],b11=a[10]*a[15]-a[11]*a[14];let det=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;if(!det)return null;det=1/det;
  o[0]=(a[5]*b11-a[6]*b10+a[7]*b09)*det;o[1]=(a[2]*b10-a[1]*b11-a[3]*b09)*det;o[2]=(a[13]*b05-a[14]*b04+a[15]*b03)*det;o[3]=(a[10]*b04-a[9]*b05-a[11]*b03)*det;o[4]=(a[6]*b08-a[4]*b11-a[7]*b07)*det;o[5]=(a[0]*b11-a[2]*b08+a[3]*b07)*det;o[6]=(a[14]*b02-a[12]*b05-a[15]*b01)*det;o[7]=(a[8]*b05-a[10]*b02+a[11]*b01)*det;o[8]=(a[4]*b10-a[5]*b08+a[7]*b06)*det;o[9]=(a[1]*b08-a[0]*b10-a[3]*b06)*det;o[10]=(a[12]*b04-a[13]*b02+a[15]*b00)*det;o[11]=(a[9]*b02-a[8]*b04-a[11]*b00)*det;o[12]=(a[5]*b07-a[4]*b09-a[6]*b06)*det;o[13]=(a[0]*b09-a[1]*b07+a[2]*b06)*det;o[14]=(a[13]*b01-a[12]*b03-a[14]*b00)*det;o[15]=(a[8]*b03-a[9]*b01+a[11]*b00)*det;return o}
const tr=(m,x,y,z)=>{const w=m[3]*x+m[7]*y+m[11]*z+m[15];return [(m[0]*x+m[4]*y+m[8]*z+m[12])/w,(m[1]*x+m[5]*y+m[9]*z+m[13])/w,(m[2]*x+m[6]*y+m[10]*z+m[14])/w]};
let BB=null;
function solidB(x,y,z){if(!BB)BB=B.filter(b=>b.poly&&b.poly.length>2&&b.roof>-1e8).map(b=>{const xs=b.poly.map(q=>q[0]),zs=b.poly.map(q=>q[1]);return {b,x0:Math.min(...xs),x1:Math.max(...xs),z0:Math.min(...zs),z1:Math.max(...zs)}});
  for(const o of BB){if(x<o.x0||x>o.x1||z<o.z0||z>o.z1||y>o.b.roof)continue;const P=o.b.poly;let c=false;for(let a=0,d=P.length-1;a<P.length;d=a++){const p=P[a],q=P[d];if((p[1]>z)!==(q[1]>z)&&x<(q[0]-p[0])*(z-p[1])/(q[1]-p[1])+p[0])c=!c}if(c)return true}return false}
function pickAt(cx,cy){const r=canvas.getBoundingClientRect(),nx=(cx-r.left)/r.width*2-1,ny=1-(cy-r.top)/r.height*2,I=camera.mvp&&inv(camera.mvp);if(!I)return null;
  const a=tr(I,nx,ny,-1),b=tr(I,nx,ny,1);let dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2];const L=Math.hypot(dx,dy,dz);dx/=L;dy/=L;dz/=L;
  const st=.05,max=Math.min(L,600);let prev=null;
  for(let t=0;t<max;t+=t<80?st:st*3){const x=a[0]+dx*t,y=a[1]+dy*t,z=a[2]+dz*t,c=[Math.floor(x/S),Math.floor(y/S),Math.floor(z/S)];
    if(prev&&c[0]===prev[0]&&c[1]===prev[1]&&c[2]===prev[2])continue;
    if(VOX.has(key(c[0],c[1],c[2])))return {hit:'vox',cell:c,prev};
    if(y<H(x,z)-.02||solidB(x,y,z))return prev?{hit:'ground',cell:null,prev}:null;
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
const prevC=globalThis.__CAN;globalThis.__CAN=()=>{prevC&&prevC();let n=0;for(const C of DIRTY){rebuild(C);DIRTY.delete(C);if(++n>40)break}
  for(const o of MESH.values())renderObj(o,camera.mvp,0);
  if(ghost){gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-1,-2);renderObj(ghost,camera.mvp,0);gl.disable(gl.POLYGON_OFFSET_FILL)}};
function voxelMode(o){o=o||{};MODE=Object.assign({},MODE,o);if(o.stamp)MODE.stamp=o.stamp.filter(q=>Array.isArray(q)&&q.length>=4).slice(0,4000);ghostKey='';if(ghost){gl.deleteBuffer(ghost.buffer);ghost=null}
  if(MODE.tool)globalThis.__NOPICK=true;canvas.style.cursor=MODE.tool?'crosshair':'';return {tool:MODE.tool}}
const okC=c=>c===null||/^#[0-9a-f]{6}$/i.test(c);
function voxelApply(cells){let n=0;for(const q of cells||[]){if(!Array.isArray(q)||!okC(q[3]))continue;const [i,j,k]=q.map(v=>v|0);if(setCell(i,j,k,q[3]))n++}return {count:VOX.size,applied:n}}
function voxelReset(cells){for(const C of CHUNK.keys())DIRTY.add(C);VOX.clear();CHUNK.clear();return voxelApply(cells)}
function voxelInfo(){return {count:VOX.size,size:S,max:MAX}}
Object.assign(globalThis.__KIT||{},{voxelMode,voxelApply,voxelReset,voxelInfo});
})()}
