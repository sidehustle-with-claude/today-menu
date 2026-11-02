# MCP 서버 등록 기록

서버 등록은 내 컴퓨터의 클로드 코드 설정에 저장되므로 저장소 파일은 거의 늘지 않습니다.
이 파일은 7장에서 어떤 서버를 어떻게 붙였는지 남겨 두는 메모입니다.

## context7 (라이브러리 최신 문서)

```bash
claude mcp add --transport http context7 https://mcp.context7.com/mcp
claude mcp list
```

- 연결 확인: `claude mcp list` 또는 클로드 코드 안의 `/mcp`
- 쓰는 법: 질문 끝에 `use context7`을 붙인다.
- 키와 토큰은 파일에 쓰지 않고 환경변수로 넘긴다.
- 출처를 모르는 서버는 설치하지 않는다.
- 안 쓰는 서버는 `/mcp`에서 끄거나 `claude mcp remove context7`로 지운다.
