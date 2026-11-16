// ===== v23: 캠퍼스 섬(바깥 제거) 가장자리, 연석·계단·옹벽, 급경사 오버레이 =====
let extObj=null,steepObj=null;
{const m=[],soil=[.46,.39,.31],soil2=[.36,.30,.24];
 // 섬 가장자리 단면(흙 절개면)
 for(let j=0;j<160;j++)for(let i=0;i<160;i++){if(!TMASK_IJ(i,j))continue;const x=-320+i*4,z=-320+j*4;
  const side=(ax,az,bx,bz)=>{const ha=H(ax,az),hb=H(bx,bz);quad(m,[ax,ha,az],[bx,hb,bz],[bx,ha-2.2,bz],[ax,ha-2.2,az],soil);quad(m,[ax,ha-2.2,az],[bx,hb-2.2,bz],[bx,hb-9,bz],[ax,ha-9,az],soil2)};
  if(ECFULL(i,j)){if(!TMASK_IJ(i,j-1))side(x+4,z,x,z);if(!TMASK_IJ(i,j+1))side(x,z+4,x+4,z+4);if(!TMASK_IJ(i-1,j))side(x,z,x,z+4);if(!TMASK_IJ(i+1,j))side(x+4,z+4,x+4,z)}}{const OL=EXT.ecring||[],side=(ax,az,bx,bz)=>{const ha=H(ax,az),hb=H(bx,bz);quad(m,[ax,ha,az],[bx,hb,bz],[bx,ha-2.2,bz],[ax,ha-2.2,az],soil);quad(m,[ax,ha-2.2,az],[bx,hb-2.2,bz],[bx,hb-9,bz],[ax,ha-9,az],soil2)};for(let k=0;k<OL.length;k++){const p=OL[k],q=OL[(k+1)%OL.length],L=Math.hypot(q[0]-p[0],q[1]-p[1]),n=Math.max(1,Math.ceil(L/2));for(let s=0;s<n;s++){const a=[p[0]+(q[0]-p[0])*s/n,p[1]+(q[1]-p[1])*s/n],b=[p[0]+(q[0]-p[0])*(s+1)/n,p[1]+(q[1]-p[1])*(s+1)/n];side(b[0],b[1],a[0],a[1])}}}
 // 연석: 차도 경계를 따라 높이 13 cm, 폭 18 cm
 const curb=[.74,.74,.71],curbS=[.58,.58,.56];
 for(const poly of EXT.curbs){for(let k=0;k<poly.length-1;k++){const a=poly[k],b=poly[k+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.2)continue;const n=Math.ceil(L/2);
  for(let s=0;s<n;s++){const p=[a[0]+(b[0]-a[0])*s/n,a[1]+(b[1]-a[1])*s/n],q=[a[0]+(b[0]-a[0])*(s+1)/n,a[1]+(b[1]-a[1])*(s+1)/n],nx=-(q[1]-p[1])/(L/n)*.09,nz=(q[0]-p[0])/(L/n)*.09,hp=H(p[0],p[1])+.16,hq=H(q[0],q[1])+.16;
   quad(m,[p[0]+nx,hp,p[1]+nz],[q[0]+nx,hq,q[1]+nz],[q[0]-nx,hq,q[1]-nz],[p[0]-nx,hp,p[1]-nz],curb);quad(m,[p[0]-nx,hp,p[1]-nz],[q[0]-nx,hq,q[1]-nz],[q[0]-nx,hq-.35,q[1]-nz],[p[0]-nx,hp-.35,p[1]-nz],curbS);quad(m,[q[0]+nx,hq,q[1]+nz],[p[0]+nx,hp,p[1]+nz],[p[0]+nx,hp-.35,p[1]+nz],[q[0]+nx,hq-.35,q[1]+nz],curbS)}}}
 // 계단: 경로망의 계단 구간을 실제 단(약 16 cm)으로
 const tread=[.70,.69,.66],riser=[.55,.54,.52],side=[.50,.49,.47];
 for(const st of EXT.stairs){const g=st.g,w=st.w/2;let tot=0;const cum=[0];for(let k=0;k<g.length-1;k++){tot+=Math.hypot(g[k+1][0]-g[k][0],g[k+1][1]-g[k][1]);cum.push(tot)}if(tot<1)continue;
  const at=d=>{let k=0;while(k<g.length-2&&cum[k+1]<d)k++;const f=(d-cum[k])/Math.max(1e-6,cum[k+1]-cum[k]);return [g[k][0]+(g[k+1][0]-g[k][0])*f,g[k][1]+(g[k+1][1]-g[k][1])*f,k]};
  const h0=H(g[0][0],g[0][1]),h1=H(g[g.length-1][0],g[g.length-1][1]),n=Math.max(3,Math.round(Math.abs(h1-h0)/.16)),lift=.12;
  for(let s=0;s<n;s++){const d0=tot*s/n,d1=tot*(s+1)/n,p=at(d0),q=at(d1),k=p[2],dx=g[k+1][0]-g[k][0],dz=g[k+1][1]-g[k][1],l=Math.hypot(dx,dz)||1,nx=-dz/l*w,nz=dx/l*w;
   const y=h0+(h1-h0)*(h1>h0?(s+1)/n:s/n)+lift,base=Math.min(H(p[0],p[1]),H(q[0],q[1]))-.6;
   quad(m,[p[0]+nx,y,p[1]+nz],[q[0]+nx,y,q[1]+nz],[q[0]-nx,y,q[1]-nz],[p[0]-nx,y,p[1]-nz],tread);
   const e=h1>h0?p:q;quad(m,[e[0]-nx,base,e[1]-nz],[e[0]+nx,base,e[1]+nz],[e[0]+nx,y,e[1]+nz],[e[0]-nx,y,e[1]-nz],riser);
   quad(m,[p[0]+nx,base,p[1]+nz],[q[0]+nx,base,q[1]+nz],[q[0]+nx,y,q[1]+nz],[p[0]+nx,y,p[1]+nz],side);quad(m,[q[0]-nx,base,q[1]-nz],[p[0]-nx,base,p[1]-nz],[p[0]-nx,y,p[1]-nz],[q[0]-nx,y,q[1]-nz],side)}}
 // 옹벽·석축: NGII(높이 속성) 상단선과 CAD 옹벽선 → 지면 위 낮은 벽(상단 표시)
 const wallc=[.64,.62,.58],wallT=[.76,.75,.72];
 for(const wl of EXT.walls){const g=wl.g,up=wl.h>0?Math.min(.9,.35+wl.h*.12):.10;for(let k=0;k<g.length-1;k++){const a=g[k],b=g[k+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.2)continue;const n=Math.ceil(L/2);
  for(let s=0;s<n;s++){const p=[a[0]+(b[0]-a[0])*s/n,a[1]+(b[1]-a[1])*s/n],q=[a[0]+(b[0]-a[0])*(s+1)/n,a[1]+(b[1]-a[1])*(s+1)/n],hw=wl.h>0?.15:.07,nx=-(q[1]-p[1])/(L/n)*hw,nz=(q[0]-p[0])/(L/n)*hw,hp=H(p[0],p[1]),hq=H(q[0],q[1]);
   quad(m,[p[0]+nx,hp-1.2,p[1]+nz],[q[0]+nx,hq-1.2,q[1]+nz],[q[0]+nx,hq+up,q[1]+nz],[p[0]+nx,hp+up,p[1]+nz],wallc);quad(m,[q[0]-nx,hq-1.2,q[1]-nz],[p[0]-nx,hp-1.2,p[1]-nz],[p[0]-nx,hp+up,p[1]-nz],[q[0]-nx,hq+up,q[1]-nz],wallc);quad(m,[p[0]+nx,hp+up,p[1]+nz],[q[0]+nx,hq+up,q[1]+nz],[q[0]-nx,hq+up,q[1]-nz],[p[0]-nx,hp+up,p[1]-nz],wallT)}}}
 extObj=upload(m)}
{const m=[];for(const e of NE)if(e.so)ribbon(m,e.g,3.4,[1,.86,.18],.95);steepObj=upload(m)}

