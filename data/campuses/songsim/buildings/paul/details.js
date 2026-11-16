 // 24) 바오로관·국제교류관 (2026-11-12 사용자 현장 사진 20장): 바오로관 = 붉은 벽돌 마름모 포장 앞마당 + 벽돌 문기둥·바위 + 화강석 계단 + 초록 금속 모임지붕 캐노피 / 길 남쪽 가장자리 계단식 낮은 벽돌 담 + 소나무 줄 /
 //     국제교류관 = 길에서 바로 오르는 화강석 계단 8단 + 흰 난간 + 짙은 금속 박공 캐노피("INTERNATIONAL HOUSE") + 서쪽 끝 철골 바깥 계단, 벽의 네모 화강석 장식 / 다솔관 남서쪽 관목·소나무 섬, 서쪽 길 돌담
 {const brk=[.62,.33,.26],gran=[.80,.79,.76],grn=[.36,.47,.42],dk=[.22,.22,.23],wh=[.92,.92,.90];
   const ent=(code,id,W,ns,rise,canopy)=>{const b=bOf(code),n=node(id);if(!b||!n)return;const e=edgeAt(b,[n.x,n.z]),v=[e.uz,-e.ux],pt=(s2,o)=>[e.c[0]+e.ux*s2+v[0]*o,e.c[1]+e.uz*s2+v[1]*o],PD=2.0,TR=.32,g=H(...pt(0,PD+ns*TR+.6)),yd=g+ns*rise;
     BX(e.c,e.ux,e.uz,W,PD,g-.5,yd,gran,0);for(let k=0;k<ns;k++)BX(e.c,e.ux,e.uz,W+(code==='P'?k*.25:0),TR+.01,g-.5,yd-(k+1)*rise+.001,gran.map(q=>q*(.96+(k%2)*.04)),PD+k*TR);
     BX(e.c,e.ux,e.uz,2.2,.08,yd,yd+2.4,[.16,.20,.23],.03);for(const sg of[-1,1])BX(pt(sg*(W/2-.35),0),e.ux,e.uz,.7,PD-.1,yd,yd+2.7,brk,0);
     if(canopy==='hip'){BX(e.c,e.ux,e.uz,W+1.6,PD+1.2,yd+2.7,yd+2.95,grn.map(q=>q*.8),0);BX(e.c,e.ux,e.uz,W+.2,PD,yd+2.95,yd+3.35,grn,.2);BX(e.c,e.ux,e.uz,W-1.6,PD-1.0,yd+3.35,yd+3.7,grn.map(q=>q*1.05),.4)}
     else{BX(e.c,e.ux,e.uz,W+.8,PD+1.0,yd+2.7,yd+2.9,dk,0);BX(e.c,e.ux,e.uz,W-.6,PD+1.0,yd+2.9,yd+3.3,dk.map(q=>q*1.15),0);BX(e.c,e.ux,e.uz,W-2.4,PD+1.0,yd+3.3,yd+3.7,dk,0);BX(e.c,e.ux,e.uz,2.6,.05,yd+2.42,yd+2.68,[.20,.22,.26],.12);BX(e.c,e.ux,e.uz,2.2,.03,yd+2.5,yd+2.6,wh,.17);
       for(const sg of[-1,1]){for(let k=0;k<=ns;k++){const o=PD+k*TR,y=yd-k*rise;BX(pt(sg*(W/2-.08),o),e.ux,e.uz,.06,.06,y-.1,y+.9,wh,-.03);BX(pt(sg*(W/2-.08),o),e.ux,e.uz,.07,TR+.02,y+.86-rise,y+.93,wh,-.02)}BX(pt(sg*(W/2-.08),0),e.ux,e.uz,.07,PD,yd+.86,yd+.93,wh,0);for(let o=.3;o<PD;o+=.45)BX(pt(sg*(W/2-.08),o),e.ux,e.uz,.05,.05,yd,yd+.9,wh,-.025)}}};
   ent('P','E_P_E1',5.2,6,.165,'hip');ent('I','E_I_E1',4.4,8,.165,'gable');
   for(const [x,z] of [[10.9,169.4],[23.9,164.6]]){const g=H(x,z);BX([x,z],.938,-.346,1.3,1.3,g-.3,g+1.7,brk,-.65);BX([x,z],.938,-.346,1.4,1.4,g+1.7,g+1.8,brk.map(q=>q*.85),-.7)}
   let sd=41;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};
   for(const [x,z] of [[12.4,171.2],[24.6,167.2],[25.6,170.0],[13.0,173.4],[9.6,170.4]]){const g=H(x,z),q=.45+rnd()*.15;BX([x,z],.8,.6,1.2+rnd()*.8,1.0,g-.3,g+.5+rnd()*.4,[q,q,q*.98],-.5)}
   const R=[[9.5,165.7],[-21.0,176.9],[-45.2,185.8]];let acc=0;
   for(let i=0;i<R.length-1;i++){const a=R[i],b=R[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/l,uz=(b[1]-a[1])/l,sx=uz,sz=-ux;
    for(let t=0;t<l-(i?6:0);t+=2.4){const d=acc+t,off=d<24?5.4:3.4;if(d>26.5&&d<32.5)continue;const c=[a[0]+ux*(t+1.2)+sx*off,a[1]+uz*(t+1.2)+sz*off],g=Math.max(H(...c),H(c[0]-sx*1.5,c[1]-sz*1.5)),h=1.0+(Math.floor(d/7.2)%2)*.25;
      BX(c,ux,uz,2.42,.3,g-.6,g+h,brk.map(q=>q*.9),-.15);BX(c,ux,uz,2.44,.36,g+h,g+h+.09,brk.map(q=>q*.72),-.18)}
    acc+=l}
   {const b=bOf('I');if(b){const L=lvlOf(b),P=b.spec.parts[0],fh=(P.height-(P.parapet||0))/P.floors;
     for(const [px,pz] of [[-21.8,183.7],[-7,182],[-34.4,190.3],[-2,186]]){const e=edgeAt(b,[px,pz]);for(const s2 of[-3.4,0,3.4])for(const f of[0,1]){const c=[e.c[0]+e.ux*s2,e.c[1]+e.uz*s2];BX(c,e.ux,e.uz,.45,.08,L+f*fh+2.75,L+f*fh+3.2,gran,.02)}}
     const e=edgeAt(b,[-35.6,198]),v=[e.uz,-e.ux],pt=(s2,o)=>[e.c[0]+e.ux*s2+v[0]*o,e.c[1]+e.uz*s2+v[1]*o],g=H(...pt(0,2)),st=[.30,.27,.26];
     for(let f=0;f<2;f++){const y0=g+f*fh,y1=y0+fh;BX(pt(0,0),e.ux,e.uz,5.2,1.2,y1-.12,y1,st,0);for(let k=0;k<10;k++)BX(pt(-2.2+k*.44*(f%2?-1:1)+(f%2?4.4:0),0),e.ux,e.uz,.44,1.1,y0+k*fh/10-.06,y0+(k+1)*fh/10,st,1.25);BX(pt(0,2.4),e.ux,e.uz,5.2,.05,y1+.9,y1+.95,st,0)}
     for(const s2 of[-2.6,2.6])for(const o of[.05,2.4])BX(pt(s2,o),e.ux,e.uz,.14,.14,g-.3,g+2*fh+1,st,-.07)}}
   {const b=bOf('P');if(b){const L=lvlOf(b),P=b.spec.parts[0],fh=(P.height-(P.parapet||0))/P.floors;for(const [px,pz] of [[26,177.4],[33,181.8]]){const e=edgeAt(b,[px,pz]);for(const s2 of[-1.5,1.5])BX([e.c[0]+e.ux*s2,e.c[1]+e.uz*s2],e.ux,e.uz,.45,.08,L+2.75,L+3.2,gran,.02)}}
    const q=B.find(x=>x.name&&x.name.indexOf('부속건물')===0&&Math.abs(x.poly[0][0]-15.3)<1);if(q){const e=edgeAt(q,[7.2,177.6]),g=H(e.c[0]+e.uz*1.5,e.c[1]-e.ux*1.5);BX(e.c,e.ux,e.uz,6.4,.1,g+.2,g+3.3,[.84,.84,.82],.03);for(let y=g+.9;y<g+3.2;y+=.8)BX(e.c,e.ux,e.uz,6.4,.02,y,y+.03,[.66,.66,.65],.13);for(let s2=-2.4;s2<2.5;s2+=1.6)BX([e.c[0]+e.ux*s2,e.c[1]+e.uz*s2],e.ux,e.uz,.03,.02,g+.2,g+3.3,[.66,.66,.65],.13)}}
   for(let k=0;k<12;k++){const c=[-47.5+rnd()*8,169+rnd()*12],g=H(...c),q=.2+rnd()*.06;BX(c,1,0,2.4,2.2,g-.2,g+.9+rnd()*.5,[q*1.2,q*1.6,q*.8],-1.1)}
   {const a=[-55.9,180.0],b=[-65.6,114.7],l=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/l,uz=(b[1]-a[1])/l;for(let t=6;t<l-12;t+=2.5){const c=[a[0]+ux*(t+1.25),a[1]+uz*(t+1.25)],g=H(...c),q=.33+rnd()*.05;BX(c,ux,uz,2.52,.4,g-.5,g+1.7,[q,q*.95,q*.9],-.2)}}}
