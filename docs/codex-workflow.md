# Codex 와 같이 쓰기 (45장)

Codex 는 OpenAI 의 도구다. 클로드와 경쟁시키는 것이 아니라 잘하는 일을 나눈다.
기능은 빠르게 바뀌니 공식 문서를 먼저 확인한다.

- 설치와 사용: https://developers.openai.com/codex/cli
- 요금과 한도: https://developers.openai.com/codex/pricing
- 설치 명령은 인터넷에서 받은 스크립트를 바로 실행하는 형태다. 출처가 공식 페이지인지 주소를 눈으로 확인한 뒤 실행한다.
- ChatGPT 로그인은 사람이 한다.

## 역할 나누기

- 기능 개발, 리팩터링, 테스트 작성: 클로드
- 요약, 글쓰기, 문서: 클로드
- 이미지 생성: Codex
- 화면 조작: 스크립트가 먼저, 안 되면 Codex (43장의 순서)
- 코드 리뷰: 서로 교차

## 커밋 전 교차 리뷰

- 클로드로 작은 기능을 만들고 커밋하지 않은 채로 둔다.
- 같은 폴더의 새 터미널에서 `codex` 를 실행하고 `/review` 에서 "커밋 안 한 변경"을 고른다.
- 리뷰할 때는 "치명적 문제와 버그만"처럼 범위를 먼저 좁힌다.
- Codex 의 지적을 복사해 클로드에게 준다.

```text
다른 도구가 내 변경분을 리뷰해서 아래 지적을 줬어. 하나씩 읽고
(1) 맞는 지적인지, (2) 고쳐야 하는지 판단해 줘.
맞는 것만 고치고, 틀렸다고 보는 건 이유를 한 줄로 써 줘. 지적 전체를 그대로 따르지는 마.
[여기에 Codex 리뷰 붙여 넣기]
```

- 리뷰어가 항상 맞는 것은 아니다. 큰 변경은 내가 눈으로 확인한다.

## 아이콘 이미지

이미지 모델은 영어 설명으로 훈련된 비중이 큰 편이지만 모델마다 다르다. 한국어와 영어를 한 번씩 해 보고 정한다.
글자는 그림에 넣지 않는다. 글자가 필요하면 나중에 코드나 디자인 도구로 얹는다.

클로드에게 영어 프롬프트 초안을 쓰게 한다.

```text
'오늘 뭐 먹지' 웹 앱의 아이콘용 이미지 프롬프트를 영어로 3개 써 줘.
조건: 정사각형, 단순한 그림, 글자는 넣지 않기, 따뜻한 느낌, 작게 줄여도 알아볼 것.
각 프롬프트는 두 문장 이내.
```

이런 모양이 나오면 된다 (예시).

1. `Create a square app icon, a simple bowl with steam, warm colors, flat style, no text.`
2. `Create a square app icon, a pair of chopsticks resting on a round plate, soft orange background, minimal flat style, no text.`
3. `Create a square app icon, a friendly spoon and fork crossed over a small bowl, warm yellow tones, simple shapes that stay readable when small, no text.`

고른 프롬프트를 Codex 에게 준다.

```text
Create a square app icon, a simple bowl with steam, warm colors, flat style, no text. Save the result as assets/icon-draft.png
```

- 결과 파일은 `assets/icon-draft.png` 로 저장하게 한다. 이 저장소에는 실제 이미지를 넣지 않았다.
- 이미지 생성이 내 환경에서 되는지는 직접 확인한다.

## 같은 파일을 동시에 고치지 않기

아래 중 하나를 지킨다.

- 한 번에 한 도구만 쓴다. 가장 단순하다.
- 브랜치를 나눈다. 클로드는 `feature/favorite`, Codex 는 `fix/review` 에서 일한다.
- 작업 폴더를 나눈다. `git worktree` 는 같은 저장소를 폴더 하나 더에 펼쳐 주는 깃 기능이다.
- 리뷰 때는 읽기만 시킨다.

```bash
git worktree add ../today-menu-review review/codex
```

## 규칙 파일 하나로 맞추기

- 원본은 `AGENTS.md` 다. 빌드 명령, 코드 스타일, 하지 말 것을 여기에 쓴다.
- `CLAUDE.md` 는 `@AGENTS.md` 로 가져오고, 아래에 클로드 전용 규칙만 쓴다.
- OpenAI 공식 AGENTS.md 안내에는 다른 파일을 가져오는 문법이 없어서 이 방향으로 정했다.

## 한도가 차면 (자동 전환은 권하지 않는다)

- 한 계정의 한도를 다른 도구로 우회하는 구조가 약관에 맞는지 확신할 수 없다.
- 의도치 않게 다른 쪽 요금이 계속 나갈 수 있다.
- 규칙과 맥락이 다른 도구가 중간에 일을 이어받으면 엉뚱한 변경이 생긴다.
- 한도가 차면 쉬거나, 내가 눈으로 보고 일부러 바꾼다.

## 비용

- 클로드 요금제와 ChatGPT 요금제는 따로 결제한다. 같이 쓰면 월 비용이 합쳐진다.
- 매일 쓰기 전에 한 달 사용량을 한 번 확인한다.
