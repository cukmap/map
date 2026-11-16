// 베리타스관: 녹색 금속 모임지붕 + 깊은 처마 (현장 사진 기준, 치수는 추정)
{const b=B.find(q=>q.code==='도서관'&&q.photoRoof);if(b){const P=b.spec.parts[0],poly=P.poly,top=b.spec.datum+P.height;
 const o=poly[0],u=[poly[1][0]-o[0],poly[1][1]-o[1]],Lu=Math.hypot(...u),uu=[u[0]/Lu,u[1]/Lu],vv=[-uu[1],uu[0]];
 const loc=p=>[(p[0]-o[0])*uu[0]+(p[1]-o[1])*uu[1],(p[0]-o[0])*vv[0]+(p[1]-o[1])*vv[1]],W=(a,c,y)=>[o[0]+uu[0]*a+vv[0]*c,y,o[1]+uu[1]*a+vv[1]*c];
 const L=poly.map(loc),u0=Math.min(...L.map(p=>p[0])),u1=Math.max(...L.map(p=>p[0])),v0=Math.min(...L.map(p=>p[1])),v1=Math.max(...L.map(p=>p[1]));
 const HL=(P.holes&&P.holes[0]||[]).map(loc),hu0=HL.length?Math.min(...HL.map(p=>p[0]))-.5:(u0+u1)/2-1,hu1=HL.length?Math.max(...HL.map(p=>p[0]))+.5:(u0+u1)/2+1,hv0=HL.length?Math.min(...HL.map(p=>p[1]))-.5:(v0+v1)/2-1,hv1=HL.length?Math.max(...HL.map(p=>p[1]))+.5:(v0+v1)/2+1;
 const e=2.0,E=[u0-e,u1+e,v0-e,v1+e],I=[hu0,hu1,hv0,hv1],R=[(E[0]+I[0])/2,(E[1]+I[1])/2,(E[2]+I[2])/2,(E[3]+I[3])/2];
 const ring=(r,y)=>[W(r[0],r[2],y),W(r[1],r[2],y),W(r[1],r[3],y),W(r[0],r[3],y)];
 const yE=top-.2,yR=top+3.2,yI=top+.9,gE=ring(E,yE),gR=ring(R,yR),gI=ring(I,yI),green=[.27,.42,.38],green2=[.22,.36,.32],sof=[.66,.40,.22]/* 2026-11-11 나무위키 정면 사진: 처마 밑은 목재(주황 갈색) */;
 for(let i=0;i<4;i++){const j=(i+1)%4;quad(mesh,gE[i],gE[j],gR[j],gR[i],i%2?green:green2);quad(mesh,gR[i],gR[j],gI[j],gI[i],i%2?green2:green)}
 const gS=ring([u0,u1,v0,v1],yE-.05),gE2=gE.map(p=>[p[0],p[1]-.05,p[2]]);for(let i=0;i<4;i++){const j=(i+1)%4;quad(mesh,gS[i],gS[j],gE2[j],gE2[i],sof);quad(mesh,gE[i],gE[j],[gE[j][0],yE-.45,gE[j][2]],[gE[i][0],yE-.45,gE[i][2]],[.20,.30,.28])}
 // 처마 밑 서까래(사진의 흰 보 반복)
 for(let i=0;i<4;i++){const j=(i+1)%4,a=gS[i],c=gS[j],ea=gE2[i],ec=gE2[j],n=Math.floor(Math.hypot(c[0]-a[0],c[2]-a[2])/2.6);for(let k=1;k<n;k++){const t=k/n,p=[a[0]+(c[0]-a[0])*t,0,a[2]+(c[2]-a[2])*t],q=[ea[0]+(ec[0]-ea[0])*t,0,ea[2]+(ec[2]-ea[2])*t],dx=(c[0]-a[0])/n*.12,dz=(c[2]-a[2])/n*.12;
   quad(mesh,[p[0]-dx,yE-.06,p[2]-dz],[q[0]-dx,yE-.06,q[2]-dz],[q[0]-dx,yE-.4,q[2]-dz],[p[0]-dx,yE-.4,p[2]-dz],[.52,.28,.14])}}
 b.roof=Math.max(b.roof||0,yR)}}

