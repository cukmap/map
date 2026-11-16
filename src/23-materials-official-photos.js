// ===== 학교 홈페이지 캠퍼스 안내 공식 사진(2026-11-08 재확인) — 외벽 재질·창 형식 =====
{for(const b of B){if(!b.spec||!b.spec.parts)continue;const set=(o)=>{for(const P of b.spec.parts)Object.assign(P,o)};
 if(b.code==='N'){set({wall:[.46,.20,.18],trim:[.93,.93,.91],win:'ribbon',glass:[.22,.28,.32]});b.photo26='현장 사진(2026-11-10): 흰 골조(층 띠·기둥) + 짙은 적갈색 벽돌 아래벽 + 흰 띠 속 가로 띠창'}
 if(b.code==='V'){set({wall:[.46,.20,.18],trim:[.93,.93,.91],win:'ribbon',glass:[.22,.28,.32]});b.photo26='현장 사진(2026-11-10): 흰 골조 + 짙은 적갈색 벽돌 판, 띠창, "10 비르투스관"'}
 if(b.code==='H / T'){/* 2026-11-11 나무위키 항공 사진: 밝은 베이지 석재, 저층동 맨 위층은 앞으로 나온 흰 띠(띠창), 고층 탑은 좁은 세로창 + 가운데 유리 */for(const P of b.spec.parts){P.wall=[.86,.82,.74];P.trim=[.92,.90,.86];if(P.floors>=8){P.win='slit';P.pitch=3.4;P.ww=.9;P.hf=.62;P.glass=[.24,.32,.36]}else{P.win='punched';P.pitch=3.0;P.ww=1.1;P.hf=.5;P.glass=[.22,.30,.34]}}}
 if(b.code==='교회'){/* 2026-11-11 나무위키 사진: 넓고 낮은 연두색 금속 팔각 지붕 + 작은 꼭대기 탑, 벽은 밝은 베이지 */for(const P of b.spec.parts){P.roofColor=[.74,.78,.52];P.wall=[.88,.84,.74];if(P.roofTris)P.roofTris=P.roofTris.map(t=>t.map(v=>[v[0],v[1]*.45,v[2]]))}}
 if(b.code==='M'){for(const P of b.spec.parts){if(P.era==='new')Object.assign(P,{wall:[.70,.36,.28],trim:[.60,.31,.25],win:'punched',glass:[.18,.22,.26],pitch:3.6,ww:1.9,hf:.52});else Object.assign(P,{wall:[.46,.20,.18],trim:[.93,.93,.91],win:'ribbon',glass:[.22,.28,.32]})}b.photo26='현장 사진(2026-11-10): 남쪽 옛 동 = 흰 골조 + 짙은 적갈색 벽돌·띠창, 북쪽 새 동 = 밝은 붉은 벽돌·개별창·유리 계단탑·포치'}
 if(b.code==='BA'){set({wall:[.88,.88,.86],trim:[.28,.30,.32],win:'ribbon',glass:[.22,.30,.34]});b.photo26='현장 사진(2026-11-10): 흰 콘크리트, 짙은 틀 띠창, 서쪽 짙은 파란 벽 + 흰 바깥 계단, "8 밤비노관"'}
 // 니콜스관 5층은 4층보다 좁음(사용자: 5층 창으로 나가면 4층 옥상) → 위 덩어리를 2~4층 + 안으로 줄인 5층으로
 if(b.code==='N'&&b.n5poly){const ps=b.spec.parts,top=ps.reduce((a,p)=>((p.base||0)+p.height>(a.base||0)+a.height?p:a),ps[0]);const fh=(top.height-(top.parapet||0))/top.floors;
  if(top.floors>=2){const p5=JSON.parse(JSON.stringify(top));top.floors-=1;top.height=top.floors*fh+(top.parapet||.9);top.parapet=top.parapet||.9;
   p5.base=(top.base||0)+top.floors*fh;p5.floors=1;p5.height=fh+.6;p5.parapet=.6;p5.poly=b.n5poly;p5.tri=b.n5tri;p5.holes=[];p5.bottom=.01;p5.wall=[.86,.86,.84];p5.trim=[.80,.80,.78];p5.win='ribbon';p5.roofTex=null;ps.push(p5)}}
 if(b.code==='NP'){set({wall:[.56,.30,.25],win:'slit',glass:[.22,.34,.48],pitch:3.3,ww:.95,hf:.84,height:23.2,parapet:.6});b.photo26='현장 사진(2026-11-10): 짙은 적벽돌 5층, 세로로 긴 창, 북쪽 면 1·2층 유리 커튼월 + 짙은 금속 틀(현관)'}
 if(b.code==='SH'){set({wall:[.66,.33,.24],/* 2026-11-12 로드뷰: 밝은 주황빛 붉은 벽돌 */trim:[.90,.89,.86],glass:[.20,.26,.30]});b.photo26='현장 사진(2026-11-10): 짙은 적벽돌 5층, 격자창, 낮은 모임지붕 + 흰 처마, 은색 배기 덕트, 동쪽 끝 유리 현관'}
 if(b.code==='C'){set({wall:[.70,.32,.25],trim:[.93,.93,.91]});b.photo26='공식 사진: 붉은 벽돌 + 흰 띠창, 아치 창, 흰 곡면 캐노피'}
 if(b.code==='D'){set({wall:[.75,.46,.37],trim:[.84,.64,.50],win:'punched',pitch:4.6,ww:3.1,hf:.5,glass:[.30,.42,.50]});/* 2026-11-11 카카오 로드뷰(2025-12): 밝은 붉은 벽돌, 3짝 넓은 가로창 */b.photo26='공식 사진: 붉은 벽돌, 모서리 깎인 출입구 + 흰 기둥 2개'}
 if(b.code==='B'){set({wall:[.60,.27,.21],trim:[.52,.23,.18],win:'punched',glass:[.22,.28,.33],pitch:4.2,ww:2.6,hf:.42});b.photo26='공식 사진: 붉은 벽돌, 깊게 파인 정면 출입구 + 둥근 기둥, 위 유리창'}
 if(b.code==='도서관'){set({wall:[.90,.90,.88],trim:[.80,.80,.78],win:'punched',glass:[.22,.30,.36],pitch:3.9,ww:1.6,hf:.52});b.photo26='공식 사진: 흰 석재 격자 + 가운데 유리 커튼월, 녹색 모임지붕, 원형 출입구'}
 if(b.code==='BI'){set({wall:[.76,.78,.78],trim:[.84,.85,.85],win:'ribbon',glass:[.42,.54,.58]});b.photo26='공식 사진: 흰 패널 + 연속 유리 띠창'}
 if(b.code==='S'){/* 2026-11-11 공식 입체 캠퍼스맵 재대조: 서남 중층 날개는 회색이 아니라 연어색 벽돌 + 파란 유리 띠, 위로 갈수록 한 단씩 물러나는 테라스 */for(const P of b.spec.parts)if(P.floors>=6&&P.floors<=8&&P.base===0){P.wall=[.86,.57,.47];P.trim=[.95,.95,.93];P.win='ribbon';P.glass=[.26,.46,.70]}}
 if(b.code==='S'){/* 2026-11-13 현장 사진: 고층부 = 주황 테라코타 패널, 남쪽 동 = 짙은 붉은 벽돌 */for(const P of b.spec.parts){if(P.floors===15&&P.base===0)P.wall=[.80,.43,.27];if(P.floors===11&&P.base===0){P.wall=[.60,.28,.22];P.trim=[.66,.34,.27]}}}
 if(b.code==='K'){/* 공식 입체맵: 흰 가로 띠 + 하늘색 유리 커튼월, 지붕 전체 보라색 격자(정사영상 3×4 격자와 일치) */const ps=b.spec.parts;/* 2026-11-11 정면 사진: 보라색은 공식맵의 표현일 뿐, 실제 지붕은 회색 금속 경사 지붕 + 청록 유리 커튼월 */if(ps[0]){Object.assign(ps[0],{wall:[.40,.62,.62],trim:[.93,.94,.94],glass:[.34,.58,.60],win:'ribbon',roofColor:[.60,.62,.63],roofTex:null})}if(ps[1])Object.assign(ps[1],{wall:[.50,.52,.54],trim:[.62,.64,.65],roofColor:[.56,.58,.60],parapet:0});if(ps[2])Object.assign(ps[2],{glass:[.16,.42,.50],wall:[.20,.44,.52],roofColor:[.60,.62,.63],roofTex:null})}
}}

for(let idx=0;idx<B.length;idx++){if(idx)B[idx-1]._rg=[B[idx-1]._m0,mesh.length/11,B[idx-1]._r0,roofMesh.length/11];B[idx]._m0=mesh.length/11;B[idx]._r0=roofMesh.length/11;let b=B[idx],poly=b.poly,foot=Math.min(...poly.map(p=>H(...p)))-.4,bh=b.code==='ST'?13.2:b.h,top=foot+bh,fac=C[b.shade]||C.neutral; if(!b.spec&&(b.complexPart||b.code==='ST'&&showArch)){b.ground=V10.fit.base;b.roof=V10.fit.base+55.2;b.cx=poly.reduce((s,p)=>s+p[0],0)/poly.length;b.cz=poly.reduce((s,p)=>s+p[1],0)/poly.length;continue;}b.ground=foot;b.roof=top;b.cx=poly.reduce((s,p)=>s+p[0],0)/poly.length;b.cz=poly.reduce((s,p)=>s+p[1],0)/poly.length;
if(b.spec){buildSpec(b,foot);continue;}
if(b.profile==='andrea'){
 const fl=b.floorLift||0,lift=6.6+fl,sign0=(poly.reduce((s,p,i)=>{let q=poly[(i+1)%poly.length];return s+p[0]*q[1]-q[0]*p[1]},0)>0?1:-1),axis=b.longAxis,range=b.axisRange,span=range[1]-range[0],end=p=>{let t=(p[0]*axis[0]+p[1]*axis[1]-range[0])/span;return t<.20||t>.77};
 // The CAD roof path is exact in plan; opening, floor heights and facade spacing are interpreted.
 for(let i=0;i<poly.length;i++){
  const p=poly[i],q=poly[(i+1)%poly.length],ll=len(p,q);if(ll<.001)continue;
  const middle=[(p[0]+q[0])/2,(p[1]+q[1])/2],bottom=end(middle)?foot:foot+lift;
  texQuad(mesh,p,q,bottom,top,[.88,.64,.58],[0,0],0,0,2);if(end(middle)){glassQuad(mesh,p,q,foot+.15,foot+3.1,[sign0*(q[1]-p[1])/ll,-sign0*(q[0]-p[0])/ll],.06)}
 }
 // Distribute facade bays along complete runs so curved segments also receive windows.
 const area=poly.reduce((s,p,i)=>{let q=poly[(i+1)%poly.length];return s+p[0]*q[1]-q[0]*p[1]},0),sign=area>0?1:-1;
 for(let i=0;i<poly.length;i++){
  const p=poly[i],q=poly[(i+1)%poly.length],ll=len(p,q);if(ll<.1)continue;
  const out=[sign*(q[1]-p[1])/ll,-sign*(q[0]-p[0])/ll];
  let n=Math.max(1,Math.round(ll/3.8));
  for(let row=2;row<10;row++)for(let j=0;j<n;j++){
   const hs=((row*7+j*13+i*5)%5),wv=[.30,.48,.62,.40,.55][hs],off=[.18,.30,.12,.24,.20][(hs+row)%5],u=(j+off)/n,v=(j+off+wv)/n,y=foot+fl+row*3.3+1.0,at=(a,h)=>[mix(p[0],q[0],a)+out[0]*.08,h,mix(p[1],q[1],a)+out[1]*.08];
   glassQuad(mesh,[mix(p[0],q[0],u),mix(p[1],q[1],u)],[mix(p[0],q[0],v),mix(p[1],q[1],v)],y,y+1.35,out,.08);
  }
 }
 // Exposed pilotis are schematic, grounded in the official photograph, not measured columns.
 const xs=poly.map(p=>p[0]),zs=poly.map(p=>p[1]);
 /* 2026-10-31 현장 사진: 필로티 광장은 굵은 사각 기둥 + V자 기둥, 바닥은 목재 데크 */{const ax=axis,px_=[-ax[1],ax[0]],cc=[.86,.85,.82],w=.95;
 const leg=(x0,z0,x1,z1)=>{const h=w/2,c0=[[-h,-h],[h,-h],[h,h],[-h,h]];const P=(x,z,y,o)=>[x+ax[0]*o[0]+px_[0]*o[1],y,z+ax[1]*o[0]+px_[1]*o[1]];for(let i=0;i<4;i++){const a=c0[i],c=c0[(i+1)%4];quad(mesh,P(x0,z0,foot,a),P(x0,z0,foot,c),P(x1,z1,foot+lift,c),P(x1,z1,foot+lift,a),i%2?cc:cc.map(v=>v*.92))}};
 for(let x=Math.min(...xs)+4;x<Math.max(...xs);x+=8.5)for(let z=Math.min(...zs)+4;z<Math.max(...zs);z+=8.5){if(!inside(x,z,poly)||end([x,z]))continue;const n=14,r=.42;for(let k=0;k<n;k++){const a0=k/n*6.283,a1=(k+1)/n*6.283;quad(mesh,[x+Math.cos(a0)*r,foot,z+Math.sin(a0)*r],[x+Math.cos(a1)*r,foot,z+Math.sin(a1)*r],[x+Math.cos(a1)*r,foot+lift,z+Math.sin(a1)*r],[x+Math.cos(a0)*r,foot+lift,z+Math.sin(a0)*r],[.94,.94,.92].map(v=>v*(k%2?.95:1)))}}
 for(const tr of b.tri)pushTri(mesh,...tr.map(p=>[p[0],H(p[0],p[1])+.12,p[1]]),[.72,.45,.31])}
 for(const tr of b.tri){pushTri(mesh,...tr.map(p=>[p[0],foot+lift,p[1]]),[.68,.66,.60]);}
 texTris(b.tri,top,[.58,.40,.34],b.roofTex||[0,0]);b.roof=top;continue;
}
for(let i=0;i<poly.length;i++){let p=poly[i],q=poly[(i+1)%poly.length],ll=len(p,q),dir=[(q[0]-p[0])/ll,(q[1]-p[1])/ll],out=[dir[1],-dir[0]];let face=i%3===0?fac.map(v=>v*.88):i%3===1?fac:fac.map(v=>v*1.07);quad(mesh,[p[0],foot,p[1]],[q[0],foot,q[1]],[q[0],top,q[1]],[p[0],top,p[1]],face);if(bh<5)continue;let ncol=[.24,.40,.44],count=Math.floor(ll/3.2),nfl=Math.floor(bh/3.3);if(count<=0)continue;for(let f=0;f<nfl;f++)for(let j=0;j<count;j++){let s1=(j+.19)/count,s2=(j+.77)/count,y1=foot+f*3.3+1.0,y2=Math.min(foot+(f+1)*3.3-.55,top-.9);if(y2<=y1)continue;let v=(u,y)=>[mix(p[0],q[0],u)+out[0]*.085,y,mix(p[1],q[1],u)+out[1]*.085];let cc=((j+f*3)%9===0)?[.52,.63,.59]:ncol;quad(mesh,v(s1,y1),v(s2,y1),v(s2,y2),v(s1,y2),cc)}}for(const hp of (b.holes||[]))for(let j=0;j<hp.length;j++){let p=hp[j],q=hp[(j+1)%hp.length];let bottom=b.courtyardDepth?top-b.courtyardDepth:foot;quad(mesh,[p[0],bottom,p[1]],[q[0],bottom,q[1]],[q[0],top,q[1]],[p[0],top,p[1]],fac)}for(const t of (b.courtyardFloor||[])){pushTri(mesh,...t.map(p=>[p[0],top-b.courtyardDepth,p[1]]),[.55,.60,.55])}roof(poly,b.tri,top,fac.map(v=>v*.75));
}
B[B.length-1]._rg=[B[B.length-1]._m0,mesh.length/11,B[B.length-1]._r0,roofMesh.length/11];
