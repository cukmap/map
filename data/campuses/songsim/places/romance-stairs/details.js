 // 19) 낭만계단 (2026-11-11 나무위키 사진): 스머프동산 동쪽 비탈의 어두운 나무 디딤판 계단 + 나무 말뚝·밧줄 난간, 디딤판 끝 노란 선
 {const G=[[97.6,-17.4],[95.28,-16.73],[82.0,-17.7],[61.96,-21.99],[60.4,-23.8]],wd=[.34,.25,.18],post=[.40,.30,.21],rope=[.24,.20,.16];let prev=[null,null];
   for(let i=0;i<G.length-1;i++){const a=G[i],b=G[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/l,uz=(b[1]-a[1])/l,vx=uz,vz=-ux,n=Math.max(1,Math.round(l/1.1)),run=l/n;
    for(let k=0;k<n;k++){const c=[a[0]+ux*(k+.5)*run,a[1]+uz*(k+.5)*run],y=Math.max(H(c[0]+ux*run*.5,c[1]+uz*run*.5),H(c[0]-ux*run*.5,c[1]-uz*run*.5),H(...c))+.1;
      BX(c,ux,uz,run+.04,2.3,y-.7,y,wd,-1.15);BX([c[0]-ux*(run/2-.06),c[1]-uz*(run/2-.06)],ux,uz,.1,2.3,y-.02,y+.012,[.86,.72,.16],-1.15);
      if(k%2===0)for(const [si,sg] of [[0,-1],[1,1]]){const q=[c[0]+vx*sg*1.3,c[1]+vz*sg*1.3],top=[q[0],y+1.0,q[1]];BX(q,ux,uz,.13,.13,y-.6,y+1.05,post,-.065);
        if(prev[si]){const p0=prev[si];for(const dy of[0,-.4]){quad(mesh,[p0[0],p0[1]+dy-.03,p0[2]],[top[0],top[1]+dy-.03,top[2]],[top[0],top[1]+dy+.02,top[2]],[p0[0],p0[1]+dy+.02,p0[2]],rope);quad(mesh,[top[0],top[1]+dy-.03,top[2]],[p0[0],p0[1]+dy-.03,p0[2]],[p0[0],p0[1]+dy+.02,p0[2]],[top[0],top[1]+dy+.02,top[2]],rope)}}
        prev[si]=top}}}}
