// ===== Edit 화면: 지도 오류 제보 (2026-11-17) =====
// 로그인 없이 누구나. 글자만 받고, 화면에는 textContent 로만 넣는다(코드가 실행되지 않게).
// 서버: worker/index.js 의 /api/reports
if(globalThis.CUK_MODE==='edit'){(()=>{
const CATS=[['building','건물 모양·높이'],['path','길·계단'],['entrance','출입구'],['indoor','실내'],['name','이름·표기'],['other','기타']];
const CATN=Object.fromEntries(CATS),CATC={building:'#c8664d',path:'#4f8fdc',entrance:'#e8a33d',indoor:'#8a6fd1',name:'#3b9a6b',other:'#6b7a70'};
const world=$('gl').parentElement,el=(t,c,txt)=>{const e=document.createElement(t);if(c)e.className=c;if(txt!=null)e.textContent=txt;return e};
const st=document.createElement('style');st.textContent=`
.cukedit .hud,.cukedit #p2hint,.cukedit .intro{display:none!important}
#ed [hidden]{display:none!important}
#ed{position:absolute;left:14px;top:14px;bottom:14px;width:340px;z-index:70;background:#fffffff5;border:1px solid #d7e2db;border-radius:14px;box-shadow:0 8px 28px #1c442026;display:flex;flex-direction:column;overflow:hidden;font-size:12.5px;color:#26392f}
#ed.fold{bottom:auto}#ed.fold>*:not(.edhead){display:none!important}
.edhead{display:flex;align-items:center;justify-content:space-between;padding:12px 14px 6px}.edhead b{font-size:15px}.edhead button{font-size:11px;padding:5px 9px}
.edlead{margin:0 14px 10px;color:#5b6f62;line-height:1.5}
.edgo{margin:0 14px 10px;background:#e8552e!important;border-color:#e8552e!important;color:#fff!important;font-weight:800}
.edform{margin:0 14px 10px;padding:10px;border:1px solid #f0c9b9;background:#fff8f4;border-radius:10px;display:flex;flex-direction:column;gap:8px}
.edpick{font-weight:700;color:#c2401c;line-height:1.4}.edxy{font-weight:400;font-size:11px;color:#6b7a70;margin-top:3px}.edxy button{font-size:10.5px;padding:2px 7px}.edpick.ok{color:#26392f}.edpick button{margin-left:6px;font-size:11px;padding:3px 8px}
.edcats{display:flex;flex-wrap:wrap;gap:5px}.edcats button{font-size:11px;padding:5px 8px}
.edform textarea{min-height:76px;resize:vertical;border:1px solid #d7e2db;border-radius:8px;padding:8px;font:inherit}
.edform input{border:1px solid #d7e2db;border-radius:8px;padding:7px 8px;font:inherit}
.edrow{display:flex;gap:6px;justify-content:flex-end}.edrow button{font-size:12px;padding:7px 12px}.edsend{background:#244f3d!important;color:#fff!important}
.edmsg{min-height:1em;color:#c2401c;font-size:11.5px}.ednote{margin:-4px 14px 8px;color:#2d7a4c;font-weight:700;font-size:12px}.ednote:empty{display:none}
.edtabs{display:flex;gap:6px;margin:0 14px 8px}.edtabs button{font-size:11.5px;padding:6px 10px}
.edlist{flex:1;overflow:auto;padding:0 10px 6px;min-height:60px}
.edempty{color:#7a8a80;padding:16px 6px;text-align:center;line-height:1.6}
.eitem{border:1px solid #e1e8e2;border-radius:10px;padding:9px 10px;margin:0 0 8px;background:#fff;cursor:pointer}.eitem.sel{border-color:#e8552e;box-shadow:0 0 0 2px #e8552e33}
.eitem .m{display:flex;gap:6px;align-items:center;flex-wrap:wrap;font-size:11px;color:#6b7a70}.eitem .c{color:#fff;border-radius:6px;padding:2px 6px;font-weight:700}
.eitem .t{margin:6px 0;white-space:pre-wrap;word-break:break-word;line-height:1.5}
.eitem .v{display:flex;gap:5px;flex-wrap:wrap}.eitem .v button{font-size:11px;padding:4px 8px}.eitem .v button.did{background:#edf4ed;border-color:#9cc3a8}.eitem .v .fl{margin-left:auto;color:#a06a5a}
.edfoot{margin:0;padding:9px 14px 12px;border-top:1px solid #e6ece7;color:#5b6f62;line-height:1.5}.edfoot a{color:#244f3d;font-weight:700}
#edpins{position:absolute;inset:0;pointer-events:none;z-index:66;overflow:hidden}
.edpin{position:absolute;width:16px;height:16px;margin:-16px 0 0 -8px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px #0005;pointer-events:auto;cursor:pointer}
.edpin.sel{width:22px;height:22px;margin:-22px 0 0 -11px;z-index:2}.edpin.new{background:#e8552e;animation:edb 1s infinite alternate}@keyframes edb{to{transform:rotate(-45deg) scale(1.25)}}
.cukedit.edpicking #gl,.cukedit.edpicking #p2 canvas{cursor:crosshair!important}
@media(max-width:800px){#ed{left:8px;right:8px;top:auto;bottom:8px;width:auto;max-height:48%}#ed.fold{top:auto}}`;document.head.appendChild(st);

// ---------- 패널
const ed=el('div');ed.id='ed';const head=el('div','edhead'),fold=el('button',null,'접기');head.append(el('b',null,'지도 오류 제보'),fold);
const lead=el('p','edlead','지도에서 실제와 다른 곳을 찾으면 위치를 찍고 알려 주세요. 로그인 없이 누구나 할 수 있어요. 부적절한 제보는 「부적절해요」가 3번 모이면 자동으로 숨겨져요.');
const go=el('button','edgo','＋ 오류 제보하기'),note=el('div','ednote');
const form=el('div','edform');form.hidden=true;
const pick=el('div','edpick'),cats=el('div','edcats'),ta=el('textarea'),nick=el('input'),msg=el('div','edmsg'),row=el('div','edrow'),cancel=el('button',null,'취소'),send=el('button','edsend','보내기');
ta.placeholder='무엇이 실제와 어떻게 다른지 적어 주세요.\n예) 이 건물 출입구는 실제로 북쪽 면에 있어요.';ta.maxLength=1000;nick.placeholder='닉네임 (선택)';nick.maxLength=30;
let cat='building';for(const [k,n] of CATS){const b=el('button',null,n);b.dataset.k=k;b.onclick=()=>{cat=k;[...cats.children].forEach(x=>x.classList.toggle('on',x===b))};cats.appendChild(b)}cats.firstChild.classList.add('on');
row.append(cancel,send);form.append(pick,cats,ta,nick,msg,row);
const tabs=el('div','edtabs'),tOpen=el('button','on','진행 중'),tFix=el('button',null,'해결됨');tabs.append(tOpen,tFix);
const list=el('div','edlist');
const foot=el('p','edfoot');foot.append('직접 고치고 싶다면 ');const gh=el('a',null,'GitHub');gh.href='https://github.com/cukmap/map';gh.target='_blank';gh.rel='noopener';foot.append(gh,'에서 수정을 제안해 주세요. 오른쪽 「대조 도구」로 도면·보행망과 비교해 볼 수 있어요. ');const cr=el('a',null,'함께 만든 사람들');cr.href='/contributors/';foot.appendChild(cr);
ed.append(head,lead,go,note,form,tabs,list,foot);world.appendChild(ed);
fold.onclick=()=>{ed.classList.toggle('fold');fold.textContent=ed.classList.contains('fold')?'펼치기':'접기'};
const pins=el('div');pins.id='edpins';world.appendChild(pins);

// ---------- 상태
let reports=[],filter='open',selId=null,draft=null,picking=false;
let voted={};try{voted=JSON.parse(localStorage.getItem('cukvotes')||'{}')}catch(e){}
const saveVoted=()=>{try{localStorage.setItem('cukvotes',JSON.stringify(voted))}catch(e){}};
const ago=t=>{const s=(Date.now()-t)/1000;if(s<60)return '방금';if(s<3600)return Math.floor(s/60)+'분 전';if(s<86400)return Math.floor(s/3600)+'시간 전';if(s<86400*30)return Math.floor(s/86400)+'일 전';const d=new Date(t);return `${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()}`};
const place=r=>[r.bname||'',r.floor?IFN(r.floor):''].filter(Boolean).join(' ')||'건물 밖';
const api=async(path,opt)=>{const r=await fetch(path,opt);let j=null;try{j=await r.json()}catch(e){}if(!r.ok)throw new Error((j&&j.error)||'연결에 실패했어요.');return j};

// ---------- 목록
function render(){list.textContent='';const rs=reports.filter(r=>filter==='fixed'?r.status==='fixed':r.status!=='fixed');
 if(!rs.length){list.appendChild(el('div','edempty',filter==='fixed'?'아직 해결된 제보가 없어요.':'아직 제보가 없어요.\n첫 번째로 틀린 곳을 알려 주세요.'));}
 for(const r of rs){const it=el('div','eitem'+(r.id===selId?' sel':''));const m=el('div','m'),c=el('span','c',CATN[r.cat]||'기타');c.style.background=CATC[r.cat]||CATC.other;
  m.append(c,el('span',null,place(r)),el('span',null,'· '+ago(r.created)),el('span',null,'· '+(r.nick||'익명')));
  const v=el('div','v');const mk=(k,label,n,cls)=>{const b=el('button',cls||null,n==null?label:`${label} ${n}`);if(voted[r.id]&&voted[r.id][k])b.classList.add('did');b.onclick=e=>{e.stopPropagation();doVote(r,k)};return b};
  v.append(mk('agree','맞아요',r.agree),mk('disagree','아니에요',r.disagree),mk('fixed','고쳐졌어요',r.fixed),mk('flag','부적절해요',null,'fl'));
  it.append(m,el('div','t',r.text),v);it.onclick=()=>{selId=r.id;render();flyTo(r)};list.appendChild(it)}
 drawPins(true)}
tOpen.onclick=()=>{filter='open';tOpen.classList.add('on');tFix.classList.remove('on');render()};tFix.onclick=()=>{filter='fixed';tFix.classList.add('on');tOpen.classList.remove('on');render()};
async function load(){try{const j=await api('/api/reports');reports=j.reports||[];render()}catch(e){list.textContent='';list.appendChild(el('div','edempty','제보 목록을 불러오지 못했어요. 잠시 후 새로고침해 주세요.'))}}
async function doVote(r,k){if(voted[r.id]&&voted[r.id][k])return;
 if(k==='flag'&&!confirm('이 제보를 부적절한 내용으로 신고할까요? 신고가 모이면 자동으로 숨겨져요.'))return;
 try{const j=await api(`/api/reports/${r.id}/vote`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({kind:k})});
  (voted[r.id]=voted[r.id]||{})[k]=1;saveVoted();const i=reports.findIndex(x=>x.id===r.id);if(j.report&&!j.report.hidden)reports[i]=j.report;else reports.splice(i,1);render()}catch(e){alert(e.message)}}

// ---------- 위치 찍기
const inPoly=(x,z,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c}return c};
const bAt=(x,z)=>B.find(b=>b.poly&&b.poly.length>2&&inPoly(x,z,b.poly));
function inv4(m){const a=m,o=new Float64Array(16);const [a00,a01,a02,a03,a10,a11,a12,a13,a20,a21,a22,a23,a30,a31,a32,a33]=a;
 const b00=a00*a11-a01*a10,b01=a00*a12-a02*a10,b02=a00*a13-a03*a10,b03=a01*a12-a02*a11,b04=a01*a13-a03*a11,b05=a02*a13-a03*a12,b06=a20*a31-a21*a30,b07=a20*a32-a22*a30,b08=a20*a33-a23*a30,b09=a21*a32-a22*a31,b10=a21*a33-a23*a31,b11=a22*a33-a23*a32;
 let d=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;if(!d)return null;d=1/d;
 o[0]=(a11*b11-a12*b10+a13*b09)*d;o[1]=(a02*b10-a01*b11-a03*b09)*d;o[2]=(a31*b05-a32*b04+a33*b03)*d;o[3]=(a22*b04-a21*b05-a23*b03)*d;o[4]=(a12*b08-a10*b11-a13*b07)*d;o[5]=(a00*b11-a02*b08+a03*b07)*d;o[6]=(a32*b02-a30*b05-a33*b01)*d;o[7]=(a20*b05-a22*b02+a23*b01)*d;
 o[8]=(a10*b10-a11*b08+a13*b06)*d;o[9]=(a01*b08-a00*b10-a03*b06)*d;o[10]=(a30*b04-a31*b02+a33*b00)*d;o[11]=(a21*b02-a20*b04-a23*b00)*d;o[12]=(a11*b07-a10*b09-a12*b06)*d;o[13]=(a00*b09-a01*b07+a02*b06)*d;o[14]=(a31*b01-a30*b03-a32*b00)*d;o[15]=(a20*b03-a21*b01+a22*b00)*d;return o}
const unp=(I,x,y,z)=>{const w=I[3]*x+I[7]*y+I[11]*z+I[15];return [(I[0]*x+I[4]*y+I[8]*z+I[12])/w,(I[1]*x+I[5]*y+I[9]*z+I[13])/w,(I[2]*x+I[6]*y+I[10]*z+I[14])/w]};
function pick3d(cx,cy){const cv=$('gl'),r=cv.getBoundingClientRect();if(!camera.mvp)return null;const I=inv4(camera.mvp);if(!I)return null;
 const nx=(cx-r.left)/r.width*2-1,ny=1-(cy-r.top)/r.height*2,A=unp(I,nx,ny,-1),C=unp(I,nx,ny,1);
 // 실내 보기 중이면 보이는 층 바닥에 먼저 맞춘다
 if(IN.b&&IN.b.rt){const f=IN.b.rt.floors[IN.cur];const t=(f.y-A[1])/(C[1]-A[1]);if(t>0&&t<1){const x=A[0]+(C[0]-A[0])*t,z=A[2]+(C[2]-A[2])*t,[X0,Z0,X1,Z1]=IN.b.d.bounds;
   if(x>X0&&x<X1&&z>Z0&&z<Z1&&f&&IN.b.rt.floors)return {x,z,y:f.y,b:IN.b.bv,floor:f.id,view:'3d'}}}
 const L=Math.hypot(C[0]-A[0],C[1]-A[1],C[2]-A[2]),n=Math.min(4000,Math.ceil(L/1.5));let prev=0;
 for(let i=1;i<=n;i++){const t=i/n,x=A[0]+(C[0]-A[0])*t,y=A[1]+(C[1]-A[1])*t,z=A[2]+(C[2]-A[2])*t;
  const b=bAt(x,z);if(b){const g=H(b.cx,b.cz);if(y<=g+(b.h||10)&&y>=g-2)return {x,z,y,b,floor:null,view:camera.mode==='walk'?'walk':'3d'}}
  if(y<=H(x,z)){let lo=prev,hi=t;for(let k=0;k<20;k++){const m=(lo+hi)/2,xx=A[0]+(C[0]-A[0])*m,yy=A[1]+(C[1]-A[1])*m,zz=A[2]+(C[2]-A[2])*m;if(yy<=H(xx,zz))hi=m;else lo=m}
   const xx=A[0]+(C[0]-A[0])*hi,zz=A[2]+(C[2]-A[2])*hi;return {x:xx,z:zz,y:H(xx,zz),b:bAt(xx,zz)||null,floor:null,view:camera.mode==='walk'?'walk':'3d'}}
  prev=t}
 return null}
function pickPlan(cx,cy){const P=globalThis.__P2D;if(!P)return null;const cv=document.querySelector('#p2 canvas'),r=cv.getBoundingClientRect(),PL=P.PL;
 const x=PL.cx+(cx-r.left-r.width/2)/PL.s,z=PL.cz+(cy-r.top-r.height/2)/PL.s;let floor=null;const b=bAt(x,z)||null;
 if(b&&PL.s>=2.4){const ib=P.ibs.find(q=>q.bv===b);if(ib){let fi=PL.fl[ib.d.code];if(fi==null){fi=ib.d.floors.findIndex(f=>f.id==='1F');if(fi<0)fi=0}floor=ib.d.floors[fi].id}}
 return {x,z,y:H(x,z),b,floor,view:'plan'}}
let downAt=null;
world.addEventListener('pointerdown',e=>{downAt=[e.clientX,e.clientY]},true);
world.addEventListener('pointerup',e=>{if(!picking||!downAt||e.target.closest('#ed'))return;const mv=Math.hypot(e.clientX-downAt[0],e.clientY-downAt[1]);downAt=null;if(mv>6)return;
 const onCanvas=e.target===$('gl')||e.target.closest('#p2');if(!onCanvas)return;
 const p=globalThis.__P2ON?pickPlan(e.clientX,e.clientY):pick3d(e.clientX,e.clientY);if(!p)return;e.stopPropagation();e.preventDefault();setDraft(p)},true);
function setDraft(p){draft=p;picking=false;document.body.classList.remove('edpicking');pick.textContent='';pick.classList.add('ok');
 const nm=p.b?(p.b.name||'').split('(')[0].trim():'';pick.append('위치: '+([nm,p.floor?IFN(p.floor):''].filter(Boolean).join(' ')||'건물 밖')+' ');const re=el('button',null,'다시 찍기');re.onclick=startPick;pick.appendChild(re);
 const xy=`x ${p.x.toFixed(1)}, z ${p.z.toFixed(1)}`,co=el('div','edxy','좌표 '+xy+(p.y!=null?` · 높이 ${p.y.toFixed(1)} m`:'')+' ');const cp=el('button',null,'복사');cp.onclick=()=>{try{navigator.clipboard.writeText(`[${p.x.toFixed(2)}, ${p.z.toFixed(2)}]`);cp.textContent='복사됨'}catch(e){}};co.appendChild(cp);pick.appendChild(co);drawPins(true)}
function startPick(){picking=true;draft=null;document.body.classList.add('edpicking');pick.classList.remove('ok');pick.textContent='지도에서 틀린 위치를 눌러 주세요. (드래그하면 지도를 움직일 수 있어요)';drawPins(true)}
go.onclick=()=>{form.hidden=false;go.hidden=true;msg.textContent='';note.textContent='';startPick();ta.focus()};
cancel.onclick=()=>{form.hidden=true;go.hidden=false;picking=false;draft=null;document.body.classList.remove('edpicking');drawPins(true)};
send.onclick=async()=>{msg.textContent='';if(!draft){msg.textContent='먼저 지도에서 위치를 찍어 주세요.';return}const text=ta.value.trim();if(text.length<3){msg.textContent='내용을 조금 더 적어 주세요.';return}
 send.disabled=true;try{const b=draft.b;const j=await api('/api/reports',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({x:+draft.x.toFixed(2),z:+draft.z.toFixed(2),y:draft.y==null?null:+draft.y.toFixed(2),view:draft.view,bcode:b?b.code:'',bname:b?(b.name||'').split('(')[0].trim():'',floor:draft.floor||'',cat,text,nick:nick.value.trim()})});
  ta.value='';draft=null;form.hidden=true;go.hidden=false;
  note.textContent='제보가 등록됐어요. 고마워요!';reports.unshift(j.report);selId=j.report.id;filter='open';tOpen.click()
  setTimeout(()=>{note.textContent=''},6000)}catch(e){msg.textContent=e.message}finally{send.disabled=false}};

// ---------- 핀
const pinEls=new Map();
function toScreen(x,y,z){if(globalThis.__P2ON){const P=globalThis.__P2D;if(!P)return null;const PL=P.PL,r=world.getBoundingClientRect();return [r.width/2+(x-PL.cx)*PL.s,r.height/2+(z-PL.cz)*PL.s]}
 const p=project([x,(y==null?H(x,z):y)+1.2,z]);return p?[p[0],p[1]]:null}
function drawPins(rebuild){const rs=reports.filter(r=>filter==='fixed'?r.status==='fixed':r.status!=='fixed');
 if(rebuild){pins.textContent='';pinEls.clear();for(const r of rs){const d=el('div','edpin'+(r.id===selId?' sel':''));d.style.background=CATC[r.cat]||CATC.other;d.title=(CATN[r.cat]||'')+' · '+r.text.slice(0,40);d.onclick=e=>{e.stopPropagation();selId=r.id;render();const it=list.querySelector('.eitem.sel');it&&it.scrollIntoView({block:'nearest'})};pins.appendChild(d);pinEls.set(d,r)}
  if(draft){const d=el('div','edpin new');pins.appendChild(d);pinEls.set(d,draft)}}
 for(const [d,r] of pinEls){const s=toScreen(r.x,r.y,r.z);if(!s){d.style.display='none';continue}d.style.display='block';d.style.left=s[0]+'px';d.style.top=s[1]+'px'}}
(function tick(){if(pinEls.size)drawPins(false);requestAnimationFrame(tick)})();
function flyTo(r){if(globalThis.__P2ON){const P=globalThis.__P2D,PL=P.PL;PL.cx=r.x;PL.cz=r.z;PL.s=Math.max(PL.s,4);if(r.floor&&r.bcode){const ib=P.ibs.find(q=>q.d.code===r.bcode);if(ib){const fi=ib.d.floors.findIndex(f=>f.id===r.floor);if(fi>=0)PL.fl[r.bcode]=fi}}PL.dirty=true;return}
 if(camera.mode==='walk')return;camera.target=[r.x,(r.y==null?H(r.x,r.z):r.y)+2,r.z];camera.dist=Math.min(camera.dist,160)}
load();globalThis.__EDIT={reload:load,get reports(){return reports}};
})()}
