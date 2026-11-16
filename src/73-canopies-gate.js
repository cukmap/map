// ===== 출입구 캐노피 + 건물별 특징 구조물 (현장·학교 공식 사진 판독, 치수 추정) =====
{const BMAP={L:'도서관',CH:'C',C:'교회','H/T':'H / T'},cm=[];
 const STY={N:{c:[.93,.93,.91],d:3.0,w:6,h:3.4},V:{c:[.55,.38,.24],d:4.5,w:7,h:3.6,wood:1},'도서관':{c:[.88,.88,.86],d:3.2,w:7,h:3.6,curve:1},C:{c:[.95,.95,.94],d:3.4,w:8,h:3.4,curve:1},B:{c:[.62,.36,.30],d:4.0,w:8,h:4.2},M:{c:[.9,.9,.88],d:2.5,w:5,h:3.2},K:{c:[.86,.86,.84],d:3.0,w:7,h:3.6},'H / T':{c:[.86,.83,.76],d:3.5,w:8,h:4.0},D:{c:[.9,.89,.86],d:2.8,w:6,h:3.4}};
 const box=(a,b,c,d,y0,y1,col)=>{const P=[a,b,c,d];quad(cm,[a[0],y1,a[1]],[b[0],y1,b[1]],[c[0],y1,c[1]],[d[0],y1,d[1]],col);quad(cm,[a[0],y0,a[1]],[d[0],y0,d[1]],[c[0],y0,c[1]],[b[0],y0,b[1]],col.map(v=>v*.82));for(let i=0;i<4;i++){const p=P[i],q=P[(i+1)%4];quad(cm,[p[0],y0,p[1]],[q[0],y0,q[1]],[q[0],y1,q[1]],[p[0],y1,p[1]],col.map(v=>v*.92))}};
 for(const n of NN){if(n.k!=='entrance'||n.id==='E_V_E1'||n.b==='CH'||n.id==='E_SH_E1'||n.id==='E_D_E2F'||n.id==='E_D_W1'||n.id==='E_P_E1'||n.id==='E_I_E1'||n.id==='E_NP_E1'||n.id==='E_B_E2'||n.id==='E_N_E1'||n.id==='E_N_E4F'||n.id==='E_M_N1'||n.b==='BA')continue;const code=BMAP[n.b]||n.b,b=B.find(q=>q.code===code);if(!b||!b.poly)continue;const st=STY[code]||{c:[.88,.88,.86],d:2.4,w:5,h:3.2};
  let best=null;const P=b.poly;for(let i=0;i<P.length;i++){const p=P[i],q=P[(i+1)%P.length],dx=q[0]-p[0],dz=q[1]-p[1],L2=dx*dx+dz*dz||1;let t=((n.x-p[0])*dx+(n.z-p[1])*dz)/L2;t=Math.max(0,Math.min(1,t));const x=p[0]+dx*t,z=p[1]+dz*t,d=Math.hypot(n.x-x,n.z-z);if(!best||d<best.d)best={d,x,z,dx,dz,L:Math.sqrt(L2)}}
  if(!best||best.d>9)continue;const u=[best.dx/best.L,best.dz/best.L];let o=[u[1],-u[0]];if((n.x-best.x)*o[0]+(n.z-best.z)*o[1]<0&&Math.hypot(b.cx-best.x-o[0],b.cz-best.z-o[1])<Math.hypot(b.cx-best.x+o[0],b.cz-best.z+o[1]))o=[-o[0],-o[1]];
  if(inside(best.x+o[0]*.5,best.z+o[1]*.5,P))o=[-o[0],-o[1]];
  const w=Math.min(st.w,best.L*.9)/2,dd=st.d,cx=best.x,cz=best.z,A=(s,t)=>[cx+u[0]*s+o[0]*t,cz+u[1]*s+o[1]*t];const yb=H(...A(0,1.2)),y=yb+st.h;
  if(st.curve){const seg=10;for(let k=0;k<seg;k++){const a0=Math.PI*k/seg,a1=Math.PI*(k+1)/seg,p0=A(-Math.cos(a0)*w,Math.sin(a0)*dd),p1=A(-Math.cos(a1)*w,Math.sin(a1)*dd),q0=A(-Math.cos(a0)*w*.15,Math.sin(a0)*dd*.15),q1=A(-Math.cos(a1)*w*.15,Math.sin(a1)*dd*.15);
    quad(cm,[q0[0],y+.35,q0[1]],[p0[0],y+.35,p0[1]],[p1[0],y+.35,p1[1]],[q1[0],y+.35,q1[1]],st.c);quad(cm,[q0[0],y,q0[1]],[q1[0],y,q1[1]],[p1[0],y,p1[1]],[p0[0],y,p0[1]],st.c.map(v=>v*.85));quad(cm,[p0[0],y,p0[1]],[p1[0],y,p1[1]],[p1[0],y+.35,p1[1]],[p0[0],y+.35,p0[1]],st.c.map(v=>v*.95))}}
  else box(A(-w,0),A(w,0),A(w,dd),A(-w,dd),y,y+.35,st.c);
  if(st.wood){box(A(-w-.4,0),A(-w,0),A(-w,dd),A(-w-.4,dd),yb-.2,y,[.9,.89,.86]);box(A(w,0),A(w+.4,0),A(w+.4,dd),A(w,dd),yb-.2,y,[.9,.89,.86])}
  else{for(const s of [-w+.25,w-.25]){const c=A(s,dd-.25),r=.14;box([c[0]-r,c[1]-r],[c[0]+r,c[1]-r],[c[0]+r,c[1]+r],[c[0]-r,c[1]+r],H(c[0],c[1])-.2,y,[.92,.92,.9])}}
  // 출입문(유리) 표시
  const g0=A(-Math.min(1.6,w*.6),-.02),g1=A(Math.min(1.6,w*.6),-.02);quad(cm,[g0[0],yb,g0[1]],[g1[0],yb,g1[1]],[g1[0],yb+2.4,g1[1]],[g0[0],yb+2.4,g0[1]],[.16,.24,.28]);
 }
 
 const CO=cm.length?upload(cm):null;globalThis.__CAN=()=>{if(CO)renderObj(CO,camera.mvp,0)};
 setTimeout(()=>{if(globalThis.__SHPASS&&CO)globalThis.__SHPASS([build,roofObj,forest,CO])},50);
}

// 정문 구조물 v2 (2026-11-01 현장 사진 반영): 회색 석재 문주 2개(가로 줄눈·갓돌) + 앞면 파란 패널·교표, 오른쪽 흰 경비실,
// 문주 안쪽 약 32 m 지점 파란 날개형 지붕 출입 관리소(가운데 부스 + 차단기). 치수 추정
{const G=[282.44,92.16],d=[.746,.666],n=[-d[1],d[0]],gy=H(...G)-.1,cm=[];
 const box=(c,hw,hd,y0,y1,col,u=d,v=n)=>{const P=[[-hw,-hd],[hw,-hd],[hw,hd],[-hw,hd]].map(([a,b])=>[c[0]+v[0]*a+u[0]*b,c[1]+v[1]*a+u[1]*b]);quad(cm,[P[0][0],y1,P[0][1]],[P[1][0],y1,P[1][1]],[P[2][0],y1,P[2][1]],[P[3][0],y1,P[3][1]],col);for(let i=0;i<4;i++){const p=P[i],q=P[(i+1)%4];quad(cm,[p[0],y0,p[1]],[q[0],y0,q[1]],[q[0],y1,q[1]],[p[0],y1,p[1]],col.map(x=>x*(i%2?.9:1)))}};
 const blue=[.10,.29,.64],white=[.95,.95,.94],gray=[.62,.64,.66],stone=[.70,.69,.66],joint=[.52,.51,.49],cap=[.58,.57,.55];
 // 문주: 석재 몸체 + 가로 줄눈 + 갓돌, 바깥(도로 쪽) 면에 파란 패널과 흰 테두리·교표
 for(const s of [-6.2,6.2]){const c=[G[0]+n[0]*s,G[1]+n[1]*s];box(c,1.05,.75,gy,gy+8.4,stone);
  for(let y=gy+.6;y<gy+8.2;y+=.6)box(c,1.07,.77,y,y+.04,joint);
  box(c,1.18,.88,gy+8.4,gy+8.75,cap);
  for(const sd of [-1,1]){const f=[c[0]+d[0]*.70*sd,c[1]+d[1]*.70*sd];box(f,.80,.08,gy+.9,gy+7.9,white);box([f[0]+d[0]*.03*sd,f[1]+d[1]*.03*sd],.68,.08,gy+1.0,gy+7.8,blue);
  const lc=[f[0]+d[0]*.13*sd,f[1]+d[1]*.13*sd];for(let k=0;k<14;k++){const a0=k/14*6.283,a1=(k+1)/14*6.283,r=.42,y=gy+6.9;quad(cm,[lc[0]+n[0]*Math.cos(a0)*r,y+Math.sin(a0)*r,lc[1]+n[1]*Math.cos(a0)*r],[lc[0]+n[0]*Math.cos(a1)*r,y+Math.sin(a1)*r,lc[1]+n[1]*Math.cos(a1)*r],[lc[0],y,lc[1]],[lc[0],y,lc[1]],white)}}}
 // 경비실(오른쪽, 흰색)
 {const c=[G[0]+n[0]*10.5+d[0]*1.5,G[1]+n[1]*10.5+d[1]*1.5];box(c,1.6,1.8,gy,gy+3.2,white);box(c,1.9,2.1,gy+3.2,gy+3.45,gray)}
 // 안쪽 출입 관리소: 파란 날개형 지붕(가운데 낮고 양끝이 들린 형태) + 흰 부스 + 차단기
 {const c=[G[0]-d[0]*32,G[1]-d[1]*32],cy=H(...c)-.1,hd=4.2,span=9.5,N=10,P=(o,b,y)=>[c[0]+n[0]*o+d[0]*b,y,c[1]+n[1]*o+d[1]*b],yr=o=>cy+5.0+1.3*Math.pow(Math.abs(o)/span,1.6);
  for(let i=0;i<N*2;i++){const o0=-span+i*span/N,o1=o0+span/N,y0=yr(o0),y1=yr(o1);
   quad(cm,P(o0,-hd,y0+.25),P(o1,-hd,y1+.25),P(o1,hd,y1+.25),P(o0,hd,y0+.25),blue);
   quad(cm,P(o0,hd,y0),P(o1,hd,y1),P(o1,-hd,y1),P(o0,-hd,y0),[.88,.90,.92]);
   quad(cm,P(o0,-hd,y0),P(o1,-hd,y1),P(o1,-hd,y1+.25),P(o0,-hd,y0+.25),white);quad(cm,P(o1,hd,y1),P(o0,hd,y0),P(o0,hd,y0+.25),P(o1,hd,y1+.25),white)}
  box(c,1.3,2.0,cy,cy+.25,[.80,.80,.78]);box(c,.95,1.5,cy+.25,cy+2.9,white);box(c,.98,1.53,cy+1.2,cy+2.5,[.30,.40,.46]);
  for(const b of [-1.9,1.9])box([c[0]+d[0]*b,c[1]+d[1]*b],.18,.18,cy,yr(0),white);
  for(const sg of [-1,1]){const bc=[c[0]+n[0]*sg*1.3+d[0]*sg*2.4,c[1]+n[1]*sg*1.3+d[1]*sg*2.4];box(bc,.18,.18,cy,cy+1.0,[.95,.80,.20]);
   for(let k=0;k<6;k++){const o=sg*(1.5+k*.55);box([c[0]+n[0]*o+d[0]*sg*2.4,c[1]+n[1]*o+d[1]*sg*2.4],.275,.04,cy+.95,cy+1.03,k%2?white:[.85,.15,.12])}}}
 const GO=upload(cm);const prev=globalThis.__CAN;globalThis.__CAN=()=>{prev&&prev();renderObj(GO,camera.mvp,0)};
 (globalThis.__SHX=globalThis.__SHX||[]).push(GO);setTimeout(()=>{if(globalThis.__SHPASS)globalThis.__SHPASS([build,roofObj,forest,...globalThis.__SHX])},80);}
