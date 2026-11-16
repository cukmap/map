 // 6) 성심관 (2026-11-10 사용자 현장 사진 8장): 짙은 적벽돌, 낮은 모임지붕 + 깊은 흰 처마, 주차장 쪽 긴 면 은색 배기 덕트 3줄 + 동쪽 모서리 세로 유리블록 띠,
 //    동쪽 끝면은 가운데 창 한 줄(맨 위 아치창)만, 1층 반원 유리 현관 + 짙은 곡면 캐노피, 서쪽 끝 지붕 위 계단실(위치·크기 추정)
 {const b=bOf('SH');if(b){const L=lvlOf(b),P=b.spec.parts[0],ring=P.poly,top=L+P.height,fh=P.height/P.floors,brk=P.wall||[.52,.25,.21],roofC=P.roofColor||[.42,.5,.45],silver=[.78,.79,.80];
  const pip=(x,z)=>{let c=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],q=ring[j];if((a[1]>z)!==(q[1]>z)&&x<(q[0]-a[0])*(z-a[1])/(q[1]-a[1])+a[0])c=!c}return c};
  const out=(a,q)=>{const l=Math.hypot(q[0]-a[0],q[1]-a[1]);let ux=(q[0]-a[0])/l,uz=(q[1]-a[1])/l;const m=[(a[0]+q[0])/2,(a[1]+q[1])/2];if(pip(m[0]+uz*.4,m[1]-ux*.4)){ux=-ux;uz=-uz}return {m,ux,uz,l}};
  // 깊은 처마: 위는 지붕색, 옆·아래는 흰 처마널
  for(let i=0;i<ring.length;i++){const a=ring[i],q=ring[(i+1)%ring.length],e=out(a,q);if(e.l<.8)continue;const w=e.l>4?e.l+1.9:e.l;
   BX(e.m,e.ux,e.uz,w,.95,top-.4,top-.04,white,0);BX(e.m,e.ux,e.uz,w,.97,top-.04,top+.06,roofC,0)}
  // 주차장 쪽 긴 면(남쪽): 동쪽 모서리 → 서쪽
  const s0=[-222.432,-79.399],s1=[-273.057,-62.912],S=out(s0,s1),sl=Math.hypot(s1[0]-s0[0],s1[1]-s0[1]),su=[(s1[0]-s0[0])/sl,(s1[1]-s0[1])/sl],sv=[S.uz,-S.ux],at=(d,o)=>[s0[0]+su[0]*d+sv[0]*o,s0[1]+su[1]*d+sv[1]*o];
  for(const d of [11,25,39]){const c=at(d,.42),g=H(...c)-.2;CYL(c,.27,g,top-.42,silver,14,silver);for(let y=g+2.5;y<top-.6;y+=3)BX(at(d,.08),su[0],su[1],.7,.2,y,y+.08,silver.map(v=>v*.9),0)}
  {const c=at(2.4,0),g=H(...c);BX(c,su[0],su[1],1.3,.08,g+.3,top-.7,[.74,.82,.84],.01);for(let y=g+.3;y<top-.7;y+=.32)BX(c,su[0],su[1],1.32,.1,y,y+.04,[.92,.93,.92],.01);for(const k of[-.33,0,.33])BX([c[0]+su[0]*k,c[1]+su[1]*k],su[0],su[1],.04,.1,g+.3,top-.7,[.92,.93,.92],.01)}
  // 동쪽 끝면: 개별창 덮고 가운데 창 한 줄 + 맨 위 아치창
  {const e0=[-222.432,-79.399],e1=[-227.45,-94.131],E=out(e0,e1),g=Math.min(H(...e0),H(...e1))-.2;BX(E.m,E.ux,E.uz,E.l+.1,.16,g,top-.4,brk,0);
   const vx=E.uz,vz=-E.ux,c=[E.m[0]-E.ux*1.2,E.m[1]-E.uz*1.2],at2=(a,y,o=.19)=>[c[0]+E.ux*a+vx*o,y,c[1]+E.uz*a+vz*o];
   for(let f=0;f<P.floors;f++){const y0=L+f*fh+(f===P.floors-1?.6:.85),y1=y0+(f===P.floors-1?.7:1.55),W=.75;
    BX(c,E.ux,E.uz,1.75,.05,y0-.12,y1+.08,white,.16);BX(c,E.ux,E.uz,1.5,.05,y0,y1,glass,.2);BX(c,E.ux,E.uz,1.9,.18,y0-.2,y0-.08,white,.16);
    BX(c,E.ux,E.uz,.06,.07,y0,y1,white,.22);BX(c,E.ux,E.uz,1.5,.07,(y0+y1)/2-.03,(y0+y1)/2+.03,white,.22);
    if(f===P.floors-1){const n=10;for(let k=0;k<n;k++){const a0=Math.PI*k/n,a1=Math.PI*(k+1)/n;pushTri(mesh,at2(-.75*Math.cos(a0)*-1,y1+.75*Math.sin(a0)),at2(0,y1),at2(-.75*Math.cos(a1)*-1,y1+.75*Math.sin(a1)),glass);pushTri(mesh,at2(0,y1),at2(.75*Math.cos(a0),y1+.75*Math.sin(a0)),at2(.75*Math.cos(a1),y1+.75*Math.sin(a1)),glass)}
     for(let k=0;k<n;k++){const a0=Math.PI*k/n,a1=Math.PI*(k+1)/n,r0=.75,r1=.9,P0=at2(r0*Math.cos(a0),y1+r0*Math.sin(a0),.18),P1=at2(r0*Math.cos(a1),y1+r0*Math.sin(a1),.18),Q1=at2(r1*Math.cos(a1),y1+r1*Math.sin(a1),.18),Q0=at2(r1*Math.cos(a0),y1+r1*Math.sin(a0),.18);quad(mesh,P0,Q0,Q1,P1,white);quad(mesh,P1,Q1,Q0,P0,white)}}}}
  // 1층 반원 유리 현관 + 짙은 곡면 캐노피
  if(b.shVest){const Q=b.shVest,g=Math.min(...Q.map(p=>H(...p)))-.1,y1=L+3.1,cx=Q.reduce((a,p)=>a+p[0],0)/Q.length,cz=Q.reduce((a,p)=>a+p[1],0)/Q.length,dark=[.20,.21,.22];
   for(let k=0;k<Q.length-1;k++){const p=Q[k],q=Q[k+1];quad(mesh,[p[0],g,p[1]],[q[0],g,q[1]],[q[0],y1,q[1]],[p[0],y1,p[1]],[.36,.46,.50]);quad(mesh,[q[0],g,q[1]],[p[0],g,p[1]],[p[0],y1,p[1]],[q[0],y1,q[1]],[.36,.46,.50]);BX(p,1,0,.12,.12,g,y1,dark,-.06)}
   const R=Q.map(p=>[cx+(p[0]-cx)*1.35,cz+(p[1]-cz)*1.35]);
   for(let k=0;k<R.length-1;k++){const p=R[k],q=R[k+1];quad(mesh,[p[0],y1,p[1]],[q[0],y1,q[1]],[q[0],y1+.55,q[1]],[p[0],y1+.55,p[1]],dark);quad(mesh,[q[0],y1,q[1]],[p[0],y1,p[1]],[p[0],y1+.55,p[1]],[q[0],y1+.55,q[1]],dark);
    pushTri(mesh,[cx,y1+.55,cz],[p[0],y1+.55,p[1]],[q[0],y1+.55,q[1]],dark.map(v=>v*1.2));pushTri(mesh,[cx,y1+.55,cz],[q[0],y1+.55,q[1]],[p[0],y1+.55,p[1]],dark.map(v=>v*1.2));pushTri(mesh,[cx,y1,cz],[p[0],y1,p[1]],[q[0],y1,q[1]],dark);pushTri(mesh,[cx,y1,cz],[q[0],y1,q[1]],[p[0],y1,p[1]],dark)}}
  // 서쪽 끝 지붕 위 계단실(사진: 지붕 위로 솟은 덩어리) — 위치 추정
  {const c=at(sl-5.5,-3.2);BX(c,su[0],su[1],5.2,4.2,top-1,top+2.6,brk,0);BX(c,su[0],su[1],5.8,4.8,top+2.6,top+2.9,white,-.3)}}}
