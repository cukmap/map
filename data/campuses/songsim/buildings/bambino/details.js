 // 9) 밤비노관 (2026-11-10 현장 사진): 서쪽 출입구 면 짙은 파란 벽("8 밤비노관") + 그 앞 흰 바깥 계단(층마다 꺾여 오르는 직선 계단, 검은 난간), 옆 회색 콘크리트 벽기둥
 //    비르투스관 3층과 잇는 흰 콘크리트 다리 + 홈 파인 흰 둥근 기둥(니콜스 4층 = 비르투스 3층 = 밤비노 3층)
 {const b=bOf('BA'),n=node('E_BA_E1');if(b&&n){const P=b.spec.parts[0],L=lvlOf(b),fh=(P.height-(P.parapet||0))/P.floors,top=L+P.height,e=edgeAt(b,[n.x,n.z]),g=H(...e.c),blue=[.10,.20,.45],conc=[.60,.60,.58],rail=[.12,.12,.13];
   const vx=e.uz,vz=-e.ux,W2=(a,o)=>[e.c[0]+e.ux*a+vx*o,e.c[1]+e.uz*a+vz*o],P3=(a,o,y)=>{const q=W2(a,o);return [q[0],y,q[1]]};
   BX(e.c,e.ux,e.uz,6.6,.3,g-.3,top+1.4,blue,0);BX(W2(-4.4,0),e.ux,e.uz,.7,2.6,g-.3,top+1.7,conc,0);BX(W2(4.2,0),e.ux,e.uz,1.6,2.6,g-.3,top+.6,white,0);
   const ys=[g,L+fh,L+2*fh,top-.25];
   for(let k=0;k<3;k++){const a0=k%2?2.7:-2.7,a1=-a0,y0=ys[k],y1=ys[k+1];if(y1-y0<.3)continue;const n2=Math.max(6,Math.round((y1-y0)/.17));
    for(let s=0;s<n2;s++){const t=(s+.5)/n2,a=a0+(a1-a0)*t,y=y0+(y1-y0)*(s+1)/n2;BX(W2(a,0),e.ux,e.uz,Math.abs(a1-a0)/n2+.05,1.3,y-.22,y,white,.35)}
    BX(W2(a1+(a1>0?.75:-.75),0),e.ux,e.uz,1.6,1.3,y1-.3,y1,white,.35);BX(W2(a1+(a1>0?.75:-.75),0),e.ux,e.uz,1.6,1.4,y1-.75,y1-.3,white,.3);
    const r0=P3(a0,1.65,y0+1.0),r1=P3(a1,1.65,y1+1.0),r2=P3(a1,1.65,y1+.94),r3=P3(a0,1.65,y0+.94);quad(mesh,r3,r2,r1,r0,rail);quad(mesh,r0,r1,r2,r3,rail);
    for(let s=0;s<=6;s++){const t=s/6,a=a0+(a1-a0)*t,y=y0+(y1-y0)*t;BX(W2(a,0),e.ux,e.uz,.05,.05,y,y+1.0,rail,1.62)}}
   const V=bOf('V');if(V){const Lv=lvlOf(V),y0=Lv+2*fh,y1=Lv+3*fh;let best=null;for(const p of b.poly)for(let i2=0;i2<V.poly.length;i2++){const a=V.poly[i2],c=V.poly[(i2+1)%V.poly.length],ex=c[0]-a[0],ez=c[1]-a[1],l2=ex*ex+ez*ez;let t=((p[0]-a[0])*ex+(p[1]-a[1])*ez)/l2;t=Math.max(0,Math.min(1,t));const q=[a[0]+ex*t,a[1]+ez*t],d=Math.hypot(p[0]-q[0],p[1]-q[1]);if(!best||d<best.d)best={d,p,q}}
    if(best&&best.d<14){const dx=best.q[0]-best.p[0],dz=best.q[1]-best.p[1],l=Math.hypot(dx,dz),m=[(best.p[0]+best.q[0])/2,(best.p[1]+best.q[1])/2],ux2=-dz/l,uz2=dx/l;
     BX(m,ux2,uz2,4.5,l+1.6,y0-.4,y1+.5,[.88,.88,.86],-(l+1.6)/2);BX(m,ux2,uz2,4.6,l*.9,y0+.9,y1-.4,glass,-(l*.9)/2);
     CYL(m,.5,H(...m)-.3,y0-.4,[.92,.92,.90],28)}}}}
