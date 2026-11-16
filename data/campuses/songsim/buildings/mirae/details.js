 // 4) 학생미래인재관 (2026-11-11 나무위키 정면 사진): 붉은 벽돌, 2개 층 높이로 깊게 파인 출입구 위를 맨 위층 벽돌 덩어리가 가로질러 덮음,
 //    파인 안쪽에 비스듬한 유리 쐐기, 문 위 벽돌 간판 띠("학생미래인재관"), 밝은 사각 기둥 2개, 넓은 계단 + 오른쪽 경사로
 {const b=bOf('B'),n=node('E_B_E2');if(b&&n){const e=edgeAt(b,[n.x,n.z]),L=lvlOf(b),g=H(...e.c),P=b.spec.parts[0],fh=(P.height-(P.parapet||0))/P.floors,brk=P.wall||[.69,.37,.29],top=L+P.height,W=15,D=4.5,vx=e.uz,vz=-e.ux,at=(a,o)=>[e.c[0]+e.ux*a+vx*o,e.c[1]+e.uz*a+vz*o];
   const y1=L+2*fh,yt=top-(P.parapet||0)+.15;BX(e.c,e.ux,e.uz,W,.12,g-.2,y1,[.22,.18,.16],.02);   // 깊은 그늘 면(창 가림)
   BX(e.c,e.ux,e.uz,W+1.2,D,y1,yt,brk,0);BX(e.c,e.ux,e.uz,W+1.2,D,y1-.05,y1,brk.map(v=>v*.7),0);   // 앞으로 나온 위층 벽돌 덩어리
   for(const s of[-W/2-.3,W/2+.3])BX(at(s,0),e.ux,e.uz,.6,D,g-.2,yt,brk.map(v=>v*.92),0);   // 양옆 벽돌 기둥벽
   BX(e.c,e.ux,e.uz,7,.1,L-.1,L+3.0,glass,.15);BX(e.c,e.ux,e.uz,8,1.6,L+3.0,L+4.1,brk,.1);BX(e.c,e.ux,e.uz,5.2,.06,L+3.35,L+3.75,[.95,.94,.90],1.72);
   for(const s of[-3.6,3.6])CYL(at(s,2.6),.38,g-.2,L+3.0,[.86,.80,.70]);for(let k=-2;k<=2;k++){const w2=1.75,o=1.7+(2-Math.abs(k))*.75;BX(at(k*w2,0),e.ux,e.uz,w2+.03,o,L+3.0,L+4.1,brk,.1);BX(at(k*w2,0),e.ux,e.uz,w2+.03,o+.15,L+2.9,L+3.0,brk.map(v=>v*.7),.1);if(Math.abs(k)<2)BX(at(k*w2,0),e.ux,e.uz,1.3,.05,L+3.35,L+3.75,[.95,.94,.90],o+.12)}
   {const h0=L+4.2,h1=y1-.2;const Q=(a,o,y)=>{const p=at(a,o);return [p[0],y,p[1]]};const p1=Q(-1,.2,h0),p2=Q(4.5,.2,h0),p3=Q(4.5,2.2,h1),p4=Q(-1,.2,h1);quad(mesh,p1,p2,p3,p4,[.34,.44,.50]);quad(mesh,p4,p3,p2,p1,[.34,.44,.50]);pushTri(mesh,p2,p3,Q(4.5,.2,h1),[.30,.40,.46]);pushTri(mesh,Q(4.5,.2,h1),p3,p2,[.30,.40,.46])}
   if(L>g+.15){const n2=Math.ceil((L-g)/.16);for(let k=0;k<n2;k++)BX(e.c,e.ux,e.uz,9,Math.max(.6,D+2.4-k*.3),g-.2,g+(k+1)*(L-g)/n2,[.72,.70,.66],0)}}}
 // 4b) 학생미래인재관 (2026-11-12 사용자 현장 사진 22장): 정면 출입구 남쪽에 지붕 위로 뾰족하게 솟은 삼각 벽돌 날개벽(세로 유리 띠), 둥글게 나온 간판 차양 + 둥근 기둥, 남쪽 끝 계단탑(지붕 위로 솟음) + 바깥 계단·낮은 벽돌 벽·금속 퍼걸러
 {const b=bOf('B');if(b){const L=lvlOf(b),P=b.spec.parts[0],top=L+P.height,brk=P.wall||[.60,.27,.21],V4=[10.7,28.3],V5=[-6.4,34.0],l=Math.hypot(V5[0]-V4[0],V5[1]-V4[1]),ux=(V5[0]-V4[0])/l,uz=(V5[1]-V4[1])/l,nx=-uz,nz=ux,pk=top+7;
   for(const o of[-.35,.35]){const A=[V4[0]+nx*o,V4[1]+nz*o],Bq=[V5[0]+nx*o,V5[1]+nz*o],g=H(...V4)-.3,c=brk.map(v=>v*(o>0?1:.9));
     quad(mesh,[A[0],g,A[1]],[Bq[0],g,Bq[1]],[Bq[0],top,Bq[1]],[A[0],pk,A[1]],c);quad(mesh,[Bq[0],g,Bq[1]],[A[0],g,A[1]],[A[0],pk,A[1]],[Bq[0],top,Bq[1]],c)}
   {const g=H(...V4)-.3;quad(mesh,[V4[0]-nx*.35,g,V4[1]-nz*.35],[V4[0]+nx*.35,g,V4[1]+nz*.35],[V4[0]+nx*.35,pk,V4[1]+nz*.35],[V4[0]-nx*.35,pk,V4[1]-nz*.35],brk);quad(mesh,[V4[0]+nx*.35,g,V4[1]+nz*.35],[V4[0]-nx*.35,g,V4[1]-nz*.35],[V4[0]-nx*.35,pk,V4[1]-nz*.35],[V4[0]+nx*.35,pk,V4[1]+nz*.35],brk);
    for(const o of[-.37,.37]){const p=t=>[V4[0]+ux*t+nx*o,V4[1]+uz*t+nz*o],a=p(3.2),c2=p(4.4),y0=L+1.2,y1=top+3.2;quad(mesh,[a[0],y0,a[1]],[c2[0],y0,c2[1]],[c2[0],y1,c2[1]],[a[0],y1,a[1]],[.42,.52,.58]);quad(mesh,[c2[0],y0,c2[1]],[a[0],y0,a[1]],[a[0],y1,a[1]],[c2[0],y1,c2[1]],[.42,.52,.58])}}
   {const c=[-4.6,81.6],g=H(3.3,82);BX(c,.95,-.32,6.5,6.0,top-.5,top+3.4,brk,-3.0);BX(c,.95,-.32,6.7,6.2,top+3.4,top+3.55,brk.map(v=>v*.8),-3.1);
    const a=[3.3,75.4],q=[-.4,82.4],l2=Math.hypot(q[0]-a[0],q[1]-a[1]),sx=(q[0]-a[0])/l2,sz=(q[1]-a[1])/l2,ox=sz,oz=-sx;for(let k=0;k<9;k++){const m=[a[0]+sx*(k+.5)*.6+ox*1.2,a[1]+sz*(k+.5)*.6+oz*1.2];BX(m,sx,sz,.62,1.6,g-.4,g+(9-k)*.17,[.74,.73,.70],-.8)}
    for(let k=0;k<3;k++)BX([a[0]+sx*(1+k*2.2)+ox*2.3,a[1]+sz*(1+k*2.2)+oz*2.3],sx,sz,2.2,.35,g-.4,g+2.4-k*.7,brk.map(v=>v*.95),-.17);
    BX([1.5,79],sx,sz,5,2.6,L+5.4,L+5.55,[.20,.21,.22],.6);for(const t of[-2.3,2.3])BX([1.5+sx*t,79+sz*t],sx,sz,.12,.12,L+3.3,L+5.4,[.20,.21,.22],3.0)}}}
