// ===== 실내·실외 통합 보기: 카메라가 건물 벽 안으로 들어가면 그 건물 외벽을 걷어내고 내부(눈높이 아래 층들)를 보여준다 =====
const UNI={b:null,ib:null,fi:-1,plates:new Map(),tag:null};
const IBbyB=new Map();IB.forEach(ib=>{if(ib.bv)IBbyB.set(ib.bv,ib)});
setTimeout(()=>{(async()=>{for(const ib of IB)await buildIndoor(ib)})()},1200);
function uniSkip(){const out=[];const add=b=>{if(b&&b._rg&&!out.includes(b))out.push(b)};
 if(IN.b){add(IN.b.bv);(HIDE_ALSO[IN.b.d.code]||[]).forEach(c=>add(B.find(q=>q.code===c)))}if(UNI.b)add(UNI.b);return out}
function lvOf(b){if(b.lv)return b.lv;const sp=b.spec;if(sp&&sp.parts&&sp.parts.length){const p=sp.parts[0],fh=Math.max(2.8,(p.height-(p.parapet||0))/p.floors);const lvl1=Math.min(...b.poly.map(q=>H(...q)))+(sp.lift||0);return {datum:lvl1,fh,approx:true}}
 const fh=3.3;return {datum:b.ground+.4,fh,approx:true}}
function floorsOf(b){const lv=lvOf(b),n=b.floors||Math.max(1,Math.round((b.roof-lv.datum)/lv.fh)),bf=b.basementFloors||0,out=[];for(let k=-bf;k<n;k++)out.push({k,id:k<0?'B'+(-k):(k+1)+'F',y:lv.datum+k*lv.fh});return out}
function platesOf(b){if(UNI.plates.has(b))return UNI.plates.get(b);const fl=floorsOf(b).map(f=>{const m=[];const tri=b.tri||[];for(const t of tri){pushTri(m,[t[0][0],f.y,t[0][1]],[t[1][0],f.y,t[1][1]],[t[2][0],f.y,t[2][1]],[.86,.84,.79]);pushTri(m,[t[0][0],f.y-.3,t[0][1]],[t[1][0],f.y-.3,t[1][1]],[t[2][0],f.y-.3,t[2][1]],[.72,.70,.66])}
  const P=b.poly;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length];quad(m,[p[0],f.y-.3,p[1]],[q[0],f.y-.3,q[1]],[q[0],f.y,q[1]],[p[0],f.y,p[1]],[.62,.60,.56]);
   // 외벽 안쪽 면(창 높이 아래까지만, 반투명 느낌 대신 낮은 벽)
   quad(m,[p[0],f.y,p[1]],[q[0],f.y,q[1]],[q[0],f.y+1.0,q[1]],[p[0],f.y+1.0,p[1]],[.80,.77,.72])}
  return {...f,obj:upload(m)}});UNI.plates.set(b,fl);return fl}
function bTop(b){return b.lv&&b.floors?Math.max(b.roof,b.lv.datum+b.floors*b.lv.fh+.9):b.roof}
function eyeBuilding(e){if(!e)return null;for(const b of B){if(!b.poly||b.roof==null)continue;if(e[1]>bTop(b)+.3||e[1]<b.ground-6)continue;if(inside(e[0],e[2],b.poly)&&!(b.holes||[]).some(h=>inside(e[0],e[2],h)))return b}return null}
const uniTag=document.createElement('div');uniTag.style.cssText='position:absolute;left:16px;bottom:22px;background:#1f3b2ce6;color:#fff;border-radius:12px;padding:8px 12px;font-size:12px;font-weight:700;z-index:31;display:none;max-width:70%';world.appendChild(uniTag);
const uniBusy=()=>globalThis.__CR&&globalThis.__CR.CR&&globalThis.__CR.CR.phase;
function uniUpdate(){const e=camera.eye;const walkIn=globalThis.__INW;let b=walkIn?null:eyeBuilding(e);
 if(uniBusy())b=null;
 if(b&&IN.b&&!IN.auto&&IN.b.bv===b)b=null; // 수동 실내 보기 중인 건물은 그쪽 로직 사용
 UNI.b=b;const ib=b?IBbyB.get(b):null;
 if(ib&&ib.rt){const ys=ib.rt.floors.map(f=>f.y);let fi=0;ys.forEach((y,i)=>{if(y<=e[1]-.3)fi=i});
  if(!IN.b||IN.auto){if(IN.b!==ib){IN.b=ib;IN.auto=true;IN.robj=null;IN.dst=null;ibar.style.display='none'}if(IN.cur!==fi){IN.cur=fi;rebuildTags()}}}
 else if(IN.auto){IN.b=null;IN.auto=false;ilay.textContent='';itags=[]}
 UNI.ib=ib;
 let txt='';if(b){const nm=b.name.split('·')[0].trim();if(ib&&ib.rt)txt=`${nm} 내부 · ${IFN(ib.rt.floors[IN.cur].id)} (도면 기반)`;else{const fl=floorsOf(b);let f0=fl[0];fl.forEach(f=>{if(f.y<=e[1]-.3)f0=f});txt=`${nm} 내부 · ${IFN(f0.id)} — 실내 도면 미확보(층 바닥만 표시)`}}
 else if(walkIn&&IW.ib)txt='';
 uniTag.style.display=txt?'block':'none';if(txt!==uniTag._t){uniTag._t=txt;uniTag.textContent=txt}}
globalThis.__UNI=()=>{uniUpdate();const b=UNI.b;if(!b||UNI.ib)return;const e=camera.eye;for(const f of platesOf(b)){if(f.y<=e[1]+.2)renderObj(f.obj,camera.mvp,0)}};
// ---- seamless walking: 실외에서 출입구로 걸어 들어가면 실내로, 실내 출입구에서 밖으로 걸어 나가면 실외로
let uniCool=0;
function uniAutoEnter(){if(uniBusy()||camera.mode!=='walk'||IW.ib||performance.now()<uniCool)return;const x=camera.pos[0],z=camera.pos[2];const mv=(CTL&&CTL.walkV)||[0,0];if(Math.hypot(mv[0],mv[1])<.5)return;
 for(const ib of IB){if(!ib.rt)continue;for(const a of ib.rt.att){const d=Math.hypot(a.n.x-x,a.n.z-z);if(d>3.2)continue;const ix=a.p[0]-a.n.x,iz=a.p[1]-a.n.z,l=Math.hypot(ix,iz)||1;
   const toward=(mv[0]*ix+mv[1]*iz)/l/Math.hypot(mv[0],mv[1]);const bv=ib.bv;const intoB=bv?((mv[0]*(bv.cx-x)+mv[1]*(bv.cz-z))>0):true;
   if(toward>.2||(l<.8&&intoB)){const yaw=camera.yaw;iwStart(ib,a.fi,{p:a.p,face:null}).then(()=>{camera.yaw=yaw;uniCool=performance.now()+1200});return}}}}
function uniWish(){const f=(held.w||held.arrowup?1:0)-(held.s||held.arrowdown?1:0),sd=(held.d||held.arrowright?1:0)-(held.a||held.arrowleft?1:0),a=camera.yaw;return [Math.sin(a)*f+Math.cos(a)*sd,-Math.cos(a)*f+Math.sin(a)*sd]}
function uniAutoExit(){if(!IW.ib||uniBusy()||performance.now()<uniCool)return;const rt=IW.ib.rt;const v=uniWish();const sp=Math.hypot(v[0],v[1]);if(sp<.5)return;
 for(const a of rt.att){if(a.fi!==IW.fi)continue;const d=Math.hypot(a.p[0]-IW.x,a.p[1]-IW.z);if(d>2.2)continue;const ox=a.n.x-a.p[0],oz=a.n.z-a.p[1],l=Math.hypot(ox,oz)||1;const out=(v[0]*ox+v[1]*oz)/l/sp;
  if(out>.45){const yaw=camera.yaw;iwNear.exit={...a,d};iwExit();camera.yaw=yaw;uniCool=performance.now()+1200;return}}}
(function uniLoop(){requestAnimationFrame(uniLoop);uniAutoEnter();uniAutoExit()})();
globalThis.__HELD=held;globalThis.__UNIS={UNI,uniSkip,eyeBuilding,floorsOf,lvOf,cam:camera,CTL};globalThis.__Bs=B;
{const _e2=enterIndoor;enterIndoor=async function(...a){IN.auto=false;const r=await _e2(...a);IN.auto=false;return r}}

