 // 23) 정문~김수환관 앞 오르막 (2026-11-12 카카오 로드뷰 (262,74), (195,14)): 길 양옆 낮은 생울타리(겨울 갈색), 오르막 남서쪽 소나무 둔덕 아래 돌 옹벽
 {const G=[[287,89],[270,80],[255,67],[240,54],[224,41],[209,28],[195,14],[180,1]];let sd=91;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};const MT=(x,z)=>globalThis.__MAT?__MAT(x,z):0;
   for(let i=0;i<G.length-1;i++){const a=G[i],b=G[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/l,uz=(b[1]-a[1])/l,nx=uz,nz=-ux;/* (nx,nz): 남서쪽(둔덕 쪽) */
    for(const sg of[-1,1])for(let t=0;t<l;t+=2.4){if(i===0&&t<10)continue;const o=sg*(5.4+rnd()*.3),c=[a[0]+ux*(t+1.2)+nx*o,a[1]+uz*(t+1.2)+nz*o],g=H(...c),q=.9+rnd()*.2;
      if(Math.abs(H(c[0]+nx*sg*2,c[1]+nz*sg*2)-g)>2.5)continue;BX(c,ux,uz,2.45,1.1,g-.3,g+.75+rnd()*.2,[.42*q,.27*q,.17*q],-.55)}
    if(i>=4)for(let t=0;t<l;t+=1.6){const c=[a[0]+ux*(t+.8)+nx*6.6,a[1]+uz*(t+.8)+nz*6.6],g=H(...c),q=.50+rnd()*.1;BX(c,ux,uz,1.62,.5,g-.4,g+1.5+rnd()*.15,[q,q,q*.97],-.25)}}}
