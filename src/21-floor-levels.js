// ===== 건물 층 높이 통일 (실내·실외 공통 기준) =====
// 사용자 확인 연결: 마리아관 4층 = 니콜스관 4층 = 비르투스관 3층 = 밤비노관 3층.
// 층고 3.6 m 가정, 1층 바닥 높이는 네 건물 출입구 지형고(NGII)와의 오차를 최소화하도록 맞춤(최소제곱, 잔차 ±2.8 m 이내).
// [1층 바닥 높이, 층고, 외관 지상층수(null=유지), 외관에도 적용?]
const LVTAB={N:[28.95,3.6,5,true],M:[28.95,3.6,4,true],V:[32.55,3.6,3,true],BA:[32.55,3.6,3,true],
 B:[43.37,3.6,3,true],'도서관':[46.4,3.6,5,true],K:[15.04,3.32,null,false],C:[55.0,4.5,null,false]};
const LVLINK=[['M','4F','N','4F'],['N','4F','V','3F'],['V','3F','BA','3F']];
for(const b of B){const L=LVTAB[b.code];if(!L)continue;b.lv={datum:L[0],fh:L[1]};if(!L[3]||!b.spec)continue;b.spec.datum=L[0];
 for(const pt of b.spec.parts){if(!pt.floors)continue;if(L[2]!=null&&b.spec.parts.length===1)pt.floors=L[2];pt.height=pt.floors*L[1]+(pt.parapet||0)}if(L[2]!=null)b.floors=L[2]}
function lvFloorY(lv,id,top){if(id==='B1')return lv.datum-lv.fh;if(id==='B2')return lv.datum-2*lv.fh;if(id==='RF')return lv.datum+top*lv.fh;const m=/^(\d+)F$/.exec(id);return m?lv.datum+(+m[1]-1)*lv.fh:lv.datum}

