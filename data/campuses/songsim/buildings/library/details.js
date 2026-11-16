 // 5) 베리타스관 (2026-11-11 나무위키 정면 사진): 흰 석재, 가운데 좁은 유리 커튼월(밝은 청록, 2~5층), 앞 광장 바닥분수(낮은 테두리 + 원통 볼라드), 정문 계단
 {const b=bOf('도서관'),n=node('E_L_E1');if(b&&n){const e=edgeAt(b,[n.x,n.z]),L=lvlOf(b),g=H(...e.c),P=b.spec.parts[0],fh=(P.height-(P.parapet||0))/P.floors,W=8.5,vx=e.uz,vz=-e.ux,at=(a,o)=>[e.c[0]+e.ux*a+vx*o,e.c[1]+e.uz*a+vz*o];
   BX(e.c,e.ux,e.uz,W,.12,L+.1,L+fh*(P.floors-1)-.2,[.32,.52,.56],.02);for(let s=-W/2;s<=W/2+.01;s+=1.06)BX(at(s,0),e.ux,e.uz,.08,.18,L+.1,L+fh*(P.floors-1)-.2,[.88,.88,.86],0);
   for(let k=1;k<P.floors-1;k++)BX(e.c,e.ux,e.uz,W,.2,L+fh*k-.05,L+fh*k+.12,[.88,.88,.86],0);BX(e.c,e.ux,e.uz,W+.4,.3,L-.1,L+.1,[.88,.88,.86],0);
   if(L>g+.1){const n2=Math.ceil((L-g)/.16);for(let k=0;k<n2;k++)BX(e.c,e.ux,e.uz,W+2,Math.max(.6,3.2-k*.3),g-.2,g+(k+1)*(L-g)/n2,[.78,.77,.74],0)}
   {const c=at(0,16),gy=H(...c),R=[8,5];BX(c,e.ux,e.uz,2*R[0]+.6,2*R[1]+.6,gy-.2,gy+.28,[.80,.78,.74],-R[1]-.3);BX(c,e.ux,e.uz,2*R[0],2*R[1],gy-.1,gy+.22,[.42,.56,.62],-R[1]);
    for(const [a,o] of [[-R[0]-.3,-R[1]-.3],[R[0]+.3,-R[1]-.3],[-R[0]-.3,R[1]+.3],[R[0]+.3,R[1]+.3],[0,-R[1]-.3],[0,R[1]+.3]])CYL(at(a,16+o),.28,gy-.1,gy+.6,[.72,.72,.70],10,[.80,.80,.78]);
    for(let k=0;k<14;k++){const a=-R[0]+1+k*(2*R[0]-2)/13;for(const o of[-R[1]+1.2,R[1]-1.2])CYL(at(a,16+o),.06,gy+.2,gy+1.6+((k*7)%5)*.25,[.93,.95,.97],6)}}}}
 // 5b) 베리타스관 서·남·북면 (2026-11-12 카카오 로드뷰 (−157,0)): 비탈 아래로 드러난 아래층은 거친 회색 돌 받침(쇠창살 창), 서쪽 면 가운데 위층은 청록 유리 커튼월
 {const b=bOf('도서관');if(b){const L=lvlOf(b),P=b.spec.parts[0],fh=(P.height-(P.parapet||0))/P.floors,top=L+P.height-(P.parapet||0),yb=L+fh+.9,st=[.56,.57,.58];
   for(const [px,pz,full] of [[-156,-2,1],[-145,-36.6,0],[-127,20,0]]){const e=edgeAt(b,[px,pz]),ring=b.poly;let len=0;for(let i=0;i<ring.length;i++){const p=ring[i],q=ring[(i+1)%ring.length],m=[(p[0]+q[0])/2,(p[1]+q[1])/2];if(Math.hypot(m[0]-e.c[0],m[1]-e.c[1])<1.5)len=Math.hypot(q[0]-p[0],q[1]-p[1])}
    if(!len)continue;const n=Math.round(len/4.2);for(let k=0;k<n;k++){const s2=-len/2+(k+.5)*len/n,c=[e.c[0]+e.ux*s2,e.c[1]+e.uz*s2],g=H(c[0]+e.uz*1.2,c[1]-e.ux*1.2);if(yb-g<.6)continue;
      BX(c,e.ux,e.uz,len/n+.02,.2,g-.4,yb,st.map(v=>v*(.94+((k*7)%5)*.025)),0);BX(c,e.ux,e.uz,len/n+.02,.3,yb,yb+.18,[.78,.78,.77],0);
      if(yb-g>3.2){BX(c,e.ux,e.uz,2.0,.05,g+.7,g+2.6,[.12,.13,.14],.21);for(let q=-.8;q<=.81;q+=.4)BX([c[0]+e.ux*q,c[1]+e.uz*q],e.ux,e.uz,.05,.04,g+.7,g+2.6,[.36,.37,.38],.25)}}
    if(full){const W=17;BX(e.c,e.ux,e.uz,W,.12,yb+.18,top-.5,[.30,.56,.62],.03);for(let s2=-W/2;s2<=W/2+.01;s2+=W/12)BX([e.c[0]+e.ux*s2,e.c[1]+e.uz*s2],e.ux,e.uz,.09,.2,yb+.18,top-.5,[.86,.87,.86],0);for(let y=yb+.18+fh*.8;y<top-.8;y+=fh*.8)BX(e.c,e.ux,e.uz,W,.2,y,y+.1,[.86,.87,.86],0)}}}}
