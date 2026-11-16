 // 20) 성심관 벚꽃길·약학관 앞마당 (2026-11-11 나무위키 사진 + 정사영상): 벚꽃길 = 흙길 + 통나무 디딤턱 + 통나무 말뚝·가로대 울타리, 약학관 북쪽 마당 = 황토색 블록 네모 + 둘레 청록 유리 천창 띠, 성심관 주차장 남쪽 붉은 관목 띠
 {const G=[[-260.18,-103.66],[-262.72,-115.86],[-272.82,-125.9],[-287.71,-153.32],[-287.18,-178.6],[-295.16,-215.22]],lg=[.50,.38,.26],lg2=[.42,.31,.21];let prev=[null,null],acc=0;
   for(let i=0;i<G.length-1;i++){const a=G[i],b=G[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/l,uz=(b[1]-a[1])/l,vx=uz,vz=-ux;
    for(let t=(i?0:5);t<l;t+=2.5){const c=[a[0]+ux*t,a[1]+uz*t],g=H(...c);
      if(Math.round((acc+t)/2.5)%2===0)BX(c,ux,uz,.22,2.2,g-.1,g+.16,lg2,-1.1);
      for(const [si,sg] of [[0,-1],[1,1]]){const q=[c[0]+vx*sg*1.75,c[1]+vz*sg*1.75],gy=H(...q),top=[q[0],gy+.95,q[1]];BX(q,ux,uz,.16,.16,gy-.2,gy+1.05,lg,-.08);
        if(prev[si]&&Math.hypot(prev[si][0]-top[0],prev[si][2]-top[2])<4){const p0=prev[si];for(const dy of[-.08,-.5]){quad(mesh,[p0[0],p0[1]+dy-.06,p0[2]],[top[0],top[1]+dy-.06,top[2]],[top[0],top[1]+dy+.06,top[2]],[p0[0],p0[1]+dy+.06,p0[2]],lg);quad(mesh,[top[0],top[1]+dy-.06,top[2]],[p0[0],p0[1]+dy-.06,p0[2]],[p0[0],p0[1]+dy+.06,p0[2]],[top[0],top[1]+dy+.06,top[2]],lg)}}
        prev[si]=top}}
    acc+=l}
   {const C=[-195,-48],U=[.977,-.215],V=[.215,.977],at=(s,t)=>[C[0]+U[0]*s+V[0]*t,C[1]+U[1]*s+V[1]*t];
    const tile=(s0,s1,t0,t1,col,lift)=>{for(let s=s0;s<s1-.01;s+=2)for(let t=t0;t<t1-.01;t+=2){const w=Math.min(2,s1-s),d=Math.min(2,t1-t),c=at(s+w/2,t+d/2),g=H(...c);BX(c,U[0],U[1],w-(lift>.07?.12:0),d-(lift>.07?.12:0),g-.15,g+lift,col,-(d-(lift>.07?.12:0))/2)}};
    tile(-7.5,7.5,-6,8,[.74,.66,.52],.06);tile(-7.5,7.5,-11.5,-6.6,[.33,.58,.54],.1);tile(-13.5,-8.1,-6,10,[.33,.58,.54],.1);tile(8.1,13.5,-9,8,[.33,.58,.54],.1)}
   {const a=[-243,-52],b=[-194,-65],l=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/l,uz=(b[1]-a[1])/l;let sd=77;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};
    for(let t=0;t<l;t+=2.2){if(t>22&&t<27)continue;const c=[a[0]+ux*(t+1.1),a[1]+uz*(t+1.1)],g=H(...c),r=rnd(),col=[.19+r*.05,.33+rnd()*.08,.20];/* 로드뷰(12월): 초록 관목 + 앞쪽 검은 난간 */if(Math.round(t/2.2)%1===0){const q=[c[0]+uz*1.1,c[1]-ux*1.1],gq=H(...q);BX(q,ux,uz,2.25,.05,gq+1.0,gq+1.06,[.16,.17,.18],-.03);BX(q,ux,uz,2.25,.04,gq+.5,gq+.54,[.16,.17,.18],-.02);BX(q,ux,uz,.06,.06,gq-.1,gq+1.06,[.16,.17,.18],-.03)}BX(c,ux,uz,2.3,1.5+rnd()*.5,g-.3,g+.6+rnd()*.4,col,-.8)}}}
