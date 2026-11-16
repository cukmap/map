// ===== 안드레아 마루광장(필로티 데크)·앞 도로 높이 맞춤 (사용자 2026-11-02: 등고선상 경사가 있어도 실제로는 평지) =====
// v2(사용자 2026-11-02): 평지 높이 = 니콜스관 1층(LVTAB N 28.95, 지면은 0.1 m 아래). 안드레아 기숙사 바닥(+3 m)·니콜스관과 사이 서쪽 도로·녹지대만 평탄,
// 남쪽(성당·김수환관 계단 쪽)과 동쪽 광장(안드레아 B1 레벨)은 원래 지형으로 경사 연결(16 m)
{const FLAT_Y=28.95-.1,BL=16,a=T.levels,N=T.nx||161,base=T.base,st=T.step;
 const AD=(B.find(b=>b.code==='AD')||{}).poly||[];
 const ROAD=[[94,58],[96.2,68.5],[104.5,88],[110.5,110],[116,127]],RW=8;
 const inP=(x,z,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const p=P[i],q=P[j];if((p[1]>z)!==(q[1]>z)&&x<(q[0]-p[0])*(z-p[1])/(q[1]-p[1])+p[0])c=!c}return c};
 const dSeg=(x,z,p,q)=>{const ex=q[0]-p[0],ez=q[1]-p[1],l=ex*ex+ez*ez;let t=l?((x-p[0])*ex+(z-p[1])*ez)/l:0;t=Math.max(0,Math.min(1,t));return Math.hypot(x-p[0]-ex*t,z-p[1]-ez*t)};
 const dPoly=(x,z,P)=>{if(P.length<3)return 1e9;if(inP(x,z,P))return 0;let m=1e9;for(let i=0;i<P.length;i++)m=Math.min(m,dSeg(x,z,P[i],P[(i+1)%P.length]));return m};
 const dLine=(x,z,L)=>{let m=1e9;for(let i=0;i+1<L.length;i++)m=Math.min(m,dSeg(x,z,L[i],L[i+1]));return m};
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=T.x0+i*st,z=T.z0+j*st;if(x<70||x>200||z<35||z>170)continue;
  const d=Math.min(Math.max(0,dPoly(x,z,AD)-3),Math.max(0,dLine(x,z,ROAD)-RW));if(d>=BL)continue;
  let w=1-d/BL;w=w*w*(3-2*w);const k=j*N+i,h=a[k]/10-base;a[k]=(h+(FLAT_Y-h)*w+base)*10}}

// 콘서트홀 동쪽 지하 출입구 앞(사용자 사진: 도로가 내려가고 동쪽 끝은 3개 층이 드러남) — 3.6 m 낮춤, 바깥 14 m에서 원래 지형으로
{const CH_DIP=[[-151,-112],[-140,-112],[-130,-125],[-125,-150],[-138,-155],[-150,-135],[-156,-120]],a=T.levels,N=T.nx||161,base=T.base,st=T.step,BL=14,D=3.6;
 const inP=(x,z,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const p=P[i],q=P[j];if((p[1]>z)!==(q[1]>z)&&x<(q[0]-p[0])*(z-p[1])/(q[1]-p[1])+p[0])c=!c}return c};
 const dS=(x,z,p,q)=>{const ex=q[0]-p[0],ez=q[1]-p[1],l=ex*ex+ez*ez;let t=l?((x-p[0])*ex+(z-p[1])*ez)/l:0;t=Math.max(0,Math.min(1,t));return Math.hypot(x-p[0]-ex*t,z-p[1]-ez*t)};
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=T.x0+i*st,z=T.z0+j*st;if(x<-175||x>-100||z<-175||z>-95)continue;let d=0;if(!inP(x,z,CH_DIP)){d=1e9;for(let k=0;k<CH_DIP.length;k++)d=Math.min(d,dS(x,z,CH_DIP[k],CH_DIP[(k+1)%CH_DIP.length]))}
  if(d>=BL)continue;let w=1-d/BL;w=w*w*(3-2*w);a[j*N+i]-=D*10*w}}

// 김수환관 강당 지붕 = 성당 앞 광장(2026-11-11 사용자): 광장을 평평하게(29.4 m), 바깥 6 m에서 원래 지형으로 — 광장 범위만
{const PZ=[[153.26,144.03],[173.75,213.05],[126.78,226.99],[106.29,157.97]],a=T.levels,N=T.nx||161,st=T.step,BL=6,Y=29.4;
 const inP=(x,z,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const p=P[i],q=P[j];if((p[1]>z)!==(q[1]>z)&&x<(q[0]-p[0])*(z-p[1])/(q[1]-p[1])+p[0])c=!c}return c};
 const dS=(x,z,p,q)=>{const ex=q[0]-p[0],ez=q[1]-p[1],l=ex*ex+ez*ez;let t=l?((x-p[0])*ex+(z-p[1])*ez)/l:0;t=Math.max(0,Math.min(1,t));return Math.hypot(x-p[0]-ex*t,z-p[1]-ez*t)};
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=T.x0+i*st,z=T.z0+j*st;if(x<90||x>215||z<120||z>240)continue;let d=0;if(!inP(x,z,PZ)){d=1e9;for(let k=0;k<PZ.length;k++)d=Math.min(d,dS(x,z,PZ[k],PZ[(k+1)%PZ.length]))}
  if(d>=BL)continue;let w=1-d/BL;w=w*w*(3-2*w);const k=j*N+i,h=a[k]/10-T.base;a[k]=(h+(Y-h)*w+T.base)*10}}


const V10=JSON.parse(document.getElementById('v10model').textContent);let showArch=true;
const trArch=p=>[V10.fit.x+V10.fit.scale*(V10.fit.cos*p[0]-V10.fit.sin*p[2]),V10.fit.base+p[1],V10.fit.z+V10.fit.scale*(V10.fit.sin*p[0]+V10.fit.cos*p[2])];
const rgbArch=h=>[parseInt(h.slice(1,3),16)/255,parseInt(h.slice(3,5),16)/255,parseInt(h.slice(5,7),16)/255];
function wireV10Focus(fn){if($('v10Toggle'))$('v10Toggle').onclick=()=>{showArch=!showArch;$('v10Toggle').classList.toggle('on',showArch);$('v10Toggle').textContent=showArch?'15동 도면 모델':'15동 기본 외곽'};$('v10Focus').onclick=fn;$('v10Quality').onclick=()=>document.getElementById('evidence').showModal()}

const C={brick:[.61,.36,.31],cream:[.79,.73,.61],sand:[.72,.69,.58],ivory:[.83,.82,.71],slate:[.47,.54,.59],blue:[.56,.69,.72],neutral:[.65,.70,.64],glass:[.31,.51,.59]};
const TN=T.nx||33,TM=TN-1-1e-5,H=(x,z)=>{let fx=Math.max(0,Math.min(TM,(x-T.x0)/T.step)),fz=Math.max(0,Math.min(TM,(z-T.z0)/T.step)),i=Math.floor(fx),j=Math.floor(fz),u=fx-i,v=fz-j,k=j*TN+i,a=T.levels;return ((a[k]*(1-u)+a[k+1]*u)*(1-v)+(a[k+TN]*(1-u)+a[k+TN+1]*u)*v)/10-T.base};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),mix=(a,b,t)=>a+(b-a)*t,lerp=(a,b,t)=>a.map((x,i)=>mix(x,b[i],t));
const inside=(x,z,poly)=>{let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){let a=poly[i],b=poly[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c}return c};
const len=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
let mesh=[],terrainMesh=[],treeMesh=[],contourMesh=[],detailMesh=[];const pushTri=(dst,a,b,c,col,uvs=null)=>{let u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]],n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],mag=Math.hypot(...n)||1;n=n.map(q=>q/mag);for(let j=0;j<3;j++){let p=[a,b,c][j];dst.push(p[0],p[1],p[2],...n,...col,...(uvs?uvs[j]:[0,0]))}};
const quad=(dst,a,b,c,d,col)=>{pushTri(dst,a,b,c,col);pushTri(dst,a,c,d,col)};
const px=(x,z,yoff=0)=>[x,H(x,z)+yoff,z];
