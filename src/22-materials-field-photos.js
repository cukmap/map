// ===== 현장 사진(2026-10-31) 반영: 외장 재료·색, 1층 띠, 지붕 형태 =====
{const MC=DATA.materials||{};const col=k=>MC[k]?MC[k].slice():null;
 for(const b of B){if(!b.spec||!b.spec.parts)continue;
  if(b.code==='N'){/* 사진: 흰 외벽 + 1층 짙은 벽돌 띠, 5층 */const P=b.spec.parts[0];const fh=b.lv?b.lv.fh:3.3;P.wall=col('white')||[.9,.9,.87];P.trim=[.82,.83,.82];
   const brick=JSON.parse(JSON.stringify(P));brick.floors=1;brick.height=fh;brick.parapet=0;brick.wall=col('brickDark')||[.55,.32,.27];brick.trim=[.86,.86,.84];brick.roofTex=null;
   P.base=fh;P.win='ribbon';P.floors=Math.max(1,P.floors-1);P.height=P.floors*fh+(P.parapet||0);P.bottom=.01;b.spec.parts=[brick,P];b.photo='2026-10-31 현장 사진: 흰 외벽·1층 벽돌 띠·지상 5층'}
  if(b.code==='M'){for(const P of b.spec.parts){P.wall=col('brickDark')||[.55,.32,.27];P.trim=[.62,.36,.3]}b.photo='2026-10-31 현장 사진: 짙은 적벽돌'}
  /* 학교 캠퍼스 안내 공식 사진(catholic.ac.kr) 판독 */
  if(b.code==='V'){for(const P of b.spec.parts){P.wall=col('brick')||[.68,.41,.34];P.trim=col('white')||[.9,.9,.87]}b.photo='학교 공식 사진: 적벽돌 벽 + 흰 기둥·보, 목재 천장 캐노피 출입구'}
  if(b.code==='BA'){for(const P of b.spec.parts){P.wall=col('cream')||[.86,.83,.75];P.trim=[.12,.29,.52]}b.photo='학교 공식 사진: 크림색 벽 + 짙은 파란 계단탑'}
  if(b.code==='K'){b.photo='학교 공식 입체 캠퍼스맵: 흰 프레임·청록 유리·보라색 홀 지붕·원통형 유리(2026-11-02 재구성)'}
  if(b.code==='S'){const P=b.spec.parts.find(q=>q.floors>=10);if(P){const fh=(P.height-(P.parapet||0))/P.floors,nl=4;const low=JSON.parse(JSON.stringify(P));low.floors=nl;low.height=nl*fh;low.parapet=0;low.roofTex=null;low.wall=col('brick')||[.68,.41,.34];
   P.base=(P.base||0)+nl*fh;P.floors-=nl;P.height=P.floors*fh+(P.parapet||0);P.bottom=.01;P.wall=[.93,.53,.30];P.trim=[.62,.62,.60];b.spec.parts.splice(b.spec.parts.indexOf(P),0,low)}b.photo='학교 공식 사진: 하부 적벽돌, 상부 테라코타 패널'}
  if(b.code==='H / T'||b.code==='H/T'){for(const P of b.spec.parts){P.wall=[.80,.74,.64];P.trim=[.86,.81,.72];P.win='punched';P.glass=[.16,.22,.25]}b.photo='학교 공식 사진: 베이지 석재 고층 탑 + 저층 동'}
  if(b.code==='N'){/* 공식 사진: 흰 가로 띠 + 띠창 */}
  if(b.code==='BI'){for(const P of b.spec.parts){P.wall=col('lightgray')||[.8,.81,.82];P.win='ribbon'}b.photo='학교 공식 사진: 회색 패널 + 가로 띠창'}
  if(b.code==='교회'){for(const P of b.spec.parts){P.wall=[.84,.78,.66]}b.photo='학교 공식 사진: 팔각 평면, 베이지 석재, 녹색 지붕'}
  /* 창 배치: 사진 판독 기반 건물별 간격·크기 */
  {const W={'도서관':{pitch:2.4,ww:1.5,hf:.55},M:{pitch:3.4,ww:1.4,hf:.48},D:{pitch:2.8,ww:1.3,hf:.5},SH:{pitch:2.2,ww:.9,hf:.62},V:{pitch:3.6,ww:2.4,hf:.5},S:{pitch:2.6,ww:1.6,hf:.45},AD:{pitch:3.0,ww:1.2,hf:.42},I:{pitch:3.0,ww:1.0,hf:.55},P:{pitch:3.2,ww:1.4,hf:.5},'H / T':{pitch:2.0,ww:1.2,hf:.55},NP:{pitch:1.6,ww:.45,hf:.8}}[b.code];if(W)for(const P of b.spec.parts){if(P.win==='punched'||P.win==='slit')Object.assign(P,W)}}
  if(b.code==='도서관'){const P=b.spec.parts[0];P.wall=col('lightgray')||[.8,.81,.82];P.parapet=.4;if(b.lv)P.height=P.floors*b.lv.fh+.4;b.photoRoof=true;b.photo='2026-10-31 현장 사진: 회색 석재 외벽·녹색 금속 모임지붕(깊은 처마)'}
 }}

