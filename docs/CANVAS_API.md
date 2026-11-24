# canvas 서버 (/api/canvas)

canvas.cukmap.com(벽 그림 시안)이 쓰는 저장소예요. 코드는 `worker/canvas.js`, 퀴즈는 `tools/make_canvas_quiz.py`가 만드는 `worker/canvas-quiz.js`에 있어요.
표는 첫 요청 때 같은 D1(cukmap-db)에 `cv_` 이름으로 만들어져요.

## 사람 구분
- 가입 없음. 브라우저가 처음 만든 무작위 값을 `x-canvas-id` 머리글로 보내면, 서버는 해시만 저장해요.
- 학교 와이파이는 여러 사람이 같은 IP를 쓰기 때문에 IP로 나누지 않아요.

## 규칙(값은 `worker/canvas.js`의 `R`)
| 항목 | 값 |
|---|---|
| 물감 | 시간마다 6㎡씩 30㎡까지 저절로 참. 퀴즈 보상은 100㎡까지 쌓임 |
| 퀴즈(정답 있음) | 한 번만. 맞히면 바로 물감 5㎡ + 1점. 틀리면 정답과 설명을 보여 줌 |
| 현장 질문(정답 모름) | 같은 답 3명 이상, 전체의 2/3 이상이면 확정. 같은 답을 낸 사람 모두 3점(다음 접속 때 들어옴) |
| 그림 | 한 번 입힐 때마다 새로 칠한 부분만 한 장(patch). 덮어쓰기는 위에 새로 칠하는 것 |
| 신고 | 「부적절해요」 3번이면 그 한 장(또는 소품)만 숨김 |
| 소품 | 트리 5점, 눈사람 3점, 가로등 장식 2점, 선물 상자 1점. 반지름 4m 안 3개, 한 사람 10개까지 |
| 날씨 | 10점. 모두의 화면이 바뀌고 한 시간 동안 아무도 못 바꿈 |

## 주소
| 요청 | 하는 일 |
|---|---|
| `GET /api/canvas/state?since=ID` | 새 그림 목록, 숨긴 그림, 소품, 날씨, 소식, 내 물감·점수 |
| `GET /api/canvas/patch/ID.png` | 그림 한 장 |
| `POST /api/canvas/me` `{name}` | 닉네임 |
| `POST /api/canvas/patches` `{sheet,x,y,w,h,area,front,png,label}` | 그림 올리기(물감 차감) |
| `POST /api/canvas/flag` `{kind:'patch'|'prop',id}` | 신고 |
| `GET /api/canvas/quizzes`, `POST /api/canvas/quiz` `{id,choice}` | 퀴즈 |
| `POST /api/canvas/answer` `{qkey,value}`, `GET /api/canvas/answers`, `GET /api/canvas/confirmed` | 현장 질문 |
| `POST /api/canvas/props` `{type,x,z,rot}`, `DELETE /api/canvas/props/ID` | 소품 |
| `POST /api/canvas/weather` `{kind}` | 날씨(clear, snow, rain, night, sunset) |
| `GET /api/canvas/ranking` | 많이 그린 사람·꾸민 사람·확인한 사람 |

## 운영진 꾸미기
Cloudflare 설정에 비밀 값 `CANVAS_ADMIN`을 넣고, 요청 머리글 `x-canvas-admin`에 같은 값을 보내면 물감·점수·날씨 대기 시간 없이 꾸밀 수 있어요(발표 전 크리스마스 꾸미기용). 값을 넣지 않으면 이 기능은 꺼져 있어요.

## 다른 곳에서 부를 때
`cukmap.com`과 `*.cukmap.com`, `cukmap.github.io`, `localhost`에서만 부를 수 있어요(CORS).
