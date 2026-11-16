 // 13) 미카엘관 (2026-11-11 나무위키 항공 사진): 저층동 맨 위층 = 앞으로 0.9 m 나온 흰 띠 + 연속 띠창, 고층 탑 긴 면 가운데 전층 유리 띠 + 지붕 위 평판 차양
 {const b=bOf('H / T');if(b){const L=lvlOf(b);for(const P of b.spec.parts){const ring=P.poly,fh=(P.height-(P.parapet||0))/P.floors,top=L+P.height-(P.parapet||0);
   for(let i=0;i<ring.length;i++){const a=ring[i],q=ring[(i+1)%ring.length],l=Math.hypot(q[0]-a[0],q[1]-a[1]);if(l<4)continue;const e=edgeAt({poly:ring},[(a[0]+q[0])/2,(a[1]+q[1])/2]);if(!e)continue;const m=[(a[0]+q[0])/2,(a[1]+q[1])/2];
    if(P.floors<=4){const y0=top-fh-.2;BX(m,e.ux,e.uz,l+1.4,.9,y0,top+.3,[.94,.93,.90],0);BX(m,e.ux,e.uz,l-.6,.06,y0+.6,top-.5,[.26,.40,.44],.9)}
    else if(l>14){BX(m,e.ux,e.uz,5.2,.1,L+fh*.9,top-2.2,[.22,.34,.40],.02);for(let k=1;k<P.floors;k++)BX(m,e.ux,e.uz,5.4,.14,L+fh*k-.06,L+fh*k+.06,[.88,.86,.82],.02)}}}}}
