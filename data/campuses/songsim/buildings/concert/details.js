 // 8) 콘서트홀 (2026-11-10 현장 사진): 붉은 벽돌, 위층 긴 유리 띠창(짙은 틀) + 아래 흰 줄, 정면 1층 박공(삼각 지붕) 모양 창, 반원 돌출 3곳 = 흰 곡면 캐노피 + 짙은 둥근 기둥, 동쪽 3층 덩어리 띠창, 2층(테니스장) 쪽 모서리 유리블록
 {const b=bOf('C');if(b&&b.lobes){const L=lvlOf(b),main=b.spec.parts[0],fh=(main.height-(main.parapet||0))/main.floors,brk=main.wall||[.70,.32,.25];
   const seg=(p,q,f)=>{const ex=q[0]-p[0],ez=q[1]-p[1],l=Math.hypot(ex,ez),ux=ex/l,uz=ez/l,C=b.poly.reduce((s2,r)=>[s2[0]+r[0]/b.poly.length,s2[1]+r[1]/b.poly.length],[0,0]);let o=[uz,-ux];const m=[(p[0]+q[0])/2,(p[1]+q[1])/2];if((m[0]+o[0]-C[0])**2+(m[1]+o[1]-C[1])**2<(m[0]-o[0]-C[0])**2+(m[1]-o[1]-C[1])**2){/*바깥이 -o*/return f(m,-ux,-uz,l)}return f(m,ux,uz,l)};
   const ribbon=(m,ux,uz,l,y0,y1)=>{BX(m,ux,uz,l-1,.06,y0-.25,y0-.05,white,.02);BX(m,ux,uz,l-1,.05,y0,y1,[.30,.36,.38],.02);for(let s2=-l/2+.5;s2<=l/2-.5+1e-6;s2+=1.3)BX([m[0]+ux*s2,m[1]+uz*s2],ux,uz,.09,.1,y0,y1,[.18,.18,.19],.04);BX(m,ux,uz,l-1,.1,(y0+y1)/2-.04,(y0+y1)/2+.04,[.18,.18,.19],.04)};
   const gable=(c,ux,uz,g,W)=>{const vx=uz,vz=-ux,P2=(a,y)=>[c[0]+ux*a+vx*.06,y,c[1]+uz*a+vz*.06],h1=2.0,h2=1.5;
    quad(mesh,P2(-W/2,g+.3),P2(W/2,g+.3),P2(W/2,g+h1),P2(-W/2,g+h1),[.95,.88,.62]);pushTri(mesh,P2(-W/2,g+h1),P2(W/2,g+h1),P2(0,g+h1+h2),[.95,.88,.62]);
    const fr=(a0,y0,a1,y1)=>{const d=[a1-a0,y1-y0],l=Math.hypot(...d),n=[-d[1]/l*.09,d[0]/l*.09];quad(mesh,P2(a0-n[0],y0-n[1]).map((v,k)=>v+(k==1?0:0)),P2(a1-n[0],y1-n[1]),P2(a1+n[0],y1+n[1]),P2(a0+n[0],y0+n[1]),white)};
    fr(-W/2,g+.3,-W/2,g+h1);fr(W/2,g+.3,W/2,g+h1);fr(-W/2,g+h1,0,g+h1+h2);fr(0,g+h1+h2,W/2,g+h1);fr(-W/2,g+.3,W/2,g+.3);fr(0,g+.3,0,g+h1)};
   // 정면 = E1 캐노피 양옆 벽: 띠창 + 박공 창
   const P=main.poly,near=(a,q)=>Math.hypot(a[0]-q[0],a[1]-q[1])<.6;
   for(let k=0;k<P.length;k++){const p=P[k],q=P[(k+1)%P.length],l=Math.hypot(q[0]-p[0],q[1]-p[1]);if(l<6)continue;const mz=(p[1]+q[1])/2,mx=(p[0]+q[0])/2;
    const front=mz>-124&&mx<-150&&mx>-192;seg(p,q,(m,ux,uz,ll)=>{if(front||ll>14)ribbon(m,ux,uz,ll,L+fh+.6,L+2*fh-.4);if(front){const g=H(...m);for(const a of(ll>9?[-ll/4,ll/4]:[0]))gable([m[0]+ux*a,m[1]+uz*a],ux,uz,g,3.0)}})}
   // 동쪽 3층 덩어리: 맨 위층 띠창
   if(b.eastPoly){const E=b.eastPoly;for(let k=0;k<E.length;k++){const p=E[k],q=E[(k+1)%E.length],l=Math.hypot(q[0]-p[0],q[1]-p[1]);if(l<6||p[0]<-157.5&&q[0]<-157.5)continue;seg(p,q,(m,ux,uz,ll)=>ribbon(m,ux,uz,ll,L+fh+.6,L+2*fh-.4))}}
   // 흰 곡면 캐노피(반원 돌출 자리) + 짙은 둥근 기둥
   for(const lb of b.lobes){const Q=lb.poly,g=Math.min(...Q.map(p=>H(...p))),y0=Math.max(g,lb.nm==='B1'?g:L-.2)+3.4,y1=y0+.85,cx=Q.reduce((a,p)=>a+p[0],0)/Q.length,cz=Q.reduce((a,p)=>a+p[1],0)/Q.length;
    for(let k=0;k<Q.length-1;k++){const p=Q[k],q=Q[k+1];quad(mesh,[p[0],y0,p[1]],[q[0],y0,q[1]],[q[0],y1,q[1]],[p[0],y1,p[1]],[.95,.95,.94]);quad(mesh,[q[0],y0,q[1]],[p[0],y0,p[1]],[p[0],y1,p[1]],[q[0],y1,q[1]],[.95,.95,.94]);
     pushTri(mesh,[cx,y1,cz],[p[0],y1,p[1]],[q[0],y1,q[1]],[.86,.86,.85]);pushTri(mesh,[cx,y1,cz],[q[0],y1,q[1]],[p[0],y1,p[1]],[.86,.86,.85]);pushTri(mesh,[cx,y0,cz],[p[0],y0,p[1]],[q[0],y0,q[1]],[.90,.90,.88]);pushTri(mesh,[cx,y0,cz],[q[0],y0,q[1]],[p[0],y0,p[1]],[.90,.90,.88])}
    const a=Q[0],c=Q[Q.length-1],mid=[(a[0]+c[0])/2,(a[1]+c[1])/2],far=Q.reduce((best,p)=>Math.hypot(p[0]-mid[0],p[1]-mid[1])>Math.hypot(best[0]-mid[0],best[1]-mid[1])?p:best,Q[0]),col=[mid[0]+(far[0]-mid[0])*.55,mid[1]+(far[1]-mid[1])*.55];
    CYL(col,.35,H(...col)-.2,y0,[.30,.24,.20]);
    const ex=c[0]-a[0],ez=c[1]-a[1],ll=Math.hypot(ex,ez);BX(mid,ex/ll,ez/ll,Math.min(5.5,ll*.7),.08,H(...mid)-.1,y0-.05,[.34,.42,.44],.03)}
   // 2층(테니스장) 쪽: 둥근 모서리 세로 유리블록 띠
   {const n=node('E_CH_2F');if(n){const e=edgeAt(b,[n.x,n.z]),g=H(...e.c);BX([e.c[0]+e.ux*(e.len*.35),e.c[1]+e.uz*(e.len*.35)],e.ux,e.uz,1.6,.1,g,L+main.height-1.2,[.70,.80,.82],.02);for(let y=g+.4;y<L+main.height-1.2;y+=.4)BX([e.c[0]+e.ux*(e.len*.35),e.c[1]+e.uz*(e.len*.35)],e.ux,e.uz,1.62,.12,y,y+.04,[.88,.90,.90],.02)}}}}
