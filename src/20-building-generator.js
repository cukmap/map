// v19 building generator: parts, materials, window types, pitched roofs and orthophoto-textured roofs.
// Window positions are rule-based (floor count / floor height), not surveyed openings.
// v21 materials: procedural wall detail atlas (brick / panel / concrete / glass), applied as a texture multiplied by the
// building colour, so facades read as real surfaces next to the orthophoto ground. Tile index is encoded in uv.x.
function matAtlas(){const S=1024,h=S/2,c=document.createElement('canvas');c.width=c.height=S;const g=c.getContext('2d');let seed=91;const R=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
 const tile=(ox,oy,draw)=>{g.save();g.beginPath();g.rect(ox,oy,h,h);g.clip();g.translate(ox,oy);draw();g.restore()};
 // 0 brick (2 m x 2 m): 0.25 x 0.075 m courses, running bond, per-brick tone variation, light mortar
 tile(0,0,()=>{g.fillStyle='rgb(206,204,198)';g.fillRect(0,0,h,h);const bw=h/8,bh=h/26.6;for(let r=0;r<27;r++){for(let k=-1;k<9;k++){const x=k*bw+(r%2)*bw/2,y=r*bh,v=200+R()*55;g.fillStyle=`rgb(${v},${v*.97},${v*.95})`;g.fillRect(x+1.2,y+1.2,bw-2.4,bh-2.4)}}for(let i=0;i<9000;i++){const v=R()*40-20;g.fillStyle=`rgba(${v>0?255:0},${v>0?255:0},${v>0?255:0},${Math.abs(v)/400})`;g.fillRect(R()*h,R()*h,2,2)}});
 // 1 stone / tile panels (2 m): 0.6 x 0.3 m joints
 tile(h,0,()=>{g.fillStyle='rgb(246,246,243)';g.fillRect(0,0,h,h);for(let r=0;r<7;r++)for(let k=0;k<4;k++){const v=236+R()*18;g.fillStyle=`rgb(${v},${v},${v-3})`;g.fillRect(k*h/3.33+1,r*h/6.66+1,h/3.33-2,h/6.66-2)}});
 // 2 concrete (4 m): soft noise + form-tie dots
 tile(0,h,()=>{g.fillStyle='rgb(232,232,230)';g.fillRect(0,0,h,h);for(let i=0;i<14000;i++){const v=R();g.fillStyle=`rgba(0,0,0,${v*.05})`;g.fillRect(R()*h,R()*h,3,3)}g.fillStyle='rgba(0,0,0,.12)';for(let y=h/8;y<h;y+=h/4)for(let x=h/8;x<h;x+=h/4){g.beginPath();g.arc(x,y,2.2,0,7);g.fill()}});
 // 3 glass (one tile per window): sky reflection gradient, mullion and frame
 tile(h,h,()=>{const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgb(225,236,245)');gr.addColorStop(.45,'rgb(150,175,195)');gr.addColorStop(.55,'rgb(105,125,140)');gr.addColorStop(1,'rgb(70,85,95)');g.fillStyle=gr;g.fillRect(0,0,h,h);g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.moveTo(h*.15,0);g.lineTo(h*.45,0);g.lineTo(h*.05,h);g.lineTo(-h*.25,h);g.fill();g.fillStyle='rgb(235,235,232)';g.fillRect(0,0,h,h*.04);g.fillRect(0,h*.96,h,h*.04);g.fillRect(0,0,h*.04,h);g.fillRect(h*.96,0,h*.04,h);g.fillRect(h*.48,0,h*.04,h)});
 return c}
const TILE={brick:0,brickSalmon:0,brickDark:0,brickTrim:0,white:1,lightgray:1,cream:1,tealTrim:2,roofGray:2,copper:2,greenTile:2};
function texQuad(dst,p,q,y0,y1,col,o,off,tile,scale){const L=len(p,q),a=[p[0]+o[0]*off,p[1]+o[1]*off],b=[q[0]+o[0]*off,q[1]+o[1]*off],T=(tile+1)*1000,U=u=>T+u,u0=0,u1=L/scale,v0=y0/scale,v1=y1/scale;
 const A=[a[0],y0,a[1]],Bq=[b[0],y0,b[1]],Cq=[b[0],y1,b[1]],Dq=[a[0],y1,a[1]];pushTri(dst,A,Bq,Cq,col,[[U(u0),v0],[U(u1),v0],[U(u1),v1]]);pushTri(dst,A,Cq,Dq,col,[[U(u0),v0],[U(u1),v1],[U(u0),v1]])}
function glassQuad(dst,p,q,y0,y1,o,off){const a=[p[0]+o[0]*off,p[1]+o[1]*off],b=[q[0]+o[0]*off,q[1]+o[1]*off],T=4000;const A=[a[0],y0,a[1]],Bq=[b[0],y0,b[1]],Cq=[b[0],y1,b[1]],Dq=[a[0],y1,a[1]],w=[1,1,1];pushTri(dst,A,Bq,Cq,w,[[T+.02,.98],[T+.98,.98],[T+.98,.02]]);pushTri(dst,A,Cq,Dq,w,[[T+.02,.98],[T+.98,.02],[T+.02,.02]])}
const tileOf=c=>{const k=Object.keys(MATC).find(k=>MATC[k].every((v,i)=>Math.abs(v-c[i])<.004));return k&&TILE[k]!=null?TILE[k]:-1};

const MATC=DATA.materials||{};let roofMesh=[];
const RTX=(x,z,o)=>[(x+o[0]+320)/640,1-(z+o[1]+320)/640];
function texTris(tris,level,col,off,dyIdx){for(const t of tris){const P=t.map(v=>v.length===3?[v[0],level+v[1],v[2]]:[v[0],level,v[1]]),uv=P.map(p=>RTX(p[0],p[2],off));pushTri(roofMesh,P[0],P[1],P[2],col,uv);pushTri(roofMesh,P[2],P[1],P[0],col,[uv[2],uv[1],uv[0]])}}
const ringSign=r=>{let a=0;for(let i=0;i<r.length;i++){const p=r[i],q=r[(i+1)%r.length];a+=p[0]*q[1]-q[0]*p[1]}return a>0?1:-1};
function wq(p,q,y0,y1,col,o,off){quad(mesh,[p[0]+o[0]*off,y0,p[1]+o[1]*off],[q[0]+o[0]*off,y0,q[1]+o[1]*off],[q[0]+o[0]*off,y1,q[1]+o[1]*off],[p[0]+o[0]*off,y1,p[1]+o[1]*off],col)}
function windowsOnEdge(part,p,q,o,l1,floorH,nFl,startF){const ll=len(p,q);if(ll<2.2)return;const g=part.glass,fr=part.trim,st=part.win,at=u=>[mix(p[0],q[0],u),mix(p[1],q[1],u)];
 const ground=u=>H(mix(p[0],q[0],u),mix(p[1],q[1],u));
 for(let f=startF;f<nFl;f++){const y0=l1+f*floorH;
  if(st==='ribbon'){const m=Math.min(.8,ll*.1),u0=m/ll,u1=1-m/ll,ya=y0+floorH*.30,yb=y0+floorH*.78;if(ya<Math.max(ground(u0),ground(u1))+.3)continue;glassQuad(mesh,at(u0),at(u1),ya,yb,o,.07);const nm=Math.floor((ll-2*m)/1.8);for(let k=1;k<nm;k++){const u=u0+(u1-u0)*k/nm,a=at(u-.05/ll),b2=at(u+.05/ll);wq(a,b2,ya,yb,fr,o,.09)}continue}
  let pitch=part.pitch||(st==='slit'?1.9:3.3),ww=part.ww||(st==='slit'?.55:Math.min(1.9,pitch*.52)),hf=part.hf||(st==='slit'?.74:.5),sill=part.sill||(st==='slit'?.12:.33);const n=Math.floor(ll/pitch);if(n<1)continue;
  for(let k=0;k<n;k++){const uc=(k+.5)/n,u0=uc-ww/2/ll,u1=uc+ww/2/ll,ya=y0+floorH*sill,yb=ya+floorH*hf;if(ya<ground(uc)+.35)continue;glassQuad(mesh,at(u0),at(u1),ya,yb,o,.07);if(st!=='slit')wq(at(u0),at(u1),ya-.12,ya,fr,o,.09)}}}
function buildSpec(b,foot){const lift=b.spec.lift||0,lvl1=(b.spec.datum!=null)?b.spec.datum:Math.min(...b.poly.map(p=>H(...p)))+lift;let roofTop=-1e9;
 for(const part of b.spec.parts){const poly=part.poly,sg=ringSign(poly),base=lvl1+(part.base||0),top=base+part.height,par=part.parapet||0,eave=top-par,nFl=part.floors,floorH=Math.max(2.8,(part.height-(par>0?par:0))/nFl),wall=part.wall,trim=part.trim,plinth=wall.map(v=>v*.8);
  const pfoot=Math.min(...poly.map(p=>H(...p)))-.4,bot=part.bottom||0,pf=part.pilotis||0,wallBottom=bot>0?base+bot:(pf?base+pf*floorH:pfoot),startF=bot>0?Math.round(bot/floorH):pf;if(bot>0)for(const t of part.tri)pushTri(mesh,...t.map(p=>[p[0],base+bot,p[1]]).reverse(),trim.map(v=>v*.7));
  const rings=[[poly,1]].concat((part.holes||[]).map(h=>[h,-1]));
  for(const [ring,dir] of rings){const s=ringSign(ring)*dir;for(let i=0;i<ring.length;i++){const p=ring[i],q=ring[(i+1)%ring.length],ll=len(p,q);if(ll<.05)continue;const o=[s*(q[1]-p[1])/ll,-s*(q[0]-p[0])/ll];
    const yb=dir<0&&part.courtyardDepth?top-part.courtyardDepth:wallBottom;
    // wall with alternating light per facade; plinth below first floor level
    {const tl=tileOf(wall),cw=i%2?wall.map(v=>v*.95):wall;if(tl>=0)texQuad(mesh,p,q,yb,eave,cw,o,0,tl,tl===2?4:2);else wq(p,q,yb,eave,cw,o,0)};if(dir>0&&!pf&&!bot&&base-pfoot>.6)texQuad(mesh,p,q,pfoot,Math.min(base,eave),plinth,o,.02,2,4);
    // cornice / parapet
    if(par>0){wq(p,q,eave,top,trim,o,0);wq(q,p,eave+.05,top,trim.map(v=>v*.85),[-o[0],-o[1]],.25);quad(mesh,[p[0],top,p[1]],[q[0],top,q[1]],[q[0]-o[0]*.25,top,q[1]-o[1]*.25],[p[0]-o[0]*.25,top,p[1]-o[1]*.25],trim)}
    else wq(p,q,eave-.35,eave,trim,o,.05);
    if(part.win!=='none'&&(dir>0||!part.courtyardDepth))windowsOnEdge(part,p,q,o,base,floorH,nFl,startF);
    // floor bands on tall flat facades
    if(part.win==='punched'&&nFl>=4)for(let f=1;f<nFl;f++){const y=base+f*floorH;if(y>H(p[0],p[1])+.5&&y>H(q[0],q[1])+.5)wq(p,q,y-.12,y+.06,trim.map(v=>v*.97),o,.03)}
  }}
  if(pf){const xs=poly.map(p=>p[0]),zs=poly.map(p=>p[1]),yt=base+pf*floorH;for(let x=Math.min(...xs)+2.5;x<Math.max(...xs);x+=5.4)for(let z=Math.min(...zs)+2.5;z<Math.max(...zs);z+=5.4){if(!inside(x,z,poly))continue;const r=.32,pp=[[x-r,z-r],[x+r,z-r],[x+r,z+r],[x-r,z+r]];for(let k=0;k<4;k++){const a=pp[k],c=pp[(k+1)%4];quad(mesh,[a[0],H(a[0],a[1])-.3,a[1]],[c[0],H(c[0],c[1])-.3,c[1]],[c[0],yt,c[1]],[a[0],yt,a[1]],trim)}}for(const t of part.tri)pushTri(mesh,...t.map(p=>[p[0],yt,p[1]]),[.62,.62,.6])}
  // roof: flat (eave) or pitched; textured with the orthophoto roof image (lean-corrected)
  const off=part.roofTex||[0,0],rc=part.roofColor;
  if(part.roofTris){texTris(part.roofTris,eave,rc,off);roofTop=Math.max(roofTop,eave+Math.max(...part.roofTris.flat().map(v=>v[1])))}
  else{texTris(part.tri.map(t=>t.map(p=>[p[0],p[1]])),part.courtyardDepth?top-par:eave+.02,rc,off);roofTop=Math.max(roofTop,top)}
  if(part.courtyardFloor)for(const t of part.courtyardFloor)pushTri(mesh,...t.map(p=>[p[0],top-part.courtyardDepth,p[1]]),[.55,.60,.55]);
  if(part.lantern){const L=part.lantern,ap=eave+Math.max(...part.roofTris.flat().map(v=>v[1]))-.6,n=8;for(let k=0;k<n;k++){const a0=k*2*Math.PI/n,a1=(k+1)*2*Math.PI/n,p=[L.c[0]+Math.cos(a0)*L.r,L.c[1]+Math.sin(a0)*L.r],q=[L.c[0]+Math.cos(a1)*L.r,L.c[1]+Math.sin(a1)*L.r];quad(mesh,[p[0],ap,p[1]],[q[0],ap,q[1]],[q[0],ap+L.h,q[1]],[p[0],ap+L.h,p[1]],[.62,.72,.70]);pushTri(mesh,[p[0],ap+L.h,p[1]],[q[0],ap+L.h,q[1]],[L.c[0],ap+L.h+1.4,L.c[1]],rc.map(v=>v*1.1));pushTri(mesh,[q[0],ap+L.h,q[1]],[p[0],ap+L.h,p[1]],[L.c[0],ap+L.h+1.4,L.c[1]],rc.map(v=>v*1.1))}roofTop=Math.max(roofTop,ap+L.h+1.4)}
 }
 b.ground=foot;b.roof=roofTop;b.cx=b.poly.reduce((s,p)=>s+p[0],0)/b.poly.length;b.cz=b.poly.reduce((s,p)=>s+p[1],0)/b.poly.length}

// Exterior volumes: spec-driven where a v19 spec exists (buildSpec), legacy generic massing otherwise.

