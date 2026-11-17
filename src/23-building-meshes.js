// ===== 건물 외관 만들기: building.json 의 spec 으로 건물마다 벽·창·지붕을 세운다 =====
// 외장 색·창 모양 등은 2026-11-17 코드에서 각 building.json 으로 옮겼다(현장·공식 사진 근거는 "photo", "photo26").
for(let idx=0;idx<B.length;idx++){if(idx)B[idx-1]._rg=[B[idx-1]._m0,mesh.length/11,B[idx-1]._r0,roofMesh.length/11];B[idx]._m0=mesh.length/11;B[idx]._r0=roofMesh.length/11;let b=B[idx],poly=b.poly,foot=Math.min(...poly.map(p=>H(...p)))-.4,bh=b.code==='ST'?13.2:b.h,top=foot+bh,fac=C[b.shade]||C.neutral; if(!b.spec&&(b.complexPart||b.code==='ST'&&showArch)){b.ground=V10.fit.base;b.roof=V10.fit.base+55.2;b.cx=poly.reduce((s,p)=>s+p[0],0)/poly.length;b.cz=poly.reduce((s,p)=>s+p[1],0)/poly.length;continue;}b.ground=foot;b.roof=top;b.cx=poly.reduce((s,p)=>s+p[0],0)/poly.length;b.cz=poly.reduce((s,p)=>s+p[1],0)/poly.length;
if(b.spec){buildSpec(b,foot);continue;}
if(b.profile==='andrea'){
 const fl=b.floorLift||0,lift=6.6+fl,sign0=(poly.reduce((s,p,i)=>{let q=poly[(i+1)%poly.length];return s+p[0]*q[1]-q[0]*p[1]},0)>0?1:-1),axis=b.longAxis,range=b.axisRange,span=range[1]-range[0],end=p=>{let t=(p[0]*axis[0]+p[1]*axis[1]-range[0])/span;return t<.20||t>.77};
 // The CAD roof path is exact in plan; opening, floor heights and facade spacing are interpreted.
 for(let i=0;i<poly.length;i++){
  const p=poly[i],q=poly[(i+1)%poly.length],ll=len(p,q);if(ll<.001)continue;
  const middle=[(p[0]+q[0])/2,(p[1]+q[1])/2],bottom=end(middle)?foot:foot+lift;
  texQuad(mesh,p,q,bottom,top,[.88,.64,.58],[0,0],0,0,2);if(end(middle)){glassQuad(mesh,p,q,foot+.15,foot+3.1,[sign0*(q[1]-p[1])/ll,-sign0*(q[0]-p[0])/ll],.06)}
 }
 // Distribute facade bays along complete runs so curved segments also receive windows.
 const area=poly.reduce((s,p,i)=>{let q=poly[(i+1)%poly.length];return s+p[0]*q[1]-q[0]*p[1]},0),sign=area>0?1:-1;
 for(let i=0;i<poly.length;i++){
  const p=poly[i],q=poly[(i+1)%poly.length],ll=len(p,q);if(ll<.1)continue;
  const out=[sign*(q[1]-p[1])/ll,-sign*(q[0]-p[0])/ll];
  let n=Math.max(1,Math.round(ll/3.8));
  for(let row=2;row<10;row++)for(let j=0;j<n;j++){
   const hs=((row*7+j*13+i*5)%5),wv=[.30,.48,.62,.40,.55][hs],off=[.18,.30,.12,.24,.20][(hs+row)%5],u=(j+off)/n,v=(j+off+wv)/n,y=foot+fl+row*3.3+1.0,at=(a,h)=>[mix(p[0],q[0],a)+out[0]*.08,h,mix(p[1],q[1],a)+out[1]*.08];
   glassQuad(mesh,[mix(p[0],q[0],u),mix(p[1],q[1],u)],[mix(p[0],q[0],v),mix(p[1],q[1],v)],y,y+1.35,out,.08);
  }
 }
 // Exposed pilotis are schematic, grounded in the official photograph, not measured columns.
 const xs=poly.map(p=>p[0]),zs=poly.map(p=>p[1]);
 /* 2026-10-31 현장 사진: 필로티 광장은 굵은 사각 기둥 + V자 기둥, 바닥은 목재 데크 */{const ax=axis,px_=[-ax[1],ax[0]],cc=[.86,.85,.82],w=.95;
 const leg=(x0,z0,x1,z1)=>{const h=w/2,c0=[[-h,-h],[h,-h],[h,h],[-h,h]];const P=(x,z,y,o)=>[x+ax[0]*o[0]+px_[0]*o[1],y,z+ax[1]*o[0]+px_[1]*o[1]];for(let i=0;i<4;i++){const a=c0[i],c=c0[(i+1)%4];quad(mesh,P(x0,z0,foot,a),P(x0,z0,foot,c),P(x1,z1,foot+lift,c),P(x1,z1,foot+lift,a),i%2?cc:cc.map(v=>v*.92))}};
 for(let x=Math.min(...xs)+4;x<Math.max(...xs);x+=8.5)for(let z=Math.min(...zs)+4;z<Math.max(...zs);z+=8.5){if(!inside(x,z,poly)||end([x,z]))continue;const n=14,r=.42;for(let k=0;k<n;k++){const a0=k/n*6.283,a1=(k+1)/n*6.283;quad(mesh,[x+Math.cos(a0)*r,foot,z+Math.sin(a0)*r],[x+Math.cos(a1)*r,foot,z+Math.sin(a1)*r],[x+Math.cos(a1)*r,foot+lift,z+Math.sin(a1)*r],[x+Math.cos(a0)*r,foot+lift,z+Math.sin(a0)*r],[.94,.94,.92].map(v=>v*(k%2?.95:1)))}}
 for(const tr of b.tri)pushTri(mesh,...tr.map(p=>[p[0],H(p[0],p[1])+.12,p[1]]),[.72,.45,.31])}
 for(const tr of b.tri){pushTri(mesh,...tr.map(p=>[p[0],foot+lift,p[1]]),[.68,.66,.60]);}
 texTris(b.tri,top,[.58,.40,.34],b.roofTex||[0,0]);b.roof=top;continue;
}
for(let i=0;i<poly.length;i++){let p=poly[i],q=poly[(i+1)%poly.length],ll=len(p,q),dir=[(q[0]-p[0])/ll,(q[1]-p[1])/ll],out=[dir[1],-dir[0]];let face=i%3===0?fac.map(v=>v*.88):i%3===1?fac:fac.map(v=>v*1.07);quad(mesh,[p[0],foot,p[1]],[q[0],foot,q[1]],[q[0],top,q[1]],[p[0],top,p[1]],face);if(bh<5)continue;let ncol=[.24,.40,.44],count=Math.floor(ll/3.2),nfl=Math.floor(bh/3.3);if(count<=0)continue;for(let f=0;f<nfl;f++)for(let j=0;j<count;j++){let s1=(j+.19)/count,s2=(j+.77)/count,y1=foot+f*3.3+1.0,y2=Math.min(foot+(f+1)*3.3-.55,top-.9);if(y2<=y1)continue;let v=(u,y)=>[mix(p[0],q[0],u)+out[0]*.085,y,mix(p[1],q[1],u)+out[1]*.085];let cc=((j+f*3)%9===0)?[.52,.63,.59]:ncol;quad(mesh,v(s1,y1),v(s2,y1),v(s2,y2),v(s1,y2),cc)}}for(const hp of (b.holes||[]))for(let j=0;j<hp.length;j++){let p=hp[j],q=hp[(j+1)%hp.length];let bottom=b.courtyardDepth?top-b.courtyardDepth:foot;quad(mesh,[p[0],bottom,p[1]],[q[0],bottom,q[1]],[q[0],top,q[1]],[p[0],top,p[1]],fac)}for(const t of (b.courtyardFloor||[])){pushTri(mesh,...t.map(p=>[p[0],top-b.courtyardDepth,p[1]]),[.55,.60,.55])}roof(poly,b.tri,top,fac.map(v=>v*.75));
}
B[B.length-1]._rg=[B[B.length-1]._m0,mesh.length/11,B[B.length-1]._r0,roofMesh.length/11];
