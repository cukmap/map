// ===== v22: 출입구·보행 경로망과 길찾기 (net-1) =====
const NET=JSON.parse(document.getElementById('net').textContent),NN=NET.nodes,NE=NET.edges;
const NADJ=NN.map(()=>[]);NE.forEach((e,i)=>{NADJ[e.a].push(i);NADJ[e.b].push(i)});
let showNet=false,netMode='fast',netRoute=null,netObj=null,routeObj=null,routeObjW=null,routeTab=false,walker=null;
const NCOL={walk:[.97,.84,.36],road_campus:[.47,.76,.92],street:[.72,.62,.86],trail:[.46,.72,.44],steps:[.90,.30,.24],link:[.94,.94,.90]};
const NW={walk:1.5,road_campus:2.2,street:2.0,trail:1.0,steps:1.9,link:.7};
function ribbon(dst,pts,w,col,lift){const P=[];for(let i=0;i<pts.length-1;i++){const a=pts[i],b=pts[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.ceil(L/2));for(let k=0;k<n;k++){const t=k/n;P.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t])}}P.push(pts[pts.length-1]);
 for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];if(typeof TMASK_IJ==='function'&&!TMASK_IJ(((a[0]+b[0])/2+320)/4|0,((a[1]+b[1])/2+320)/4|0))continue;const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w/2,nz=dx/l*w/2,ya=H(a[0],a[1])+lift,yb=H(b[0],b[1])+lift;
  quad(dst,[a[0]+nx,ya,a[1]+nz],[b[0]+nx,yb,b[1]+nz],[b[0]-nx,yb,b[1]-nz],[a[0]-nx,ya,a[1]-nz],col)}}
{const m=[];for(const e of NE){if(e.t==='indoor')continue;ribbon(m,e.g,NW[e.t]||1.4,NCOL[e.t]||[.9,.9,.9],.45)}netObj=upload(m)}
const tob=s=>6*Math.exp(-3.5*Math.abs(s+.05))/3.6;
function ncost(e,mode,dir){const L=e.L,s=dir>0?e.s:-e.s;
 if(e.t==='indoor'){if(mode==='outdoor')return null;const f=e.fls||[1,1],nf=e.kind==='inter_building'?0:Math.abs(f[0]-f[1]);if(nf&&mode==='nostairs'&&e.el===false)return null;return Math.max(L,10)*1.3/1.2+(nf?30+3*nf:0)}
 if(e.t==='steps'){if(mode==='nostairs')return null;return L/.55+Math.abs(e.dz)}
 let sp=e.t==='trail'?tob(s)*.8:Math.min(1.35,tob(s));if(mode==='nostairs'&&e.st)return L/sp*2;return L/sp}
function nroute(s,t,mode){const n=NN.length,dist=new Float64Array(n).fill(Infinity),pv=new Int32Array(n).fill(-1),pe=new Int32Array(n).fill(-1),done=new Uint8Array(n);dist[s]=0;const pq=[[0,s]];
 while(pq.length){let bi=0;for(let i=1;i<pq.length;i++)if(pq[i][0]<pq[bi][0])bi=i;const [d,u]=pq.splice(bi,1)[0];if(done[u])continue;done[u]=1;if(u===t)break;
  for(const ei of NADJ[u]){const e=NE[ei],v=e.a===u?e.b:e.a,c=ncost(e,mode,e.a===u?1:-1);if(c==null)continue;if(d+c<dist[v]){dist[v]=d+c;pv[v]=u;pe[v]=ei;pq.push([dist[v],v])}}}
 if(!isFinite(dist[t]))return null;const edges=[],nodes=[t];let u=t;while(u!==s){edges.push(pe[u]);u=pv[u];nodes.push(u)}edges.reverse();nodes.reverse();return {time:dist[t],edges,nodes}}
const tko={walk:'보행로',road_campus:'교내 도로',street:'외부 도로',trail:'산책로',steps:'계단',link:'출입구 접근로'};
const nlabel=n=>n.k==='place'?n.nm:`${n.bn||n.b} · ${(n.nm||'').replace(n.bn||'','').trim()||'출입구'}${n.fl?' ['+n.fl+']':''}`;
function ninstr(r){const out=[];let acc=null;const fl=()=>{if(!acc)return;const p=[];if(acc.steps)p.push(`계단 ${acc.steps}곳`);if(acc.up>1)p.push(`오르막 ${Math.round(acc.up)} m`);if(acc.down>1)p.push(`내리막 ${Math.round(acc.down)} m`);const main=Object.entries(acc.ty).sort((a,b)=>b[1]-a[1])[0][0];out.push({t:`${tko[main]||'보행로'} 따라 ${Math.round(acc.L)} m`,s:p.join(' · '),c:''});acc=null};
 r.edges.forEach((ei,k)=>{const e=NE[ei],u=NN[r.nodes[k]],v=NN[r.nodes[k+1]];
  if(e.t==='indoor'){fl();if(e.kind==='inter_building')out.push({t:`연결 통로로 ${v.bn||v.b} ${v.fl||''} 방향`,s:e.note+' · 사용자 제공 연결관계',c:'in'});else if((u.fl||'1F')!==(v.fl||'1F'))out.push({t:`${u.bn||u.b} 안에서 ${netMode==='nostairs'?'엘리베이터로':'엘리베이터나 계단으로'} ${u.fl||'1F'} → ${v.fl||'1F'}`,s:'실내 경로는 추정',c:'in'});else out.push({t:`${u.bn||u.b} 건물 안을 지나 반대편 출입구로`,s:'같은 층 실내 통과(추정)',c:'in'});return}
  if(e.t==='link'&&u.k==='entrance'){fl();out.push({t:`${u.bn||u.b} ${u.fl||''} 출입구로 나오기`,s:u.nm,c:''})}
  if(!acc)acc={L:0,steps:0,up:0,down:0,ty:{}};acc.L+=e.L;acc.ty[e.t]=(acc.ty[e.t]||0)+e.L;const dz=(e.a===r.nodes[k]?1:-1)*e.dz;if(dz>0)acc.up+=dz;else acc.down-=dz;if(e.t==='steps')acc.steps++;
  if(e.t==='link'&&v.k==='entrance'){fl();out.push({t:`${v.bn||v.b} ${v.fl||''} 출입구로 들어가기`,s:v.nm,c:''})}});fl();return out}
const pickable=NN.map((n,i)=>i).filter(i=>NN[i].k==='entrance'||NN[i].k==='place');
function fillSel(sel){sel.textContent='';const og=document.createElement('optgroup');og.label='교문·장소';pickable.filter(i=>NN[i].k==='place').forEach(i=>og.appendChild(new Option(NN[i].nm,i)));sel.appendChild(og);
 const by={};pickable.filter(i=>NN[i].k==='entrance').forEach(i=>{const b=NN[i].bn||NN[i].b;(by[b]=by[b]||[]).push(i)});Object.keys(by).sort((a,b)=>a.localeCompare(b,'ko')).forEach(b=>{const g=document.createElement('optgroup');g.label=b;by[b].forEach(i=>g.appendChild(new Option(nlabel(NN[i]),i)));sel.appendChild(g)})}
const nid=id=>NN.findIndex(n=>n.id===id);fillSel($('rFrom'));fillSel($('rTo'));$('rFrom').value=nid('P_GATE_MAIN');$('rTo').value=nid('E_M_E1');
let clickStage=0;
function doRoute(fly){const s=+$('rFrom').value,t=+$('rTo').value;stopWalk();netRoute=s===t?null:nroute(s,t,netMode);
 const st=$('rSteps');st.textContent='';$('rWarn').textContent='';$('rRes').hidden=!netRoute&&s===t;
 if(!netRoute){routeObj=null;routeObjW=null;$('rTime').textContent='-';$('rDist').textContent='-';$('rUp').textContent='-';if(s!==t){const li=document.createElement('li');li.textContent='이 조건으로 이어지는 길이 없습니다. 조건을 바꿔 보세요.';st.appendChild(li)}return}
 let L=0,up=0;const low=new Set();const m=[],mw=[];
 netRoute.edges.forEach((ei,k)=>{const e=NE[ei];if(e.t!=='indoor'){L+=e.L;const dz=(e.a===netRoute.nodes[k]?1:-1)*e.dz;if(dz>0)up+=dz;ribbon(m,e.g,3.2,e.t==='steps'?[.80,.16,.12]:[1,.42,.18],.85);ribbon(mw,e.g,.9,e.t==='steps'?[.85,.2,.15]:[1,.55,.25],.22)}if(e.cf==='C'&&e.t!=='link')low.add(e.t==='indoor'?'실내 연결':(e.nm||tko[e.t]))});
 netRoute.nodes.forEach(i=>{if(NN[i].k==='entrance'&&NN[i].cf==='C')low.add(nlabel(NN[i]))});routeObj=upload(m);routeObjW=upload(mw);
 const T=netRoute.time;$('rTime').textContent=T<90?Math.round(T)+'초':Math.round(T/60)+'분';$('rDist').textContent=Math.round(L)+' m';$('rUp').textContent=Math.round(up)+' m';
 ninstr(netRoute).forEach(o=>{const li=document.createElement('li');if(o.c)li.className=o.c;li.textContent=o.t;if(o.s){const sm=document.createElement('small');sm.textContent=o.s;li.appendChild(sm)}st.appendChild(li)});
 if(low.size)$('rWarn').textContent='현장 확인이 필요한 추정 구간 포함: '+[...low].slice(0,5).join(', ')+(low.size>5?' 외':'');
 if(fly)flyRoute()}
function flyRoute(){if(!netRoute)return;stopWalk();let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;netRoute.nodes.forEach(i=>{const n=NN[i];x0=Math.min(x0,n.x);x1=Math.max(x1,n.x);z0=Math.min(z0,n.z);z1=Math.max(z1,n.z)});
 const cx=(x0+x1)/2,cz=(z0+z1)/2,span=Math.max(x1-x0,z1-z0,60);camera.mode='orbit';camera.target=[cx,H(cx,cz)+8,cz];camera.dist=clamp(span*1.9+90,170,1100);camera.pitch=1.0;setMode()}
// ----- 경로 따라 걷기 (Campus Quest 이동 엔진의 첫 단계) -----
function buildLegs(r){const legs=[];let cur=null;r.edges.forEach((ei,k)=>{const e=NE[ei],fw=e.a===r.nodes[k],g=fw?e.g:e.g.slice().reverse();
  if(e.t==='indoor'){if(cur){legs.push(cur);cur=null}const u=NN[r.nodes[k]],v=NN[r.nodes[k+1]];legs.push({indoor:true,msg:e.kind==='inter_building'?`연결 통로 → ${v.bn||v.b} ${v.fl||''}`:((u.fl||'1F')!==(v.fl||'1F')?`${u.bn||u.b} 실내 · 엘리베이터 ${u.fl||'1F'} → ${v.fl||'1F'}`:`${u.bn||u.b} 실내 통과`),to:[v.x,v.z]});return}
  if(!cur)cur={pts:[]};for(const p of g){const q=cur.pts[cur.pts.length-1];if(!q||Math.hypot(q[0]-p[0],q[1]-p[1])>.05)cur.pts.push(p)}});if(cur)legs.push(cur);return legs}
function stopWalk(){if(walker){walker=null;$('mode').textContent=walkTxt;$('rWalk').textContent='경로 따라 걷기'}}
const walkTxt=$('mode').textContent;
function startWalk(){if(!netRoute)return;if(walker){stopWalk();return}const legs=buildLegs(netRoute);walker={legs,li:0,pi:0,t:0,wait:0,last:0};camera.mode='walk';const p=legs[0].pts?legs[0].pts[0]:legs[0].to;camera.pos=[p[0],H(p[0],p[1])+1.8,p[1]];camera.pitch=-.05;setMode();$('rWalk').textContent='걷기 멈추기';requestAnimationFrame(walkStep)}
function walkStep(now){if(!walker)return;if(camera.mode!=='walk'){stopWalk();return}const dt=Math.min(.05,walker.last?(now-walker.last)/1000:1/60);walker.last=now;const leg=walker.legs[walker.li];
 if(!leg){$('mode').textContent='도착했습니다 · ESC로 지도 보기';walker=null;$('rWalk').textContent='경로 따라 걷기';return}
 if(leg.indoor){if(!walker.wait){walker.wait=now;$('mode').textContent=leg.msg}if(now-walker.wait>1700){camera.pos=[leg.to[0],0,leg.to[1]];walker.wait=0;walker.li++;walker.pi=0}requestAnimationFrame(walkStep);return}
 $('mode').textContent='경로 따라 걷는 중 · 다시 누르면 멈춤';let step=(held&&held.shift?14:6)*dt;
 while(step>0&&walker.pi<leg.pts.length-1){const a=[camera.pos[0],camera.pos[2]],b=leg.pts[walker.pi+1],d=Math.hypot(b[0]-a[0],b[1]-a[1]);
  const ty=Math.atan2(b[0]-a[0],-(b[1]-a[1]));let dy=((ty-camera.yaw+Math.PI*3)%(Math.PI*2))-Math.PI;camera.yaw+=dy*Math.min(1,dt*5);
  if(d<=step){camera.pos=[b[0],0,b[1]];step-=d;walker.pi++}else{camera.pos=[a[0]+(b[0]-a[0])/d*step,0,a[1]+(b[1]-a[1])/d*step];step=0}}
 if(walker.pi>=leg.pts.length-1){walker.li++;walker.pi=0}requestAnimationFrame(walkStep)}
// ----- 화면 오버레이: 출입구 점, 출발·도착, 실내 연결 -----
const nov=$('netov'),nctx=nov.getContext('2d');
function drawNet(){const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,2);if(nov.width!==Math.round(w*dpr)||nov.height!==Math.round(h*dpr)){nov.width=Math.round(w*dpr);nov.height=Math.round(h*dpr)}
 nctx.setTransform(dpr,0,0,dpr,0,0);nctx.clearRect(0,0,w,h);if(!(showNet||netRoute||routeTab)||(walker&&camera.mode==='walk'))return;
 const near=camera.mode==='top'?camera.dist<520:camera.dist<620;
 if(netRoute){netRoute.edges.forEach((ei,k)=>{const e=NE[ei];if(e.t!=='indoor')return;const u=NN[e.a],v=NN[e.b],p=project([u.x,u.y+2.5,u.z]),q=project([v.x,v.y+2.5,v.z]);if(!p||!q)return;nctx.setLineDash([7,5]);nctx.lineWidth=4;nctx.strokeStyle='#1f3d2e';nctx.beginPath();nctx.moveTo(p[0],p[1]);nctx.lineTo(q[0],q[1]);nctx.stroke();nctx.lineWidth=2.4;nctx.strokeStyle='#ffb35c';nctx.stroke();nctx.setLineDash([]);
  const t=(u.fl||'1F')!==(v.fl||'1F')&&e.kind!=='inter_building'?`${u.fl}→${v.fl}`:'실내';nctx.font='700 11px system-ui,sans-serif';const mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2,tw=nctx.measureText(t).width+10;nctx.fillStyle='#ffb35c';nctx.fillRect(mx-tw/2,my-9,tw,18);nctx.fillStyle='#1f3d2e';nctx.textAlign='center';nctx.textBaseline='middle';nctx.fillText(t,mx,my)})}
 for(const i of pickable){const n=NN[i];const onR=netRoute&&netRoute.nodes.includes(i);if(!showNet&&!routeTab&&!onR)continue;if(!onR&&!TMASK_IJ((n.x+320)/4|0,(n.z+320)/4|0))continue;if(!near&&!onR)continue;const p=project([n.x,n.y+1.4,n.z]);if(!p)continue;
  nctx.beginPath();nctx.arc(p[0],p[1],n.k==='place'?6:5,0,7);nctx.fillStyle=n.k==='place'?'#99CCEE':({A:'#5fbf7f',B:'#ffd84d',C:'#ff9a4d'}[n.cf]||'#ffd84d');nctx.fill();nctx.lineWidth=2;nctx.strokeStyle='#1f3d2e';nctx.stroke();
  if(near&&n.k==='entrance'&&n.fl){nctx.font='700 10px system-ui,sans-serif';nctx.textAlign='left';nctx.textBaseline='middle';nctx.lineWidth=3;nctx.strokeStyle='#fff';nctx.strokeText(n.fl,p[0]+8,p[1]);nctx.fillStyle='#1f3d2e';nctx.fillText(n.fl,p[0]+8,p[1])}}
 if(netRoute){[[netRoute.nodes[0],'출발','#2e9e5b'],[netRoute.nodes[netRoute.nodes.length-1],'도착','#e5532e']].forEach(([i,t,c])=>{const n=NN[i],p=project([n.x,n.y+1.4,n.z]);if(!p)return;nctx.beginPath();nctx.arc(p[0],p[1],9,0,7);nctx.fillStyle=c;nctx.fill();nctx.lineWidth=3;nctx.strokeStyle='#fff';nctx.stroke();
  nctx.font='800 12px system-ui,sans-serif';const tw=nctx.measureText(t).width+14;nctx.fillStyle=c;nctx.beginPath();nctx.roundRect?nctx.roundRect(p[0]-tw/2,p[1]-34,tw,20,10):nctx.rect(p[0]-tw/2,p[1]-34,tw,20);nctx.fill();nctx.fillStyle='#fff';nctx.textAlign='center';nctx.textBaseline='middle';nctx.fillText(t,p[0],p[1]-24)})}}
globalThis.__netPick=e=>{if(!(showNet||routeTab))return false;const r=canvas.getBoundingClientRect(),mx=e.clientX-r.left,my=e.clientY-r.top;let best=-1,bd=15;for(const i of pickable){const n=NN[i],p=project([n.x,n.y+1.4,n.z]);if(!p)continue;const d=Math.hypot(p[0]-mx,p[1]-my);if(d<bd){bd=d;best=i}}
 if(best<0)return false;if(!routeTab)setTab(true);if(clickStage===0){$('rFrom').value=best;clickStage=1}else{$('rTo').value=best;clickStage=0}doRoute(false);return true};
function setTab(r){routeTab=r;$('intro').style.visibility=r?'hidden':'';$('tabB').classList.toggle('on',!r);$('tabR').classList.toggle('on',r);$('routePane').hidden=!r;for(const id of ['search','buildings','selected'])$(id).style.display=r?'none':'';document.querySelector('.statrow').style.display=r?'none':'';if(r&&!netRoute)doRoute(true)}
$('tabB').onclick=()=>setTab(false);$('tabR').onclick=()=>setTab(true);
$('netBtn').onclick=()=>{showNet=!showNet;$('netBtn').classList.toggle('on',showNet)};
$('rFrom').onchange=$('rTo').onchange=()=>doRoute(true);$('rSwap').onclick=()=>{const t=$('rFrom').value;$('rFrom').value=$('rTo').value;$('rTo').value=t;doRoute(true)};
document.querySelectorAll('#rMode button').forEach(b=>b.onclick=()=>{document.querySelectorAll('#rMode button').forEach(x=>x.classList.toggle('on',x===b));netMode=b.dataset.m;doRoute(false)});
document.querySelectorAll('#rPresets button').forEach(b=>b.onclick=()=>{const [a,c]=b.dataset.p.split('|');$('rFrom').value=nid(a);$('rTo').value=nid(c);doRoute(true)});
$('rFly').onclick=flyRoute;$('rWalk').onclick=startWalk;$('rClear').onclick=()=>{stopWalk();netRoute=null;routeObj=null;routeObjW=null;$('rRes').hidden=true};
globalThis.__NET={NN,NE,nroute,get route(){return netRoute},doRoute,setTab,startWalk};

