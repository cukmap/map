 // 14) 예수성심성당 (2026-11-11 나무위키 사진): 땅을 파서 지은 성당 — 팔각 마당을 둘러싼 옹벽(서·남·동, 북쪽은 광장 쪽으로 열림) + 위 나무 울타리, 마당은 돌 포장
 {const b=bOf('교회');if(b){const C=b.poly.reduce((s2,p)=>[s2[0]+p[0]/b.poly.length,s2[1]+p[1]/b.poly.length],[0,0]),g=lvlOf(b),R=24,hW=3.4,stone=[.80,.78,.72],wood=[.58,.42,.28];
   const pt=(a,r)=>[C[0]+Math.cos(a)*r,C[1]+Math.sin(a)*r];
   for(let k=0;k<8;k++){const a0=(k+.5)/8*6.283,a1=(k+1.5)/8*6.283,m=(a0+a1)/2;if(Math.sin(m)<-.3)continue;   // 북쪽(광장 쪽) 열림
    const p=pt(a0,R),q=pt(a1,R),mm=[(p[0]+q[0])/2,(p[1]+q[1])/2],l=Math.hypot(q[0]-p[0],q[1]-p[1]),ux=(q[0]-p[0])/l,uz=(q[1]-p[1])/l;
    BX(mm,ux,uz,l+.8,1.2,g-.3,g+hW,stone,-.6);BX(mm,ux,uz,l+1,1.4,g+hW,g+hW+.18,[.88,.86,.82],-.7);
    for(let s2=-l/2;s2<=l/2;s2+=1.6)BX([mm[0]+ux*s2,mm[1]+uz*s2],ux,uz,.1,.1,g+hW+.18,g+hW+1.2,wood,0);BX(mm,ux,uz,l,.08,g+hW+.95,g+hW+1.05,wood,0)}
   {const P0=b.spec.parts[0],ye=g+P0.height-(P0.parapet||0),r0=Math.max(...b.poly.map(p=>Math.hypot(p[0]-C[0],p[1]-C[1]))),rc=[.74,.78,.52];/* 넓게 내민 낮은 처마 */
    for(let k=0;k<8;k++){const a0=(k+.5)/8*6.283,a1=(k+1.5)/8*6.283,P1=pt(a0,r0-.3),P2=pt(a1,r0-.3),Q1=pt(a0,r0+2.6),Q2=pt(a1,r0+2.6);const A=[P1[0],ye+.5,P1[1]],Bq=[P2[0],ye+.5,P2[1]],Cq=[Q2[0],ye-.3,Q2[1]],D=[Q1[0],ye-.3,Q1[1]];quad(mesh,A,Bq,Cq,D,rc);quad(mesh,D,Cq,Bq,A,rc.map(v=>v*.8));quad(mesh,D,Cq,[Q2[0],ye-.6,Q2[1]],[Q1[0],ye-.6,Q1[1]],[.30,.42,.40]);quad(mesh,[Q1[0],ye-.6,Q1[1]],[Q2[0],ye-.6,Q2[1]],Cq,D,[.30,.42,.40])}}
   for(let k=0;k<8;k++){const a0=k/8*6.283,a1=(k+1)/8*6.283,p=pt(a0,R-.2),q=pt(a1,R-.2);pushTri(mesh,[C[0],g+.03,C[1]],[q[0],g+.03,q[1]],[p[0],g+.03,p[1]],[.76,.75,.72]);pushTri(mesh,[C[0],g+.03,C[1]],[p[0],g+.03,p[1]],[q[0],g+.03,q[1]],[.76,.75,.72])}}}
