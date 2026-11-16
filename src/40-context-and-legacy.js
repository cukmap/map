// Unverified IH / dorm-like high tower: position and extent interpreted from its large campus footprint.
// Candidate footprint: simple GIS mass only when detailed illustration is hidden.
let k=B.find(q=>q.code==='ST'),baseCandidateMesh=[],archMesh=[];
if(k){let poly=k.poly,foot=Math.min(...poly.map(p=>H(...p)))-.4,top=foot+45.9;
  for(let i=0;i<poly.length;i++){let p=poly[i],q=poly[(i+1)%poly.length];quad(baseCandidateMesh,[p[0],foot,p[1]],[q[0],foot,q[1]],[q[0],top,q[1]],[p[0],top,p[1]],[.59,.36,.31])}
  for(let tr of k.tri){pushTri(baseCandidateMesh,[tr[0][0],top,tr[0][1]],[tr[1][0],top,tr[1][1]],[tr[2][0],top,tr[2][1]],[.35,.40,.38])}
  k.ground=V10.fit.base;k.roof=V10.fit.base+55.2;k.cx=poly.reduce((s,p)=>s+p[0],0)/poly.length;k.cz=poly.reduce((s,p)=>s+p[1],0)/poly.length;
}
for(const f of V10.faces){let pts=f[0].map(trArch),color=rgbArch(V10.colors[f[1]]);for(let j=1;j<pts.length-1;j++){pushTri(archMesh,pts[0],pts[j],pts[j+1],color)}}
for(const b of B){if(b.labelPoint){b.cx=b.labelPoint[0];b.cz=b.labelPoint[1];b.roof=V10.fit.base+(b.code==='ST'?60.3:16.3)}}
// Source linework is draped on inherited terrain; it does not certify step heights or access.
const detailStyle={stairs:[.64,.56,.44],retaining:[.39,.41,.36],crossing:[.96,.94,.82],roadEdge:[.66,.66,.58],parking:[.88,.87,.75]};
for(const entry of DATA.cadDetail.lines){stripe(entry.points,entry.kind==='crossing'?.18:entry.kind==='retaining'?.22:.12,detailStyle[entry.kind],.38,detailMesh)}
for(const tr of DATA.cadDetail.trees){let [x,z]=tr.xy;if(B.some(b=>inside(x,z,b.poly)))continue;const base=H(x,z),r=tr.radius,tall=tr.height;for(let a=0;a<8;a++){let aa=a*Math.PI/4,bb=(a+1)*Math.PI/4,p=[x+Math.cos(aa)*r,base+tall*.48,z+Math.sin(aa)*r],q=[x+Math.cos(bb)*r,base+tall*.48,z+Math.sin(bb)*r];pushTri(treeMesh,p,q,[x,base+tall,z],[.30,.46,.27]);pushTri(treeMesh,q,p,[x,base+tall*.22,z],[.24,.38,.22])}}


// v16 NGII 2025 detail: retaining/stone walls use the surveyed height attribute; the low side is not known, so the slab is drawn downward from terrain level.
if(DATA.ngiiDetail){for(const w of DATA.ngiiDetail.walls){const hgt=Math.max(.4,w.height||1),col=w.kind==='석축'?[.55,.52,.44]:[.62,.62,.58];for(let i=0;i<w.points.length-1;i++){let p=w.points[i],q=w.points[i+1];if(len(p,q)<.05)continue;let a=H(...p)+.35,c=H(...q)+.35;quad(detailMesh,[p[0],a-hgt,p[1]],[q[0],c-hgt,q[1]],[q[0],c,q[1]],[p[0],a,p[1]],col);quad(detailMesh,[q[0],c-hgt,q[1]],[p[0],a-hgt,p[1]],[p[0],a,p[1]],[q[0],c,q[1]],col)}}
for(const st of DATA.ngiiDetail.stairs)for(const t of st.tri){const q=t.map(p=>px(...p,.42));pushTri(detailMesh,q[0],q[2],q[1],[.74,.62,.45]);pushTri(detailMesh,q[0],q[1],q[2],[.74,.62,.45])}
for(const f of DATA.ngiiDetail.fences)stripe(f.points,.16,[.40,.40,.37],.9,detailMesh)}
// Reproducible illustrative vegetation; no claim of surveyed tree positions.
let seed=6421;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};let trees=0;const OCT=(()=>{const v=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],f=[[0,4,2],[4,1,2],[1,5,2],[5,0,2],[4,0,3],[1,4,3],[5,1,3],[0,5,3]],o=[];const nm=a=>{const l=Math.hypot(...a);return a.map(x=>x/l)};for(const [a,b,c] of f){const A=v[a],Bv=v[b],Cv=v[c],ab=nm(A.map((x,k)=>x+Bv[k])),bc=nm(Bv.map((x,k)=>x+Cv[k])),ca=nm(Cv.map((x,k)=>x+A[k]));o.push([A,ab,ca],[ab,Bv,bc],[ca,bc,Cv],[ab,bc,ca])}return o})();
for(const [x,z,tall,r,sp0] of ((DATA.vegetation&&DATA.vegetation.trees)||[])){const base=H(x,z),cy=base+Math.max(tall*.62,r*1.1),ry=Math.max(1.6,tall*.42),j=rand()*6.28;const tone=.88+rand()*.2,spr=rand(),sp=sp0==null?spr:sp0,pine=sp<.34,leaf=(pine?[.16,.29,.19]:sp<.47?[.72,.26,.15]:sp<.58?[.82,.46,.17]:sp<.70?[.86,.73,.26]:[.40,.51,.27]).map(v=>v*tone);const P=d=>{const w=1+.16*Math.sin(d[0]*3.1+j)*Math.cos(d[2]*2.7+j),c=pine?Math.max(.08,.62-.5*d[1]):1,yy=pine?1.35:1;return [x+d[0]*r*w*c,cy+d[1]*ry*yy*(d[1]<0?.55:1),z+d[2]*r*w*c]};
 for(const t of OCT){const pts=t.map(P),uv=pts.map(p=>[(x+(p[0]-x)*.35+320)/640,1-(z+(p[2]-z)*.35+320)/640]);pushTri(treeMesh,pts[0],pts[1],pts[2],leaf,uv)}
 const tr=[.36,.30,.24],k=.18;quad(treeMesh,[x-k,base,z],[x+k,base,z],[x+k,cy-ry*.5,z],[x-k,cy-ry*.5,z],tr);quad(treeMesh,[x,base,z-k],[x,base,z+k],[x,cy-ry*.5,z+k],[x,cy-ry*.5,z-k],tr);trees++}
// v17 context: surrounding NGII 2025 buildings as simple massing (not selectable).
if(DATA.context)for(const c of DATA.context.buildings){const poly=c.p,foot=Math.min(...poly.map(p=>H(...p)))-.3,top=foot+c.h+.3,col=c.k==='campus'?[.90,.87,.80]:c.k==='shed'?[.84,.84,.80]:[.93,.92,.89],sg=ringSign(poly),nf=Math.max(1,c.f||1),fh=c.h/nf;for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],ll=len(p,q);if(ll<.05)continue;const o=[sg*(q[1]-p[1])/ll,-sg*(q[0]-p[0])/ll],cc=col.map(v=>v*(i%2?.9:1));wq(p,q,foot,top,cc,o,0);if(c.k!=='shed'&&ll>2.5)for(let f=0;f<nf;f++){const y=foot+.3+f*fh+fh*.35;if(y<Math.max(H(p[0],p[1]),H(q[0],q[1]))+.3)continue;wq(p,q,y,y+fh*.36,[.38,.44,.48],o,.06)}}texTris(c.t,top,col.map(v=>v*.85),c.rt||[0,0])}
