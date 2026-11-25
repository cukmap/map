// ---- 더 사실적인 화면(시험 중): 주소에 ?look=next 가 있을 때만 켜진다. 기본 지도는 그대로 ----
// 장면을 화면 대신 한 장의 그림(색 + 깊이)으로 그린 뒤, 마지막에 한 번 더 손질해서 화면에 낸다.
//  ① 주변 가림(AO): 벽과 땅이 만나는 곳, 건물 사이 좁은 곳을 살짝 어둡게 → 물체가 땅에 붙어 보임
//  ② 하늘: 지평선은 뿌옇고 위로 갈수록 파란 하늘 + 해 쪽 빛 번짐
//  ③ 공기 원근: 멀수록 하늘색으로 옅어짐
//  ④ 색 보정: 밝은 곳이 하얗게 날아가지 않게 누르고(ACES), 채도·따뜻함을 조금
//  ⑤ 계단 현상 줄이기(FXAA): 그림으로 그리면 기본 안티에일리어싱이 꺼지므로 대신 넣는다
//  ⑥ 질감: 나무 잎 뭉치·벽 얼룩·땅 얼룩을 위치 기반 잡음으로(50-renderer 셰이더, uNext)
// 깊이 그림(WEBGL_depth_texture)을 못 쓰는 기기에서는 아무것도 하지 않는다.
(()=>{
const want=(()=>{try{const q=new URLSearchParams(location.search);if(q.has('look'))return q.get('look')==='next';return localStorage.getItem('cukmap.look')==='next'}catch(_){return false}})();
globalThis.__LOOK=want?'next':'base';
if(!want)return;
const DT=gl.getExtension('WEBGL_depth_texture');if(!DT){console.warn('look=next: 깊이 그림을 못 써서 끕니다');globalThis.__LOOK='base';return}
let W=0,H=0,fb=null,ctex=null,dtex=null,afb=null,atex=null,inFrame=false,VP=null,IVP=null,EYE=[0,0,0];
const tex=(w,h,fmt,type)=>{const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,fmt,w,h,0,fmt,type,null);for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);return t};
const real=gl.bindFramebuffer.bind(gl);
// 장면을 그리는 동안 「화면」으로 돌아가라는 요청은 우리 그림으로 돌린다(그림자 지도처럼 다른 판을 쓰는 코드와 함께 쓰기 위해)
gl.bindFramebuffer=(t,f)=>real(t,f===null&&inFrame?fb:f);
function alloc(w,h){
  for(const o of [ctex,dtex,atex])if(o)gl.deleteTexture(o);for(const o of [fb,afb])if(o)gl.deleteFramebuffer(o);
  W=w;H=h;ctex=tex(w,h,gl.RGBA,gl.UNSIGNED_BYTE);dtex=tex(w,h,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT);
  gl.bindTexture(gl.TEXTURE_2D,dtex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
  fb=gl.createFramebuffer();real(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,ctex,0);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,dtex,0);
  atex=tex(Math.max(1,w>>1),Math.max(1,h>>1),gl.RGBA,gl.UNSIGNED_BYTE);afb=gl.createFramebuffer();real(gl.FRAMEBUFFER,afb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,atex,0);
  const ok=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;real(gl.FRAMEBUFFER,null);return ok;
}
const VS='attribute vec2 aP;varying vec2 vUv;void main(){vUv=aP*.5+.5;gl_Position=vec4(aP,0.,1.);}';
const COMMON=`precision highp float;varying vec2 vUv;uniform sampler2D uD;uniform mat4 uIVP;uniform mat4 uVP;uniform vec3 uEye;uniform vec2 uRes;
vec3 wpos(vec2 uv){float d=texture2D(uD,uv).r;vec4 p=uIVP*vec4(uv*2.-1.,d*2.-1.,1.);return p.xyz/p.w;}
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}`;
// ① 주변 가림: 반 크기로 계산. 화면에서 본 위치 주변 반구에 점 12개를 찍어 다른 물체 뒤에 숨는 비율을 센다
const AO=COMMON+`void main(){float d=texture2D(uD,vUv).r;if(d>.99999){gl_FragColor=vec4(1.);return;}
vec2 px=1./uRes;vec3 p=wpos(vUv);vec3 a=wpos(vUv+vec2(px.x,0.)),b=wpos(vUv+vec2(0.,px.y));vec3 n=normalize(cross(a-p,b-p));vec3 toE=uEye-p;if(dot(n,toE)<0.)n=-n;
float dist=length(toE),r=clamp(dist*.008,.35,1.8),occ=0.;float ang=hash(gl_FragCoord.xy)*6.2832;
vec3 t=normalize(abs(n.y)<.9?cross(n,vec3(0.,1.,0.)):cross(n,vec3(1.,0.,0.))),bt=cross(n,t);
for(int i=0;i<12;i++){float fi=float(i);float th=ang+fi*2.39996;float z=fract(fi*.618+.17);float s=sqrt(1.-z*z);float l=mix(.2,1.,fract(fi*.371+.11));l*=l;
 vec3 k=(t*cos(th)*s+bt*sin(th)*s+n*z)*r*l;vec3 q=p+n*.06+k;vec4 c=uVP*vec4(q,1.);if(c.w<=0.)continue;vec2 su=c.xy/c.w*.5+.5;if(su.x<0.||su.y<0.||su.x>1.||su.y>1.)continue;
 vec3 hp=wpos(su);float dq=length(uEye-q),dh=length(uEye-hp);if(dh<dq-.05){float range=smoothstep(0.,1.,r*1.6/max(.001,dq-dh));occ+=range;}}
float ao=1.-occ/12.;gl_FragColor=vec4(vec3(ao),1.);}`;
// ②~⑤ 마무리
const FIN=COMMON+`uniform sampler2D uC;uniform sampler2D uA;uniform vec3 uSun;uniform float uFocus;uniform float uAOon;
vec3 fxaa(vec2 uv){vec2 px=1./uRes;vec3 L=vec3(.299,.587,.114);vec3 cM=texture2D(uC,uv).rgb;
 float lM=dot(cM,L),lNW=dot(texture2D(uC,uv+vec2(-1.,-1.)*px).rgb,L),lNE=dot(texture2D(uC,uv+vec2(1.,-1.)*px).rgb,L),lSW=dot(texture2D(uC,uv+vec2(-1.,1.)*px).rgb,L),lSE=dot(texture2D(uC,uv+vec2(1.,1.)*px).rgb,L);
 float mn=min(lM,min(min(lNW,lNE),min(lSW,lSE))),mx=max(lM,max(max(lNW,lNE),max(lSW,lSE)));if(mx-mn<max(.0312,mx*.125))return cM;
 vec2 dir=vec2(-((lNW+lNE)-(lSW+lSE)),((lNW+lSW)-(lNE+lSE)));float red=max((lNW+lNE+lSW+lSE)*.03125,1./128.);float rc=1./(min(abs(dir.x),abs(dir.y))+red);dir=clamp(dir*rc,-8.,8.)*px;
 vec3 A=.5*(texture2D(uC,uv+dir*(1./3.-.5)).rgb+texture2D(uC,uv+dir*(2./3.-.5)).rgb);vec3 B=A*.5+.25*(texture2D(uC,uv-dir*.5).rgb+texture2D(uC,uv+dir*.5).rgb);float lB=dot(B,L);return (lB<mn||lB>mx)?A:B;}
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
vec3 sky(vec3 dir){float h=max(dir.y,0.);vec3 hor=vec3(.78,.87,.96),zen=vec3(.45,.66,.92);vec3 c=mix(hor,zen,pow(h,.55));float s=max(dot(dir,uSun),0.);c+=vec3(1.,.86,.62)*(pow(s,48.)*.45+pow(s,6.)*.08);if(dir.y<0.)c=mix(hor,vec3(.72,.83,.93),min(1.,-dir.y*2.5));return c;}
void main(){float d=texture2D(uD,vUv).r;vec3 col;
 if(d>.99999){vec4 f=uIVP*vec4(vUv*2.-1.,1.,1.);vec3 dir=normalize(f.xyz/f.w-uEye);gl_FragColor=vec4(sky(dir),1.);return;}
 else{col=fxaa(vUv);vec3 p=wpos(vUv);
  // 주변 가림을 깊이가 비슷한 이웃끼리만 흐려서 얼룩을 없앤다
  vec2 px=2./uRes;float dl=length(uEye-p),s=0.,wsum=0.;for(int i=-1;i<=1;i++)for(int j=-1;j<=1;j++){vec2 o=vec2(float(i),float(j))*px;float w=1./(1.+abs(length(uEye-wpos(vUv+o))-dl)*4.);s+=texture2D(uA,vUv+o).r*w;wsum+=w;}
  float ao=s/wsum;col*=mix(1.,ao,.6*uAOon);
  vec3 dir=normalize(p-uEye);float haze=(1.-exp(-max(0.,dl-uFocus)*.0009))*.5;col=mix(col,sky(normalize(vec3(dir.x,max(dir.y,.02),dir.z))),haze);}
 col=clamp(col*1.03,0.,1.);col=mix(col,col*col*(3.-2.*col),.3);float l=dot(col,vec3(.299,.587,.114));col=mix(vec3(l),col,1.14);col*=vec3(1.02,1.,.97);
 vec2 v=vUv-.5;col*=1.-dot(v,v)*.28;gl_FragColor=vec4(col,1.);}`;
let pa=null,pf=null,qb=null;
try{
  const mk=fs=>{const p=gl.createProgram();gl.attachShader(p,shader(gl.VERTEX_SHADER,VS));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,fs));gl.bindAttribLocation(p,0,'aP');gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(p));return p};
  pa=mk(AO);pf=mk(FIN);qb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,qb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
}catch(e){console.warn('look=next 셰이더 실패, 끕니다',e);globalThis.__LOOK='base';return}
function inv(m){const a=m,o=new Float32Array(16);const b00=a[0]*a[5]-a[1]*a[4],b01=a[0]*a[6]-a[2]*a[4],b02=a[0]*a[7]-a[3]*a[4],b03=a[1]*a[6]-a[2]*a[5],b04=a[1]*a[7]-a[3]*a[5],b05=a[2]*a[7]-a[3]*a[6],b06=a[8]*a[13]-a[9]*a[12],b07=a[8]*a[14]-a[10]*a[12],b08=a[8]*a[15]-a[11]*a[12],b09=a[9]*a[14]-a[10]*a[13],b10=a[9]*a[15]-a[11]*a[13],b11=a[10]*a[15]-a[11]*a[14];let det=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;if(!det)return null;det=1/det;
  o[0]=(a[5]*b11-a[6]*b10+a[7]*b09)*det;o[1]=(a[2]*b10-a[1]*b11-a[3]*b09)*det;o[2]=(a[13]*b05-a[14]*b04+a[15]*b03)*det;o[3]=(a[10]*b04-a[9]*b05-a[11]*b03)*det;o[4]=(a[6]*b08-a[4]*b11-a[7]*b07)*det;o[5]=(a[0]*b11-a[2]*b08+a[3]*b07)*det;o[6]=(a[14]*b02-a[12]*b05-a[15]*b01)*det;o[7]=(a[8]*b05-a[10]*b02+a[11]*b01)*det;o[8]=(a[4]*b10-a[5]*b08+a[7]*b06)*det;o[9]=(a[1]*b08-a[0]*b10-a[3]*b06)*det;o[10]=(a[12]*b04-a[13]*b02+a[15]*b00)*det;o[11]=(a[9]*b02-a[8]*b04-a[11]*b00)*det;o[12]=(a[5]*b07-a[4]*b09-a[6]*b06)*det;o[13]=(a[0]*b09-a[1]*b07+a[2]*b06)*det;o[14]=(a[13]*b01-a[12]*b03-a[14]*b00)*det;o[15]=(a[8]*b03-a[9]*b01+a[11]*b00)*det;return o}
let broken=false;
let marked=false;
globalThis.__PRE=(mvp,eye)=>{if(broken)return;if(!marked){marked=true;try{forest.__kind=1;build.__kind=2;roofObj.__kind=2;ter.__kind=3}catch(_){}}const w=canvas.width,h=canvas.height;if((w!==W||h!==H)&&!alloc(w,h)){broken=true;console.warn('look=next: 그림판을 만들지 못해 끕니다');return}
  VP=mvp;IVP=inv(mvp);EYE=eye;inFrame=true;real(gl.FRAMEBUFFER,fb);gl.viewport(0,0,W,H)};
const sun=(()=>{const v=[-.5,.72,.48],l=Math.hypot(...v);return v.map(x=>x/l)})();
function use(p,uv){gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,qb);for(let i=0;i<4;i++)gl.disableVertexAttribArray(i);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  const U=n=>gl.getUniformLocation(p,n);gl.uniformMatrix4fv(U('uIVP'),false,IVP);gl.uniformMatrix4fv(U('uVP'),false,VP);gl.uniform3fv(U('uEye'),EYE);gl.uniform2f(U('uRes'),uv[0],uv[1]);
  gl.activeTexture(gl.TEXTURE6);gl.bindTexture(gl.TEXTURE_2D,dtex);gl.uniform1i(U('uD'),6);return U}
// 느린 기기 보호: 처음 4초 동안 화면이 초당 22장보다 느리면 가장 무거운 주변 가림을 끈다
let aoOn=true,t0=0,tl=0,nf=0,slow=0;
globalThis.__POST=()=>{if(!inFrame)return;inFrame=false;if(!IVP){real(gl.FRAMEBUFFER,null);return}
  const now=performance.now();if(tl&&aoOn&&!document.hidden){const dt=now-tl;if(!t0)t0=now;if(now-t0<4000){nf++;if(dt>45)slow++}else if(nf>20&&slow/nf>.6){aoOn=false;console.info('look=next: 느린 기기라 주변 가림을 껐어요')}}tl=now;
  gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);
  if(aoOn){real(gl.FRAMEBUFFER,afb);gl.viewport(0,0,Math.max(1,W>>1),Math.max(1,H>>1));use(pa,[W/2,H/2]);gl.drawArrays(gl.TRIANGLES,0,6);}
  real(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,H);const U=use(pf,[W,H]);gl.activeTexture(gl.TEXTURE7);gl.bindTexture(gl.TEXTURE_2D,ctex);gl.uniform1i(U('uC'),7);gl.activeTexture(gl.TEXTURE4);gl.bindTexture(gl.TEXTURE_2D,atex);gl.uniform1i(U('uA'),4);gl.uniform3fv(U('uSun'),sun);gl.uniform1f(U('uAOon'),aoOn?1:0);const C=globalThis.__SA;gl.uniform1f(U('uFocus'),C&&C.mode==='walk'?60:C&&C.dist?C.dist*1.1:300);gl.drawArrays(gl.TRIANGLES,0,6);
  gl.activeTexture(gl.TEXTURE0);gl.enable(gl.DEPTH_TEST);gl.useProgram(program)};
})();
