# 하위 주소 신청 (이름.cukmap.com)

cukmap 지도를 활용한 프로젝트라면 누구나 `이름.cukmap.com` 주소를 받을 수 있어요. 자동 검사(이름·주소·주인 확인)를 통과한 신청이 합쳐지면 연결돼요. 처음이라면 [시작 안내](../docs/START.md)를 따라 하세요.

## 신청 순서

1. 내 프로젝트를 먼저 인터넷에 올려요. GitHub Pages, Cloudflare(Pages·Workers), Vercel, Netlify 중 아무 곳이나 괜찮아요.
2. 이 폴더에 `원하는이름.json` 파일을 새로 만들어 수정 제안(pull request)을 보내요. GitHub 웹에서 **Add file → Create new file**로 만들 수 있어요.
3. 자동 검사를 통과하면 합쳐지고, 몇 분 뒤 `원하는이름.cukmap.com`이 내 프로젝트로 연결돼요.
4. 프로젝트 목록([cukmap.com/projects](https://cukmap.com/projects/))에도 자동으로 올라가요.

## 파일 모양

파일 이름이 곧 주소예요. `ot.json` → `ot.cukmap.com`

```json
{
  "target": "https://내아이디.github.io/ot-guide/",
  "title": "OT 강의실 안내",
  "description": "학과별 신입생 OT 강의실을 지도에서 찾아요.",
  "team": "2026-2 키스톤디자인 ○반 ○조",
  "github": "내GitHub아이디"
}
```

| 항목 | 규칙 |
|---|---|
| 파일 이름 | 영문 소문자·숫자·`-`, 2~30자. 이미 있는 이름은 쓸 수 없어요(먼저 신청한 사람이 가져요) |
| `target` | 내 프로젝트 주소. `https://`로 시작하고 github.io, pages.dev, workers.dev, vercel.app, netlify.app 중 하나 |
| `title` | 프로젝트 이름, 40자까지 |
| `description` | 한두 줄 설명, 200자까지 |
| `team` | 만든 사람·팀 |
| `github` | 신청하는 사람의 GitHub 아이디. 나중에 이 파일을 고칠 수 있는 사람이에요 |

## 지켜 주세요

- 학교 공식 사이트처럼 보이게 만들지 않아요. 누가 만든 프로젝트인지는 각자 페이지에 표시해 주세요.
- 지도 부품을 쓰면 지도 아래 자료 출처 표시는 지우지 말아 주세요.
- 로그인·결제·개인정보를 받는 기능은 만들지 않아요.
- 끝난 프로젝트는 파일을 지워 주세요. 그 이름은 다른 사람이 다시 쓸 수 있어요.
- 문제가 있는 하위 주소는 [이슈](https://github.com/cukmap/map/issues)로 알려 주세요.
