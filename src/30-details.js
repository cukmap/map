// ===== 공식 사진(2026-11-08) 기반 외관 형태: 흰 골조·출입구 캐노피·유리 커튼월·계단탑 =====
{const NN26=(()=>{try{return JSON.parse(document.getElementById('net').textContent).nodes}catch(e){return []}})();
 const lvlOf=b=>{const sp=b.spec;return sp.datum!=null?sp.datum:Math.min(...b.poly.map(p=>H(...p)))+(sp.lift||0)};
 const BX=(c,ux,uz,w,d,y0,y1,col,o=0)=>{const vx=uz,vz=-ux;/* v: 바깥쪽 */const P=[[-w/2,o],[w/2,o],[w/2,o+d],[-w/2,o+d]].map(([a,b])=>[c[0]+ux*a+vx*b,c[1]+uz*a+vz*b]);
  quad(mesh,[P[0][0],y1,P[0][1]],[P[1][0],y1,P[1][1]],[P[2][0],y1,P[2][1]],[P[3][0],y1,P[3][1]],col);quad(mesh,[P[3][0],y0,P[3][1]],[P[2][0],y0,P[2][1]],[P[1][0],y0,P[1][1]],[P[0][0],y0,P[0][1]],col.map(v=>v*.85));
  for(let i=0;i<4;i++){const p=P[i],q=P[(i+1)%4];quad(mesh,[p[0],y0,p[1]],[q[0],y0,q[1]],[q[0],y1,q[1]],[p[0],y1,p[1]],col.map(v=>v*(i%2?.88:.97)))}};
 const CYL=(c,r,y0,y1,col,n=20,top=null)=>{for(let k=0;k<n;k++){const a0=k/n*6.283,a1=(k+1)/n*6.283;quad(mesh,[c[0]+Math.cos(a0)*r,y0,c[1]+Math.sin(a0)*r],[c[0]+Math.cos(a1)*r,y0,c[1]+Math.sin(a1)*r],[c[0]+Math.cos(a1)*r,y1,c[1]+Math.sin(a1)*r],[c[0]+Math.cos(a0)*r,y1,c[1]+Math.sin(a0)*r],col.map(v=>v*(k%2?.94:1)));if(top)pushTri(mesh,[c[0]+Math.cos(a1)*r,y1,c[1]+Math.sin(a1)*r],[c[0]+Math.cos(a0)*r,y1,c[1]+Math.sin(a0)*r],[c[0],y1,c[1]],top)}};
 // 건물 외곽에서 점 p에 가장 가까운 변: 그 위의 점·변 방향·바깥 법선
 const edgeAt=(b,p)=>{const P=b.poly,C=P.reduce((s,q)=>[s[0]+q[0]/P.length,s[1]+q[1]/P.length],[0,0]);let best=null;
  for(let i=0;i<P.length;i++){const a=P[i],q=P[(i+1)%P.length],ex=q[0]-a[0],ez=q[1]-a[1],l=Math.hypot(ex,ez);if(l<2)continue;let t=((p[0]-a[0])*ex+(p[1]-a[1])*ez)/(l*l);t=Math.max(.08,Math.min(.92,t));const x=a[0]+ex*t,z=a[1]+ez*t,d=Math.hypot(p[0]-x,p[1]-z);if(!best||d<best.d){let ux=ex/l,uz=ez/l;
   let vx=uz,vz=-ux;if((x+vx-C[0])**2+(z+vz-C[1])**2<(x-vx-C[0])**2+(z-vz-C[1])**2){ux=-ux;uz=-uz}best={d,c:[x,z],ux,uz,len:l,t}}}return best};
 const node=id=>NN26.find(n=>n.id===id);
 const bOf=c=>B.find(q=>q.code===c&&q.spec&&q.spec.parts);
 const white=[.93,.93,.91],glass=[.16,.26,.32],frame=[.30,.31,.32],wood=[.62,.42,.26];
 // 흰 골조: 각 층 바닥선 띠 + 일정 간격 기둥(벽면에서 조금 튀어나옴)
 const frameOn=(b,step,bandH,col)=>{const L=lvlOf(b);for(const P of b.spec.parts){if(P.roofTris)continue;const base=L+(P.base||0),fh=(P.height-(P.parapet||0))/P.floors,ring=P.poly;
   for(let i=0;i<ring.length;i++){const a=ring[i],q=ring[(i+1)%ring.length],l=Math.hypot(q[0]-a[0],q[1]-a[1]);if(l<3)continue;const e=edgeAt({poly:ring},[(a[0]+q[0])/2,(a[1]+q[1])/2]);if(!e)continue;const mid=[(a[0]+q[0])/2,(a[1]+q[1])/2];
    const g=Math.min(H(...a),H(...q))-.2;for(let k=1;k<=P.floors;k++){const y=base+k*fh-(k===P.floors?0:bandH/2);BX(mid,e.ux,e.uz,l+.3,.22,y-bandH/2,y+bandH/2,col,-.02)}
    const n=Math.max(1,Math.round(l/step));for(let s=0;s<=n;s++){const t=-l/2+l*s/n,c=[mid[0]+e.ux*t,mid[1]+e.uz*t];BX(c,e.ux,e.uz,.55,.26,Math.max(g,base-.3),base+P.height-(P.parapet||0),col,-.02)}}}};
/*@@DETAILS@@*/
}

