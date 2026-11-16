// ===== 옥상 요소 (2026-11-08): 정사영상 판독 → 태양광 패널·옥탑·설비·채광창·중정을 단순 형상으로 =====
{const RF=JSON.parse(document.getElementById('roof26').textContent),rm=[];
 const topOf=b=>{const out=[];const sp=b.spec;if(sp&&sp.parts&&sp.parts.length){const lvl1=(sp.datum!=null)?sp.datum:Math.min(...b.poly.map(p=>H(...p)))+(sp.lift||0);for(const p of sp.parts){if(!p.poly)continue;const t=lvl1+(p.base||0)+p.height-(p.parapet||0);out.push([p.poly,t,!!p.roofTris])}}else out.push([b.poly,b.roof,false]);return out};
 const roofY=(b,x,z)=>{let y=null;for(const [P,t,sl] of topOf(b))if(!sl&&inside(x,z,P)&&(y==null||t>y))y=t;return y};
 const box=(c,a,w,h,y0,y1,col)=>{const ux=Math.cos(a),uz=Math.sin(a),vx=-uz,vz=ux,P=[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]].map(([p,q])=>[c[0]+ux*p+vx*q,c[1]+uz*p+vz*q]);
  quad(rm,[P[0][0],y1,P[0][1]],[P[1][0],y1,P[1][1]],[P[2][0],y1,P[2][1]],[P[3][0],y1,P[3][1]],col.map(v=>Math.min(1,v*1.06)));for(let i=0;i<4;i++){const p=P[i],q=P[(i+1)%4];quad(rm,[p[0],y0,p[1]],[q[0],y0,q[1]],[q[0],y1,q[1]],[p[0],y1,p[1]],col.map(v=>v*(i%2?.82:.92)))}};
 const flat=(c,a,w,h,y,col)=>{const ux=Math.cos(a),uz=Math.sin(a),vx=-uz,vz=ux,P=[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]].map(([p,q])=>[c[0]+ux*p+vx*q,y,c[1]+uz*p+vz*q]);quad(rm,P[0],P[1],P[2],P[3],col)};
 const PVC=[.14,.19,.30],PVF=[.70,.72,.74];
 for(const b of B){const L=RF[b.code];if(!L)continue;
  for(const f of L){
   if(f.k==='patch'||f.k==='voidp'){const col=f.k==='patch'?f.col:[.20,.30,.21];for(const t of f.tri){const ys=[0,1,2].map(i=>roofY(b,t[i][0]*.98+(t[0][0]+t[1][0]+t[2][0])/150,t[i][1]*.98+(t[0][1]+t[1][1]+t[2][1])/150)),y=ys[0];if(ys.some(v=>v==null||Math.abs(v-y)>.5))continue;pushTri(rm,[t[0][0],y+.03,t[0][1]],[t[1][0],y+.03,t[1][1]],[t[2][0],y+.03,t[2][1]],col);pushTri(rm,[t[2][0],y+.03,t[2][1]],[t[1][0],y+.03,t[1][1]],[t[0][0],y+.03,t[0][1]],col)}continue}
   const y=roofY(b,f.x,f.z);if(y==null)continue;const c=[f.x,f.z];
   if(f.k==='box')box(c,f.a,f.w,f.h,y,y+f.ht,f.col);
   else if(f.k==='frame'){for(const s of[-1,1])for(const t of[-1,1])box([f.x+Math.cos(f.a)*s*f.w/2-Math.sin(f.a)*t*f.h/2,f.z+Math.sin(f.a)*s*f.w/2+Math.cos(f.a)*t*f.h/2],f.a,.25,.25,y,y+f.ht,[.85,.85,.83]);flat(c,f.a,f.w,f.h,y+f.ht,[.82,.82,.80]);flat(c,f.a,f.w*.96,f.h*.96,y+f.ht-.05,[.70,.70,.68])}
   else if(f.k==='glass'){box(c,f.a,f.w,f.h,y,y+(f.y||.3)+.05,[.78,.80,.80]);flat(c,f.a,f.w*.92,f.h*.92,y+(f.y||.3)+.08,[.30,.45,.52])}
   else if(f.k==="void")flat(c,f.a,f.w,f.h,y+.03,[.20,.30,.21]);
   else if(f.k==='sky'){const n=28,r=f.r,ht=f.ht||.6,col=f.col||[.80,.80,.78];for(let k=0;k<n;k++){const a0=k/n*6.283,a1=(k+1)/n*6.283,p=[f.x+Math.cos(a0)*r,f.z+Math.sin(a0)*r],q=[f.x+Math.cos(a1)*r,f.z+Math.sin(a1)*r];
     quad(rm,[p[0],y,p[1]],[q[0],y,q[1]],[q[0],y+ht,q[1]],[p[0],y+ht,p[1]],col.map(v=>v*.9));pushTri(rm,[p[0],y+ht,p[1]],[q[0],y+ht,q[1]],[f.x,y+ht+(f.col?0:.5),f.z],f.col?col:[.32,.48,.55])}}
   else if(f.k==='pv'){const W=Math.max(f.w,f.h),D=Math.min(f.w,f.h),a=f.w>=f.h?f.a:f.a+Math.PI/2,ux=Math.cos(a),uz=Math.sin(a),vx=-uz,vz=ux,rows=Math.max(1,Math.floor(D/1.7));
     for(let r=0;r<rows;r++){const o=-D/2+(r+.5)*D/rows,d=Math.min(1.3,D/rows*.85),lo=y+.25,hi=y+.25+d*Math.sin(.21);
      const P=(p,q,yy)=>[f.x+ux*p+vx*q,yy,f.z+uz*p+vz*q];
      quad(rm,P(-W/2,o-d/2,lo),P(W/2,o-d/2,lo),P(W/2,o+d/2,hi),P(-W/2,o+d/2,hi),PVC);quad(rm,P(-W/2,o+d/2,hi),P(W/2,o+d/2,hi),P(W/2,o+d/2,y),P(-W/2,o+d/2,y),PVF.map(v=>v*.7));
      for(let s=-W/2;s<=W/2+1e-6;s+=1.0)quad(rm,P(s-.03,o-d/2,lo+.01),P(s+.03,o-d/2,lo+.01),P(s+.03,o+d/2,hi+.01),P(s-.03,o+d/2,hi+.01),PVF)}}}}
 const RO=upload(rm);const prev=globalThis.__CAN;globalThis.__CAN=()=>{prev&&prev();renderObj(RO,camera.mvp,0)};
 (globalThis.__SHX=globalThis.__SHX||[]).push(RO);setTimeout(()=>{if(globalThis.__SHPASS)globalThis.__SHPASS([build,roofObj,forest,...globalThis.__SHX])},160);globalThis.__ROOF={n:rm.length/11/6}}

