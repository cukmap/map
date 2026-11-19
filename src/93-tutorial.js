// ===== 오류 제보 화면 첫 안내(튜토리얼) — 2026-11-19 =====
// 처음 들어오면 팝업으로 「알리기 · 고치기 · 가져다 쓰기」 세 가지 참여 방법을 단계별로 보여 준다.
// 「다시 보지 않기」는 이 브라우저에만 저장. 패널의 「도움말」로 언제든 다시 연다.
if(globalThis.CUK_MODE==='edit'){(()=>{
const KEY='cukTutorialSeen2',GH='https://github.com/cukmap/map';
const st=document.createElement('style');st.textContent=`
#tut{position:fixed;inset:0;z-index:200;background:#1c2b2266;display:flex;align-items:center;justify-content:center;padding:16px}
#tut .box{width:min(520px,100%);max-height:calc(100vh - 32px);overflow:auto;background:#fff;border-radius:16px;box-shadow:0 18px 50px #0003;color:#26392f;font-size:14px;line-height:1.6}
#tut .top{display:flex;align-items:center;justify-content:space-between;padding:16px 20px 0}#tut .top small{color:#8a978e;font-size:12px;letter-spacing:1px}
#tut .x{border:0;background:none;font-size:20px;color:#8a978e;cursor:pointer;padding:2px 6px}
#tut .pg{padding:6px 22px 4px}#tut h2{font-size:20px;margin:4px 0 8px}#tut p{margin:0 0 10px;color:#4d6355}
#tut ol{margin:0 0 10px;padding-left:20px}#tut li{margin:5px 0}#tut li b{color:#1d3a2c}
#tut .three{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:6px 0 12px}
#tut .three div{border:1px solid #dfe7e0;border-radius:11px;padding:10px;font-size:12.5px;line-height:1.45}#tut .three b{display:block;font-size:14px;margin-bottom:2px}
#tut .three .n{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;background:#244f3d;color:#fff;font-size:11px;font-weight:800;margin-bottom:4px}
#tut .tip{background:#f3f8f3;border-radius:10px;padding:9px 12px;font-size:12.5px;color:#4d6355;margin:0 0 10px}
#tut .links{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 10px}#tut .links a{font-size:12.5px;text-decoration:none;border:1px solid #d7e2db;border-radius:9px;padding:7px 11px;color:#244f3d}
#tut .links a.hot{background:#244f3d;color:#fff;border-color:#244f3d}
#tut .bot{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 20px 16px;border-top:1px solid #eef2ee;margin-top:6px}
#tut .dots{display:flex;gap:6px}#tut .dots i{width:7px;height:7px;border-radius:50%;background:#d7e2db}#tut .dots i.on{background:#244f3d}
#tut .bot label{font-size:12px;color:#6b7a70;display:flex;align-items:center;gap:5px;cursor:pointer}
#tut .nav{display:flex;gap:6px}#tut .nav button{font:inherit;font-size:13px;padding:8px 14px;border-radius:9px;border:1px solid #d7e2db;background:#fff;color:#244f3d;cursor:pointer}
#tut .nav .go{background:#e8552e;border-color:#e8552e;color:#fff;font-weight:800}
@media(max-width:560px){#tut .three{grid-template-columns:1fr}#tut .bot{flex-wrap:wrap}}`;
document.head.appendChild(st);
// 내용은 고정 문구만(HTML로 넣어도 안전). 바깥 입력은 넣지 않는다
const PAGES=[
`<small>MAKE THE CUKMAP</small><h2>cukmap을 함께 만드는 곳이에요</h2>
<p>cukmap은 누구나 고치고, 누구나 가져다 쓰는 가톨릭대학교 지도예요. 참여하는 방법은 세 가지예요.</p>
<div class="three"><div><span class="n">1</span><b>알리기</b>틀린 곳을 지도에서 찍어 알려요. 로그인 없이 누구나.</div>
<div><span class="n">2</span><b>고치기</b>GitHub에서 값을 직접 고쳐요. 검사를 통과하면 바로 반영돼요.</div>
<div><span class="n">3</span><b>가져다 쓰기</b>이 지도로 내 프로젝트를 만들고 <b style="display:inline">이름.cukmap.com</b> 주소를 받아요.</div></div>
<p>하나씩 알려 드릴게요.</p>`,
`<small>1 · 알리기</small><h2>틀린 곳을 알려 주세요</h2>
<ol><li>왼쪽 패널의 <b>＋ 오류 제보하기</b>를 눌러요.</li>
<li>지도에서 <b>틀린 위치를 눌러요.</b> 건물 안이면 층까지 찍혀요. (드래그하면 지도가 움직여요)</li>
<li><b>분류</b>를 고르고, 실제와 무엇이 다른지 적어서 <b>보내기</b>.</li></ol>
<div class="tip">다른 사람의 제보에는 <b>맞아요 · 아니에요 · 고쳐졌어요 · 부적절해요</b>를 눌러 함께 판단해요. 「고쳐졌어요」 2번이면 해결됨으로, 「부적절해요」 3번이면 자동으로 숨겨져요.</div>`,
`<small>2 · 고치기</small><h2>직접 고칠 수도 있어요</h2>
<ol><li>오류 제보처럼 <b>건물을 지도에서 찍으면</b> 아래에 <b>「이 건물 값을 GitHub에서 직접 고치기」</b>가 나와요.</li>
<li>GitHub 편집 화면에서 이름, 층수, 색 같은 <b>값을 고치고</b> <b>Commit changes → Propose changes</b>를 눌러요. (GitHub 가입이 필요해요)</li>
<li><b>자동 검사</b>가 지도를 망가뜨리지 않는지 확인하고, 통과하면 <b>관리자 없이 자동으로 합쳐져요.</b> 몇 분 뒤 cukmap.com에 반영돼요.</li></ol>
<div class="tip">잘못 고쳐도 괜찮아요. 모든 기록이 남아서 언제든 되돌릴 수 있어요.</div>
<div class="links"><a href="${GH}/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener">고치는 방법 자세히 보기</a></div>`,
`<small>3 · 가져다 쓰기</small><h2>이 지도로 내 프로젝트를 만들어요</h2>
<p>OT 강의실 안내, 축제 부스 지도, 시설 위치처럼 학교 공간을 다루는 프로젝트라면 지도를 새로 만들 필요가 없어요. <b>코드 없이</b> 만들 수 있어요.</p>
<ol><li>견본 저장소에서 <b>Use this template</b>으로 내 저장소를 만들어요.</li>
<li><b>content.txt</b> 파일에 제목과 장소 목록만 적어요. 예) <code>N301 | 국어국문학과 OT</code></li>
<li><b>Settings → Pages</b>를 켜면 내 페이지가 열려요.</li>
<li>신청 파일 하나를 보내면 <b>이름.cukmap.com</b> 주소가 생기고 <a href="/projects/">활용 프로젝트</a> 목록에 올라가요.</li></ol>
<div class="links"><a class="hot" href="${GH}/blob/main/docs/START.md" target="_blank" rel="noopener">단계별 설명서 보기</a><a href="https://github.com/cukmap/starter" target="_blank" rel="noopener">견본 저장소</a></div>`];
let i=0,ov=null;
const close=()=>{if(!ov)return;const ck=ov.querySelector('#tutno');try{if(ck&&ck.checked)localStorage.setItem(KEY,'1')}catch(e){}ov.remove();ov=null};
const draw=()=>{const pg=ov.querySelector('.pg');pg.innerHTML=PAGES[i];ov.querySelectorAll('.dots i').forEach((d,k)=>d.classList.toggle('on',k===i));
 const prev=ov.querySelector('.prev'),next=ov.querySelector('.next');prev.style.visibility=i?'visible':'hidden';
 next.textContent=i===PAGES.length-1?'시작하기':i===1?'다음':'다음';next.classList.toggle('go',i===PAGES.length-1);
 const tryb=ov.querySelector('.try');tryb.hidden=i!==1};
const open=()=>{if(ov)return;i=0;ov=document.createElement('div');ov.id='tut';
 ov.innerHTML=`<div class="box" role="dialog" aria-modal="true" aria-label="오류 제보 화면 안내"><div class="top"><span></span><button class="x" aria-label="닫기">×</button></div><div class="pg"></div>
 <div class="bot"><label><input type="checkbox" id="tutno">다시 보지 않기</label><div class="dots">${PAGES.map(()=>'<i></i>').join('')}</div>
 <div class="nav"><button class="prev">이전</button><button class="try" hidden>지금 해 보기</button><button class="next">다음</button></div></div></div>`;
 document.body.appendChild(ov);
 ov.querySelector('.x').onclick=close;ov.addEventListener('click',e=>{if(e.target===ov)close()});
 ov.querySelector('.prev').onclick=()=>{if(i>0){i--;draw()}};
 ov.querySelector('.next').onclick=()=>{if(i<PAGES.length-1){i++;draw()}else close()};
 ov.querySelector('.try').onclick=()=>{close();const g=document.querySelector('#ed .edgo');if(g)g.click()};
 draw()};
addEventListener('keydown',e=>{if(!ov)return;if(e.key==='Escape')close();else if(e.key==='ArrowRight')ov.querySelector('.next').click();else if(e.key==='ArrowLeft')ov.querySelector('.prev').click()});
// 패널 머리에 「도움말」
const head=document.querySelector('#ed .edhead');if(head){const b=document.createElement('button');b.textContent='도움말';b.onclick=e=>{e.stopPropagation();open()};const f=head.querySelector('button');head.insertBefore(b,f);
 const w=document.createElement('span');w.style.cssText='display:flex;gap:4px';head.insertBefore(w,b);w.append(b,f)}
let seen=false;try{seen=localStorage.getItem(KEY)==='1'}catch(e){}
if(!seen){const wait=()=>document.getElementById('cukload')?setTimeout(wait,300):setTimeout(open,400);wait()}
})()}
