# 지도 부품 — 내 사이트에 cukmap 지도 넣기

cukmap 지도를 다른 웹사이트에 넣고, 핀을 찍거나 특정 건물·층·강의실로 이동시킬 수 있어요.
축제 부스 안내, OT 강의실 안내, 동아리 위치 홍보, 게임처럼 지도를 쓰는 프로젝트를 지도를 새로 만들지 않고 만들 수 있어요.

예시: [`examples/kit-demo/index.html`](../examples/kit-demo/index.html) (강의실 안내)

코딩이 처음이라면 [시작 안내](START.md)부터 보세요. AI에게 부탁하는 법과 인터넷에 올리는 법이 있어요.
지도 없이 목록과 위치만 필요하면 [자료 바로 받기](START.md#b-자료-바로-받기)를 쓰세요.

## 1. 가장 짧은 예

```html
<div id="map" style="height:500px"></div>
<script src="https://cukmap.com/kit/v1/cukmap.js"></script>
<script>
  CUKmap.create('#map', { view: '2d' }).then(map => {
    map.addPin({ room: 'N301', label: 'OT 장소' });
    map.focus({ room: 'N301' });
  });
</script>
```

## 2. 지도 만들기

`CUKmap.create(자리, 설정)` → 지도가 준비되면 `map`을 돌려줘요.

| 설정 | 뜻 | 예 |
|---|---|---|
| `view` | 처음 보기: `'3d'` 입체, `'2d'` 평면(층별 평면도), `'walk'` 지상 시점 | `'2d'` |
| `focus` | 처음에 보여 줄 건물 | `'니콜스관'` |
| `floor` | 처음에 보여 줄 층(focus와 함께) | `'3F'` |
| `ui` | `false`면 확대 버튼·미니맵을 숨김 | `false` |
| `select` | `false`면 건물을 눌러도 기본 지도가 건물을 고르지 않음(카메라가 움직이지 않음). 누르기를 직접 다룰 때 | `false` |
| `src` | 고정판을 쓸 때 그 파일 주소(아래 5번) | |

건물은 코드(`'N'`), 영문 이름(`'nichols'`), 한글 이름(`'니콜스관'`) 모두 받아요. 목록은 `map.buildings()`로 볼 수 있어요.

## 3. 할 수 있는 것

| 명령 | 뜻 |
|---|---|
| `map.addPin({ id, room, label, color })` | 강의실에 핀. 실내 도면이 있는 건물의 호실 번호나 방 이름 |
| `map.addPin({ id, building, floor, label })` | 건물(층)에 핀 |
| `map.addPin({ id, x, z, label })` | 좌표에 핀. 좌표는 [cukmap.com/edit](https://cukmap.com/edit/)에서 찍으면 나와요 |
| `map.removePin(id)`, `map.clearPins()` | 핀 지우기 |
| `map.selectPin(id)` | 핀 강조 |
| `map.focus({ room })`, `map.focus({ building, floor })`, `map.focus({ x, z, zoom })` | 그곳으로 이동. 입체 보기에서는 `yaw`(바라보는 방향, 라디안), `pitch`(내려다보는 각도)도 줄 수 있어요 |
| `map.setView('3d' \| '2d' \| 'walk')` | 보기 바꾸기 |
| `map.walkAt({ x, z, look: { building } })` | 지상 시점으로 그 자리에 서서 건물(또는 `look: { x, z }`)을 바라보기 |
| `map.faces('니콜스관')` | 건물의 면(북·동·남·서, 면마다 약 4m 폭 세로 줄 수 `cols`)과 층 목록 |
| `map.paint([{ building, side, floor, col, color }])` | 건물 벽의 그 면·층(`col`을 주면 그 세로 줄 한 칸만)을 색으로 덮기(`color: null`이면 지우기). 기본 지도는 바뀌지 않아요 |
| `map.clearPaint()`, `map.showPaint(false)` | 칠 모두 지우기 / 잠깐 숨기기(원래 모습 보기) |
| `map.shape({ x0, z0, x1, z1, step, indoor })` | 그 범위의 지형 높이 격자와 건물 모양(외곽·바닥·꼭대기 높이). `indoor: '니콜스관'`이면 그 건물 실내(층별 벽·문·바닥·방 이름)도. 블록 세상처럼 나만의 화면을 만들 때 |
| `map.sheets({ buildings: ['니콜스관'] })` | 건물 외벽을 크게 꺾이는 모서리에서 잘라 펼친 「벽 도화지」 목록(길이·높이·층 선·꺾인 곳) |
| `map.sheetPaint(id, 그림주소, { front })` | 그 도화지에 그림(PNG 등 data URL)을 입히기. 기본은 벽에 바로 칠한 것처럼(기둥·차양이 앞에 남음), `front: true`면 튀어나온 것보다 앞에 현수막처럼 걸어요 |
| `map.showSheets(false)`, `map.showSheets(true, { blank: true })` | 도화지 잠깐 숨기기(원래 모습 보기) / 그림 없는 벽을 흰 도화지로 보이기. 그림의 투명한 부분으로는 원래 벽이 보여요. 입체 보기에서 벽을 누르면 클릭 알림에 `e.sheet`, `e.su`(가로 m), `e.sv`(높이 m) |
| `map.buildings()` | 건물 목록 `[{ id, code, name, floors, indoor: [층...] }]` |
| `map.on('click', e => …)` | 지도를 누르면 `e.x`, `e.z`, `e.building`, `e.floor`. 입체 보기에서 건물 벽을 누르면 `e.side`(면), `e.level`(층), `e.col`(세로 줄)도 |
| `map.on('pinClick', e => …)` | 핀을 누르면 `e.id` |

모든 명령은 Promise를 돌려줘요. 찾을 수 없는 방·건물이면 오류 메시지와 함께 실패해요.

평면 지도에서 층이 있는 핀은 그 층을 보고 있을 때만 보여요.

## 4. 내 프로젝트와 기본 지도는 섞이지 않아요

핀, 설명, 일정 같은 **내 프로젝트의 내용은 내 사이트에만** 있어요. 기본 지도(건물·길·출입구)는 건드리지 않아요.
작업하다 기본 지도 자체의 오류를 발견하면 [오류 제보](https://cukmap.com/edit/)나 GitHub로 고쳐 주세요. 모두에게 도움이 돼요.

## 5. 최신판과 고정판

- **최신판** (`https://cukmap.com/kit/v1/cukmap.js`): 기본 지도가 고쳐지면 자동으로 따라 바뀌어요. 이름·위치가 고쳐지는 정도로는 내 프로젝트가 꼬이지 않게, `v1`의 명령 모양은 바꾸지 않아요. 크게 바뀌어야 하면 `v2`를 새로 내고 `v1`은 남겨 둬요.
- **고정판**: 축제처럼 기간이 정해진 프로젝트라 지도가 바뀌면 곤란하다면, [GitHub 릴리스](https://github.com/cukmap/map/releases)에서 그 시점의 지도 파일(`embed`)을 내려받아 내 사이트에 같이 올리고 `src`로 그 주소를 알려 주세요. 그 시점 그대로 멈춰 있어요.

## 6. 알아 둘 것

- 지도는 `iframe`으로 들어가요. 높이를 정해 준 자리에 넣어 주세요.
- 실내 도면이 있는 건물은 학생미래인재관, 니콜스관, 김수환관, 중앙도서관, 콘서트홀, 밤비노관이에요.
- 지도 아래쪽의 「cukmap · 자료 출처」 표시는 지우지 말아 주세요(OpenStreetMap 등 출처 표시 조건).
