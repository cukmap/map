 // 15) 창업보육센터 (2026-11-11 나무위키 사진): 회색 금속 패널 + 넓은 유리 띠, 서쪽 끝 지붕 위로 솟은 회색 계단탑(세로 청록 띠), 옥상 난간
 {const b=bOf('BI');if(b){const L=lvlOf(b),P=b.spec.parts[0],top=L+P.height-(P.parapet||0),c=[241,109.5];
   BX(c,.97,-.24,5.5,5.5,H(...c)-.3,top+4.2,[.70,.71,.70],-2.75);BX([c[0]+.97*1.2,c[1]-.24*1.2],.97,-.24,1.0,.06,L+1,top+3.6,[.30,.56,.56],2.76);BX(c,.97,-.24,5.8,5.8,top+4.2,top+4.5,[.80,.80,.80],-2.9);
   const ring=P.poly;for(let i=0;i<ring.length;i++){const a=ring[i],q=ring[(i+1)%ring.length],l=Math.hypot(q[0]-a[0],q[1]-a[1]);if(l<3)continue;const e=edgeAt({poly:ring},[(a[0]+q[0])/2,(a[1]+q[1])/2]);if(!e)continue;const m=[(a[0]+q[0])/2,(a[1]+q[1])/2];
    BX(m,e.ux,e.uz,l,.05,top+1.0,top+1.08,[.80,.81,.82],-.3);for(let s2=-l/2;s2<=l/2;s2+=1.5)BX([m[0]+e.ux*s2,m[1]+e.uz*s2],e.ux,e.uz,.05,.05,top,top+1.05,[.80,.81,.82],-.3)}}}
