 // 1) 니콜스관: 흰 골조 + 벽돌 채움
 {const b=bOf('N');if(b)frameOn(b,6.2,.55,white)}
 // 11) 니콜스관 출입구 (2026-11-10 현장 사진): 동측(믿음의길 쪽) = 2개 층 높이 큰 포치(짙은 목재 천장 + 흰 테두리 판, 바깥으로 벌어진 흰 기둥) + 넓은 돌계단 + 유리 출입구
 //    서측(4층 레벨) = 흰 1층 현관 + 짙은 상자형 차양("니콜스관") + 양옆 파란 테두리 게시판
 {const b=bOf('N');if(b){const L=lvlOf(b),P=b.spec.parts[0],fh=(P.height-(P.parapet||0))/P.floors;
   const n=node('E_N_E1');if(n){const e=edgeAt(b,[n.x,n.z]),vx=e.uz,vz=-e.ux,W2=(a,o)=>[e.c[0]+e.ux*a+vx*o,e.c[1]+e.uz*a+vz*o],g=Math.min(H(n.x,n.z),H(...e.c)),yb=Math.max(L,g)+fh*1.8,D=7.5,Wd=10.5,stone=[.70,.69,.66];
    BX(e.c,e.ux,e.uz,Wd,D,yb,yb+.8,white,0);BX(e.c,e.ux,e.uz,Wd-.5,D-.3,yb-.05,yb,[.30,.20,.13],0);
    const SC=(b0,y0,b1,y1,r)=>{const C=[[-r,-r],[r,-r],[r,r],[-r,r]],Q=(bp,c,y)=>{const q=W2(bp[0]+c[0],bp[1]+c[1]);return [q[0],y,q[1]]};for(let i=0;i<4;i++){const c0=C[i],c1=C[(i+1)%4],a=Q(b0,c0,y0),bb=Q(b0,c1,y0),cc=Q(b1,c1,y1),d=Q(b1,c0,y1);quad(mesh,a,bb,cc,d,white);quad(mesh,d,cc,bb,a,white)}};
    for(const s of[-1,1]){SC([s*3.4,D-1.6],g-.2,[s*(Wd/2-.4),D-.5],yb,.32);SC([s*3.6,1.2],L-.1,[s*(Wd/2-.4),.6],yb,.3)}
    BX(e.c,e.ux,e.uz,6.4,.1,L-.05,L+fh*1.5,[.24,.30,.34],.03);for(let s=-3.2;s<=3.21;s+=1.07)BX([e.c[0]+e.ux*s,e.c[1]+e.uz*s],e.ux,e.uz,.07,.14,L-.05,L+fh*1.5,[.85,.85,.83],.03);BX(e.c,e.ux,e.uz,6.6,.16,L+fh*.75,L+fh*.75+.08,[.85,.85,.83],.03);
    if(L>g+.2){const k2=Math.ceil((L-g)/.16);for(let k=0;k<k2;k++)BX(e.c,e.ux,e.uz,Wd-1.4,Math.max(.6,D+.5-k*(D/k2)),g-.2,g+(k+1)*(L-g)/k2,stone,0);for(const s of[-1,1])BX(W2(s*(Wd/2-.5),0),e.ux,e.uz,.7,D+.5,g-.2,L+.9,stone,0)}}
   const w=node('E_N_E4F');if(w){const e=edgeAt(b,[w.x,w.z]),vx=e.uz,vz=-e.ux,W2=(a,o)=>[e.c[0]+e.ux*a+vx*o,e.c[1]+e.uz*a+vz*o],g=Math.max(H(w.x,w.z),L+3*fh-.05);/* 4층 바닥 높이 기준(2026-11-11 점검: 서쪽 땅이 더 높아 현관이 묻혀 보임) */
    BX(e.c,e.ux,e.uz,10,4.2,g-.3,g+3.9,white,0);BX(e.c,e.ux,e.uz,10.3,4.5,g+3.9,g+4.2,[.82,.82,.80],-.1);
    BX(e.c,e.ux,e.uz,3.4,.08,g,g+2.6,[.22,.30,.36],4.2);BX(e.c,e.ux,e.uz,5.2,2.2,g+2.7,g+3.4,[.14,.14,.15],4.2);
    for(const s of[-1,1]){const c=W2(s*8.6,2.5);BX(c,e.ux,e.uz,5.4,.3,g,g+2.5,[.12,.28,.70],0);BX(c,e.ux,e.uz,5.0,.34,g+.35,g+2.2,[.93,.93,.91],-.02)}}}}
