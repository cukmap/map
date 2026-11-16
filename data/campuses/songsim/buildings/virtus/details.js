 // 2) 비르투스관: 흰 기둥·보 + 니콜스관 쪽 다리(2·3층) 아래 통로 — 목재 천장, 통로 입구 흰 기둥, 본동 쪽 유리문·돌계단(사용자 설명 + 공식 사진)
 {const b=bOf('V');if(b){frameOn(b,7.5,.45,white);const L=lvlOf(b),arm=b.spec.parts.find(p=>p.bottom>1);if(arm){const A=arm.poly,yb=L+arm.bottom-.06;
   pushTri(mesh,[A[0][0],yb,A[0][1]],[A[2][0],yb,A[2][1]],[A[1][0],yb,A[1][1]],wood);pushTri(mesh,[A[0][0],yb,A[0][1]],[A[3][0],yb,A[3][1]],[A[2][0],yb,A[2][1]],wood);
   for(let k=1;k<8;k++){const t=k/8,p=[A[0][0]+(A[3][0]-A[0][0])*t,A[0][1]+(A[3][1]-A[0][1])*t],q=[A[1][0]+(A[2][0]-A[1][0])*t,A[1][1]+(A[2][1]-A[1][1])*t];const ex=q[0]-p[0],ez=q[1]-p[1],l=Math.hypot(ex,ez);BX([(p[0]+q[0])/2,(p[1]+q[1])/2],ex/l,ez/l,l,.06,yb-.04,yb,[.45,.30,.18],-.03)}
   for(const c of A){const g=H(c[0],c[1])-.3;BX([c[0],c[1]],1,0,.7,.7,g,yb+.06,white,-.35)}
   const W0=A[0],W1=A[3],ux=(W1[0]-W0[0]),uz=(W1[1]-W0[1]),l=Math.hypot(ux,uz),m=[(W0[0]+W1[0])/2,(W0[1]+W1[1])/2],g=H(...m);
   BX(m,ux/l,uz/l,4.2,.08,L-.05,L+2.6,glass,.02);BX(m,ux/l,uz/l,4.6,.12,L+2.6,L+2.85,frame,.02);
   for(let k=0;k<6;k++){const y=g-.2+k*(L-g+.2)/6;BX(m,ux/l,uz/l,5.2,.45,y,y+(L-g+.2)/6,[.80,.79,.76],.1+(5-k)*.42)}}}}
