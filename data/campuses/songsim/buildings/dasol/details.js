 // 3) 다솔관: 사실상 2층이 1층(사용자) — 깎인 모서리 2층 출입구(계단 몇 단 위), 흰 둥근 기둥 2개, 처마, 교표 원 / 안마당 바닥은 2층 높이
 {const b=bOf('D'),n=node('E_D_E2F');if(b){const L=lvlOf(b),P=b.spec.parts[0],fh=(P.height-(P.parapet||0))/P.floors,y2=L+fh;
   if(b.court){const C=b.court,cx=C.reduce((a,p)=>a+p[0],0)/C.length,cz=C.reduce((a,p)=>a+p[1],0)/C.length;for(let k=0;k<C.length;k++){const p=C[k],q=C[(k+1)%C.length];pushTri(mesh,[cx,y2,cz],[q[0],y2,q[1]],[p[0],y2,p[1]],[.48,.56,.42]);pushTri(mesh,[cx,y2,cz],[p[0],y2,p[1]],[q[0],y2,q[1]],[.48,.56,.42])}
    for(let k=0;k<C.length;k+=2){const p=C[k],q=C[(k+1)%C.length];BX([(p[0]*.7+cx*.3),(p[1]*.7+cz*.3)],1,0,1.4,1.4,y2,y2+.5,[.62,.60,.56],-.7)}}
   if(n){/* 2026-11-11 카카오 로드뷰(2025-12, 삼거리 (16,105))를 원근 시점으로 펴서 확인: 벽은 평평함(파노라마 원본의 휘어 보임은 왜곡). 현관 = 삼거리 쪽 동쪽 벽 12 m 구간의 1층이 안으로 파인 것 — 양 끝 굵은 흰 원기둥, 안쪽 벽돌 벽에 문·창, 앞에 돌 덮개 얹은 낮은 벽돌 벽 + 침엽수. 위층은 그대로 평평한 벽 + 넓은 창. 교표 원·세로 슬릿·둥근 벽 없음 */
    const e=edgeAt(b,[10.2,102.8]),g=H(...e.c),yd=g+.9,yp=yd+3.3,brk=P.wall||[.72,.42,.35],v=[e.uz,-e.ux],pt=(s2,o)=>[e.c[0]+e.ux*s2+v[0]*o,e.c[1]+e.uz*s2+v[1]*o],W=11.2;
    BX(e.c,e.ux,e.uz,W,.14,yd,yp,[.17,.14,.13],.02);BX(pt(-1.5,0),e.ux,e.uz,2.2,.08,yd,yd+2.3,glass,.17);BX(pt(2.6,0),e.ux,e.uz,2.0,.08,yd+.9,yd+2.2,glass,.17);
    BX(e.c,e.ux,e.uz,W+.6,.5,yp,yp+.3,brk.map(q=>q*.88),0);
    for(const s2 of[-W/2,W/2])CYL(pt(s2,.45),.6,g-.4,yp,white);
    BX(e.c,e.ux,e.uz,W+1.2,1.9,g-1.0,yd,brk.map(q=>q*.9),0);BX(e.c,e.ux,e.uz,W+1.2,.4,yd,yd+.75,brk.map(q=>q*.95),1.5);BX(e.c,e.ux,e.uz,W+1.4,.5,yd+.75,yd+.9,[.80,.79,.76],1.45);
    {const st=Math.max(2,Math.round((yd-g)/.17));for(let k=0;k<st;k++)BX(pt(-W/2-.9-k*.3,.95),e.ux,e.uz,.31,1.9,g-.6,yd-(k+1)*(yd-g)/st+.02,[.80,.79,.76],-.95)}
    {/* 깎인 모서리(삼거리 북쪽에서 보이는 면, 로드뷰 (13,95) 번호 102084): 벽돌 면에 교표 원 + "9 다솔관", 1층 깊은 현관 + 흰 원기둥, 넓은 돌계단 */
     const e=edgeAt(b,[4.9,95.7]),g=H(...e.c),yd=g+1.2,v=[e.uz,-e.ux],pt=(s2,o)=>[e.c[0]+e.ux*s2+v[0]*o,e.c[1]+e.uz*s2+v[1]*o];
     BX(e.c,e.ux,e.uz,6.2,.14,yd,yd+3.1,[.17,.14,.13],.02);BX(e.c,e.ux,e.uz,3.0,.08,yd,yd+2.4,glass,.17);for(const s2 of[-3.0,3.0])CYL(pt(s2,.4),.5,g-.4,yd+3.1,white);
     {const y=yd+fh*1.75,r=1.25;for(let k=0;k<20;k++){const a0=k/20*6.283,a1=(k+1)/20*6.283,o=.06,P1=[e.c[0]+e.ux*Math.cos(a0)*r+v[0]*o,y+Math.sin(a0)*r,e.c[1]+e.uz*Math.cos(a0)*r+v[1]*o],P2=[e.c[0]+e.ux*Math.cos(a1)*r+v[0]*o,y+Math.sin(a1)*r,e.c[1]+e.uz*Math.cos(a1)*r+v[1]*o],C=[e.c[0]+v[0]*o,y,e.c[1]+v[1]*o];pushTri(mesh,P1,P2,C,[.92,.93,.94]);pushTri(mesh,C,P2,P1,[.92,.93,.94])}
      BX(e.c,e.ux,e.uz,1.5,.05,y-.55,y+.55,[.30,.42,.62],.08);BX(e.c,e.ux,e.uz,3.0,.05,y-2.2,y-1.7,[.92,.93,.94],.06)}
     const st=Math.max(1,Math.round((yd-g)/.17));for(let k=0;k<st;k++){const y=g-.2+k*(yd-g+.2)/st;BX(e.c,e.ux,e.uz,6.2,.32,y,y+(yd-g+.2)/st,[.80,.79,.76],(st-1-k)*.32+.2)}}}}}
 // 3b) 다솔관 (2026-11-12 사용자 현장 사진 16장): 깎인 모서리 = 벽돌 면에 화강석 교표 원(벽돌 테) + "9 다솔관", 그 위 층에 깊은 가로 홈(발코니), 맨 위층 세로 슬릿 창 5개 / 동쪽 현관 낮은 벽에 금색 "다솔관 SCIENCE HALL" /
 //     북서쪽 출입구 = 본동과 벽돌 원통 계단탑 사이 들어간 유리문 + 위 둥근 창 + 캐노피 판("9 다솔관") / 원통에 둥근 창·네모 창 / 남쪽 긴 면 지붕 위 "가톨릭대학교" 글자 틀, 남쪽 길가 바위 석축 + 관목
 {const b=bOf('D');if(b){const L=lvlOf(b),P=b.spec.parts[0],fh=(P.height-(P.parapet||0))/P.floors,top=L+P.height-(P.parapet||0),rt=L+P.height,brk=P.wall,band=[.86,.66,.52],gran=[.82,.81,.78],gold=[.80,.66,.30];
   const DISC=(c,ux,uz,y,r,col,o)=>{const vx=uz,vz=-ux,C=[c[0]+vx*o,y,c[1]+vz*o];for(let k=0;k<20;k++){const a0=k/20*6.283,a1=(k+1)/20*6.283,P1=[c[0]+ux*Math.cos(a0)*r+vx*o,y+Math.sin(a0)*r,c[1]+uz*Math.cos(a0)*r+vz*o],P2=[c[0]+ux*Math.cos(a1)*r+vx*o,y+Math.sin(a1)*r,c[1]+uz*Math.cos(a1)*r+vz*o];pushTri(mesh,P1,P2,C,col);pushTri(mesh,C,P2,P1,col)}};
   {const e=edgeAt(b,[4.9,95.7]),g=H(...e.c),yd=g+1.2,yc=yd+fh*1.75;BX(e.c,e.ux,e.uz,7.0,.2,yd+3.1,rt,brk,.05);for(let k=2;k<P.floors;k++)BX(e.c,e.ux,e.uz,7.0,.03,L+k*fh-.07,L+k*fh+.07,band,.25);
    DISC(e.c,e.ux,e.uz,yc,1.55,band,.27);DISC(e.c,e.ux,e.uz,yc,1.25,gran,.29);BX(e.c,e.ux,e.uz,1.5,.03,yc-.5,yc+.5,[.25,.42,.36],.3);BX([e.c[0]+e.ux*.3,e.c[1]+e.uz*.3],e.ux,e.uz,2.6,.05,yc-2.5,yc-2.0,[.90,.90,.86],.26);BX([e.c[0]-e.ux*1.5,e.c[1]-e.uz*1.5],e.ux,e.uz,.5,.05,yc-2.6,yc-1.9,[.86,.80,.55],.26);
    const s0=L+4*fh+.5,s1=L+5*fh-.5;BX(e.c,e.ux,e.uz,5.6,.04,s0,s1,[.15,.13,.12],.26);BX(e.c,e.ux,e.uz,5.6,.3,s0-.12,s0,brk.map(v=>v*.9),.05);
    for(let k=0;k<5;k++)BX([e.c[0]+e.ux*(k-2)*1.0+e.ux*.9,e.c[1]+e.uz*(k-2)*1.0+e.uz*.9],e.ux,e.uz,.42,.04,L+5*fh+.7,top-.7,[.26,.33,.38],.26)}
   {const e=edgeAt(b,[10.2,102.8]),g=H(...e.c);BX(e.c,e.ux,e.uz,5.2,.04,g+.42,g+.78,gold,1.92);BX(e.c,e.ux,e.uz,4.4,.04,g+.12,g+.28,gold,1.92)}
   {const e=edgeAt(b,[-47.85,116.95]),vx=e.uz,vz=-e.ux,g=H(e.c[0]+vx*2,e.c[1]+vz*2);BX(e.c,e.ux,e.uz,3.3,.1,g,g+2.6,[.20,.24,.28],.06);BX(e.c,e.ux,e.uz,3.3,.03,g+.95,g+1.08,[.20,.36,.72],.17);BX(e.c,e.ux,e.uz,.08,.05,g,g+2.6,[.8,.8,.8],.17);
    DISC(e.c,e.ux,e.uz,g+4.5,1.25,band,.08);DISC(e.c,e.ux,e.uz,g+4.5,1.0,[.22,.28,.32],.1);BX(e.c,e.ux,e.uz,3.6,3.5,g+6.3,g+7.4,brk,0);BX(e.c,e.ux,e.uz,3.6,3.5,g+6.2,g+6.3,[.70,.72,.70],0);BX(e.c,e.ux,e.uz,2.6,.05,g+6.6,g+7.1,[.90,.90,.86],3.5);
    BX(e.c,e.ux,e.uz,3.6,4.6,g-.25,g+.05,gran,0);
    const C=[-54.2,119.9],R=4.15;for(const [ad,kind] of [[205,'r'],[250,'w'],[160,'r']]){const a=ad*Math.PI/180,ox=Math.cos(a),oz=Math.sin(a),c=[C[0]+ox*R,C[1]+oz*R],ux=-oz,uz=ox,sg=(uz*ox-ux*oz)>0?1:-1;
      for(let f=0;f<5;f++){const y=g+1.2+f*fh;if(y+2>rt)break;if(kind==='r'&&f%2===0){DISC(c,ux,uz,y+1.0,1.0,band,.12);DISC(c,ux,uz,y+1.0,.76,[.22,.28,.32],.16)}
        else if(kind==='w'||f%2===1){for(const q of[-1,1])quad(mesh,[c[0]-ux*.55+ox*.07,y+.3,c[1]-uz*.55+oz*.07],[c[0]+ux*.55+ox*.07,y+.3,c[1]+uz*.55+oz*.07],[c[0]+ux*.55+ox*.07,y+1.9,c[1]+uz*.55+oz*.07],[c[0]-ux*.55+ox*.07,y+1.9,c[1]-uz*.55+oz*.07].map(v=>v),[.24,.30,.34]);
          quad(mesh,[c[0]+ux*.55+ox*.07,y+.3,c[1]+uz*.55+oz*.07],[c[0]-ux*.55+ox*.07,y+.3,c[1]-uz*.55+oz*.07],[c[0]-ux*.55+ox*.07,y+1.9,c[1]-uz*.55+oz*.07],[c[0]+ux*.55+ox*.07,y+1.9,c[1]+uz*.55+oz*.07],[.24,.30,.34])}}}}
   {const e=edgeAt(b,[-5.9,165.35]),vx=e.uz,vz=-e.ux,at=(s2,o)=>[e.c[0]+e.ux*s2+vx*o,e.c[1]+e.uz*s2+vz*o];let sd=13;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};
    BX(e.c,e.ux,e.uz,19,.12,rt,rt+1.9,[.78,.76,.70],-.5);for(let k=0;k<6;k++)BX(at((k-2.5)*3.0,0),e.ux,e.uz,1.7,.08,rt+.25,rt+1.7,[.97,.97,.95],-.36);
    for(let s2=-16;s2<16.5;s2+=1.5){const c=at(s2+rnd()*.4,2.3+rnd()*.3),g=H(...c),q=.30+rnd()*.1;BX(c,e.ux,e.uz,.7+rnd()*.5,.6,g-.3,g+.25+rnd()*.3,[q,q,q*.98],-.3);
      if(rnd()<.8){const hc=at(s2,1.2),hg=H(...hc)+.5,k2=.19+rnd()*.06;BX(hc,e.ux,e.uz,1.6,1.2,hg,hg+1.0+rnd()*.5,[k2*.95,k2*1.7,k2],-.6)}}}}}
