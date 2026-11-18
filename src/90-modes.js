// ===== 보는 화면(/) · Edit 화면(/edit/) 정리 (2026-11-17) =====
// 보는 화면: 기본 조작 + 「보기 설정」(등고선·항공사진·급경사로)만.
// Edit 화면: 위에 더해 「대조 도구」(보행망·시설 세부·도면 겹치기) — 지도가 맞는지 비교하며 오류를 찾는 도구.
{const MODE=globalThis.CUK_MODE==='edit'?'edit':'view';document.body.classList.add(MODE==='edit'?'cukedit':'cukview');
const st=document.createElement('style');st.textContent=`
#v10Focus,#v10Quality,.secondary a[download],.foot,#info,#toolMore{display:none!important}
.toolgrp{position:relative}.toolgrp>button{width:100%}
.toolpop{position:absolute;right:calc(100% + 8px);top:0;display:none;flex-direction:column;gap:6px;background:#ffffffee;border:1px solid #d7e2db;border-radius:12px;padding:8px;box-shadow:0 6px 20px #1c442022;min-width:112px;z-index:6}
.toolgrp.open .toolpop{display:flex}.toolgrp.open>button{background:#edf4ed}
.navlink{display:inline-flex;align-items:center;text-decoration:none;font-size:12px;border:1px solid #d7e2db;border-radius:9px;padding:10px 13px;color:#244f3d;background:#fff}
.navlink:hover{background:#edf4ed}.navlink.hot{background:#e8552e;border-color:#e8552e;color:#fff}.navlink.hot:hover{background:#d24a25}
.tools .compass{position:static;align-self:flex-end;margin-top:4px;box-shadow:0 3px 12px #1c442018;border:1px solid #d7e2db}
#wspd{position:absolute;left:50%;bottom:86px;transform:translateX(-50%);display:none;gap:4px;align-items:center;background:#ffffffee;border:1px solid #d7e2db;border-radius:12px;padding:5px 6px;box-shadow:0 4px 16px #1c442022;z-index:8;font-size:11px;color:#55705c}#wspd.on{display:flex}#wspd b{padding:0 4px}#wspd button{font-size:11px;padding:6px 9px}
@media(max-width:800px){.navlink{padding:8px;font-size:10px}}`;document.head.appendChild(st);
const tools=document.querySelector('.tools');
const grp=(label,ids)=>{const g=document.createElement('div');g.className='toolgrp';const b=document.createElement('button');b.textContent=label;const pop=document.createElement('div');pop.className='toolpop';
 for(const id of ids){const x=$(id);if(x)pop.appendChild(x)}
 b.onclick=e=>{e.stopPropagation();const o=!g.classList.contains('open');document.querySelectorAll('.toolgrp.open').forEach(q=>q.classList.remove('open'));g.classList.toggle('open',o)};g.append(b,pop);tools.appendChild(g);return g};
grp('보기 설정',['contourBtn','orthoBtn','accBtn']);
if(MODE==='edit')grp('대조 도구',['netBtn','detailBtn','satBtn']);
else for(const id of ['netBtn','detailBtn','satBtn']){const x=$(id);if(x)x.style.display='none'}
const nav=document.querySelector('.nav'),a=document.createElement('a');a.className='navlink'+(MODE==='view'?' hot':'');a.href=MODE==='view'?'/edit/':'/';a.textContent=MODE==='view'?'오류 제보':'홈';nav.appendChild(a);
if(MODE==='edit'){document.title='cukmap · 지도 오류 제보';const sub=document.querySelector('.top .sub');if(sub)sub.textContent='MAKE THE CUKMAP · 지도 오류 제보'}
// 나침반: 오른쪽 버튼 줄 맨 아래로(버튼 수가 달라도 겹치지 않게)
{const c=document.querySelector('.compass');if(c&&tools)tools.appendChild(c)}
// 지상 시점 속도(학교 전체를 둘러볼 때 답답하지 않게): 1·2·4배, Shift를 누르고 있으면 2배 더
{const SP=[[1,'걷기'],[2,'뛰기'],[4,'빠르게']];let v=1;try{v=+localStorage.getItem('cukWalkSpeed')||1}catch(e){}if(!SP.some(q=>q[0]===v))v=1;globalThis.__WSPD=v;
 const w=document.createElement('div');w.id='wspd';w.appendChild(Object.assign(document.createElement('b'),{textContent:'이동 속도'}));
 const set=k=>{globalThis.__WSPD=k;try{localStorage.setItem('cukWalkSpeed',k)}catch(e){}[...w.querySelectorAll('button')].forEach(b=>b.classList.toggle('on',+b.dataset.k===k))};
 for(const [k,n] of SP){const b=document.createElement('button');b.dataset.k=k;b.textContent=`${n} ${k}×`;b.onclick=e=>{e.stopPropagation();set(k);b.blur()};w.appendChild(b)}
 $('gl').parentElement.appendChild(w);set(v);
 addEventListener('keydown',e=>{if(camera.mode!=='walk'||['INPUT','TEXTAREA','SELECT'].includes((document.activeElement||{}).tagName))return;const i={Digit1:0,Digit2:1,Digit3:2}[e.code];if(i!=null)set(SP[i][0])});
 setInterval(()=>w.classList.toggle('on',camera.mode==='walk'&&!globalThis.__INW&&!globalThis.__P2ON),300);}
// 함께 만든 사람들 · 자료 출처 표시(OpenStreetMap 등 출처 표시 조건)
{const c=document.createElement('div');c.id='cukcredit';c.innerHTML='<a href="/projects/">활용 프로젝트</a> · <a href="/contributors/">함께 만든 사람들</a> · 자료: 국토지리정보원, © OpenStreetMap contributors';
 const cs=document.createElement('style');cs.textContent='#cukcredit{position:absolute;left:12px;bottom:10px;z-index:7;font-size:11px;color:#4d6355;background:#ffffffcc;border-radius:8px;padding:4px 8px}#cukcredit a{color:#244f3d;font-weight:700}.cukedit #cukcredit{display:none}@media(max-width:800px){#cukcredit{font-size:10px;bottom:6px;left:6px}}';
 document.head.appendChild(cs);$('gl').parentElement.appendChild(c)}}
