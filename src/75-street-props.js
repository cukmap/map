// ===== 거리 소품 (2026-11-02 제3자 평가 반영): 가로등·벤치·주차 차량·건물 안내판 — 위치는 경로망·CAD 주차선·출입구 기반 자동 배치 =====
{const PR=JSON.parse(document.getElementById('props26').textContent),pm=[];
 const box=(c,ux,uz,hw,hd,y0,y1,col)=>{const vx=-uz,vz=ux,P=[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].map(([a,b])=>[c[0]+ux*a+vx*b,c[1]+uz*a+vz*b]);
  quad(pm,[P[0][0],y1,P[0][1]],[P[1][0],y1,P[1][1]],[P[2][0],y1,P[2][1]],[P[3][0],y1,P[3][1]],col);for(let i=0;i<4;i++){const p=P[i],q=P[(i+1)%4];quad(pm,[p[0],y0,p[1]],[q[0],y0,q[1]],[q[0],y1,q[1]],[p[0],y1,p[1]],col.map(x=>x*(i%2?.86:1)))}};
 const pole=[.24,.26,.27],lampC=[1,.93,.72],wood=[.55,.38,.24],iron=[.20,.21,.22];
 // 가로등(2026-11-10 현장 사진): 짙은 기둥 + 둥근 유리구 등, 일부는 양쪽 두 등
 const globe=(c,y,r)=>{const n=8;for(let i=0;i<n;i++)for(let j=0;j<4;j++){const a0=i/n*6.283,a1=(i+1)/n*6.283,b0=-1.571+j/4*3.1416,b1=-1.571+(j+1)/4*3.1416,P=(a,b)=>[c[0]+Math.cos(a)*Math.cos(b)*r,y+Math.sin(b)*r,c[1]+Math.sin(a)*Math.cos(b)*r];quad(pm,P(a0,b0),P(a1,b0),P(a1,b1),P(a0,b1),lampC)}};
 PR.lamps.forEach(([x,z,a],k)=>{const y=H(x,z),ux=Math.cos(a),uz=Math.sin(a);box([x,z],1,0,.13,.13,y,y+.6,pole);box([x,z],1,0,.07,.07,y+.6,y+3.9,pole);
  if(k%3===2){box([x,z],ux,uz,.6,.05,y+3.75,y+3.82,pole);for(const s of[-.6,.6]){box([x+ux*s,z+uz*s],1,0,.05,.05,y+3.82,y+3.95,pole);globe([x+ux*s,z+uz*s],y+4.2,.27)}}else{box([x,z],1,0,.1,.1,y+3.85,y+3.95,pole);globe([x,z],y+4.22,.3)}});
 for(const [x,z,a] of PR.benches){const y=H(x,z),ux=Math.cos(a),uz=Math.sin(a),vx=-uz,vz=ux;box([x,z],ux,uz,.8,.22,y+.42,y+.48,wood);box([x-vx*.2,z-vz*.2],ux,uz,.8,.03,y+.5,y+.85,wood);for(const s of[-.7,.7])box([x+ux*s,z+uz*s],ux,uz,.04,.2,y,y+.42,iron)}
 const CC=[[.92,.92,.90],[.70,.72,.74],[.15,.16,.18],[.22,.30,.48],[.62,.14,.12],[.45,.47,.50]];
 for(const [x,z,a,k] of PR.cars){const y=H(x,z),ux=Math.cos(a),uz=Math.sin(a),c=CC[k%CC.length];box([x,z],ux,uz,2.2,.88,y+.25,y+.95,c);box([x-ux*.25,z-uz*.25],ux,uz,1.2,.8,y+.95,y+1.45,c.map(v=>v*.85));box([x-ux*.25,z-uz*.25],ux,uz,1.22,.81,y+1.0,y+1.38,[.14,.18,.22]);
  for(const s of[-1.4,1.4])for(const t of[-.86,.86])box([x+ux*s-uz*t,z+uz*s+ux*t],ux,uz,.32,.1,y,y+.55,[.08,.08,.08])}
 for(const [x,z,a,col] of PR.signs){const y=H(x,z),ux=Math.cos(a),uz=Math.sin(a);box([x,z],ux,uz,.6,.12,y,y+1.7,[.95,.95,.93]);box([x-uz*.13,z+ux*.13],ux,uz,.5,.01,y+.35,y+1.55,col)}
 const PO=upload(pm);const prev=globalThis.__CAN;globalThis.__CAN=()=>{prev&&prev();renderObj(PO,camera.mvp,0)};
 (globalThis.__SHX=globalThis.__SHX||[]).push(PO);setTimeout(()=>{if(globalThis.__SHPASS)globalThis.__SHPASS([build,roofObj,forest,...globalThis.__SHX])},120);
 globalThis.__PROPS={n:PR.lamps.length+PR.benches.length+PR.cars.length+PR.signs.length}}



