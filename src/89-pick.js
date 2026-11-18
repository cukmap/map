// ===== 지도에서 위치 찍기 · 화면 좌표 변환 (오류 제보 화면과 지도 부품이 함께 씀) =====
const CUKPICK=(()=>{
const inPoly=(x,z,P)=>{let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c}return c};
const bAt=(x,z)=>B.find(b=>b.poly&&b.poly.length>2&&inPoly(x,z,b.poly));
function inv4(m){const a=m,o=new Float64Array(16);const [a00,a01,a02,a03,a10,a11,a12,a13,a20,a21,a22,a23,a30,a31,a32,a33]=a;
 const b00=a00*a11-a01*a10,b01=a00*a12-a02*a10,b02=a00*a13-a03*a10,b03=a01*a12-a02*a11,b04=a01*a13-a03*a11,b05=a02*a13-a03*a12,b06=a20*a31-a21*a30,b07=a20*a32-a22*a30,b08=a20*a33-a23*a30,b09=a21*a32-a22*a31,b10=a21*a33-a23*a31,b11=a22*a33-a23*a32;
 let d=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;if(!d)return null;d=1/d;
 o[0]=(a11*b11-a12*b10+a13*b09)*d;o[1]=(a02*b10-a01*b11-a03*b09)*d;o[2]=(a31*b05-a32*b04+a33*b03)*d;o[3]=(a22*b04-a21*b05-a23*b03)*d;o[4]=(a12*b08-a10*b11-a13*b07)*d;o[5]=(a00*b11-a02*b08+a03*b07)*d;o[6]=(a32*b02-a30*b05-a33*b01)*d;o[7]=(a20*b05-a22*b02+a23*b01)*d;
 o[8]=(a10*b10-a11*b08+a13*b06)*d;o[9]=(a01*b08-a00*b10-a03*b06)*d;o[10]=(a30*b04-a31*b02+a33*b00)*d;o[11]=(a21*b02-a20*b04-a23*b00)*d;o[12]=(a11*b07-a10*b09-a12*b06)*d;o[13]=(a00*b09-a01*b07+a02*b06)*d;o[14]=(a31*b01-a30*b03-a32*b00)*d;o[15]=(a20*b03-a21*b01+a22*b00)*d;return o}
const unp=(I,x,y,z)=>{const w=I[3]*x+I[7]*y+I[11]*z+I[15];return [(I[0]*x+I[4]*y+I[8]*z+I[12])/w,(I[1]*x+I[5]*y+I[9]*z+I[13])/w,(I[2]*x+I[6]*y+I[10]*z+I[14])/w]};
function pick3d(cx,cy){const cv=$('gl'),r=cv.getBoundingClientRect();if(!camera.mvp)return null;const I=inv4(camera.mvp);if(!I)return null;
 const nx=(cx-r.left)/r.width*2-1,ny=1-(cy-r.top)/r.height*2,A=unp(I,nx,ny,-1),C=unp(I,nx,ny,1);
 // 실내 보기 중이면 보이는 층 바닥에 먼저 맞춘다
 if(IN.b&&IN.b.rt){const f=IN.b.rt.floors[IN.cur];const t=(f.y-A[1])/(C[1]-A[1]);if(t>0&&t<1){const x=A[0]+(C[0]-A[0])*t,z=A[2]+(C[2]-A[2])*t,[X0,Z0,X1,Z1]=IN.b.d.bounds;
   if(x>X0&&x<X1&&z>Z0&&z<Z1&&f&&IN.b.rt.floors)return {x,z,y:f.y,b:IN.b.bv,floor:f.id,view:'3d'}}}
 const L=Math.hypot(C[0]-A[0],C[1]-A[1],C[2]-A[2]),n=Math.min(4000,Math.ceil(L/1.5));let prev=0;
 for(let i=1;i<=n;i++){const t=i/n,x=A[0]+(C[0]-A[0])*t,y=A[1]+(C[1]-A[1])*t,z=A[2]+(C[2]-A[2])*t;
  const b=bAt(x,z);if(b){const g=H(b.cx,b.cz);if(y<=g+(b.h||10)&&y>=g-2)return {x,z,y,b,floor:null,view:camera.mode==='walk'?'walk':'3d'}}
  if(y<=H(x,z)){let lo=prev,hi=t;for(let k=0;k<20;k++){const m=(lo+hi)/2,xx=A[0]+(C[0]-A[0])*m,yy=A[1]+(C[1]-A[1])*m,zz=A[2]+(C[2]-A[2])*m;if(yy<=H(xx,zz))hi=m;else lo=m}
   const xx=A[0]+(C[0]-A[0])*hi,zz=A[2]+(C[2]-A[2])*hi;return {x:xx,z:zz,y:H(xx,zz),b:bAt(xx,zz)||null,floor:null,view:camera.mode==='walk'?'walk':'3d'}}
  prev=t}
 return null}
function pickPlan(cx,cy){const P=globalThis.__P2D;if(!P)return null;const cv=document.querySelector('#p2 canvas'),r=cv.getBoundingClientRect(),PL=P.PL;
 const x=PL.cx+(cx-r.left-r.width/2)/PL.s,z=PL.cz+(cy-r.top-r.height/2)/PL.s;let floor=null;const b=bAt(x,z)||null;
 if(b&&PL.s>=2.4){const ib=P.ibs.find(q=>q.bv===b);if(ib){let fi=PL.fl[ib.d.code];if(fi==null){fi=ib.d.floors.findIndex(f=>f.id==='1F');if(fi<0)fi=0}floor=ib.d.floors[fi].id}}
 return {x,z,y:H(x,z),b,floor,view:'plan'}}
function toScreen(x,y,z){if(globalThis.__P2ON){const P=globalThis.__P2D;if(!P)return null;const PL=P.PL,r=$('gl').parentElement.getBoundingClientRect();return [r.width/2+(x-PL.cx)*PL.s,r.height/2+(z-PL.cz)*PL.s]}
 const p=project([x,(y==null?H(x,z):y)+1.2,z]);return p?[p[0],p[1]]:null}
// 건물 찾기: 코드(N), 폴더 이름(nichols), 이름(니콜스관) 모두 받음
function findB(q){if(!q)return null;const s=String(q).trim();return B.find(b=>b.code===s||b.id===s||(b.name||'').split('(')[0].trim()===s)||B.find(b=>(b.name||'').includes(s))||null}
// 층 바닥 높이(해발): 건물의 lv 기준, 없으면 지면
function floorY(b,fl){if(!b)return null;if(b.lv&&fl&&typeof lvFloorY==='function')return lvFloorY(b.lv,fl,b.floors||5);return H(b.cx,b.cz)}
// 방 찾기(실내 도면이 있는 건물만): 'N301' → 위치·층·건물
function findRoom(id){if(typeof IB==='undefined')return null;const s=String(id).trim();for(const ib of IB)for(const f of ib.d.floors)for(const l of f.labels||[])if(l.id===s||(l.name&&l.name.replace(/\s/g,'')===s.replace(/\s/g,'')))return {x:l.x,z:l.z,floor:f.id,b:ib.bv,label:l};return null}
return {inPoly,bAt,pick3d,pickPlan,toScreen,findB,floorY,findRoom}})();
globalThis.__CUKPICK=CUKPICK;
