// 미카엘관 (2026-11-08 학교 홈페이지 공식 사진(동쪽 상공) + 현장 야간 사진 4장)
// 행정동: 베이지 화강석, 4층 전체가 긴 상자처럼 앞·남쪽으로 내밀고(띠창 8칸), 그 아래 정면 사각 열주(기둥마다 2층 높이 가로 보 브래킷),
//   남쪽 끝은 1층이 빈 열주 회랑 + 상자가 남쪽으로 더 내밈, 탑 아래 쪽에 유리 출입구 칸 + 건물 관통 통로(htpatch)
// 교수연구동 탑: 정면 가운데 유리 커튼월(4~7층), 8·9층 가운데 띠창, 옆 칸 세로 개별 창, 옥탑 위로 떠 있는 넓은 지붕판, 안테나
{const b=B.find(q=>q.code==='H / T'||q.code==='H/T');if(b&&b.spec){
 const lowParts=b.spec.parts.filter(p=>p.floors===4),low=lowParts[0],tw=b.spec.parts.find(p=>p.floors===9);
 const lvl=(b.spec.datum!=null?b.spec.datum:Math.min(...b.poly.map(p=>H(...p)))+(b.spec.lift||0));
 const stone=[.82,.77,.69],stone2=[.72,.67,.59],glass=[.14,.24,.26],frame=[.24,.25,.26],ceil=[.88,.85,.78];
 const A=[-101.0,21.9],Bq=[-81.8,80.4],L=Math.hypot(Bq[0]-A[0],Bq[1]-A[1]),u=[(Bq[0]-A[0])/L,(Bq[1]-A[1])/L],n=[u[1],-u[0]];
 const P=(t,o,y)=>[A[0]+u[0]*t+n[0]*o,y,A[1]+u[1]*t+n[1]*o];
 const bx=(t0,t1,o0,o1,y0,y1,c)=>{const q=[P(t0,o0,0),P(t1,o0,0),P(t1,o1,0),P(t0,o1,0)];quad(mesh,[q[0][0],y1,q[0][2]],[q[1][0],y1,q[1][2]],[q[2][0],y1,q[2][2]],[q[3][0],y1,q[3][2]],c);quad(mesh,[q[3][0],y0,q[3][2]],[q[2][0],y0,q[2][2]],[q[1][0],y0,q[1][2]],[q[0][0],y0,q[0][2]],c.map(v=>v*.82));
  for(let i=0;i<4;i++){const p=q[i],r=q[(i+1)%4];quad(mesh,[p[0],y0,p[2]],[r[0],y0,r[2]],[r[0],y1,r[2]],[p[0],y1,p[2]],c.map(v=>v*(i%2?.88:.97)))}};
 const gAt=(t,o)=>{const c=P(t,o,0);return H(c[0],c[2])};
 if(low){const fh=(low.height-(low.parapet||0))/low.floors,y3=lvl+3*fh,top=lvl+low.height,D=2.6,T1=L+4.5;
  // 4층 상자: 아래 돌 띠 + 띠창(돌 기둥으로 8칸) + 위 돌 띠(난간), 남쪽으로 4.5 m 더 내밈
  bx(-.4,T1,-.05,D,y3,y3+1.0,stone);
  bx(-.4,T1,-.05,D,top-1.25,top+.15,stone);
  bx(.6,T1-.6,D-.3,D-.2,y3+1.0,top-1.25,glass);
  const piers=[];for(let t=.6;t<=T1-.5;t+=(T1-1.2)/8)piers.push(t);
  for(const t of piers)bx(t-.5,t+.5,D-.35,D+.02,y3+1.0,top-1.25,stone);
  for(let t=.6;t<=T1-.6;t+=1.4)bx(t-.04,t+.04,D-.32,D-.12,y3+1.0,top-1.25,frame);
  bx(.6,T1-.6,D-.32,D-.12,y3+2.2,y3+2.28,frame);
  // 남쪽 끝 내민 부분 옆면·밑면, 상자 밑 천장
  bx(L,T1,-14,D,y3,top+.15,stone);bx(L+.3,T1-.3,-13.7,-13.5,y3+1.0,top-1.25,glass);
  {const q=[P(-.4,0,y3-.02),P(T1,0,y3-.02),P(T1,D,y3-.02),P(-.4,D,y3-.02)];quad(mesh,q[3],q[2],q[1],q[0],ceil)}
  // 열주: 7.6 m 간격, 지면~상자 밑, 기둥마다 2층 바닥 높이에 벽으로 이어지는 가로 보(+자 브래킷)
  const cols=[];for(let t=2.0;t<=T1-1.0;t+=(T1-3.0)/8)cols.push(t);
  for(const t of cols){const g=gAt(t,1.4)-.3;bx(t-.6,t+.6,.8,2.0,g,y3,stone);
   const yb=lvl+2*fh-.2;bx(t-.35,t+.35,-.05,.8,yb,yb+.7,stone);bx(t-1.3,t+1.3,.8,2.0,yb,yb+.7,stone);
   for(let y=g+1.2;y<y3;y+=1.2)bx(t-.61,t+.61,.79,2.01,y,y+.03,stone2)}
  // 1층 열린 공간(htpatch): 유리 출입구 칸(안쪽 6.5 m 유리벽), 관통 통로·남쪽 회랑의 둥근 기둥
  const yb1=lvl+fh+.3;
  const rcol=(t,o)=>{const c=P(t,o,0),g=H(c[0],c[2])-.2;for(let k=0;k<12;k++){const a0=k/12*6.283,a1=(k+1)/12*6.283,r=.38;quad(mesh,[c[0]+Math.cos(a0)*r,g,c[2]+Math.sin(a0)*r],[c[0]+Math.cos(a1)*r,g,c[2]+Math.sin(a1)*r],[c[0]+Math.cos(a1)*r,yb1,c[2]+Math.sin(a1)*r],[c[0]+Math.cos(a0)*r,yb1,c[2]+Math.sin(a0)*r],stone.map(v=>v*(k%2?.93:1)))}};
  {const g=gAt(48,-6.5);bx(45.6,50.4,-6.6,-6.5,g,yb1,glass);for(let t=45.6;t<=50.45;t+=1.6)bx(t-.05,t+.05,-6.62,-6.45,g,yb1,frame);bx(47.1,48.9,-6.7,-6.4,g,g+2.3,[.55,.62,.66]);bx(50.4,50.6,-6.5,0,g,yb1,stone)}
  for(const [t,o] of [[48,-3.2],[42,-4],[42,-12],[42,-20],[58.5,-4],[58.5,-10],[61,-4],[61,-10]])rcol(t,o);
  {const g=gAt(14,0);bx(12.5,15.5,.02,.08,g,g+2.6,glass);bx(12.3,15.7,.02,.5,g+2.6,g+2.85,stone2)}
  // 옥상 냉각탑(흰 상자, 탑 옆)
  {const c=P(36,-7,0);bx(34,38.5,-10,-4,top,top+2.8,[.92,.92,.90]);bx(34.3,38.2,-9.8,-4.2,top+2.8,top+3.0,[.70,.72,.74])}
 }
 if(tw){const fh=(tw.height-(tw.parapet||0))/tw.floors,top=lvl+tw.height,Q=tw.poly,C=Q.reduce((s,p)=>[s[0]+p[0]/Q.length,s[1]+p[1]/Q.length],[0,0]);
  const faces=[];for(let i=0;i<Q.length;i++){const p=Q[i],q=Q[(i+1)%Q.length],e=[q[0]-p[0],q[1]-p[1]],l=Math.hypot(...e),eu=[e[0]/l,e[1]/l];let o=[eu[1],-eu[0]];if((C[0]-p[0])*o[0]+(C[1]-p[1])*o[1]>0)o=[-o[0],-o[1]];faces.push({p,eu,o,l,dot:o[0]*n[0]+o[1]*n[1]})}
  const front=faces.reduce((a,f)=>f.dot>a.dot?f:a);
  const F=(f,a0,a1,c0,y0,y1,col)=>{const P1=[f.p[0]+f.eu[0]*a0+f.o[0]*c0,f.p[1]+f.eu[1]*a0+f.o[1]*c0],P2=[f.p[0]+f.eu[0]*a1+f.o[0]*c0,f.p[1]+f.eu[1]*a1+f.o[1]*c0];quad(mesh,[P1[0],y0,P1[1]],[P2[0],y0,P2[1]],[P2[0],y1,P2[1]],[P1[0],y1,P1[1]],col)};
  for(const f of faces){
   for(const k of [7,8]){F(f,f.l*.3,f.l*.7,.05,lvl+k*fh+.9,lvl+k*fh+2.7,glass);for(let a=f.l*.3;a<=f.l*.7+1e-6;a+=1.3)F(f,a-.04,a+.04,.07,lvl+k*fh+.9,lvl+k*fh+2.7,frame)}
   if(f===front){F(f,f.l*.3,f.l*.7,.05,lvl+3*fh+.3,lvl+7*fh+.4,glass);for(let a=f.l*.3;a<=f.l*.7+1e-6;a+=1.3)F(f,a-.05,a+.05,.08,lvl+3*fh+.3,lvl+7*fh+.4,frame);for(let k=3;k<=7;k++)F(f,f.l*.3,f.l*.7,.08,lvl+k*fh+.3,lvl+k*fh+.42,frame)}}
  // 옥탑(안으로 들인 한 층) + 위로 떠 있는 넓은 지붕판
  const inset=(d)=>Q.map(p=>{const v=[p[0]-C[0],p[1]-C[1]],l=Math.hypot(...v);return [p[0]+v[0]/l*d,p[1]+v[1]/l*d]});
  const ring=(R,y0,y1,col)=>{for(let i=0;i<R.length;i++){const p=R[i],q=R[(i+1)%R.length];quad(mesh,[p[0],y0,p[1]],[q[0],y0,q[1]],[q[0],y1,q[1]],[p[0],y1,p[1]],col)}};
  const cap=(R,y,col)=>quad(mesh,[R[0][0],y,R[0][1]],[R[1][0],y,R[1][1]],[R[2][0],y,R[2][1]],[R[3][0],y,R[3][1]],col);
  const I=inset(-4.5),O=inset(2.2);ring(I,top,top+4.2,stone);cap(I,top+4.2,stone2);
  ring(O,top+4.2,top+5.0,stone);cap(O,top+5.0,[.80,.76,.70]);cap(O,top+4.2,ceil);
  for(const f of [front]){const P1=[C[0]+(f.p[0]-C[0])*.62+f.eu[0]*f.l*.22*.62,0];}
  // 옥상 안테나(지붕 모서리 쪽)
  for(const p of inset(-1.2))for(const d of [[0,0],[.8,.3],[-.5,.7]]){const x=p[0]+d[0],z=p[1]+d[1];quad(mesh,[x-.1,top,z],[x+.1,top,z],[x+.1,top+2.6,z],[x-.1,top+2.6,z],[.93,.93,.92]);quad(mesh,[x,top,z-.1],[x,top,z+.1],[x,top+2.6,z+.1],[x,top+2.6,z-.1],[.88,.88,.87])}}
}}
