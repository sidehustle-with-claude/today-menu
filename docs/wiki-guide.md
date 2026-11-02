# LLM 위키 쓰는 법

56장에서 만든 작은 위키입니다. 이 저장소의 루트에 있습니다.

## 서랍 두 개

| 서랍 | 담는 것 | 판단 질문 |
| --- | --- | --- |
| `knowledge/` | 남의 프로젝트에도 참인 사실 | 다른 사람도 이 함정에 빠지나? |
| `decisions/` | 우리가 정한 것 | 내가 그렇게 하기로 한 건가? |

- `decisions/_global/`은 모든 프로젝트에 같이 적용되는 결정입니다.
- `decisions/today-menu/`는 이 프로젝트 전용 결정입니다.
- 파일 이름에 교훈이 드러나게 짓습니다. 날짜는 이름에 넣지 않고 파일 안 `updated`에 적습니다.

## 문서 한 장

```markdown
---
type: knowledge
topic: api
status: active
updated: 2026-11-01
---

# 목록 API는 비어 있어도 200을 돌려준다

- 증상: ...
- 원인: ...
- 대처: ...
```

- `type`은 `knowledge` 또는 `decision`입니다.
- `status`는 `active` 또는 `retired`입니다.
- 결정 문서에는 이유를 꼭 한 줄 씁니다.
- 본문은 제목 아래 `- 줄`로 짧게 씁니다.
- 미결인 것은 기록하지 않습니다.
- 개인정보와 실제 키는 어떤 문서에도 쓰지 않습니다.

## 목차

`CATALOG.md`에 문서마다 한 줄을 더합니다. 문서를 새로 쓰면 목차에도 한 줄을 더합니다.

## 훅 둘

| 훅 | 파일 | 하는 일 |
| --- | --- | --- |
| SessionStart | `hooks/inject-decisions.sh` | 결정 제목만 컨텍스트에 넣는다. 폐기된 결정은 뺀다 |
| Stop | `hooks/ask-to-record.sh` | 세션마다 한 번만 "기록할 것이 있었나?" 하고 되묻는다 |

- 둘 다 `.claude/settings.json`에 걸려 있습니다.
- `SessionStart`의 `matcher`는 `startup|resume|clear|compact`입니다. 새 세션, 이어하기, `/clear`, 압축 뒤에 모두 결정이 다시 들어옵니다.
- `ask-to-record.sh`는 표시 파일(`$TMPDIR/wiki-asked-<세션번호>`)로 세션당 한 번만 막습니다. `SKIP_HARNESS=1`이면 건너뜁니다.
- 책은 `~/.claude/settings.json`에 `$HOME/my-wiki/...`로 걸라고 했지만, 이 저장소는 위키가 저장소 루트에 있어 프로젝트 설정에서 `$CLAUDE_PROJECT_DIR` 기준으로 겁니다. 다른 프로젝트에서도 이 결정을 쓰고 싶으면 위키를 따로 저장소로 떼고 `~/.claude/settings.json`에 건다.

## 폐기

낡은 문서는 지우지 않고 표시합니다.

```markdown
---
type: knowledge
topic: api
status: retired
superseded_by: knowledge/api/list-endpoint-returns-empty-items.md
updated: 2026-11-15
---
```

- `status: retired` 문서는 목차에서 빼거나 "폐기" 구역으로 옮깁니다.
- 새 문서에는 무엇을 대체하는지 한 줄 적습니다.
- 훅은 폐기된 결정을 넣지 않습니다.

## 정기 정리

한 달에 한 번 점검합니다. 사람이 읽는 판단(모순 찾기)은 클로드에게 시키고, 기계적으로 되는 부분은 스크립트가 합니다.

```bash
scripts/wiki-lint.sh
```

| 점검 | 누가 |
| --- | --- |
| 프론트매터 4개 항목, type과 폴더 일치 | 스크립트 |
| 목차와 파일이 서로 맞는지 | 스크립트 |
| 폐기 문서의 `superseded_by` | 스크립트 |
| 전화번호, 주민번호, 키 모양 문자열 | 스크립트 |
| 6개월 넘게 갱신되지 않은 문서(경고) | 스크립트 |
| 서로 모순되는 문서 | 클로드 |

- 이 일은 54장의 루틴으로 걸어 둘 수 있습니다.
- 스크립트가 잡는 키 모양은 대표적인 몇 가지뿐입니다. 올리기 전에 한 번 더 눈으로 봅니다.

## 스킬과의 구분

| 구분 | 스킬(55장) | 위키(56장) |
| --- | --- | --- |
| 담는 것 | 일하는 순서와 도구 | 알게 된 사실과 정한 결정 |
| 읽히는 때 | 관련 일을 시킬 때 | 세션이 시작되거나 검색할 때 |

## 사람 몫

- 저장소를 공개로 둘지 비공개로 둘지 정하는 일. 처음에는 비공개입니다.
