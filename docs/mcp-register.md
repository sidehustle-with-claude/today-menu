# MCP 서버로 등록하기

툴 함수는 `src/tools-impl.ts` 한 곳에 있고, 문이 둘입니다. 웹 서비스 쪽은 `src/ask.ts`, 클로드 코드 쪽은 `src/mcp-server.ts` 입니다.

## 등록

```
claude mcp add --env DATA_GO_KR_KEY=여기에-키 --transport stdio \
  today-menu -- npx tsx src/mcp-server.ts
claude mcp list
```

- 키 없이 흐름만 보려면 `--env MOCK_TOOLS=1` 을 줍니다.
- `claude mcp list` 에서 `Connected` 가 보이면 연결된 것입니다. 클로드 코드 안에서는 `/mcp` 로 상태를 봅니다.
- 팀과 공유하려면 `--scope project` 를 붙입니다. `.mcp.json` 이 만들어지니 키는 거기에 쓰지 말고 환경변수 참조(`${DATA_GO_KR_KEY}`)로 둡니다.

## 확인

- 클로드 코드에서 "today-menu 툴로 새솔동 날씨 알려 줘"라고 시킵니다.
- MCP 패키지 이름은 SDK 버전에 따라 다릅니다. 이 저장소는 `@modelcontextprotocol/server` 를 씁니다. 이전 버전은 `@modelcontextprotocol/sdk` 였습니다.
