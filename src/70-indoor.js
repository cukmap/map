// ===== v25: 실내 지도 통합 (입찰공고 DWG 기반 6개 동) — 실내 보기 · 실외+실내 통합 길찾기 =====
const IND=JSON.parse(document.getElementById('indoor').textContent);
const IFN=f=>({B1:'지하 1층',RF:'옥상'}[f]||(f.endsWith('F')?f.slice(0,-1)+'층':f));
const IB=IND.buildings.map((d,bi)=>{const bv=B.find(b=>b.code===d.code);const ents=NN.map((n,i)=>[n,i]).filter(([n])=>n.k==='entrance'&&n.b===d.code&&n.nm&&!n.nm.includes('성당'));
 const y1=ents.filter(([n])=>n.fl==='1F').map(([n])=>n.y).sort((a,b)=>a-b);
 let base=y1.length?y1[Math.floor(y1.length/2)]:(bv?bv.ground+.4:0);
 if(!y1.length&&bv){const e=ents.find(([n])=>d.floors.some(f=>f.id===n.fl));if(e){base=e[0].y-d.floors.find(f=>f.id===e[0].fl).y}}
 return {d,bi,bv,base,ents,rt:null}});
const IN={b:null,cur:0,route:null};
// exterior ranges of buildings (recorded while building meshes)
const HIDE_ALSO={K:['S']};
function renderSkip(obj,mvp,aerial,kind){const bs=uniSkip();if(!bs.length){renderObj(obj,mvp,aerial);return}
 const R=bs.map(b=>kind==='m'?[b._rg[0],b._rg[1]]:[b._rg[2],b._rg[3]]).filter(r=>r[1]>r[0]).sort((a,b)=>a[0]-b[0]);
 gl.bindBuffer(gl.ARRAY_BUFFER,obj.buffer);
 for(let [l,o,z] of [[loc.pos,0,3],[loc.nor,12,3],[loc.col,24,3],[loc.uv,36,2]]){gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,z,gl.FLOAT,false,44,o)}
 gl.uniformMatrix4fv(loc.mvp,false,mvp);gl.uniform1f(loc.aerial,aerial);gl.uniform1f(loc.plain,globalThis.__PLAIN||0);let c=0;for(const [s0,e0] of R){if(s0>c)gl.drawArrays(gl.TRIANGLES,c,s0-c);c=Math.max(c,e0)}if(obj.n>c)gl.drawArrays(gl.TRIANGLES,c,obj.n-c)}
async function inflateB64(b64){const bin=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));return new Uint8Array(await new Response(new Blob([bin]).stream().pipeThrough(new DecompressionStream('deflate'))).arrayBuffer())}
function upT(dst,a,b,c,col,uv){const ny=(b[2]-a[2])*(c[0]-a[0])-(b[0]-a[0])*(c[2]-a[2]);if(ny>=0)pushTri(dst,a,b,c,col,uv);else pushTri(dst,a,c,b,col,uv?[uv[0],uv[2],uv[1]]:null)}
function boxSeg(dst,x1,z1,x2,z2,th,y0,y1,col,topCol){const L=Math.hypot(x2-x1,z2-z1);if(L<.05)return;const ux=(x2-x1)/L,uz=(z2-z1)/L,nx=-uz*th/2,nz=ux*th/2,ex=ux*th*.3,ez=uz*th*.3;
 const a=[x1-ex+nx,z1-ez+nz],b=[x2+ex+nx,z2+ez+nz],c=[x2+ex-nx,z2+ez-nz],d=[x1-ex-nx,z1-ez-nz];
 const Q=(p,q)=>quad(dst,[p[0],y0,p[1]],[q[0],y0,q[1]],[q[0],y1,q[1]],[p[0],y1,p[1]],col);Q(a,b);Q(c,d);Q(b,c);Q(d,a);
 upT(dst,[a[0],y1,a[1]],[b[0],y1,b[1]],[c[0],y1,c[1]],topCol||col);upT(dst,[a[0],y1,a[1]],[c[0],y1,c[1]],[d[0],y1,d[1]],topCol||col)}
function earTris(poly){const P=poly.map(p=>p.slice());const idx=P.map((_,i)=>i),out=[];const area=P.reduce((s,p,i)=>{const q=P[(i+1)%P.length];return s+p[0]*q[1]-q[0]*p[1]},0)>0?1:-1;
 const cr=(a,b,c)=>((b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]))*area;const inT=(p,a,b,c)=>cr(a,b,p)>=0&&cr(b,c,p)>=0&&cr(c,a,p)>=0;let guard=0;
 while(idx.length>3&&guard++<5000){let ok=false;for(let i=0;i<idx.length;i++){const ia=idx[(i+idx.length-1)%idx.length],ib=idx[i],ic=idx[(i+1)%idx.length],a=P[ia],b=P[ib],c=P[ic];if(cr(a,b,c)<=0)continue;
   if(idx.some(j=>j!==ia&&j!==ib&&j!==ic&&inT(P[j],a,b,c)))continue;out.push([a,b,c]);idx.splice(i,1);ok=true;break}if(!ok)break}if(idx.length===3)out.push(idx.map(i=>P[i]));return out}
async function buildIndoor(ib){if(ib.rt)return ib.rt;const d=ib.d,[X0,Z0,X1,Z1]=d.bounds;const floors=[];
 const _lv=ib.bv&&ib.bv.lv,_top=Math.max(ib.bv&&ib.bv.floors||0,...d.floors.map(f=>{const m=/^(\d+)F$/.exec(f.id);return m?+m[1]:0}));for(const f of d.floors){const y=_lv?lvFloorY(_lv,f.id,_top):ib.base+f.y,wm=[],sm=[],tm=[];const wh=f.id==='RF'?1.1:2.9;
  for(let i=0;i<f.walls.length;i+=4)boxSeg(wm,f.walls[i],f.walls[i+1],f.walls[i+2],f.walls[i+3],.16,y,y+wh,[.93,.91,.86],[.22,.24,.28]);
  if(f.id!=='RF')for(let i=0;i<f.wins.length;i+=4)boxSeg(wm,f.wins[i],f.wins[i+1],f.wins[i+2],f.wins[i+3],.07,y+.9,y+2.4,[.62,.80,.90]);
  for(const s of f.slabs){const tris=earTris(s);for(const t of tris){const P=t.map(p=>[p[0],y,p[1]]),uv=t.map(p=>[(p[0]-X0)/(X1-X0),1-(p[1]-Z0)/(Z1-Z0)]);upT(tm,P[0],P[1],P[2],[1,1,1],uv);
    pushTri(sm,[t[0][0],y-.35,t[0][1]],[t[1][0],y-.35,t[1][1]],[t[2][0],y-.35,t[2][1]],[.80,.78,.74])}
   for(let i=0;i<s.length;i++){const p=s[i],q=s[(i+1)%s.length];quad(sm,[p[0],y-.36,p[1]],[q[0],y-.36,q[1]],[q[0],y-.01,q[1]],[p[0],y-.01,p[1]],[.78,.76,.71])}}
  const tex=gl.createTexture(),im=new Image();im.onload=()=>{gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,im);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);fo.texReady=true};im.src=f.tex;
  const fo={id:f.id,y,wall:upload(wm),slab:upload(sm),top:upload(tm),tex,texReady:false,labels:f.labels};floors.push(fo)}
 const FG=d.fine,PM=await Promise.all(d.floors.map(f=>inflateB64(f.pmask)));const OFF=[];let NNi=0;for(const f of d.floors){OFF.push(NNi);NNi+=f.graph.nodes.length}
 const NP=new Array(NNi),ADJ=Array.from({length:NNi},()=>[]);
 d.floors.forEach((f,fi)=>{f.graph.nodes.forEach((p,i)=>NP[OFF[fi]+i]=p);for(const [a,c,L,pl] of f.graph.edges){ADJ[OFF[fi]+a].push([OFF[fi]+c,L,pl,fi]);ADJ[OFF[fi]+c].push([OFF[fi]+a,L,pl,fi])}});
 for(const x of d.xlinks){const A=OFF[x.fa]+x.na,C=OFF[x.fb]+x.nb;ADJ[A].push([C,x.len,null,-1]);ADJ[C].push([A,x.len,null,-1])}
 // outdoor entrance → nearest indoor node of that floor
 const att=ib.ents.map(([n,ni])=>{const fi=d.floors.findIndex(f=>f.id===n.fl);if(fi<0)return null;let best=null;
   d.floors[fi].graph.nodes.forEach((p,i)=>{const dd=Math.hypot(p[0]-n.x,p[1]-n.z);if(!best||dd<best.d)best={d:dd,node:OFF[fi]+i,p}});return best&&best.d<25?{ni,n,fi,...best}:null}).filter(Boolean);
 ib.rt={floors,FG,PM,OFF,NP,ADJ,NN:NNi,att,X0,Z0};return ib.rt}
function idijk(rt,s){const g=new Float64Array(rt.NN).fill(Infinity),from=new Int32Array(rt.NN).fill(-1),fe=new Array(rt.NN);g[s]=0;const h=[[0,s]];
 const push=e=>{h.push(e);let c=h.length-1;while(c>0){const p=(c-1)>>1;if(h[p][0]<=h[c][0])break;[h[p],h[c]]=[h[c],h[p]];c=p}};
 const pop=()=>{const top=h[0],l=h.pop();if(h.length){h[0]=l;let c=0;for(;;){const a=2*c+1,d=a+1;let m=c;if(a<h.length&&h[a][0]<h[m][0])m=a;if(d<h.length&&h[d][0]<h[m][0])m=d;if(m===c)break;[h[m],h[c]]=[h[c],h[m]];c=m}}return top};
 while(h.length){const [dd,u]=pop();if(dd>g[u])continue;for(const e of rt.ADJ[u]){const nd=dd+e[1];if(nd<g[e[0]]){g[e[0]]=nd;from[e[0]]=u;fe[e[0]]=e;push([nd,e[0]])}}}return {g,from,fe}}
function ipath(ib,D,s,t){const rt=ib.rt;if(!isFinite(D.g[t]))return null;const seq=[];for(let v=t;v!==s;v=D.from[v])seq.push([D.from[v],v,D.fe[v]]);seq.reverse();
 const pm=(fi,x,y)=>(x>=0&&y>=0&&x<rt.FG.w&&y<rt.FG.h)?(rt.PM[fi][(y*rt.FG.w+x)>>3]>>(7-((y*rt.FG.w+x)&7)))&1:0,toF=p=>[Math.round((p[0]-rt.X0)/rt.FG.res),Math.round((p[1]-rt.Z0)/rt.FG.res)];
 const los=(fi,A,C)=>{const a=toF(A),c=toF(C),n=Math.max(Math.abs(c[0]-a[0]),Math.abs(c[1]-a[1]))+1;for(let k=0;k<=n;k++)if(!pm(fi,Math.round(a[0]+(c[0]-a[0])*k/n),Math.round(a[1]+(c[1]-a[1])*k/n)))return false;return true};
 const runs=[];let cur=null;for(const [u,,e] of seq){if(e[3]<0){if(cur)runs.push(cur);cur=null;continue}let P=[];for(let i=0;i<e[2].length;i+=2)P.push([e[2][i],e[2][i+1]]);const pu=rt.NP[u];
  if(Math.hypot(P[0][0]-pu[0],P[0][1]-pu[1])>Math.hypot(P[P.length-1][0]-pu[0],P[P.length-1][1]-pu[1]))P.reverse();if(!cur)cur={f:e[3],pts:P.slice()};else cur.pts.push(...P.slice(1))}
 if(cur)runs.push(cur);for(const r of runs){const P=r.pts,o=[P[0]];let a=0;while(a<P.length-1){let c=P.length-1;while(c>a+1&&!los(r.f,P[a],P[c]))c--;o.push(P[c]);a=c}r.pts=o}
 return {runs,len:D.g[t]}}
// ---------------- render
function renderIndoor(){if(!IN.b||!IN.b.rt)return;const rt=IN.b.rt;
 rt.floors.forEach((f,i)=>{if(i>IN.cur){if(globalThis.__INW&&i===IN.cur+1)renderObj(f.slab,camera.mvp,0);return}renderObj(f.slab,camera.mvp,0);if(f.texReady){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,f.tex);renderObj(f.top,camera.mvp,2)}renderObj(f.wall,camera.mvp,0);globalThis.__IWD&&globalThis.__IWD(f,i,rt)});
 if(IN.robj){gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-2,-6);IN.robj.forEach(o=>{if(o.fi==null||o.fi<=IN.cur)renderObj(o.obj,camera.mvp,0)});gl.disable(gl.POLYGON_OFFSET_FILL);
  gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendColor(0,0,0,.38);gl.blendFunc(gl.CONSTANT_ALPHA,gl.ONE_MINUS_CONSTANT_ALPHA);IN.robj.forEach(o=>renderObj(o.obj,camera.mvp,0));gl.disable(gl.BLEND);gl.enable(gl.DEPTH_TEST)}}
// ---------------- labels & floor bar
const world=$('gl').parentElement;const ilay=document.createElement('div');ilay.style.cssText='position:absolute;inset:0;pointer-events:none;overflow:hidden';world.appendChild(ilay);
const ist=document.createElement('style');ist.textContent=`.itag{position:absolute;left:0;top:0;white-space:nowrap;font-size:10.5px;line-height:1.15;text-align:center;background:#fffffff0;border:1px solid #cfd8cc;border-radius:6px;padding:2px 5px;color:#23412f;transform:translate(-50%,-50%)}.itag b{display:block;font-size:9.5px;color:#6b7d68}.itag.nm{background:none;border:0;font-weight:800;text-shadow:0 0 3px #fff,0 0 3px #fff}.itag.dst{background:#e8552e;color:#fff;border-color:#e8552e}.itag.dst b{color:#ffe2d6}
#ibar{position:absolute;right:70px;top:50%;transform:translateY(-50%);display:none;flex-direction:column;gap:5px;background:#fffffff2;border:1px solid #d7e2db;border-radius:14px;padding:8px;box-shadow:0 6px 20px #1c442022;z-index:5}#ibar button{width:48px;padding:8px 0;font-weight:800;font-size:12px}#ibar .ttl{font-size:10px;text-align:center;color:#55705c;font-weight:800;max-width:60px;line-height:1.3}#ibar .x{font-size:10px;font-weight:600}
.indoorBtn{margin-top:6px;background:#e8552e!important;color:#fff!important;border-color:#e8552e!important;font-weight:700}`;document.head.appendChild(ist);
const ibar=document.createElement('div');ibar.id='ibar';world.appendChild(ibar);
let itags=[];
function setIndoorFloor(i){IN.cur=i;[...ibar.querySelectorAll('button[data-i]')].forEach(b=>b.classList.toggle('on',+b.dataset.i===i));rebuildTags()}
function rebuildTags(){ilay.textContent='';itags=[];if(!IN.b||!IN.b.rt)return;const f=IN.b.rt.floors[IN.cur];
 for(const l of f.labels){if(l.kind==='stair'||l.kind==='elev')continue;const el=document.createElement('div');el.className='itag'+(l.id?'':' nm')+(IN.dst&&IN.dst===l?' dst':'');el.innerHTML=l.id?`<b>${l.id}</b>${l.name||''}`:l.name;ilay.appendChild(el);itags.push({el,p:[l.x,f.y+1.3,l.z],room:!!l.id})}}
function drawITags(){if(!itags.length)return;const IWs=globalThis.__INW,close=IWs?true:camera.dist<135;for(const t of itags){const p=project(t.p);if(!p||(IWs&&(t.room||Math.hypot(t.p[0]-camera.pos[0],t.p[2]-camera.pos[2])>16))||(t.room&&!close&&!t.el.classList.contains('dst'))){t.el.style.display='none';continue}t.el.style.display='block';t.el.style.left=p[0]+'px';t.el.style.top=p[1]+'px'}}
async function enterIndoor(ib,fid,keepRoute){const rt=await buildIndoor(ib);IN.b=ib;if(!keepRoute){IN.robj=null;IN.dst=null}
 const fi=fid?Math.max(0,rt.floors.findIndex(f=>f.id===fid)):Math.max(0,rt.floors.findIndex(f=>f.id==='1F'));
 ibar.innerHTML=`<div class="ttl">${ib.d.name.split('(')[0]}<br>실내</div>`+[...rt.floors.keys()].reverse().map(i=>`<button data-i="${i}">${rt.floors[i].id}</button>`).join('')+`<button class="x">나가기</button>`;
 ibar.style.display='flex';ibar.querySelectorAll('button[data-i]').forEach(b=>b.onclick=()=>setIndoorFloor(+b.dataset.i));ibar.querySelector('.x').onclick=exitIndoor;setIndoorFloor(fi);
 const [X0,Z0,X1,Z1]=ib.d.bounds,cx=(X0+X1)/2,cz=(Z0+Z1)/2;camera.mode='orbit';camera.target=[cx,rt.floors[fi].y,cz];camera.dist=clamp(Math.hypot(X1-X0,Z1-Z0)*.78+20,70,200);camera.pitch=.95;if(typeof setMode==='function')setMode()}
function exitIndoor(){IN.b=null;IN.robj=null;IN.dst=null;ibar.style.display='none';ilay.textContent='';itags=[]}
function indoorHook(b){const ib=IB.find(x=>x.bv===b);if(!ib){if(IN.b&&!IN.robj)exitIndoor();return}const bt=document.createElement('button');bt.className='indoorBtn';bt.textContent=`실내 보기 · ${ib.d.floors.filter(f=>f.id!=='RF').map(f=>f.id).join(' ')}`;bt.onclick=()=>enterIndoor(ib);
 const p=document.createElement('p');p.textContent=`입찰공고 공개 도면(DWG)으로 만든 실내 · ${ib.d.missing.length?'도면 없는 층: '+ib.d.missing.join(', '):'전 층'}`;$('selected').append(document.createElement('br'),bt,p)}
// ---------------- integrated routing
const RSEP='R';function roomOpts(){return IB.map((ib,bi)=>{const items=[];ib.d.floors.forEach((f,fi)=>f.labels.forEach((l,li)=>{if(l.g!=null&&(l.id||l.name.length>1)&&l.kind!=='stair'&&l.kind!=='elev')items.push([`${RSEP}${bi}_${fi}_${li}`,`${f.id} · ${l.id?l.id+' ':''}${l.name}`])}));return [ib,items]})}
for(const sel of [$('rFrom'),$('rTo')]){for(const [ib,items] of roomOpts()){if(!items.length)continue;const g=document.createElement('optgroup');g.label=`실내 · ${ib.d.name}`;items.forEach(([v,t])=>g.appendChild(new Option(t,v)));sel.appendChild(g)}}
function parseR(v){if(!String(v).startsWith(RSEP))return null;const [bi,fi,li]=v.slice(1).split('_').map(Number);const ib=IB[bi];return {ib,fi,l:ib.d.floors[fi].labels[li]}}
function ribbonY(dst,pts,w,col,y){for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2;const A=[a[0]+nx,y,a[1]+nz],Bq=[b[0]+nx,y,b[1]+nz],Cq=[b[0]-nx,y,b[1]-nz],Dq=[a[0]-nx,y,a[1]-nz];upT(dst,A,Bq,Cq,col);upT(dst,A,Cq,Dq,col)}}
function vertSeg(dst,a,ya,b,yb,col){const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*.35,nz=dx/l*.35;quad(dst,[a[0]+nx,ya,a[1]+nz],[b[0]+nx,yb,b[1]+nz],[b[0]-nx,yb,b[1]-nz],[a[0]-nx,ya,a[1]-nz],col);quad(dst,[a[0],ya,a[1]],[b[0],yb,b[1]],[b[0],yb+.6,b[1]],[a[0],ya+.6,a[1]],col)}
const _doRoute=doRoute;
doRoute=async function(fly){const sv=$('rFrom').value,tv=$('rTo').value,SR=parseR(sv),TR=parseR(tv);
 if(!SR&&!TR){IN.robj=null;$('rIndoor')&&($('rIndoor').textContent='');return _doRoute(fly)}
 stopWalk();const st=$('rSteps');st.textContent='';$('rWarn').textContent='';$('rRes').hidden=false;
 for(const R of [SR,TR])if(R)await buildIndoor(R.ib);
 const out=[];let best=null;
 const roomNode=R=>R.ib.rt.OFF[R.fi]+R.l.g;
 const cands=[];
 if(SR&&TR&&SR.ib===TR.ib){const D=idijk(SR.ib.rt,roomNode(SR));const p=ipath(SR.ib,D,roomNode(SR),roomNode(TR));if(p)cands.push({t:p.len/1.2+(p.runs.length-1)*15,inA:p,ibA:SR.ib})}
 else{const DA=SR?idijk(SR.ib.rt,roomNode(SR)):null,DB=TR?idijk(TR.ib.rt,roomNode(TR)):null;
  const ea=SR?SR.ib.rt.att.filter(a=>isFinite(DA.g[a.node])):[{ni:+sv}],eb=TR?TR.ib.rt.att.filter(a=>isFinite(DB.g[a.node])):[{ni:+tv}];
  for(const a of ea)for(const b of eb){const r=a.ni===b.ni?{time:0,edges:[],nodes:[a.ni]}:nroute(a.ni,b.ni,netMode);if(!r)continue;
   const tA=SR?DA.g[a.node]/1.2+a.d/1.2:0,tB=TR?DB.g[b.node]/1.2+b.d/1.2:0;cands.push({t:r.time+tA+tB,r,a,b})}}
 if(!cands.length){IN.robj=null;netRoute=null;routeObj=null;routeObjW=null;const li=document.createElement('li');li.textContent='도면상 연결된 출입구가 없어 경로를 만들 수 없습니다(해당 건물 출입구 층의 도면 미확보).';st.appendChild(li);$('rTime').textContent='-';$('rDist').textContent='-';$('rUp').textContent='-';return}
 best=cands.sort((x,y)=>x.t-y.t)[0];
 IN.runs2=[];const objs=[],addObj=(m,fi)=>objs.push({obj:upload(m),fi});let indoorL=0;const steps=[];
 const drawIn=(ib,p,targetIb)=>{const rt=ib.rt;p.runs.forEach(r=>IN.runs2.push({ib,f:r.f,pts:r.pts}));p.runs.forEach((r,k)=>{const y=rt.floors[r.f].y+.3,m=[];ribbonY(m,r.pts,.9,[1,.42,.18],y);addObj(m,IN.b===ib||targetIb===ib?r.f:null);
   if(k<p.runs.length-1){const n=p.runs[k+1],mm=[];vertSeg(mm,r.pts[r.pts.length-1],y,n.pts[0],rt.floors[n.f].y+.3,[1,.55,.25]);addObj(mm,null)}
   for(let i=0;i<r.pts.length-1;i++)indoorL+=Math.hypot(r.pts[i+1][0]-r.pts[i][0],r.pts[i+1][1]-r.pts[i][1])})};
 const dIb=TR?TR.ib:SR.ib;
 if(best.inA){drawIn(best.ibA,best.inA,dIb);netRoute=null;routeObj=null;routeObjW=null;
   steps.push(`${SR.ib.d.name} ${IFN(SR.ib.d.floors[SR.fi].id)} ${SR.l.id} ${SR.l.name} 출발`);best.inA.runs.slice(1).forEach(q=>steps.push(`계단 → ${IFN(best.ibA.d.floors[q.f].id)}`));steps.push(`${TR.l.id} ${TR.l.name} 도착`)}
 else{netRoute=best.r.edges.length?best.r:null;
  if(SR){const D=idijk(SR.ib.rt,roomNode(SR)),p=ipath(SR.ib,D,roomNode(SR),best.a.node);p.runs.reverse().forEach(r=>r.pts.reverse());drawIn(SR.ib,p,dIb);const m=[],fy=SR.ib.rt.floors[best.a.fi].y+.3;vertSeg(m,best.a.p,fy,[best.a.n.x,best.a.n.z],best.a.n.y+.5,[1,.62,.3]);addObj(m,null);
   steps.push(`${SR.ib.d.name} ${IFN(SR.ib.d.floors[SR.fi].id)} ${SR.l.id} ${SR.l.name} 출발`);p.runs.slice(1).forEach(q=>steps.push(`계단 → ${IFN(SR.ib.d.floors[q.f].id)}`));steps.push(`${best.a.n.nm}(으)로 나가기`)}
  if(TR){const D=idijk(TR.ib.rt,roomNode(TR)),p=ipath(TR.ib,D,roomNode(TR),best.b.node);p.runs.reverse().forEach(r=>r.pts.reverse());drawIn(TR.ib,p,dIb);const m=[],fy=TR.ib.rt.floors[best.b.fi].y+.3;vertSeg(m,[best.b.n.x,best.b.n.z],best.b.n.y+.5,best.b.p,fy,[1,.62,.3]);addObj(m,null);
   const ins=[`${best.b.n.nm}(으)로 들어가기 (${IFN(best.b.n.fl)})`];p.runs.slice(1).forEach(q=>ins.push(`계단 → ${IFN(TR.ib.d.floors[q.f].id)}`));ins.push(`${TR.l.id} ${TR.l.name} 도착`);best.tIns=ins}}
 // outdoor ribbons (same style as v22)
 let L=0,up=0;if(netRoute){const m=[],mw=[];netRoute.edges.forEach((ei,k)=>{const e=NE[ei];if(e.t!=='indoor'){L+=e.L;const dz=(e.a===netRoute.nodes[k]?1:-1)*e.dz;if(dz>0)up+=dz;ribbon(m,e.g,3.2,e.t==='steps'?[.80,.16,.12]:[1,.42,.18],.85);ribbon(mw,e.g,.9,e.t==='steps'?[.85,.2,.15]:[1,.55,.25],.22)}});routeObj=upload(m);routeObjW=upload(mw)}else{routeObj=null;routeObjW=null}
 IN.robj=objs;const T=best.t;$('rTime').textContent=T<90?Math.round(T)+'초':Math.round(T/60)+'분';$('rDist').textContent=Math.round(L+indoorL)+' m';$('rUp').textContent=Math.round(up)+' m';
 const add=(t,c,s)=>{const li=document.createElement('li');if(c)li.className=c;li.textContent=t;if(s){const sm=document.createElement('small');sm.textContent=s;li.appendChild(sm)}st.appendChild(li)};
 steps.forEach(t=>add(t,'',null));if(netRoute)ninstr(netRoute).forEach(o=>add(o.t,o.c,o.s));(best.tIns||[]).forEach(t=>add(t,'',null));
 add('실내 구간: 입찰공고 도면 기반 보행망(벽·창 관통 없음) · 출입구-실내 연결은 추정','',null);
 if(TR){IN.dst=TR.l;await enterIndoor(TR.ib,TR.ib.d.floors[TR.fi].id,true);if(fly&&netRoute){/* show whole: keep indoor view */}}
 else if(SR){IN.dst=null;await enterIndoor(SR.ib,SR.ib.d.floors[SR.fi].id,true);if(fly&&netRoute)flyRoute()}}
$('rFrom').onchange=$('rTo').onchange=()=>doRoute(true);$('rSwap').onclick=()=>{const t=$('rFrom').value;$('rFrom').value=$('rTo').value;$('rTo').value=t;doRoute(true)};
document.querySelectorAll('#rMode button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#rMode button').forEach(x=>x.classList.toggle('on',x===b));netMode=b.dataset.m;doRoute(false)});
$('rClear').onclick=()=>{stopWalk();netRoute=null;routeObj=null;routeObjW=null;IN.robj=null;$('rRes').hidden=true};
(function itick(){drawITags();requestAnimationFrame(itick)})();
// presets for the demo
{const pr=$('rPresets');if(pr){const mk=(txt,a,c)=>{const b=document.createElement('button');b.textContent=txt;b.onclick=()=>{$('rFrom').value=a;$('rTo').value=c;doRoute(true)};pr.appendChild(b)};
 const find=(code,id)=>{const bi=IB.findIndex(x=>x.d.code===code);if(bi<0)return null;for(const [fi,f] of IB[bi].d.floors.entries()){const li=f.labels.findIndex(l=>l.id===id||l.name===id);if(li>=0&&f.labels[li].g!=null)return `R${bi}_${fi}_${li}`}return null};
 const gate=String(nid('P_GATE_MAIN'));const n3=find('N','N301'),b3=find('B','B338');if(n3)mk('정문 → 니콜스관 N301',gate,n3);if(b3)mk('정문 → 학생미래인재관 B338',gate,b3)}}
globalThis.__IND={IB,IN,enterIndoor,exitIndoor,doRoute};


