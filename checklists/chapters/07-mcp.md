## 7장 MCP로 바깥 도구 붙이기
요금제: Pro로 충분
선행 장: 2
사람 몫: 서비스 계정·키 발급, 로그인·권한 승인
요약
- MCP가 무엇이고 왜 쓰는지 설명할 수 있게 됩니다.
- 라이브러리 최신 문서를 가져오는 MCP 서버(context7)를 직접 등록하고 씁니다.
- 연결 상태를 확인하고, 안 쓰는 서버를 끊고, 위험한 서버를 가려내는 기준을 익힙니다.
체크리스트
- [ ] `claude mcp add --transport http context7 https://mcp.context7.com/mcp`로 등록했다
- [ ] `claude mcp list`와 `/mcp`에서 context7이 연결된 것을 확인했다
- [ ] `use context7`을 붙여 최신 문서를 근거로 한 답을 받았다
- [ ] 키와 토큰을 파일에 쓰지 않고 환경변수로 넘겼다
- [ ] 출처를 모르는 서버는 설치하지 않았다
- [ ] 안 쓰는 서버를 `/mcp`에서 끄거나 `claude mcp remove`로 지웠다
- [ ] `/context`로 MCP가 차지하는 맥락을 확인했다
- [ ] 로그인과 권한 승인은 내가 직접 했다
