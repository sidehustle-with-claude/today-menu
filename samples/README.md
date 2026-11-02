# samples

- `weather.mock.json`, `places.mock.json`: 가상 응답입니다. 실제 기관의 응답이 아니며, `MOCK_TOOLS=1` 일 때 툴 함수가 읽습니다. 응답 모양은 공식 문서의 필드 이름(`T1H`, `PTY`, `title`, `addr1`, `tel`)을 따라 만든 것이라 실제 응답과 다를 수 있습니다.
- 실제 키로 처음 호출한 응답 원본은 `SAVE_SAMPLES=1` 로 호출하면 `weather.raw.json`, `places.raw.json` 으로 저장됩니다. 이 파일들은 인증키가 들어 있지 않은 응답 본문이지만, 올리기 전에 직접 열어 확인합니다. 저장소에는 올리지 않게 `.gitignore` 에 넣어 두었습니다.
