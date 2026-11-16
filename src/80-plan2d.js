// ===== 평면 지도 (2D · 층별 평면도) 시안 — 2026-11-13 =====
// 입체 지도·지상 시점과 별개의 2D 캔버스 모드. 실외는 재질 지도(matid)를 지도 색으로 다시 칠하고,
// 실내 도면이 있는 6개 동은 확대하면 층별 평면도(방 영역 색 + 도면 선 + 방 이름)를 보여 준다.
{const P2D=JSON.parse(document.getElementById('plan2d').textContent);
const PL={on:false,cx:10,cz:20,s:1.1,fl:{},focus:null,sel:null,dirty:true,base:null,cache:{}};
const world2=$('gl').parentElement;
const st2=document.createElement('style');st2.textContent=`#p2{position:absolute;inset:0;z-index:60;display:none;background:#eef0ea;touch-action:none;user-select:none;-webkit-user-select:none}#p2 canvas{position:absolute;inset:0;width:100%;height:100%;cursor:grab}
#p2bar{position:absolute;right:16px;top:50%;transform:translateY(-50%);display:none;flex-direction:column;gap:0;background:#fff;border:1px solid #cfd6d0;border-radius:10px;box-shadow:0 4px 16px #0002;overflow:hidden;max-height:80%}
#p2bar .ttl{font-size:10px;font-weight:800;color:#55705c;text-align:center;padding:7px 6px 5px;max-width:64px;line-height:1.3;border-bottom:1px solid #e3e8e3}
#p2bar button{width:64px;padding:10px 0;border:0;border-radius:0;border-bottom:1px solid #eef1ee;background:#fff;font-weight:800;font-size:13px;color:#33423a;cursor:pointer}#p2bar button:last-child{border-bottom:0}#p2bar button.on{background:#2f6fed;color:#fff}
#p2zoom{position:absolute;right:16px;bottom:22px;display:flex;flex-direction:column;background:#fff;border:1px solid #cfd6d0;border-radius:10px;box-shadow:0 4px 16px #0002;overflow:hidden}#p2zoom button{width:40px;height:40px;border:0;border-radius:0;background:#fff;font-size:18px;font-weight:700;color:#33423a;cursor:pointer}#p2zoom button+button{border-top:1px solid #eef1ee}
#p2hint{position:absolute;left:14px;top:14px;background:#ffffffee;border:1px solid #d7ddd7;border-radius:10px;padding:8px 11px;font-size:11.5px;line-height:1.5;color:#3d4a42;max-width:min(330px,70%);box-shadow:0 2px 10px #0001}#p2hint b{color:#2f6fed}
#p2info{position:absolute;left:14px;bottom:18px;display:none;background:#fff;border:1px solid #cfd6d0;border-radius:12px;padding:11px 13px;box-shadow:0 6px 20px #0002;max-width:min(300px,72%);font-size:12px;color:#33423a}#p2info h4{margin:0 0 2px;font-size:15px}#p2info small{color:#6b7a70}#p2info .row{display:flex;gap:6px;margin-top:8px}#p2info button{font-size:11.5px;padding:6px 10px}#p2info .go{background:#2f6fed;color:#fff;border-color:#2f6fed}
body.p2on .indoorBtn{display:none}`;document.head.appendChild(st2);
const p2=document.createElement('div');p2.id='p2';p2.innerHTML=`<canvas></canvas><div id="p2hint"><b>평면 지도 · 시안</b><br>드래그 이동 · 휠/두 손가락 확대 · 실내 도면이 있는 건물(파란 테두리)을 확대하면 층별 평면도가 나옵니다.</div><div id="p2bar"></div><div id="p2zoom"><button data-z="1.5">＋</button><button data-z="0.667">−</button></div><div id="p2info"></div>`;world2.appendChild(p2);
const cv=p2.querySelector('canvas'),cx2=cv.getContext('2d'),bar=p2.querySelector('#p2bar'),info=p2.querySelector('#p2info');
const pb=document.createElement('button');pb.id='planBtn';pb.textContent='평면 지도';$('walkBtn').after(pb);
// ---- 실외 바탕: 재질 id → 지도 색
const BCOL=[[238,240,234],[255,255,255],[245,242,233],[240,231,212],[207,230,189],[188,220,171],[234,223,184],[169,211,160],[228,223,212],[217,211,198]];
function makeBase(){const im=$('matidTexture');if(!im||!im.complete||!im.naturalWidth)return null;const N=2048,c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d');g.drawImage(im,0,0,N,N);
 const d=g.getImageData(0,0,N,N),a=d.data;for(let i=0;i<a.length;i+=4){const k=Math.min(9,Math.round(a[i]/20)),q=BCOL[k];a[i]=q[0];a[i+1]=q[1];a[i+2]=q[2];a[i+3]=255}g.putImageData(d,0,0);return c}
// ---- 방 분류·색
const CAT=l=>{const n=(l.name||'').replace(/\s/g,'');if(l.kind==='wc'||/화장실|TOILET|샤워/i.test(n))return 'wc';if(l.kind==='stair'||l.kind==='elev'||/계단|승강|^EV|^ELEV/i.test(n))return 'st';
 if(/식당|편의점|카페|서점|매점|가게|주방|라운지|휴게|CAFE/i.test(n))return 'shop';if(/기계|전기|창고|발전|변전|보일러|^PS$|D\.?W|공조|펌프|물탱크|EPS|TPS|덕트/i.test(n))return 'mech';
 if(/연구실|교수|사무|행정|학과|학부|센터|처$|팀$|회의/.test(n))return 'off';return 'room'};
const RCOL={wc:[207,226,246],st:[224,221,214],shop:[253,225,196],mech:[229,229,226],off:[223,236,222],room:[253,241,204],none:[240,238,232],sel:[255,170,140]};
const ibs=IB.filter(ib=>ib.bv&&P2D[ib.d.code]);
function fdata(ib,fi){const key=ib.d.code+'|'+fi;let o=PL.cache[key];if(o)return o;const f=ib.d.floors[fi],[X0,Z0,X1,Z1]=ib.d.bounds;o=PL.cache[key]={ib,fi,f,ids:null,W:0,H:0,col:null,tex:null,X0,Z0,X1,Z1};
 const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,c.width,c.height).data;const ids=new Uint8Array(c.width*c.height);for(let i=0;i<ids.length;i++)ids[i]=d[i*4];o.ids=ids;o.W=c.width;o.H=c.height;recolor(o);PL.dirty=true};im.src=P2D[ib.d.code][f.id];
 const t=new Image();t.onload=()=>{o.tex=t;PL.dirty=true};t.src=f.tex;return o}
function recolor(o){if(!o.ids)return;const c=o.col||(o.col=document.createElement('canvas'));c.width=o.W;c.height=o.H;const g=c.getContext('2d'),d=g.createImageData(o.W,o.H),a=d.data,L=o.f.labels;const lut=[];
 for(let i=0;i<256;i++){let q=null;if(i===254)q=RCOL.none;else if(i>0&&L[i-1])q=(PL.sel&&PL.sel.o===o&&PL.sel.li===i-1)?RCOL.sel:RCOL[CAT(L[i-1])];lut.push(q)}
 for(let i=0;i<o.ids.length;i++){const q=lut[o.ids[i]];if(q){a[i*4]=q[0];a[i*4+1]=q[1];a[i*4+2]=q[2];a[i*4+3]=255}}g.putImageData(d,0,0)}
const curFi=ib=>{const c=ib.d.code;if(PL.fl[c]==null){const i=ib.d.floors.findIndex(f=>f.id==='1F');PL.fl[c]=i<0?0:i}return PL.fl[c]};
// ---- 좌표
let Wc=0,Hc=0;const sx=x=>Wc/2+(x-PL.cx)*PL.s,sz=z=>Hc/2+(z-PL.cz)*PL.s,wx=px=>PL.cx+(px-Wc/2)/PL.s,wz=py=>PL.cz+(py-Hc/2)/PL.s;
const PLAN_S=2.4;  // 이 배율(px/m)부터 층별 평면도
const polyPath=(g,P)=>{g.moveTo(sx(P[0][0]),sz(P[0][1]));for(let i=1;i<P.length;i++)g.lineTo(sx(P[i][0]),sz(P[i][1]));g.closePath()};
const partsOf=b=>(b.spec&&b.spec.parts&&b.spec.parts.length)?b.spec.parts.map(p=>p.poly):[b.poly];
function text(g,t,x,y,font,col,halo){g.font=font;g.textAlign='center';g.textBaseline='middle';if(halo){g.lineWidth=3.5;g.strokeStyle='#fffffff0';g.lineJoin='round';g.strokeText(t,x,y)}g.fillStyle=col;g.fillText(t,x,y)}
function draw(){const dpr=Math.min(devicePixelRatio||1,2),w=cv.clientWidth,h=cv.clientHeight;if(w<10||h<10)return;if(cv.width!==Math.round(w*dpr)||cv.height!==Math.round(h*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(h*dpr)}
 Wc=w;Hc=h;const g=cx2;g.setTransform(dpr,0,0,dpr,0,0);g.fillStyle='#eef0ea';g.fillRect(0,0,w,h);
 if(!PL.base)PL.base=makeBase();if(PL.base){g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';g.drawImage(PL.base,sx(-320),sz(-320),640*PL.s,640*PL.s)}
 // 캠퍼스 경계
 if(DATA.campus&&DATA.campus.length>2){g.beginPath();polyPath(g,DATA.campus);g.setLineDash([6,5]);g.strokeStyle='#9bb59a';g.lineWidth=1.2;g.stroke();g.setLineDash([])}
 const plan=PL.s>=PLAN_S,placed=[];const free=(x,y,tw,th)=>{const r=[x-tw/2-2,y-th/2-1,x+tw/2+2,y+th/2+1];if(r[2]<0||r[3]<0||r[0]>w||r[1]>h)return false;for(const q of placed)if(r[0]<q[2]&&r[2]>q[0]&&r[1]<q[3]&&r[3]>q[1])return false;placed.push(r);return true};
 // 건물 외곽
 for(const b of B){const ib=ibs.find(x=>x.bv===b);if(ib&&plan)continue;g.beginPath();for(const P of partsOf(b))if(P&&P.length>2)polyPath(g,P);g.fillStyle=ib?(plan?'#e6e1d6':'#dfe7f6'):'#ded8cc';g.fill();g.strokeStyle=ib?'#5b86d6':'#b3a998';g.lineWidth=ib?1.6:1;g.stroke()}
 // 층별 평면도
 if(plan)for(const ib of ibs){const [X0,Z0,X1,Z1]=ib.d.bounds;if(sx(X1)<0||sx(X0)>w||sz(Z1)<0||sz(Z0)>h)continue;const fi=curFi(ib),o=fdata(ib,fi),f=o.f;
  g.save();g.beginPath();for(const s of f.slabs)polyPath(g,s);g.fillStyle='#fcfbf8';g.fill();g.clip();
  if(o.col){g.imageSmoothingEnabled=true;g.drawImage(o.col,sx(X0),sz(Z0),o.W/10*PL.s,o.H/10*PL.s)}
  if(o.tex){g.globalCompositeOperation='multiply';g.globalAlpha=PL.s>6?.85:.6;g.drawImage(o.tex,sx(X0),sz(Z0),(X1-X0)*PL.s,(Z1-Z0)*PL.s);g.globalAlpha=1;g.globalCompositeOperation='source-over'}
  g.restore();g.beginPath();for(const s of f.slabs)polyPath(g,s);g.strokeStyle='#7d8794';g.lineWidth=1.4;g.stroke()}
 // 경로
 const line=(pts,col,wd)=>{if(pts.length<2)return;g.beginPath();g.moveTo(sx(pts[0][0]),sz(pts[0][1]));for(let i=1;i<pts.length;i++)g.lineTo(sx(pts[i][0]),sz(pts[i][1]));g.lineJoin=g.lineCap='round';g.strokeStyle='#fff';g.lineWidth=wd+3;g.stroke();g.strokeStyle=col;g.lineWidth=wd;g.stroke()};
 if(netRoute)for(const ei of netRoute.edges){const e=NE[ei];if(e.t!=='indoor'&&e.g)line(e.g,e.t==='steps'?'#c8322a':'#ff6a2b',4)}
 if(IN.robj&&IN.runs2)for(const r of IN.runs2){if(plan&&curFi(r.ib)===r.f)line(r.pts,'#ff6a2b',3.5)}
 // 출입구
 if(PL.s>=1.8)for(const n of NN){if(n.k!=='entrance'||!n.nm)continue;const x=sx(n.x),y=sz(n.z);if(x<-10||y<-10||x>w+10||y>h+10)continue;g.beginPath();g.arc(x,y,PL.s>=4?4.5:3.2,0,7);g.fillStyle='#ff8a3d';g.fill();g.strokeStyle='#fff';g.lineWidth=1.5;g.stroke()}
 // 방 이름
 if(plan)for(const ib of ibs){const o=fdata(ib,curFi(ib)),L=o.f.labels;const ord=L.map((l,i)=>i).sort((a,b)=>((L[b].name?1:0)+(PL.sel&&PL.sel.o===o&&PL.sel.li===b?5:0))-((L[a].name?1:0)+(PL.sel&&PL.sel.o===o&&PL.sel.li===a?5:0)));
  for(const i of ord){const l=L[i],x=sx(l.x),y=sz(l.z);if(x<-40||y<-20||x>w+40||y>h+20)continue;if(!o.f.slabs.some(q=>inPoly(l.x,l.z,q)))continue;const cat=CAT(l),sel=PL.sel&&PL.sel.o===o&&PL.sel.li===i;
   if(cat==='st'||cat==='wc'){if(PL.s<3.6)continue;const t=cat==='wc'?'화장실':(l.kind==='elev'?'EV':'계단');g.font='700 9.5px system-ui,sans-serif';const tw=g.measureText(t).width+8;if(!free(x,y,tw,14))continue;g.fillStyle=cat==='wc'?'#4f8fdc':'#8a8f96';g.beginPath();g.roundRect?g.roundRect(x-tw/2,y-7,tw,14,4):g.rect(x-tw/2,y-7,tw,14);g.fill();g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';g.fillText(t,x,y+.5);continue}
   const nm=(l.name||'').replace(/\s+/g,' ').trim(),id=l.id||'';if(!nm&&!id)continue;if(PL.s<4.2&&!sel&&!(nm&&PL.s>=3.2))continue;
   const main=nm||id,fs=sel?12.5:(PL.s>=7?12:11);g.font=`700 ${fs}px system-ui,sans-serif`;const tw=Math.max(g.measureText(main).width,nm&&id?g.measureText(id).width:0),th=nm&&id&&PL.s>=5?fs*2+2:fs+2;if(!free(x,y,tw,th))continue;
   if(nm&&id&&PL.s>=5){text(g,id,x,y-fs*.55,`600 ${fs-2}px system-ui,sans-serif`,'#7a857d',true);text(g,nm,x,y+fs*.5,`700 ${fs}px system-ui,sans-serif`,sel?'#c2401c':'#2e3a33',true)}else text(g,main,x,y,`700 ${fs}px system-ui,sans-serif`,sel?'#c2401c':'#2e3a33',true)}}
 // 건물 이름
 for(const b of B){const ib=ibs.find(x=>x.bv===b),x=sx(b.cx),y=sz(b.cz);if(x<-60||y<-20||x>w+60||y>h+20)continue;if(ib&&plan&&PL.s>=3.4)continue;const nm=(b.name||'').split('(')[0].trim();if(!nm)continue;const fs=PL.s>=2?13:11.5;g.font=`800 ${fs}px system-ui,sans-serif`;const tw=g.measureText(nm).width;if(!free(x,y,tw,fs+(ib?14:2)))continue;
  text(g,nm,x,y-(ib?6:0),`800 ${fs}px system-ui,sans-serif`,'#27352d',true);if(ib)text(g,plan?ib.d.floors[curFi(ib)].id+' 평면도':'층별 지도',x,y+8,'700 9.5px system-ui,sans-serif','#2f6fed',true)}
 if(PL.s<3)for(const p of (DATA.pois||[])){const x=sx(p.xy[0]),y=sz(p.xy[1]);g.font='700 10.5px system-ui,sans-serif';const tw=g.measureText(p.name).width;if(free(x,y,tw,12))text(g,p.name,x,y,'700 10.5px system-ui,sans-serif','#4d7a52',true)}
 // 축척·방위
 const nice=[1,2,5,10,20,50,100,200].find(m=>m*PL.s>=60)||200,bx=w-16-nice*PL.s-70,by=h-18;g.fillStyle='#ffffffd8';g.fillRect(bx-8,by-16,nice*PL.s+16,24);g.strokeStyle='#33423a';g.lineWidth=1.5;g.beginPath();g.moveTo(bx,by-4);g.lineTo(bx,by);g.lineTo(bx+nice*PL.s,by);g.lineTo(bx+nice*PL.s,by-4);g.stroke();text(g,nice+' m',bx+nice*PL.s/2,by-9,'700 10px system-ui,sans-serif','#33423a',false);
 text(g,'N ↑',w-34,22,'800 12px system-ui,sans-serif','#33423a',true);
 updBar()}
// ---- 층 선택 막대 (화면 중앙에 가까운 실내 건물)
let barKey='';
function updBar(){let best=null,bd=1e9;if(PL.s>=PLAN_S)for(const ib of ibs){const [X0,Z0,X1,Z1]=ib.d.bounds;if(sx(X1)<0||sx(X0)>Wc||sz(Z1)<0||sz(Z0)>Hc)continue;const d=Math.hypot(ib.bv.cx-PL.cx,ib.bv.cz-PL.cz);if(d<bd){bd=d;best=ib}}
 PL.focus=best;const key=best?best.d.code+'|'+curFi(best):'';if(key===barKey)return;barKey=key;if(!best){bar.style.display='none';return}
 bar.innerHTML=`<div class="ttl">${best.d.name.split('(')[0]}</div>`+[...best.d.floors.keys()].reverse().map(i=>`<button data-i="${i}" class="${i===curFi(best)?'on':''}">${best.d.floors[i].id}</button>`).join('');bar.style.display='flex';
 bar.querySelectorAll('button').forEach(b=>b.onclick=()=>{PL.fl[best.d.code]=+b.dataset.i;if(PL.sel&&PL.sel.o.ib===best)setSel(null);PL.dirty=true})}
function setSel(s){const old=PL.sel;PL.sel=s;if(old)recolor(old.o);if(s)recolor(s.o);if(!s){info.style.display='none';PL.dirty=true;return}
 const l=s.o.f.labels[s.li],ib=s.o.ib,bi=IB.indexOf(ib),can=l.g!=null&&(l.id||(l.name||'').length>1);info.innerHTML=`<small>${ib.d.name.split('(')[0]} · ${IFN(s.o.f.id)}</small><h4>${(l.id?l.id+' ':'')+(l.name||'')||'이름 없는 방'}</h4><div class="row">${can?'<button class="go">여기까지 길찾기</button>':''}<button class="x">닫기</button></div>`;info.style.display='block';
 info.querySelector('.x').onclick=()=>setSel(null);const go=info.querySelector('.go');if(go)go.onclick=async()=>{const v=`R${bi}_${s.o.fi}_${s.li}`;$('rTo').value=v;if($('rTo').value!==v)return;try{if(typeof setTab==='function')setTab(true)}catch(e){}await doRoute(false);PL.fl[ib.d.code]=s.o.fi;PL.dirty=true};PL.dirty=true}
// ---- 조작
function zoomAt(px,py,k){const x=wx(px),z=wz(py);PL.s=clamp(PL.s*k,.55,40);PL.cx=x-(px-Wc/2)/PL.s;PL.cz=z-(py-Hc/2)/PL.s;PL.dirty=true}
const ptrs=new Map();let pinch=null,moved=0;
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,[e.clientX,e.clientY]);moved=0;if(ptrs.size===2){const p=[...ptrs.values()];pinch=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1])}cv.style.cursor='grabbing'});
cv.addEventListener('pointermove',e=>{const q=ptrs.get(e.pointerId);if(!q)return;const dx=e.clientX-q[0],dy=e.clientY-q[1];ptrs.set(e.pointerId,[e.clientX,e.clientY]);moved+=Math.abs(dx)+Math.abs(dy);
 if(ptrs.size===1){PL.cx-=dx/PL.s;PL.cz-=dy/PL.s;PL.dirty=true}else if(ptrs.size===2&&pinch){const p=[...ptrs.values()],d=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]),r=cv.getBoundingClientRect();zoomAt((p[0][0]+p[1][0])/2-r.left,(p[0][1]+p[1][1])/2-r.top,d/pinch);pinch=d}});
const up=e=>{const had=ptrs.size;ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;cv.style.cursor='grab';if(had===1&&moved<6&&e.type==='pointerup'){const r=cv.getBoundingClientRect();tap(e.clientX-r.left,e.clientY-r.top)}};
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
cv.addEventListener('wheel',e=>{e.preventDefault();const r=cv.getBoundingClientRect(),dy=e.deltaMode===1?e.deltaY*33:e.deltaY;zoomAt(e.clientX-r.left,e.clientY-r.top,Math.exp(-clamp(dy,-200,200)*.0015))},{passive:false});
cv.addEventListener('dblclick',e=>{const r=cv.getBoundingClientRect();zoomAt(e.clientX-r.left,e.clientY-r.top,e.shiftKey?.5:1.8)});
p2.querySelectorAll('#p2zoom button').forEach(b=>b.onclick=()=>zoomAt(Wc/2,Hc/2,+b.dataset.z));
const inPoly=(x,z,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c}return c};
function tap(px,py){const x=wx(px),z=wz(py);
 if(PL.s>=PLAN_S)for(const ib of ibs){const o=fdata(ib,curFi(ib));if(!o.ids||!o.f.slabs.some(s=>inPoly(x,z,s)))continue;const ix=Math.floor((x-o.X0)*10),iz=Math.floor((z-o.Z0)*10);const v=(ix>=0&&iz>=0&&ix<o.W&&iz<o.H)?o.ids[iz*o.W+ix]:0;
  if(v>0&&v<254&&o.f.labels[v-1]){setSel({o,li:v-1});return}setSel(null);return}
 for(const b of B){if(partsOf(b).some(P=>P&&P.length>2&&inPoly(x,z,P))){focusB(b);return}}setSel(null)}
// ---- 모드 전환
function planOn(){if(PL.on)return;if(document.pointerLockElement)document.exitPointerLock();PL.on=true;globalThis.__P2ON=true;document.body.classList.add('p2on');
 if(IN.b&&ibs.includes(IN.b)){const b=IN.b.bv;PL.cx=b.cx;PL.cz=b.cz;PL.s=Math.max(PL.s,4.5);PL.fl[IN.b.d.code]=IN.cur}
 else{const t=camera.mode==='walk'?[camera.pos[0],0,camera.pos[2]]:camera.target;PL.cx=t[0];PL.cz=t[2];PL.s=camera.mode==='walk'?3:clamp(760/camera.dist,.9,7)}
 p2.style.display='block';PL.dirty=true;setMode()}
function planOff(){if(!PL.on)return;PL.on=false;globalThis.__P2ON=false;document.body.classList.remove('p2on');p2.style.display='none';setMode()}
pb.onclick=()=>planOn();
for(const id of ['orbitBtn','walkBtn','northBtn'])$(id).addEventListener('click',()=>planOff());
const _sM2=setMode;setMode=function(){_sM2();pb.classList.toggle('on',PL.on);if(PL.on){for(const id of ['orbitBtn','northBtn','walkBtn'])$(id).classList.remove('on');$('mode').classList.remove('on');$('intro').style.display='none'}};
const _fB2=focusB;focusB=function(b){_fB2(b);if(PL.on){const ib=ibs.find(x=>x.bv===b);PL.cx=b.cx;PL.cz=b.cz;PL.s=Math.max(PL.s,ib?4.5:2.6);PL.dirty=true}};
(function ptick(){if(PL.on&&(PL.dirty||cv.width!==Math.round(cv.clientWidth*Math.min(devicePixelRatio||1,2)))){PL.dirty=false;try{draw()}catch(e){console.error('plan2d',e)}}requestAnimationFrame(ptick)})();
globalThis.__P2D={PL,planOn,planOff,setSel,fdata,ibs};}

wireV10Focus(()=>{const q=B.find(b=>b.code==='S');if(q)focusB(q)});reset();requestAnimationFrame(frame);
