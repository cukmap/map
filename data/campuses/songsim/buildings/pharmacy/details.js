 // 7) 약학관 (2026-11-10 사용자 현장 사진 2장, 성심관 쪽에서): 북쪽 긴 면(성심관·주차장 쪽) 동쪽 모서리 3~24 m 구간 1·2층 = 유리 커튼월(격자) + 짙은 금속 틀(위 기울어진 처마띠, 양옆 사다리꼴 옆벽), 출입문은 유리 구간 서쪽 끝
 //    위 3개 층 벽돌 + 세로로 긴 창, 층마다 가는 짙은 줄, 지붕선 얇은 처마
 {const b=bOf('NP');if(b){const L=lvlOf(b),P=b.spec.parts[0],fh=(P.height-(P.parapet||0))/P.floors,top=L+P.height,dark=[.16,.16,.17],mull=[.78,.79,.77];
  const e0=[-180.874,-28.027],e1=[-237.764,-9.34],l=Math.hypot(e1[0]-e0[0],e1[1]-e0[1]),u=[(e1[0]-e0[0])/l,(e1[1]-e0[1])/l],N=[-u[1],u[0]],U=[-u[0],-u[1]];
  const at=(d,o=0)=>[e0[0]+u[0]*d+N[0]*o,e0[1]+u[1]*d+N[1]*o],W=(d,o,y)=>{const p=at(d,o);return [p[0],y,p[1]]};
  const d0=3,d1=24,dm=(d0+d1)/2,w=d1-d0,g=Math.min(H(...at(d0)),H(...at(d1)))-.2,y2=L+fh,yt=L+2*fh;
  BX(at(dm),U[0],U[1],w,.14,g,y2-.15,[.22,.30,.34],0);BX(at(dm),U[0],U[1],w,.14,y2+.25,yt-.1,[.42,.52,.56],0);BX(at(dm),U[0],U[1],w,.2,y2-.15,y2+.25,mull,0);
  for(let d=d0;d<=d1+1e-6;d+=1.5){BX(at(d),U[0],U[1],.09,.22,g,yt-.1,mull,0)}
  for(const y of[g+2.6,y2+.25+(yt-y2)*.4,y2+.25+(yt-y2)*.75])BX(at(dm),U[0],U[1],w,.22,y-.04,y+.04,mull,0);
  BX(at(22.3),U[0],U[1],2.6,.1,g,g+2.55,[.12,.17,.21],.2);BX(at(22.3),U[0],U[1],2.8,.3,g+2.55,g+2.75,dark,0);BX(at(22.3),U[0],U[1],.08,.32,g,g+2.55,dark,0);
  // 짙은 틀: 위 처마띠(아래면 기울어짐) + 양옆 사다리꼴 옆벽
  {const a=d0-1.1,c=d1+1.1,yb=yt-.1,yu=yt+.75,D=1.5;
   const Q=(p,q,r,s,col)=>{quad(mesh,p,q,r,s,col);quad(mesh,s,r,q,p,col)};
   Q(W(a,D,yu),W(c,D,yu),W(c,0,yu),W(a,0,yu),dark);Q(W(a,D,yb+.2),W(c,D,yb+.2),W(c,D,yu),W(a,D,yu),dark.map(v=>v*1.15));Q(W(a,0,yb-.7),W(c,0,yb-.7),W(c,D,yb+.2),W(a,D,yb+.2),dark.map(v=>v*.8));
   for(const d of[a,c]){Q(W(d,0,g),W(d,.35,g),W(d,D,yu),W(d,0,yu),dark);Q(W(d+(d===a?.3:-.3),0,g),W(d+(d===a?.3:-.3),.35,g),W(d+(d===a?.3:-.3),D,yu),W(d+(d===a?.3:-.3),0,yu),dark);Q(W(d,.35,g),W(d+(d===a?.3:-.3),.35,g),W(d+(d===a?.3:-.3),D,yu),W(d,D,yu),dark.map(v=>v*1.1))}}
  // 층 줄 + 지붕 처마
  const ring=P.poly;for(let i=0;i<ring.length;i++){const p=ring[i],q=ring[(i+1)%ring.length],ll=Math.hypot(q[0]-p[0],q[1]-p[1]),e=edgeAt(b,[(p[0]+q[0])/2,(p[1]+q[1])/2]);if(!e)continue;const m=[(p[0]+q[0])/2,(p[1]+q[1])/2];
   for(let f=1;f<P.floors;f++){const y=L+f*fh;if(y>H(...m)+.5)BX(m,e.ux,e.uz,ll,.08,y-.06,y+.06,[.30,.20,.17],0)}
   BX(m,e.ux,e.uz,ll+1,.45,top-.25,top+.05,[.58,.36,.30],0)}}}
