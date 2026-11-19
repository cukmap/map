# cukmap으로 내 프로젝트 시작하기 — 코딩을 몰라도 괜찮아요

키스톤디자인처럼 학교 공간을 다루는 프로젝트라면, 지도를 새로 만들지 않고 cukmap을 가져다 쓸 수 있어요.
OT 강의실 안내, 축제 부스 지도, 다회용컵 반납함·휴게 공간 위치, 게임처럼 **길 찾기가 아니어도 지도가 필요한 곳**이면 어디든요.

## 이것만 지키면 돼요

- 지도 안의 **「cukmap · 자료 출처」 표시를 지우지 않으면** 자유롭게 써요. 수업 과제든, 동아리든, 개인 프로젝트든 괜찮아요.
- 자료(`/data/`)를 따로 내려받아 쓰면 화면 어딘가에 `자료: cukmap.com, © OpenStreetMap contributors`를 적어 주세요.
- 학교 공식 사이트처럼 보이게 만들지 않아요. 로그인·결제·개인정보를 받는 기능은 만들지 않아요.

## 어떤 방법이 맞을까

| 하고 싶은 것 | 방법 |
|---|---|
| 내 페이지에 지도를 넣고 핀을 찍기 | **A. 지도 부품** |
| 지도는 필요 없고 건물·장소·출입구 목록과 위치만 필요 | **B. 자료 바로 받기** |
| 지도 자체가 틀렸어요 | [오류 제보](https://cukmap.com/edit/) (로그인 없이) |

## A. 지도 부품 — 3단계

### 1. AI에게 페이지를 만들어 달라고 해요

Claude, ChatGPT 같은 AI에게 아래처럼 부탁하면 돼요. `[ ]` 안만 내 프로젝트에 맞게 바꿔요.

```
cukmap 지도 부품을 쓰는 웹페이지(index.html 한 파일)를 만들어 줘.
사용법 문서: https://github.com/cukmap/map/blob/main/docs/KIT.md
- 내용: [신입생 OT 강의실 안내. 학과를 고르면 그 강의실에 핀이 찍히고 지도가 이동해]
- 핀 목록: [국어국문학과 N301, 경영학과 B338, ...]
- 처음 보기: [평면 지도(2d)]
지도 아래쪽 「cukmap · 자료 출처」 표시는 지우지 마.
```

강의실은 호실 번호(`N301`)로, 건물은 이름(`니콜스관`)으로 찍을 수 있어요. 실내 도면이 없는 곳은 [cukmap.com/edit](https://cukmap.com/edit/)에서 위치를 누르면 좌표가 나와요. 그 좌표를 AI에게 함께 알려 주세요.

받은 `index.html`을 내 컴퓨터에서 더블클릭해 열어 보고, 마음에 들 때까지 AI와 고쳐요.

### 2. 인터넷에 올려요 (GitHub Pages, 무료)

1. [github.com](https://github.com)에 가입해요.
2. 오른쪽 위 **＋ → New repository** → 이름(예: `ot-guide`) → **Public** → **Create repository**
3. **uploading an existing file**을 눌러 `index.html`을 끌어다 놓고 **Commit changes**
4. 저장소 **Settings → Pages** → Branch를 **main**으로 → **Save**
5. 1~2분 뒤 `https://내아이디.github.io/ot-guide/`에서 열려요.

### 3. `이름.cukmap.com` 주소를 받아요 (선택)

1. [cukmap/map 저장소의 subdomains 폴더](https://github.com/cukmap/map/tree/main/subdomains)에서 **Add file → Create new file**
2. 파일 이름을 `ot.json`처럼 원하는 주소로 하고, 아래 내용을 내 것으로 바꿔 붙여 넣어요.
   ```json
   {
     "target": "https://내아이디.github.io/ot-guide/",
     "title": "OT 강의실 안내",
     "description": "학과별 신입생 OT 강의실을 지도에서 찾아요.",
     "team": "2026-2 키스톤디자인 ○반 ○조",
     "github": "내GitHub아이디"
   }
   ```
3. **Commit changes → Propose changes → Create pull request**
4. 자동 검사가 이름·주소·주인을 확인해요. 빨간 표시가 뜨면 **Details**를 눌러 무엇이 틀렸는지 보고 고쳐요.
5. 합쳐지면 몇 분 뒤 `ot.cukmap.com`이 열리고, [활용 프로젝트 목록](https://cukmap.com/projects/)에도 올라가요.

자세한 규칙은 [하위 주소 신청 안내](../subdomains/README.md)에 있어요.

## B. 자료 바로 받기

지도를 그리지 않고 목록과 위치(위도·경도)만 필요할 때 써요. 다른 사이트에서 바로 불러올 수 있어요.

| 주소 | 내용 |
|---|---|
| `https://cukmap.com/data/v1/buildings.json` | 건물: 이름, 코드, 층수, 중심 위치, 외곽선 |
| `https://cukmap.com/data/v1/places.json` | 장소: 정문·광장·운동장 등 이름과 위치 |
| `https://cukmap.com/data/v1/entrances.json` | 출입구: 이름, 건물, 층, 위치 |

위치는 `[위도, 경도]`라서 카카오맵·구글 지도 좌표와 같은 방식이에요. AI에게 "이 주소의 JSON을 불러와서 ○○해 줘"라고 부탁하면 돼요.

## 막히면

- 사용법 전체: [지도 부품 안내](KIT.md)
- 예시 페이지: [강의실 안내 예시](../examples/kit-demo/index.html)
- 질문: [GitHub 이슈](https://github.com/cukmap/map/issues)에 남겨 주세요.
