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
.cukedit .compass{top:345px}
@media(max-width:800px){.navlink{padding:8px;font-size:10px}}`;document.head.appendChild(st);
const tools=document.querySelector('.tools');
const grp=(label,ids)=>{const g=document.createElement('div');g.className='toolgrp';const b=document.createElement('button');b.textContent=label;const pop=document.createElement('div');pop.className='toolpop';
 for(const id of ids){const x=$(id);if(x)pop.appendChild(x)}
 b.onclick=e=>{e.stopPropagation();const o=!g.classList.contains('open');document.querySelectorAll('.toolgrp.open').forEach(q=>q.classList.remove('open'));g.classList.toggle('open',o)};g.append(b,pop);tools.appendChild(g);return g};
grp('보기 설정',['contourBtn','orthoBtn','accBtn']);
if(MODE==='edit')grp('대조 도구',['netBtn','detailBtn','satBtn']);
else for(const id of ['netBtn','detailBtn','satBtn']){const x=$(id);if(x)x.style.display='none'}
document.addEventListener('click',e=>{if(!e.target.closest('.toolgrp'))document.querySelectorAll('.toolgrp.open').forEach(q=>q.classList.remove('open'))});
const nav=document.querySelector('.nav'),a=document.createElement('a');a.className='navlink'+(MODE==='view'?' hot':'');a.href=MODE==='view'?'/edit/':'/';a.textContent=MODE==='view'?'오류 제보':'보는 지도로';nav.appendChild(a);
if(MODE==='edit'){document.title='cukmap · 지도 오류 제보';const sub=document.querySelector('.top .sub');if(sub)sub.textContent='MAKE THE CUKMAP · 지도 오류 제보'}}
