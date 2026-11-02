# 아이폰에서 맥으로 옮기기 (44장)

## 준비 (사람 몫)

- 맥과 아이폰이 같은 Apple 계정이다.
- 둘 다 블루투스와 Wi-Fi 가 켜져 있고 Handoff(유니버설 클립보드)가 켜져 있다.
- 폰에서 복사한 글자가 맥에서 붙는지 먼저 확인한다.

## 인증번호

- 인증번호를 받아 복사하는 일은 사람이 한다. 클로드가 문자 앱이나 인증 앱을 읽지 않는다.
- 복사한 뒤 "복사함"이라고 말하면, 클로드가 `bash scripts/clipboard-otp.sh check` 로 6자리 숫자인지만 확인한다.
- 값은 대화에 찍지 않는다. 입력칸에 넣고 확인 버튼 앞에서 멈춘다.
- 쓴 뒤 `bash scripts/clipboard-otp.sh clear` 로 클립보드를 비운다.
- 재전송 버튼도 사람이 누른다. 짧은 시간에 여러 번 누르지 않는다.

## 키를 .env 에 넣기

```bash
bash scripts/save-clipboard-key.sh DATA_GO_KR_KEY
```

- 키를 먼저 복사하고 위 명령을 실행한다. 대화창에 키를 붙여 넣지 않는다.
- 같은 이름이 이미 있으면 덮어쓰지 않고 멈춘다.
- 화면에는 앞 4글자만 나오고, 끝나면 클립보드가 비워진다.
- `.env` 는 `.gitignore` 에 들어 있어야 하고, 클로드가 읽지 못하게 막혀 있다 (8장 훅).
- 코드에서는 `process.env.DATA_GO_KR_KEY` 처럼 이름으로만 읽는다.

## 사진

- 아이폰에서 에어드롭으로 보내면 맥의 `Downloads` 에 들어온다.
- `bash scripts/import-latest-photo.sh` 가 최신 사진 한 장을 `public/images/sample-N.jpg` 로 복사한다. 원본은 그대로 둔다.
- exiftool 이 있으면 복사본의 위치 정보(GPS)를 지운다. 없으면 공개 전에 직접 확인한다.

## 시험

```bash
bash tests/scripts/clipboard.test.sh
```

- 가짜 클립보드로 확인하므로 내 클립보드는 건드리지 않는다.

## 클립보드 기록 앱

- 클립보드 매니저를 쓰면 비밀번호 관리자에서 복사한 값을 기록하지 않게 설정한다.
