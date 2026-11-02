## 3장 Git이 뭔지와 되돌리기, GitHub, 커밋 자동화
요금제: Pro로 충분
선행 장: 2
사람 몫: GitHub 가입·2단계 인증, gh 로그인
요약
- 작업 중간중간 저장 지점(커밋)을 남기고, 망가뜨려도 이전 지점으로 되돌립니다.
- 내 코드를 GitHub에 올리고, 클로드에게 커밋, 푸시, PR을 맡깁니다.
- 비밀번호와 키가 실수로 올라가는 일을 막고, 푸시마다 자동 검사가 도는 장치를 만듭니다.
체크리스트
- [ ] `git --version` 으로 Git이 설치되어 있다
- [ ] `git config --global` 로 이름과 이메일을 등록했다
- [ ] `today-menu`에서 `git init` 하고 첫 커밋을 만들었다
- [ ] 일부러 망가뜨린 index.html을 `git restore` 로 되돌렸다
- [ ] `git revert` 로 커밋 하나를 취소해 봤다
- [ ] 커밋 메시지 규칙(접두어와 한국어 한 줄)을 CLAUDE.md에 적었다
- [ ] GitHub 가입과 로그인, 2단계 인증을 마쳤다 (사람 몫)
- [ ] `gh auth login` 을 마쳤다 (사람 몫)
- [ ] 비공개 저장소를 만들고 첫 푸시를 했다
- [ ] `.gitignore`에 .env와 키 파일을 넣었다
- [ ] 커밋 전 비밀 검사를 만들고 가짜 키로 테스트했다
- [ ] CLAUDE.md에 `push --force`와 `reset --hard`는 묻고 한다는 규칙을 넣었다
- [ ] `feature/favorite` 브랜치로 `gh pr create` PR을 만들고 합쳤다
- [ ] `.github/workflows/check.yml` 을 푸시하고 Actions 탭에서 초록 체크를 확인했다
