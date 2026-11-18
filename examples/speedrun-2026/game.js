
// ===== v27: cukmap 길 개척 스피드런 (시안) =====
// 길찾기 결과(추천 루트)는 계산하지 않는다. 같은 출발→도착 조합을 실제로 달린 사람들의 기록 중 가장 빠른 루트를 닉네임과 함께 보여준다.
// 기록이 없는 조합은 "미개척" — 처음 도착한 사람이 그 조합의 추천 루트가 된다.
const CR={phase:null,P:null,t0:0,rec:[],lastS:0,ghost:true,view:null};
const RUN=6.5,INDV=5;
const cst=document.createElement('style');cst.textContent=`
#crBtn{background:#e8552e!important;color:#fff!important;border-color:#e8552e!important;font-weight:800}
#cr{position:absolute;left:18px;top:18px;width:340px;max-height:calc(100% - 36px);overflow:auto;background:#fffdf8f7;border:1px solid #e9dccb;border-radius:16px;box-shadow:0 10px 30px #3a1f0a2e;padding:16px;z-index:30;display:none;color:#2b2118;font-size:12.5px}
#cr h3{margin:0 0 4px;font-size:17px;letter-spacing:-.5px}#cr .sub{color:#8a6f58;font-size:11.5px;line-height:1.6;margin-bottom:10px}
#cr .row{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0;align-items:center}#cr button{font-size:12px;padding:8px 11px}#cr .pri{background:#e8552e;color:#fff;border-color:#e8552e;font-weight:800}
#cr .card{background:#fff;border:1px solid #efe3d3;border-radius:12px;padding:10px 12px;margin:8px 0}#cr .k{font-size:10px;letter-spacing:1.2px;color:#a3866c;font-weight:800}
#cr .big{font-size:22px;font-weight:900;letter-spacing:-1px}#cr .nick{font-size:18px;font-weight:900;color:#c4431f}#cr .muted{color:#9a8572;font-size:11px;line-height:1.55}
#cr select,#cr input{width:100%;font-size:12.5px;padding:7px 8px;border:1px solid #e3d5c3;border-radius:9px;background:#fff;margin:3px 0 6px}
#cr .lb{width:100%;border-collapse:collapse;font-size:12px}#cr .lb td{padding:5px 3px;border-bottom:1px solid #f1e8dc}#cr .lb tr{cursor:pointer}#cr .lb tr:hover td{background:#fff4ea}#cr .lb tr.on td{background:#ffe9da}
#cr .chip{display:inline-block;font-size:10px;font-weight:800;padding:1px 6px;border-radius:6px;background:#f2e9de;color:#8a6f58;margin-left:4px}
#cr .pair{display:block;width:100%;text-align:left;margin:4px 0;background:#fff;border:1px solid #efe3d3;border-radius:10px;padding:8px 10px!important;line-height:1.45}
#cr .pair b{color:#c4431f}#cr .pair:hover{border-color:#e8552e}
#crHud{position:absolute;left:50%;top:14px;transform:translateX(-50%);display:none;gap:12px;align-items:center;background:#2b2118eb;color:#fff;border-radius:30px;padding:8px 16px;font-size:12px;z-index:31;white-space:nowrap}
#crHud b{font-size:17px;font-variant-numeric:tabular-nums}#crHud .tg{color:#ffb38f;font-weight:800}
#crAct{position:absolute;left:50%;bottom:90px;transform:translateX(-50%);display:none;z-index:31}#crAct button{font-size:15px;font-weight:900;padding:14px 22px;background:#e8552e;color:#fff;border:0;border-radius:14px;box-shadow:0 8px 20px #e8552e66}
#crToast{position:absolute;left:50%;top:62px;transform:translateX(-50%);background:#fff;border:1px solid #efe3d3;border-radius:12px;padding:9px 14px;font-size:12.5px;font-weight:700;color:#2b2118;box-shadow:0 6px 18px #0002;z-index:32;display:none}
.crPin{position:absolute;transform:translate(-50%,-100%);pointer-events:none;z-index:29;text-align:center;font-size:11px;font-weight:900;color:#fff;white-space:nowrap}.crPin i{display:block;width:3px;height:40px;margin:0 auto;background:linear-gradient(var(--c),#0000)}.crPin span{background:var(--c);border-radius:8px;padding:3px 7px}
.crMe{position:absolute;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:#2b7bff;border:3px solid #fff;box-shadow:0 0 0 6px #2b7bff44;pointer-events:none;z-index:29}
.crGhost{position:absolute;transform:translate(-50%,-100%);pointer-events:none;z-index:28;text-align:center;font-size:10.5px;font-weight:800;color:#fff;opacity:.85}.crGhost span{background:#7b5cff;border-radius:8px;padding:2px 6px}.crGhost i{display:block;width:12px;height:12px;margin:2px auto 0;border-radius:50%;background:#7b5cffaa;border:2px solid #fff}
#crCross{position:absolute;left:50%;top:50%;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:#fff;box-shadow:0 0 0 1.5px #1f3b2c;pointer-events:none;display:none;z-index:6}`;
document.head.appendChild(cst);
const ce=(tag,id,html,cls)=>{const e=document.createElement(tag);if(id)e.id=id;if(html!=null)e.innerHTML=html;if(cls)e.className=cls;return e};
const crp=ce('div','cr'),chud=ce('div','crHud'),cact=ce('div','crAct'),ctoast=ce('div','crToast'),cme=ce('div',null,null,'crMe'),ghostEl=ce('div',null,'<span></span><i></i>','crGhost'),crCrossEl=ce('div','crCross');
const pinS=ce('div',null,'<span></span><i></i>','crPin'),pinD=ce('div',null,'<span></span><i></i>','crPin');pinS.style.setProperty('--c','#1f7a4d');pinD.style.setProperty('--c','#e8552e');
for(const e of [crp,chud,cact,ctoast,cme,ghostEl,pinS,pinD,crCrossEl]){if(e!==crp&&e!==chud&&e!==cact&&e!==ctoast&&e!==crCrossEl)e.style.display='none';world.appendChild(e)}
{const nav=document.querySelector('.nav');const b=ce('button','crBtn','길찾기 스피드런');(nav||world).appendChild(b);b.onclick=()=>{const on=crp.style.display!=='block';crp.style.display=on?'block':'none';if(on&&!CR.phase)crHome()}}
let ctT=0;function cToast(t,ms=2600){ctoast.textContent=t;ctoast.style.display='block';clearTimeout(ctT);ctT=setTimeout(()=>ctoast.style.display='none',ms)}
const lsG=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??d}catch(e){return d}},lsS=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtT=s=>{s=Math.max(0,s);const m=Math.floor(s/60),r=s%60;return m+':'+(r<10?'0':'')+r.toFixed(1)};
const fmtD=t=>{const d=new Date(t);return `${d.getMonth()+1}/${d.getDate()}`};
// ---------------- places
// 2026-11-06 실외 전용 시안: 출발·도착을 정문·후문·건물 출입구로만 한정(실내 강의실 제외) — 실외 → 실내 → 게임 순서에 맞춰 기능 시험을 쉽게
const OUTDOOR_ONLY=true,OUT_PLACES=new Set(['P_GATE_MAIN','P_GATE_BACK']);
const OUTN=NN.map((n,i)=>[n,i]).filter(([n])=>(OUTDOOR_ONLY?(OUT_PLACES.has(n.id)||n.k==='entrance'):(n.k==='place'||n.k==='entrance'))&&n.nm&&n.x>-300&&n.x<330);
const OUTIDS=new Set(OUTN.map(([n])=>n.id)),outPair=k=>{const [a,b]=k.split('>');return OUTIDS.has(a)&&OUTIDS.has(b)};
let ROOMS=[],READY=false;
let _prep=null;function crPrepare(){return _prep||(_prep=_crPrepare())}
async function _crPrepare(){if(READY)return;if(OUTDOOR_ONLY){READY=true;return}for(const ib of IB)if(ib.ents.length)await buildIndoor(ib);
 for(const ib of IB){const rt=ib.rt;if(!rt||!rt.att.length)continue;const reach=new Uint8Array(rt.NN);for(const a of rt.att){const D=idijk(rt,a.node);for(let i=0;i<rt.NN;i++)if(isFinite(D.g[i]))reach[i]=1}
  ib.d.floors.forEach((f,fi)=>f.labels.forEach((l,li)=>{{const drs=dedupDoors((f.doors||[]).filter(d=>d[5]===li));if(l.id&&l.g!=null&&reach[rt.OFF[fi]+l.g]&&drs.length)ROOMS.push({id:`R:${ib.bi}:${fi}:${li}`,ib,fi,l,tn:rt.OFF[fi]+l.g,doors:drs})}}))}
 READY=true}
function dedupDoors(a){const o=[];for(const d of a)if(!o.some(q=>Math.hypot(q[0]-d[0],q[1]-d[1])<1.2))o.push(d);return o}
const bName=ib=>ib.d.name.split('(')[0];
function place(id){if(!id)return null;if(id.startsWith('R:')){const r=ROOMS.find(q=>q.id===id);return r?{kind:'room',...r,x:r.l.x,z:r.l.z,name:`${bName(r.ib)} ${IFN(r.ib.d.floors[r.fi].id)} ${r.l.id}${r.l.name?' '+r.l.name:''}`}:null}
 const ni=NN.findIndex(n=>n.id===id);if(ni<0)return null;const n=NN[ni];return {kind:'node',ni,n,x:n.x,z:n.z,name:n.nm}}
const pkey=(s,d)=>s+'>'+d;
// ---------------- records (서버 미연결 시 이 브라우저 임시 저장)
const RK='cukmap_runs_v1';
const allRec=()=>lsG(RK,{}),saveRec=o=>lsS(RK,o);
// 2026-11-10: 예시(시연용) 기록 전부 삭제 — 이전 버전이 브라우저에 넣어 둔 것도 지움
{const o=allRec();let ch=false;for(const k in o){const n=o[k].length;o[k]=o[k].filter(r=>!r.demo&&!/^예시/.test(r.nick||''));if(o[k].length!==n)ch=true;if(!o[k].length)delete o[k]}if(ch)saveRec(o);try{localStorage.removeItem('cukmap_demo_seeded')}catch(e){}}
// ---------------- shared records server (2026-11-06): Cloudflare Pages _worker.js + D1. 서버에 못 붙으면 이 브라우저 임시 저장으로 대체
const API='/api',SRV={ok:null,sum:null,pc:{},why:''};
const devId=(()=>{let v=lsG('cukmap_dev','');if(!/^[A-Za-z0-9]{16,64}$/.test(v)){v=Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');lsS('cukmap_dev',v)}return v})();
async function jget(u,ms=7000){const c=new AbortController(),tm=setTimeout(()=>c.abort(),ms);try{const r=await fetch(u,{signal:c.signal,cache:'no-store'});const j=await r.json().catch(()=>({}));return {st:r.status,j}}finally{clearTimeout(tm)}}
async function srvSummary(){try{const {st,j}=await jget(API+'/summary');if(st===200&&j&&j.pairs){SRV.ok=true;SRV.sum=j;return true}SRV.ok=false;SRV.why=(j&&j.message)||('HTTP '+st)}catch(e){SRV.ok=false;SRV.why='서버 연결 실패'}return false}
async function srvPair(k){try{const {st,j}=await jget(API+'/pair?k='+encodeURIComponent(k));if(st===200&&j&&j.recs){SRV.pc[k]=j.recs;return true}}catch(e){}return false}
const recsOf=(s,d)=>SRV.ok?(SRV.pc[pkey(s,d)]||[]).slice():(allRec()[pkey(s,d)]||[]).slice().sort((a,b)=>a.t-b.t);
// ---------------- home
function optHTML(includeRooms){const g=(lab,arr)=>`<optgroup label="${lab}">${arr.join('')}</optgroup>`;
 const pl=OUTN.filter(([n])=>n.k==='place').map(([n])=>`<option value="${n.id}">${esc(n.nm)}</option>`),en=OUTN.filter(([n])=>n.k==='entrance').map(([n])=>`<option value="${n.id}">${esc(n.nm)}</option>`);
 let h=g(OUTDOOR_ONLY?'교문':'교문·장소',pl)+g('건물 출입구',en);if(includeRooms&&!OUTDOOR_ONLY){const by={};ROOMS.forEach(r=>{(by[bName(r.ib)]=by[bName(r.ib)]||[]).push(`<option value="${r.id}">${esc(IFN(r.ib.d.floors[r.fi].id)+' '+r.l.id+(r.l.name?' '+r.l.name:''))}</option>`)});for(const k in by)h+=g(k+' 실내',by[k])}return h}
async function crHome(){CR.phase=null;chud.style.display='none';cact.style.display='none';hideRunUI();
 crp.innerHTML=`<h3>준비 중…</h3><div class="sub">${OUTDOOR_ONLY?'공유 기록을':'실내 도면 보행망과 공유 기록을'} 불러오고 있습니다.</div>`;await crPrepare();await srvSummary();
 const R=SRV.ok?Object.fromEntries(Object.entries(SRV.sum.pairs).filter(([k])=>!OUTDOOR_ONLY||outPair(k)).map(([k,v])=>{const a=v.top.slice();a.n=v.n;return [k,a]})):allRec(),pairs=Object.entries(R).filter(([,v])=>v.length);
 const pop=pairs.sort((a,b)=>(b[1].n||b[1].length)-(a[1].n||a[1].length)).slice(0,4);
 const myNick=lsG('cukmap_nick','');const mine=myNick?Object.entries(R).filter(([,v])=>v.length&&v.slice().sort((a,b)=>a.t-b.t)[0].nick===myNick).length:0;
 const fresh=[];for(let k=0;k<60&&fresh.length<3;k++){const s=OUTN[Math.floor(Math.random()*OUTN.length)][0].id,d=!OUTDOOR_ONLY&&Math.random()<.6&&ROOMS.length?ROOMS[Math.floor(Math.random()*ROOMS.length)].id:OUTN[Math.floor(Math.random()*OUTN.length)][0].id;
  const S=place(s),D=place(d);if(s===d||!S||!D||(R[pkey(s,d)]||[]).length||Math.hypot(S.x-D.x,S.z-D.z)<90)continue;fresh.push([s,d])}
 const pairBtn=(s,d,extra)=>{const S=place(s),D=place(d);return S&&D?`<button class="pair" data-s="${s}" data-d="${d}">${esc(S.name)} → <b>${esc(D.name)}</b>${extra?`<br><span class="muted">${extra}</span>`:''}</button>`:''};
 crp.innerHTML=`<h3>길찾기 스피드런 <span class="chip">${OUTDOOR_ONLY?'실외 시안':'시안'}</span></h3>
 <div class="sub">cukmap은 계산된 길을 보여주지 않습니다. 같은 출발→도착을 <b>직접 달려 본 사람의 가장 빠른 루트</b>가 닉네임과 함께 추천 루트로 표시됩니다.</div>
 <div class="card"><div class="k">출발</div><select id="crS">${optHTML(false)}</select><div class="k">도착</div><select id="crD">${optHTML(!OUTDOOR_ONLY)}</select>${OUTDOOR_ONLY?'<div class="muted" style="margin-top:4px">실외 시안: 정문·후문·건물 출입구만 고를 수 있어요. 도착 지점 6 m 안에 들어오면 자동으로 완주됩니다.</div>':''}
 <div class="row"><button class="pri" id="crFind">길 찾기</button><button id="crSwap">↕ 바꾸기</button><button id="crRand">무작위 조합</button></div></div>
 ${pop.length?`<div class="card"><div class="k">인기 조합 · 기록 경쟁 중</div>${pop.map(([k,v])=>{const [s,d]=k.split('>'),b=v.slice().sort((x,y)=>x.t-y.t)[0];return pairBtn(s,d,`${v.n||v.length}명 도전 · 1위 ${esc(b.nick)} ${fmtT(b.t)}`)}).join('')}</div>`:''}
 <div class="card"><div class="k">미개척 조합 · 첫 기록이면 내 닉네임이 추천 루트</div>${fresh.map(([s,d])=>pairBtn(s,d,'아직 아무도 달리지 않았어요')).join('')}<div class="row"><button id="crMore">다른 미개척 조합</button></div></div>
 <div class="card"><div class="k">내 닉네임</div><div class="row"><b>${myNick?esc(myNick):'<span class="muted">처음 기록할 때 정합니다</span>'}</b>${myNick?`<span class="muted">· 추천 루트 ${mine}개 보유</span>`:''}</div></div>
 ${SRV.ok&&SRV.sum.nicks.length?`<div class="card"><div class="k">전체 랭킹 · 추천 루트(조합 1위) 보유 수</div><table class="lb">${SRV.sum.nicks.slice(0,10).map((q,i)=>`<tr class="${q.nick===myNick?'on':''}"><td>${i+1}</td><td><b>${esc(q.nick)}</b></td><td style="text-align:right;font-variant-numeric:tabular-nums">1위 ${q.firsts} · 도전 ${q.pairs}조합</td></tr>`).join('')}</table></div>`:''}
 ${SRV.ok?`<div class="muted">기록은 서버에 저장되어 모든 사용자에게 공유됩니다 · 전체 ${SRV.sum.total}건 · <a href="#" id="crRefresh">새로고침</a></div>`:`<div class="muted" style="color:#b4441f">공유 기록 서버에 연결되지 않아(${esc(SRV.why)}) 기록이 이 브라우저에만 임시 저장됩니다. <a href="#" id="crRefresh">다시 연결</a></div>`}`;
 const S=$('crS'),D=$('crD');S.value='P_GATE_MAIN';if(OUTDOOR_ONLY){if(OUTIDS.has('E_N_E1'))D.value='E_N_E1'}else{const r0=ROOMS.find(r=>r.ib.d.code==='N'&&/^N30/.test(r.l.id));if(r0)D.value=r0.id}
 $('crFind').onclick=()=>crSearch(S.value,D.value);$('crSwap').onclick=()=>{if(!OUTDOOR_ONLY&&D.value.startsWith('R:')){cToast('강의실은 도착지로만 고를 수 있어요.');return}const t=S.value;S.value=D.value;D.value=t};
 $('crRand').onclick=()=>{S.value=OUTN[Math.floor(Math.random()*OUTN.length)][0].id;D.value=!OUTDOOR_ONLY&&Math.random()<.6&&ROOMS.length?ROOMS[Math.floor(Math.random()*ROOMS.length)].id:OUTN[Math.floor(Math.random()*OUTN.length)][0].id};
 $('crMore').onclick=crHome;crp.querySelectorAll('.pair').forEach(b=>b.onclick=()=>crSearch(b.dataset.s,b.dataset.d));
 $('crRefresh').onclick=e=>{e.preventDefault();crHome()};}
function hideRunUI(){cme.style.display='none';ghostEl.style.display='none';pinS.style.display='none';pinD.style.display='none';crCrossEl.style.display='none'}
// ---------------- search → show recommended (= fastest recorded) route
function clearView(){netRoute=null;routeObj=null;routeObjW=null;IN.robj=null;CR.view=null;pinS.style.display='none';pinD.style.display='none'}
async function crSearch(s,d,sel=0){await crPrepare();const S=place(s),D=place(d);if(!S||!D){cToast('출발지와 도착지를 골라 주세요.');return}if(s===d){cToast('출발지와 도착지가 같아요.');return}
 if(S.kind==='node'&&D.kind==='node'&&Math.hypot(S.x-D.x,S.z-D.z)<25){cToast('너무 가까운 조합이에요. 다른 곳을 골라 주세요.');return}
 CR.P={s,d,S,D};if(SRV.ok===null)await srvSummary();if(SRV.ok)await srvPair(pkey(s,d));const recs=recsOf(s,d);exitIndoor();clearView();
 const direct=Math.round(Math.hypot(S.x-D.x,S.z-D.z));
 if(recs.length){const r=recs[sel]||recs[0];
  crp.innerHTML=`<h3>${esc(S.name)} → ${esc(D.name)}</h3>
  <div class="card"><div class="k">${sel?`${sel+1}위 기록 루트`:'추천 루트 · 이 조합 최단 기록'}</div><div class="row" style="justify-content:space-between"><div><div class="nick">${esc(r.nick)}${r.demo?'<span class="chip">예시</span>':''}</div><div class="muted">${fmtD(r.at)} 기록 · 이동 ${Math.round(r.len||0)} m</div></div><div class="big">${fmtT(r.t)}</div></div>
  <div class="muted">지도에 표시된 주황색 선은 계산된 경로가 아니라 ${esc(r.nick)} 님이 실제로 달린 궤적입니다.</div></div>
  <div class="card"><div class="k">이 조합 기록 · ${recs.length}명 도전</div><table class="lb">${recs.slice(0,8).map((q,i)=>`<tr data-i="${i}" class="${i===sel?'on':''}"><td>${i+1}</td><td><b>${esc(q.nick)}</b>${q.demo?'<span class="chip">예시</span>':''}</td><td style="text-align:right;font-variant-numeric:tabular-nums">${fmtT(q.t)}</td></tr>`).join('')}</table><div class="muted" style="margin-top:4px">행을 누르면 그 사람의 루트를 볼 수 있어요.</div></div>
  <div class="row"><button class="pri" id="crGo">기록 도전 (1위 ${fmtT(recs[0].t)})</button><button id="crBack">← 다른 길 찾기</button></div>`;
  crp.querySelectorAll('.lb tr').forEach(tr=>tr.onclick=()=>crSearch(s,d,+tr.dataset.i));await showRoute(r)}
 else{crp.innerHTML=`<h3>${esc(S.name)} → ${esc(D.name)}</h3>
  <div class="card"><div class="k">미개척 조합</div><div style="font-size:15px;font-weight:900;margin:4px 0">아직 아무도 이 길을 달리지 않았어요</div>
  <div class="muted">추천 루트가 없습니다. 지금 출발해 처음 도착하면 <b>당신의 닉네임과 루트</b>가 이 조합의 추천 루트가 됩니다.<br>직선거리 ${direct} m${D.kind==='room'?` · 목적지는 ${esc(bName(D.ib))} 실내`:''}</div></div>
  <div class="row"><button class="pri" id="crGo">개척하러 출발</button><button id="crBack">← 다른 길 찾기</button></div>`;
  fitTo([[S.x,S.z],[D.x,D.z]])}
 CR.view={s,d,showPins:true};$('crGo').onclick=startRun;$('crBack').onclick=()=>{clearView();exitIndoor();crHome()}}
function fitTo(pts){let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;pts.forEach(p=>{x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1])});
 const cx=(x0+x1)/2,cz=(z0+z1)/2,ext=Math.max(x1-x0,z1-z0);camera.mode='orbit';camera.target=[cx-ext*.12,H(cx,cz)+8,cz];camera.dist=clamp(ext*1.25+130,190,720);camera.pitch=.95;setMode()}
async function showRoute(r){const P=CR.P;const objs=[];let ib=null;if(P.D.kind==='room'){ib=P.D.ib;await buildIndoor(ib)}
 const m=[],mw=[];let seg=[],last=null;const pts2=[];
 const flushO=()=>{if(seg.length>1){ribbon(m,seg,3.2,[1,.42,.18],.85);ribbon(mw,seg,.9,[1,.55,.25],.22)}seg=[]};
 let iseg=[],ifi=null;const flushI=()=>{if(iseg.length>1&&ib){const mm=[];ribbonY(mm,iseg,.9,[1,.42,.18],ib.rt.floors[ifi].y+.3);objs.push({obj:upload(mm),fi:ifi})}iseg=[]};
 for(const q of r.path){const [t,ph,x,z,f]=q;pts2.push([x,z]);
  if(ph==='o'){if(last&&last[1]==='i'){flushI()}if(!seg.length||Math.hypot(x-seg[seg.length-1][0],z-seg[seg.length-1][1])>1.2)seg.push([x,z])}
  else{if(last&&last[1]==='o'){flushO();if(ib){const mm=[];vertSeg(mm,[last[2],last[3]],H(last[2],last[3])+.5,[x,z],ib.rt.floors[f].y+.3,[1,.62,.3]);objs.push({obj:upload(mm),fi:null})}}
   if(ifi!==null&&f!==ifi){const lp=iseg[iseg.length-1]||[x,z];flushI();if(ib){const mm=[];vertSeg(mm,lp,ib.rt.floors[ifi].y+.3,[x,z],ib.rt.floors[f].y+.3,[1,.55,.25]);objs.push({obj:upload(mm),fi:null})}}
   ifi=f;if(!iseg.length||Math.hypot(x-iseg[iseg.length-1][0],z-iseg[iseg.length-1][1])>.6)iseg.push([x,z])}
  last=q}
 flushO();flushI();routeObj=m.length?upload(m):null;routeObjW=mw.length?upload(mw):null;netRoute=null;
 fitTo(pts2.length?pts2:[[P.S.x,P.S.z],[P.D.x,P.D.z]]);
 if(ib){IN.robj=objs;IN.dst=P.D.l;await enterIndoor(ib,ib.d.floors[P.D.fi].id,true);IN.robj=objs;fitTo(pts2);setIndoorFloor(P.D.fi)}}
// ---------------- run
function startRun(){const P=CR.P;if(!P)return;const recs=recsOf(P.s,P.d);CR.best=recs[0]||null;exitIndoor();clearView();
 const S=P.S;camera.mode='walk';camera.pos=[S.x,H(S.x,S.z)+1.8,S.z];
 {let yaw=Math.atan2(P.D.x-S.x,-(P.D.z-S.z))+(Math.random()-.5)*2.4;if(S.kind==='node'){const es=NADJ[S.ni]||[];const e=es.length?NE[es[Math.floor(Math.random()*es.length)]]:null;if(e&&e.g&&e.g.length>1){const g=e.a===S.ni?e.g:e.g.slice().reverse(),q=g[Math.min(2,g.length-1)];yaw=Math.atan2(q[0]-S.x,-(q[1]-S.z))}}camera.yaw=yaw}
 camera.pitch=.03;setMode();CR.phase='outdoor';CR.t0=performance.now();CR.rec=[[0,'o',+S.x.toFixed(1),+S.z.toFixed(1)]];CR.lastS=0;CR.len=0;CR.lp=[S.x,S.z];
 chud.style.display='flex';runPanel();lockMouse()}
function runPanel(){const P=CR.P;crp.innerHTML=`<div class="k">목적지</div><div style="font-size:15px;font-weight:900;color:#c4431f">${esc(P.D.name)}</div>
 <div class="muted" style="margin:4px 0 8px">${CR.phase==='outdoor'?(P.D.kind==='room'?`${esc(bName(P.D.ib))} 출입구 앞에서 [E]로 입장하세요. 어느 출입구든 됩니다.`:'주황색 표시가 있는 곳까지 달리세요.'):`복도를 달려 ${esc(P.D.l.id)} 강의실 문 앞에서 [E] · 계단·엘리베이터 앞 R/F로 층 이동(+4초) · 방 안으로는 들어갈 수 없어요`}</div>
 ${CR.best?`<div class="card"><div class="k">현재 1위</div><b>${esc(CR.best.nick)}</b> ${fmtT(CR.best.t)}<div class="row"><label style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="crGh" style="width:auto;margin:0" ${CR.ghost?'checked':''}> 1위 고스트 표시 (보라색)</label></div></div>`:'<div class="card"><div class="k">첫 개척</div>도착만 하면 1위입니다!</div>'}
 <div class="muted">WASD 이동 · 마우스로 시선(화면 클릭 시 연결) · Q/E 돌기</div><div class="row"><button id="crQuit">포기</button><button id="crRe">처음부터 다시</button></div>`;
 const gh=$('crGh');if(gh)gh.onchange=()=>{CR.ghost=gh.checked};$('crQuit').onclick=quitRun;$('crRe').onclick=startRun}
function quitRun(){CR.phase=null;unlockMouse();chud.style.display='none';cact.style.display='none';hideRunUI();exitIndoor();camera.mode='orbit';setMode();crSearch(CR.P.s,CR.P.d)}
function sample(force){const now=(performance.now()-CR.t0)/1000;if(!force&&now-CR.lastS<.25)return;CR.lastS=now;
 if(CR.phase==='outdoor'){const x=camera.pos[0],z=camera.pos[2];CR.rec.push([+now.toFixed(2),'o',+x.toFixed(1),+z.toFixed(1)])}
 else if(CR.phase==='indoor')CR.rec.push([+now.toFixed(2),'i',+IW.x.toFixed(2),+IW.z.toFixed(2),IW.fi])}
async function enterRunIndoor(a){const P=CR.P,ib=P.D.ib;sample(true);CR.ilp=[a.p[0],a.p[1]];CR.phase='indoor';cact.style.display='none';IN.robj=null;IN.dst=P.D.l;
 await iwStart(ib,a.fi,{p:a.p,face:[a.p[0]-a.n.x,a.p[1]-a.n.z]});IN.dst=P.D.l;rebuildTags();CR.len+=a.d;CR.ilp=[IW.x,IW.z];sample(true);runPanel();lockMouse();
 cToast(`${a.n.nm}(으)로 입장! 복도를 달려 ${P.D.l.id} 문 앞에서 [E]`,3200);
 ibar.querySelectorAll('button[data-i]').forEach(b=>b.onclick=()=>cToast('기록 중에는 계단·엘리베이터 앞에서 R/F로만 층을 바꿀 수 있어요.'));const x=ibar.querySelector('.x');if(x)x.onclick=()=>cToast('기록 중에는 나갈 수 없어요. 그만두려면 왼쪽 「포기」를 누르세요.');const iwb=ibar.querySelector('.iwb');if(iwb)iwb.remove()}
globalThis.__onIWFloor=()=>{if(CR.phase==='indoor'){CR.t0-=4000;CR.ilp=[IW.x,IW.z];sample(true);cToast(`${IFN(CR.P.D.ib.d.floors[IW.fi].id)} (+4초)`)}};
function crFloor(fi){const ib=CR.P.D.ib,rt=ib.rt;if(fi===CR.fi)return;if(CR.anim){cToast('이동이 끝난 뒤 층을 바꿀 수 있어요.');return}
 if(Math.abs(fi-CR.fi)!==1){cToast('한 번에 한 층씩 이동합니다.');return}
 let best=null;for(const x of ib.d.xlinks){let from=null,to=null;if(x.fa===CR.fi&&x.fb===fi){from=rt.OFF[x.fa]+x.na;to=rt.OFF[x.fb]+x.nb}else if(x.fb===CR.fi&&x.fa===fi){from=rt.OFF[x.fb]+x.nb;to=rt.OFF[x.fa]+x.na}
  if(from==null)continue;const p=rt.NP[from],d=Math.hypot(p[0]-CR.pos[0],p[1]-CR.pos[1]);if(!best||d<best.d)best={d,to,p:rt.NP[to]}}
 if(!best){cToast('이 층에서 그 층으로 이어지는 계단 정보가 도면에 없습니다.');return}
 if(best.d>6){cToast(`계단·엘리베이터 앞에서만 층을 바꿀 수 있어요 (가장 가까운 계단까지 ${Math.round(best.d)} m)`);return}
 sample(true);CR.t0-=4000;/* 층 이동 4초 */CR.node=best.to;CR.fi=fi;CR.pos=best.p.slice();sample(true);setIndoorFloor(fi);cToast(`${IFN(ib.d.floors[fi].id)}(으)로 이동 (+4초)`);crArrive()}
function crdijk(rt,s){const g=new Float64Array(rt.NN).fill(Infinity),from=new Int32Array(rt.NN).fill(-1),fe=new Array(rt.NN);g[s]=0;const h=[[0,s]];
 while(h.length){let bi=0;for(let i=1;i<h.length;i++)if(h[i][0]<h[bi][0])bi=i;const [d,u]=h.splice(bi,1)[0];if(d>g[u])continue;for(const e of rt.ADJ[u]){if(e[3]<0)continue;const nd=d+e[1];if(nd<g[e[0]]){g[e[0]]=nd;from[e[0]]=u;fe[e[0]]=e;h.push([nd,e[0]])}}}return {g,from,fe}}
const _prevPick=globalThis.__gamePick;globalThis.__gamePickNew=e=>CR.phase==='indoor'?false:(_prevPick?_prevPick(e):false);
globalThis.__gamePick=e=>{if(CR.phase!=='indoor')return _prevPick?_prevPick(e):false;if(CR.anim)return true;const ib=CR.P.D.ib,rt=ib.rt,f=rt.floors[CR.fi];const P=rayPlane(screenRay(e.clientX,e.clientY),f.y);if(!P)return true;
 const fl=ib.d.floors[CR.fi];let best=-1,bd=1e9;fl.graph.nodes.forEach((p,i)=>{const d=Math.hypot(p[0]-P[0],p[1]-P[2]);if(d<bd){bd=d;best=i}});if(best<0||bd>4){cToast('갈 수 없는 곳입니다(벽·빈 공간).');return true}
 const t=rt.OFF[CR.fi]+best,D=crdijk(rt,CR.node),p=ipath(ib,D,CR.node,t);if(!p||!p.runs.length){cToast('그곳으로 이어진 길이 없어요(문이 없거나 다른 층을 거쳐야 합니다).');return true}
 CR.anim={pts:[CR.pos.slice(),...p.runs[0].pts],i:0,to:t};return true};
globalThis.__gamePick=globalThis.__gamePickNew;
function stepRunIndoor(dt){const A=CR.anim;if(!A)return;let step=INDV*dt;while(step>0&&A.i<A.pts.length-1){const b=A.pts[A.i+1],d=Math.hypot(b[0]-CR.pos[0],b[1]-CR.pos[1]);if(d<=step){CR.pos=b.slice();step-=d;CR.len+=d;A.i++}else{CR.pos=[CR.pos[0]+(b[0]-CR.pos[0])/d*step,CR.pos[1]+(b[1]-CR.pos[1])/d*step];CR.len+=step;step=0}}
 if(A.i>=A.pts.length-1){CR.node=A.to;CR.anim=null;crArrive()}}
function crArrive(){const D=CR.P.D;if(CR.phase!=='indoor'||CR.fi!==D.fi)return;const d=Math.hypot(CR.pos[0]-D.l.x,CR.pos[1]-D.l.z);if(CR.node===D.tn||d<3)finishRun()}
function finishRun(){const P=CR.P;sample(true);const T=(performance.now()-CR.t0)/1000;CR.phase='done';unlockMouse();chud.style.display='none';cact.style.display='none';hideRunUI();
 let bad=0;for(let i=1;i<CR.rec.length;i++){const a0=CR.rec[i-1],b0=CR.rec[i];if(a0[1]!==b0[1])continue;const dt0=Math.max(.05,b0[0]-a0[0]),d0=Math.hypot(b0[2]-a0[2],b0[3]-a0[3]);if(d0>RUN*1.4*dt0+2&&!(b0[1]==='i'&&a0[4]!==b0[4]))bad++}
 if(bad){CR.phase='done';unlockMouse();chud.style.display='none';cact.style.display='none';hideRunUI();crp.innerHTML=`<h3>기록 무효</h3><div class="card">이동 궤적에 달리기 속도로는 불가능한 순간이동 구간이 ${bad}곳 있어 기록을 등록할 수 없습니다.<div class="muted" style="margin-top:6px">기록 서버도 등록할 때 궤적 전체를 같은 기준으로 다시 검사합니다.</div></div><div class="row"><button class="pri" id="crRe2">다시 도전</button><button id="crSkip2">돌아가기</button></div>`;$('crRe2').onclick=startRun;$('crSkip2').onclick=()=>{CR.phase=null;crSearch(P.s,P.d)};return}
 const recs=recsOf(P.s,P.d),rank=recs.filter(r=>r.t<T).length+1,first=!recs.length,beat=!first&&rank===1;
 CR.pending={nick:'',t:+T.toFixed(2),at:Date.now(),len:Math.round(CR.len),path:CR.rec};
 const nick=lsG('cukmap_nick','');
 crp.innerHTML=`<h3>${first?'첫 개척 성공!':beat?'새 1위!':'도착!'}</h3>
 <div class="card"><div class="muted">${esc(P.S.name)} → ${esc(P.D.name)}</div><div class="row" style="justify-content:space-between"><div><div class="k">내 기록</div><div class="big">${fmtT(T)}</div></div><div><div class="k">순위</div><div class="big">${rank}위</div></div>${recs[0]?`<div><div class="k">기존 1위</div><div class="big" style="font-size:16px">${fmtT(recs[0].t)}</div></div>`:''}</div>
 <div class="muted">${first?'이 조합의 첫 기록입니다. 등록하면 누군가 이 길을 찾을 때 당신의 루트가 추천 루트로 나옵니다.':beat?`${esc(recs[0].nick)} 님의 기록을 ${(recs[0].t-T).toFixed(1)}초 앞당겼어요. 등록하면 추천 루트가 당신의 루트로 바뀝니다.`:`1위까지 ${(T-recs[0].t).toFixed(1)}초. 다른 길로 다시 도전하거나, 미개척 조합을 노려 보세요.`} · 이동 ${Math.round(CR.len)} m</div></div>
 <div class="card"><div class="k">닉네임 (2~12자)</div><input id="crNick" maxlength="12" value="${esc(nick)}" placeholder="예: 역곡달팽이"><div class="row"><button class="pri" id="crSave">기록 등록</button><button id="crSkip">등록 안 함</button></div></div>`;
 $('crSave').onclick=async()=>{const v=$('crNick').value.trim();if(v.length<2||v.length>12){cToast('닉네임은 2~12자로 정해 주세요.');return}if(/^예시/.test(v)){cToast('「예시」로 시작하는 닉네임은 쓸 수 없어요.');return}
  if(SRV.ok){const btn=$('crSave');if(btn.disabled)return;btn.disabled=true;btn.textContent='등록 중…';
   try{const r=await fetch(API+'/runs',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({pair:pkey(P.s,P.d),nick:v,dev:devId,t:CR.pending.t,len:CR.pending.len,path:CR.pending.path})});const j=await r.json().catch(()=>({}));
    if(r.ok&&j.ok){lsS('cukmap_nick',v);CR.phase=null;await srvPair(pkey(P.s,P.d));srvSummary();crSearch(P.s,P.d,Math.max(0,(j.rank||1)-1));cToast(j.rank===1&&j.personalBest!==false?'등록 완료! 이 조합의 추천 루트가 되었습니다.':j.personalBest===false?`등록 완료 · 내 최고 기록(${j.rank}위)이 더 빨라 순위표는 그대로예요`:`등록 완료! ${j.rank}위`,3800);return}
    cToast(j.message||('등록 실패 ('+r.status+')'),4500)}catch(e){cToast('기록 서버에 연결하지 못했어요. 잠시 후 다시 눌러 주세요.',4500)}
   btn.disabled=false;btn.textContent='기록 등록';return}
  lsS('cukmap_nick',v);const o=allRec(),k=pkey(P.s,P.d);(o[k]=o[k]||[]).push({...CR.pending,nick:v});saveRec(o);CR.phase=null;const i=recsOf(P.s,P.d).findIndex(r=>r.at===CR.pending.at);crSearch(P.s,P.d,Math.max(0,i));cToast((i===0?'등록 완료! 이 조합의 추천 루트가 되었습니다.':`등록 완료! ${i+1}위`)+' (서버 미연결 · 이 브라우저에만 저장)',3800)};
 $('crSkip').onclick=()=>{CR.phase=null;crSearch(P.s,P.d)}}
// ---------------- mouse look (desktop)
const fine=matchMedia('(pointer:fine)').matches;let locked=false;
function lockMouse(){if(!fine||camera.mode!=='walk'||document.pointerLockElement===canvas)return;try{const r=canvas.requestPointerLock();if(r&&r.catch)r.catch(()=>{})}catch(e){}}
function unlockMouse(){if(document.pointerLockElement)document.exitPointerLock()}
canvas.addEventListener('click',()=>{if(camera.mode==='walk')lockMouse()});
document.addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas&&camera.mode==='walk'){camera.yaw+=e.movementX*.0022;camera.pitch=clamp(camera.pitch-e.movementY*.0022,-.8,.8)}});
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===canvas;crCrossEl.style.display=locked?'block':'none';if(!locked&&camera.mode==='walk'&&!CR.phase&&document.hasFocus())reset()});
addEventListener('keydown',e=>{if(e.key==='Escape'&&(CR.phase==='outdoor'||CR.phase==='indoor')){e.stopImmediatePropagation();unlockMouse();cToast('시선 고정 해제 · 화면을 클릭하면 다시 연결됩니다 (시간은 계속 흐릅니다)')}
 if((e.key==='e'||e.key==='E')&&CR.phase==='outdoor'&&CR.near){e.preventDefault();e.stopImmediatePropagation();enterRunIndoor(CR.near)}else if((e.key==='e'||e.key==='E')&&CR.phase==='indoor'&&CR.atDoor){e.preventDefault();e.stopImmediatePropagation();finishRun()}},true);
setInterval(()=>{if(document.pointerLockElement===canvas&&camera.mode!=='walk')unlockMouse()},300);
// ---------------- per-frame
function ghostAt(rec,t){const p=rec.path;if(!p.length)return null;let lo=0,hi=p.length-1;if(t>=p[hi][0])return p[hi];while(hi-lo>1){const m=(lo+hi)>>1;if(p[m][0]<=t)lo=m;else hi=m}
 const a=p[lo],b=p[hi];if(a[1]!==b[1]||a[4]!==b[4])return a;const k=(t-a[0])/Math.max(1e-6,b[0]-a[0]);return [t,a[1],a[2]+(b[2]-a[2])*k,a[3]+(b[3]-a[3])*k,a[4]]}
function placeEl(el,p){if(p){el.style.display='block';el.style.left=p[0]+'px';el.style.top=p[1]+'px'}else el.style.display='none'}
let cLast=0;
function cLoop(now){const dt=Math.min(.05,cLast?(now-cLast)/1000:1/60);cLast=now;requestAnimationFrame(cLoop);const P=CR.P;
 if(CR.view&&!CR.phase&&P){pinS.firstChild.textContent='출발 · '+P.S.name;pinD.firstChild.textContent='도착 · '+P.D.name;
  placeEl(pinS,project([P.S.x,H(P.S.x,P.S.z)+3,P.S.z]));const dy=P.D.kind==='room'?(P.D.ib.bv?P.D.ib.bv.roof+6:H(P.D.x,P.D.z)+20):H(P.D.x,P.D.z)+3;placeEl(pinD,P.D.kind==='room'&&IN.b?null:project([P.D.x,dy,P.D.z]))}
 if(CR.phase==='outdoor'||CR.phase==='indoor'){const T=(now-CR.t0)/1000;chud.innerHTML=`<span>시간 <b>${fmtT(T)}</b></span><span class="tg">${esc(P.D.name)}</span><span>${CR.best?`1위 ${esc(CR.best.nick)} ${fmtT(CR.best.t)}`:'첫 개척 도전'}</span>${CR.phase==='outdoor'&&fine&&!locked?'<span style="color:#ffd27a">화면 클릭 → 마우스 시선</span>':''}`;sample(false);
  // ghost
  if(CR.best&&CR.ghost){const g=ghostAt(CR.best,T);let p=null;if(g){if(g[1]==='o'&&CR.phase==='outdoor')p=project([g[2],H(g[2],g[3])+2.6,g[3]]);else if(g[1]==='i'&&CR.phase==='indoor'&&g[4]===IW.fi)p=project([g[2],P.D.ib.rt.floors[g[4]].y+1.6,g[3]])}ghostEl.firstChild.textContent='고스트 '+CR.best.nick;placeEl(ghostEl,p)}else ghostEl.style.display='none'}
 if(CR.phase==='outdoor'){if(camera.mode!=='walk'){camera.mode='walk';setMode()}const x=camera.pos[0],z=camera.pos[2];CR.len+=Math.hypot(x-CR.lp[0],z-CR.lp[1]);CR.lp=[x,z];
  const D=P.D;pinD.firstChild.textContent=`${D.kind==='room'?bName(D.ib):D.name} · ${Math.round(Math.hypot(D.x-x,D.z-z))} m`;
  placeEl(pinD,project([D.x,D.kind==='room'&&D.ib.bv?D.ib.bv.roof+6:H(D.x,D.z)+4,D.z]));
  if(D.kind==='node'){if(Math.hypot(D.x-x,D.z-z)<6)finishRun()}
  else{let near=null;for(const a of D.ib.rt.att){const d=Math.hypot(a.n.x-x,a.n.z-z);if(d<7&&(!near||d<near.d))near={...a,d}}
   if(near){cact.style.display='block';cact.innerHTML=`<button>[E] ${esc(near.n.nm)} 입장</button>`;cact.firstChild.onclick=()=>enterRunIndoor(near);CR.near=near}else{cact.style.display='none';cact._h='';CR.near=null}}}
 if(CR.phase==='indoor'){if(camera.mode!=='walk'){camera.mode='walk';setMode()}const D=P.D,rt=D.ib.rt;CR.len+=Math.hypot(IW.x-CR.ilp[0],IW.z-CR.ilp[1]);CR.ilp=[IW.x,IW.z];
  let at=null;if(IW.fi===D.fi){for(const d of D.doors){const dd=Math.min(Math.hypot(d[2]-IW.x,d[3]-IW.z),Math.hypot(d[0]-IW.x,d[1]-IW.z));if(dd<1.7&&(!at||dd<at.dd))at={d,dd}}
   const d0=D.doors.reduce((a,d)=>Math.hypot(d[0]-IW.x,d[1]-IW.z)<Math.hypot(a[0]-IW.x,a[1]-IW.z)?d:a,D.doors[0]);pinD.firstChild.textContent=`${D.l.id} 문 · ${Math.round(Math.hypot(d0[0]-IW.x,d0[1]-IW.z))} m`;placeEl(pinD,project([d0[0],rt.floors[D.fi].y+2.7,d0[1]]))}
  else{pinD.style.display='none'}
  CR.atDoor=!!at;if(at){cact.style.display='block';const h=`<button>[E] ${esc(D.l.id)} 도착</button>`;if(cact._h!==h){cact._h=h;cact.innerHTML=h;cact.firstChild.onclick=finishRun}}else{cact.style.display='none';cact._h=''}
  if(IW.fi!==D.fi){chud.innerHTML+=`<span style="color:#ffd27a">목적지 ${IFN(D.ib.d.floors[D.fi].id)} · 지금 ${IFN(D.ib.d.floors[IW.fi].id)}</span>`}}}
requestAnimationFrame(cLoop);
globalThis.__CR={CR,crSearch,startRun,enterRunIndoor,finishRun,crFloor,place,ROOMS:()=>ROOMS,tp:(x,z)=>{camera.pos=[x,H(x,z)+1.8,z]},allRec};
