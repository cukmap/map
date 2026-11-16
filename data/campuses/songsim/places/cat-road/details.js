 // 18) 고양이길·메이플로드 (2026-11-11 나무위키 사진): 고양이길 = 곧은 블록 포장길 양옆 낮은 관목 띠 + 북쪽 검은 볼라드 등, 메이플로드 = 차로와 체크 보도 사이 갈색 볼라드 줄 + 보도 바깥 낮은 돌 경계
 {const G=[[106.5,140.4],[97.44,143.1],[57.6,154.89],[45.5,158.0],[35.6,157.9]];let sd=31;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};let acc=0;
   for(let i=0;i<G.length-1;i++){const a=G[i],b=G[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/l,uz=(b[1]-a[1])/l,nx=-uz,nz=ux;/* (nx,nz): 서쪽으로 갈 때 왼쪽 = 남(텔레토비 동산) */
    for(const sgn of[-1,1])for(let t=(i===0?9:0);t<l-(i===G.length-2?3:0);t+=2.6){const d=acc+t;if(Math.abs(d-51)<4||(sgn<0&&d<16))continue;if(rnd()<.12)continue;
      const o=sgn*(2.35+rnd()*.2),c=[a[0]+ux*(t+1.3)+nx*o,a[1]+uz*(t+1.3)+nz*o],g=H(...c),h=.45+rnd()*.35,k=.19+rnd()*.07,w=.9+rnd()*.35;BX(c,ux,uz,2.7,w,g-.3,g+h,[k*.95,k*1.7,k],-w/2)}
    for(let t=4;t<l;t+=8){const c=[a[0]+ux*t-nx*1.85,a[1]+uz*t-nz*1.85],g=H(...c);if(Math.abs(acc+t-51)<3)continue;BX(c,1,0,.16,.16,g,g+.9,[.10,.10,.11],-.08);BX(c,1,0,.2,.2,g+.7,g+.85,[.95,.9,.7],-.1)}
    acc+=l}
   const A=[14.87,99.65],U=[.2934,.956],Nv=[.956,-.2934],mp=(t,o)=>[A[0]+U[0]*t+Nv[0]*o,A[1]+U[1]*t+Nv[1]*o];
   {let pv=null;for(let t=6;t<56;t+=2.4){const c=mp(t,3.45),g=H(...c),tp=[c[0],g+.62,c[1]];BX(c,U[0],U[1],.15,.15,g,g+.8,[.46,.31,.18],-.075);if(pv)for(const dy of[0,-.28]){quad(mesh,[pv[0],pv[1]+dy-.015,pv[2]],[tp[0],tp[1]+dy-.015,tp[2]],[tp[0],tp[1]+dy+.015,tp[2]],[pv[0],pv[1]+dy+.015,pv[2]],[.82,.82,.80]);quad(mesh,[tp[0],tp[1]+dy-.015,tp[2]],[pv[0],pv[1]+dy-.015,pv[2]],[pv[0],pv[1]+dy+.015,pv[2]],[tp[0],tp[1]+dy+.015,tp[2]],[.82,.82,.80])}pv=tp}}
   for(let t=9;t<50;t+=2.3){if(rnd()<.15)continue;const c=mp(t,-5.3-rnd()*.5),g=H(...c),k=.19+rnd()*.06;BX(c,U[0],U[1],2.4,1.4+rnd()*.6,g-.3,g+.6+rnd()*.5,[k*.95,k*1.7,k],-.8);if(rnd()<.35){const r=mp(t+1,-3.9),gr=H(...r),q=.6+rnd()*.12;BX(r,U[0],U[1],.9,.6,gr-.2,gr+.35,[q,q,q*.97],-.3)}}
   for(let t=6;t<54;t+=1.3){if(rnd()<.2)continue;const c=mp(t,6.55+rnd()*.2),g=H(...c),q=.72+rnd()*.1;BX(c,U[0],U[1],.8+rnd()*.5,.5,g-.2,g+.25+rnd()*.2,[q,q,q*.97],-.25)}}
