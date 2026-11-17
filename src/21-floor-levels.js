// ===== 건물 층 높이 통일 (실내·실외 공통 기준) =====
// 사용자 확인 연결: 마리아관 4층 = 니콜스관 4층 = 비르투스관 3층 = 밤비노관 3층.
// 층고 3.6 m 가정, 1층 바닥 높이는 네 건물 출입구 지형고(NGII)와의 오차를 최소화하도록 맞춤(최소제곱, 잔차 ±2.8 m 이내).
// 1층 바닥 해발 고도(datum)와 층고(fh)는 각 건물 building.json 의 "lv" 에 있다(2026-11-17 코드에서 데이터로 옮김).
// 색은 building.json 에서 "#rrggbb" 로 적을 수 있다 → 여기서 0~1 숫자 세 개로 바꾼다.
{const hx=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v)?[1,3,5].map(i=>parseInt(v.slice(i,i+2),16)/255):v;
 for(const b of B){if(!b.spec||!b.spec.parts)continue;for(const P of b.spec.parts)for(const k of ['wall','trim','glass','roofColor'])if(P[k]!=null)P[k]=hx(P[k])}}
function lvFloorY(lv,id,top){if(id==='B1')return lv.datum-lv.fh;if(id==='B2')return lv.datum-2*lv.fh;if(id==='RF')return lv.datum+top*lv.fh;const m=/^(\d+)F$/.exec(id);return m?lv.datum+(+m[1]-1)*lv.fh:lv.datum}

