// 김수환관 사이 외부 계단 + 유리 연결 브리지 v2 (OSM e90 + 2026-10-31·11-01 현장 사진: 폭 확장, 가운데 이중 손잡이, 컨벤션 쪽 적벽돌 옹벽+벽등, 상부 흰 난간, 어두운 유리 브리지, 김수환관 유리 계단실·처마). 치수 추정
{const A=[150.19,142.72],Bp=[210.39,123.0],L=Math.hypot(Bp[0]-A[0],Bp[1]-A[1]),u=[(Bp[0]-A[0])/L,(Bp[1]-A[1])/L],n=[-u[1],u[0]],W=7.4,OC=-1.2;
 const at=(t,o)=>[A[0]+u[0]*t+n[0]*(o+OC),A[1]+u[1]*t+n[1]*(o+OC)];
 const y0=H(...at(1,0)),y1=H(...at(L-1,0));
 const stone=[.74,.72,.68],stone2=[.64,.62,.58],rail=[.93,.93,.92];
 // 계단 4단 + 참: 경사 구간마다 단을 쌓고 사이에 평평한 참
 const flights=4,land=3.2,run=(L-land*(flights-1))/flights,riseT=y0-y1;let t=0,y=y0;const prof=[];
 for(let f=0;f<flights;f++){const ns=Math.max(4,Math.round(riseT/flights/.16)),rs=(riseT/flights)/ns,tr=run/ns;
  for(let k=0;k<ns;k++){prof.push([t,t+tr,y]);t+=tr;y-=rs}if(f<flights-1){prof.push([t,t+land,y]);t+=land}}
 for(const q of prof){const [ta,tb]=q;const a=at(ta,-W/2),b=at(tb,-W/2),c=at(tb,W/2),d=at(ta,W/2),hm=Math.max(H(...a),H(...b),H(...c),H(...d),H(...at((ta+tb)/2,0)));q[2]=Math.max(q[2],hm+.04);const yy=q[2],yb=Math.min(H(...a),H(...b),H(...c),H(...d))-1;
  quad(mesh,[a[0],yy,a[1]],[b[0],yy,b[1]],[c[0],yy,c[1]],[d[0],yy,d[1]],stone);
  quad(mesh,[a[0],yb,a[1]],[d[0],yb,d[1]],[d[0],yy,d[1]],[a[0],yy,a[1]],stone2);
  for(const s of [-W/2,W/2]){const p=at(ta,s),q=at(tb,s);quad(mesh,[p[0],yb,p[1]],[q[0],yb,q[1]],[q[0],yy,q[1]],[p[0],yy,p[1]],stone2)}}
 // 가운데 손잡이 + 양옆 난간(흰색)
 for(const s of [-W/2+.15,-.35,.35,W/2-.15]){let last=null;for(let i=0;i<prof.length;i++){const [ta,tb,yy]=prof[i];const tm=(ta+tb)/2,p=at(tm,s),top=yy+(Math.abs(s)<1?.9:1.05);
   if(last){const q=last;quad(mesh,[q[0]-n[0]*.03,q[1],q[2]-n[1]*.03],[p[0]-n[0]*.03,top,p[1]-n[1]*.03],[p[0]+n[0]*.03,top,p[1]+n[1]*.03],[q[0]+n[0]*.03,q[1],q[2]+n[1]*.03],rail);
    quad(mesh,[q[0],q[1],q[2]],[p[0],top,p[1]],[p[0],top-.07,p[1]],[q[0],q[1]-.07,q[2]],rail)}
   if(i%3===0)quad(mesh,[p[0]-u[0]*.03,yy,p[1]-u[1]*.03],[p[0]+u[0]*.03,yy,p[1]+u[1]*.03],[p[0]+u[0]*.03,top,p[1]+u[1]*.03],[p[0]-u[0]*.03,top,p[1]-u[1]*.03],rail);last=[p[0],top,p[1]]}}
 // 컨벤션(K) 쪽 적벽돌 옹벽 + 벽등 + 상부 흰 난간
 {const brick=[.60,.30,.22],brick2=[.50,.25,.19],lamp=[1.0,.86,.55],wo=-W/2-.3;let lt=-99;
  for(const q of prof){const [ta,tb,yy]=q,top=yy+3.4,a=at(ta,wo),b=at(tb,wo),a2=at(ta,wo-.5),b2=at(tb,wo-.5),yb=Math.min(H(...a),H(...b))-1;
   quad(mesh,[a[0],yb,a[1]],[b[0],yb,b[1]],[b[0],top,b[1]],[a[0],top,a[1]],brick);
   quad(mesh,[a[0],top,a[1]],[b[0],top,b[1]],[b2[0],top,b2[1]],[a2[0],top,a2[1]],brick2);
   for(let k=1;k<6;k++){const yj=yy+k*.57;if(yj<top-.1)quad(mesh,[a[0]+n[0]*.01,yj,a[1]+n[1]*.01],[b[0]+n[0]*.01,yj,b[1]+n[1]*.01],[b[0]+n[0]*.01,yj+.03,b[1]+n[1]*.01],[a[0]+n[0]*.01,yj+.03,a[1]+n[1]*.01],[.72,.66,.60])}
   const tm=(ta+tb)/2;if(tm-lt>6.5){lt=tm;const p=at(tm,wo+.02);quad(mesh,[p[0]-u[0]*.18,yy+2.2,p[1]-u[1]*.18],[p[0]+u[0]*.18,yy+2.2,p[1]+u[1]*.18],[p[0]+u[0]*.18,yy+2.6,p[1]+u[1]*.18],[p[0]-u[0]*.18,yy+2.6,p[1]-u[1]*.18],lamp)}
   const r=at(tm,wo-.25);q.rt=[r[0],top+1.0,r[1]]}
  let last=null;prof.forEach((q,i)=>{const p=q.rt;if(last){quad(mesh,[last[0],last[1],last[2]],[p[0],p[1],p[2]],[p[0],p[1]-.06,p[2]],[last[0],last[1]-.06,last[2]],rail);quad(mesh,[last[0],last[1]-.5,last[2]],[p[0],p[1]-.5,p[2]],[p[0],p[1]-.54,p[2]],[last[0],last[1]-.54,last[2]],rail)}
   if(i%2===0)quad(mesh,[p[0]-u[0]*.03,p[1]-1.0,p[2]-u[1]*.03],[p[0]+u[0]*.03,p[1]-1.0,p[2]+u[1]*.03],[p[0]+u[0]*.03,p[1],p[2]+u[1]*.03],[p[0]-u[0]*.03,p[1],p[2]-u[1]*.03],rail);last=p})}
 // 상부 광장 흰 난간(계단 머리 양옆)
 {const yy=prof[0][2];for(const s of [-1,1]){const p=at(0,s*W/2),q=at(-5,s*W/2);for(const h of [1.05,.55])quad(mesh,[p[0],yy+h,p[1]],[q[0],yy+h,q[1]],[q[0],yy+h-.06,q[1]],[p[0],yy+h-.06,p[1]],rail);for(const t of [0,-2.5,-5]){const r=at(t,s*W/2);quad(mesh,[r[0]-u[0]*.03,yy,r[1]-u[1]*.03],[r[0]+u[0]*.03,yy,r[1]+u[1]*.03],[r[0]+u[0]*.03,yy+1.05,r[1]+u[1]*.03],[r[0]-u[0]*.03,yy+1.05,r[1]-u[1]*.03],rail)}}}
 // 김수환관(S) 고층부: 남쪽 끝 유리 계단실 + 지붕 처마
 {const bS=B.find(b=>b.code==='S');if(bS&&bS.roof!=null){const T=[[201,132],[221,128],[240,192],[225,196]],top=(bS.spec&&bS.spec.datum!=null?bS.spec.datum:bS.ground)+55.3,g0=bS.ground;
  const m0=[(T[0][0]+T[1][0])/2,(T[0][1]+T[1][1])/2],e=[T[1][0]-T[0][0],T[1][1]-T[0][1]],el=Math.hypot(...e),eu=[e[0]/el,e[1]/el],out=[eu[1],-eu[0]];
  const gl=[.32,.45,.52],fr=[.80,.80,.78],B2=(c,hw,hd,y0,yt,col)=>{const P=[[-hw,0],[hw,0],[hw,hd],[-hw,hd]].map(([a,b])=>[c[0]+eu[0]*a+out[0]*b,c[1]+eu[1]*a+out[1]*b]);for(let i=0;i<4;i++){const p=P[i],q=P[(i+1)%4];quad(mesh,[p[0],y0,p[1]],[q[0],y0,q[1]],[q[0],yt,q[1]],[p[0],yt,p[1]],col)}quad(mesh,[P[0][0],yt,P[0][1]],[P[1][0],yt,P[1][1]],[P[2][0],yt,P[2][1]],[P[3][0],yt,P[3][1]],col)};
  B2(m0,2.6,2.2,g0,top+1.6,gl);for(let y=g0+3.4;y<top+1.4;y+=3.4)B2(m0,2.65,2.25,y,y+.12,fr);for(const a of [-2.6,0,2.6])B2([m0[0]+eu[0]*a,m0[1]+eu[1]*a],.07,2.26,g0,top+1.6,fr);
  const TR=[[185.46, 136.55], [220.93, 126.02], [231.18, 160.53], [195.71, 171.06]]/* 2026-11-11 고층부 = 가운데 구멍 네모(kpatch2) */,C=TR.reduce((s,p)=>[s[0]+p[0]/4,s[1]+p[1]/4],[0,0]),E=TR.map(p=>{const v=[p[0]-C[0],p[1]-C[1]],l=Math.hypot(...v);return [p[0]+v[0]/l*.8,p[1]+v[1]/l*.8]});
  for(let i=0;i<4;i++){const p=E[i],q=E[(i+1)%4],p2=TR[i],q2=TR[(i+1)%4];for(const [yy,col] of [[top+.25,[.88,.88,.86]],[top,[.74,.74,.72]]])quad(mesh,[p[0],yy,p[1]],[q[0],yy,q[1]],[q2[0],yy,q2[1]],[p2[0],yy,p2[1]],col)}
  for(let i=0;i<4;i++){const p=E[i],q=E[(i+1)%4];quad(mesh,[p[0],top,p[1]],[q[0],top,q[1]],[q[0],top+.25,q[1]],[p[0],top+.25,p[1]],[.88,.88,.86])}}}
 // 유리 연결 브리지: 계단 아래쪽 구간 위를 가로지름(사진상 김수환관 고층부 ↔ 맞은편 저층 벽돌동)
 {const tc=L*.80,yAt=(prof.find(q=>q[1]>=tc)||prof[prof.length-1])[2],yb=Math.max(y1+4.0,yAt+3.2),half=8,w=2.8,hh=3.0,c=at(tc,0),glass=[.60,.69,.74],frame=[.72,.74,.75];/* 2026-11-11 나무위키 신데렐라 계단 사진: 다리는 밝은 회색 금속·유리 */
  const P=(o,s,yy)=>[c[0]+n[0]*o+u[0]*s,yy,c[1]+n[1]*o+u[1]*s];
  quad(mesh,P(-half,-w/2,yb),P(half,-w/2,yb),P(half,w/2,yb),P(-half,w/2,yb),frame);quad(mesh,P(-half,-w/2,yb-.45),P(half,-w/2,yb-.45),P(half,-w/2,yb),P(-half,-w/2,yb),frame);quad(mesh,P(-half,w/2,yb-.45),P(half,w/2,yb-.45),P(half,w/2,yb),P(-half,w/2,yb),frame);
  for(const s of [-w/2,w/2]){quad(mesh,P(-half,s,yb),P(half,s,yb),P(half,s,yb+hh),P(-half,s,yb+hh),glass);for(let o=-half;o<=half;o+=1.5)quad(mesh,P(o-.04,s*1.01,yb),P(o+.04,s*1.01,yb),P(o+.04,s*1.01,yb+hh),P(o-.04,s*1.01,yb+hh),frame)}
  quad(mesh,P(-half,-w/2,yb+hh),P(half,-w/2,yb+hh),P(half,w/2,yb+hh),P(-half,w/2,yb+hh),frame)}
 // 컨벤션홀 쪽 처마 아래 흰 둥근 기둥(사진) — 계단 아래쪽 구간 옆
 for(const tt of [L*.78,L*.9,L*1.02]){const c=at(tt,-W/2-1.6),g=H(...c)-.2,r=.45,nn=14;for(let q=0;q<nn;q++){const a0=q/nn*6.283,a1=(q+1)/nn*6.283;quad(mesh,[c[0]+Math.cos(a0)*r,g,c[1]+Math.sin(a0)*r],[c[0]+Math.cos(a1)*r,g,c[1]+Math.sin(a1)*r],[c[0]+Math.cos(a1)*r,g+7.5,c[1]+Math.sin(a1)*r],[c[0]+Math.cos(a0)*r,g+7.5,c[1]+Math.sin(a0)*r],[.93,.93,.91].map(v=>v*(q%2?.95:1)))}}
}
