import json,base64,io,re,os
from PIL import Image
src=open('/home/claude/v24/dist/index.html',encoding='utf-8').read()
order=['mirae','nichols','kimsuhwan','library','concert','bambino']
bs=[]
for k in order:
    d=json.load(open(f'/home/claude/multi/out/{k}/{k}.json'))
    for f in d['floors']:
        b64=f['tex'].split(',',1)[1];im=Image.open(io.BytesIO(base64.b64decode(b64))).convert('RGBA')
        bg=Image.new('RGBA',im.size,(246,244,238,255));bg.alpha_composite(im)
        w,h=bg.size;sc=min(1.0,2048/max(w,h));
        if sc<1:bg=bg.resize((int(w*sc),int(h*sc)),Image.LANCZOS)
        bio=io.BytesIO();bg.convert('RGB').save(bio,'JPEG',quality=80);f['tex']='data:image/jpeg;base64,'+base64.b64encode(bio.getvalue()).decode()
    d.pop('reg',None);bs.append(d)
IND=json.dumps({'buildings':bs},ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
i=src.rindex('<script>');j=src.index('</script>',i);js=src[i+8:j]
def sub(a,b,cnt=1):
    global js
    assert js.count(a)==cnt,(a,js.count(a));js=js.replace(a,b)
sub("for(let idx=0;idx<B.length;idx++){let b=B[idx],","for(let idx=0;idx<B.length;idx++){if(idx)B[idx-1]._rg=[B[idx-1]._m0,mesh.length/11,B[idx-1]._r0,roofMesh.length/11];B[idx]._m0=mesh.length/11;B[idx]._r0=roofMesh.length/11;let b=B[idx],")
sub("// Unverified IH / dorm-like high tower","B[B.length-1]._rg=[B[B.length-1]._m0,mesh.length/11,B[B.length-1]._r0,roofMesh.length/11];\n// Unverified IH / dorm-like high tower")
sub("renderObj(build,camera.mvp,3);","renderSkip(build,camera.mvp,3,'m');")
sub("renderObj(roofObj,camera.mvp,2)","renderSkip(roofObj,camera.mvp,2,'r')")
sub("renderObj(roofObj,camera.mvp,0)","renderSkip(roofObj,camera.mvp,0,'r')")
sub("if(extObj)renderObj(extObj,camera.mvp,0);","if(extObj)renderObj(extObj,camera.mvp,0);renderIndoor();")
sub("pane.append(eye,h,p,btn)}","pane.append(eye,h,p,btn);indoorHook(b)}")
_k=js.rindex("wireV10Focus(()=>{const q=B.find");js=js[:_k]+open('indoor_v25.js').read()+"\n"+open('game_v27.js').read()+"\n"+js[_k:]
sub("if(!(globalThis.__netPick&&globalThis.__netPick(e)))pick(e)","if(!(globalThis.__gamePick&&globalThis.__gamePick(e))&&!(globalThis.__netPick&&globalThis.__netPick(e)))pick(e)")
sub("const max=held.shift?6.5:2.6,","const max=6.5,")
out=src[:i]+'<script id="indoor" type="application/json">'+IND+'</script>'+'<script>'+js+src[j:]
out=out.replace('실내 지도 준비 중','실내 6개 동 · 길찾기 연동').replace('실외 캠퍼스 맵 · v24','실외+실내 캠퍼스 맵 · 길찾기 스피드런 시안 · v27').replace('SONGSIM ATLAS · 성심교정 실외 지도 v24','cukmap · 길찾기 스피드런 시안')
os.makedirs('/home/claude/v27',exist_ok=True)
out=out.replace('<button id="tabR">길찾기</button>','<button id="tabR" style="display:none">길찾기</button>').replace('WASD 이동 · Shift 달리기 · 드래그 시선','WASD 이동 · 드래그 시선')
out=out.replace('<div class="brand">SONGSIM <span>ATLAS</span></div>','<div class="brand">cuk<span>map</span></div>')
import sys;sys.path.insert(0,'/home/claude/v24');import iwpatch
out=iwpatch.apply(out,open('/home/claude/v24/indoor_walk.js').read())
import unipatch
out=unipatch.apply(out,open('/home/claude/v24/lv_pre.js').read(),open('/home/claude/v24/unified.js').read())
import photopatch,andrea_v,treepatch,kstairpatch,shadowpatch
out=shadowpatch.apply(out)
import visualpatch
out=visualpatch.apply(out,open('/home/claude/v24/canopy.js').read())
import groundpatch
out=groundpatch.apply(out)
import cutpatch
out=cutpatch.apply(out)
import edgecut2 as edgecut
out=edgecut.apply(out)
_a="wireV10Focus(()=>{const q=B.find";_k=out.rindex(_a);out=out[:_k]+open('/home/claude/v24/gate.js').read()+"\n"+out[_k:]
out=kstairpatch.apply(out)
out=treepatch.apply(out)
out=andrea_v.apply(out)
out=photopatch.apply(out,open('/home/claude/v24/photo_pre.js').read(),open('/home/claude/v24/photo_post.js').read())
out=out.replace('<title>','<meta name="robots" content="noindex,nofollow"><title>',1)
import flatpatch,netfixpatch,walkpatch
import netnodes
out=walkpatch.apply(netnodes.apply(netfixpatch.apply(flatpatch.apply(out))))  # campatch(카메라 충돌) 되돌림 2026-11-02
import treefill,propspatch,labelpatch
out=labelpatch.apply(propspatch.apply(treefill.apply(out)))  # 2026-11-02 제3자 평가 반영
import kpatch
out=kpatch.apply(out)  # 2026-11-02 김수환관 외형 재구성
import kpatch2
out=kpatch2.apply(out)  # 2026-11-11 김수환관 2차
import htpatch
out=htpatch.apply(out)  # 2026-11-08 미카엘관 1층 열린 공간
import vpatch
out=vpatch.apply(out)  # 2026-11-08 비르투스관 3층·다리 통로
import answers26
out=answers26.apply(out)  # 2026-11-08 사용자 답변
import chpatch
out=chpatch.apply(out)  # 2026-11-10 콘서트홀 사진
import shpatch
out=shpatch.apply(out)  # 2026-11-10 성심관 사진
import mpatch
out=mpatch.apply(out)  # 2026-11-10 마리아·니콜스·비르투스·밤비노 사진
import roofpatch
out=roofpatch.apply(out)  # 2026-11-08 옥상 모델링
import ctlpatch
out=ctlpatch.apply(out)  # 2026-11-08 마우스 조작 부드럽게
import gradepatch
# out=gradepatch.apply(out)  # 2026-11-11 되돌림
import andrea2
out=andrea2.apply(out)  # 2026-11-11 안드레아관 인터넷 사진
import cleanpatch
out=cleanpatch.apply(out)  # 2026-11-11 자동 점검 정리
import path3
out=path3.apply(out)  # 2026-11-11 길 3단계(고양이길·메이플로드)
import facadepatch
out=facadepatch.apply(out)  # 2026-11-08 공식 사진 외관
open('/home/claude/v27/index.html','w',encoding='utf-8').write(out);print(len(out)/1e6,'MB')
