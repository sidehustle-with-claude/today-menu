# audio

받아쓰기에 쓰는 소리 파일을 두는 폴더입니다 (46장).

- `sample.m4a`: 폰 음성 메모를 에어드롭으로 받아 이 이름으로 둡니다. 깃에는 올리지 않습니다 (`.gitignore`).
- `script.txt`: 내가 읽은 원문입니다. 모델별 결과와 비교할 때 씁니다. 이 파일의 문장은 가상의 예시입니다.
- 긴 파일은 `bash scripts/split-audio.sh audio/long.m4a` 로 10분 단위로 잘라 `audio/parts/` 에 둡니다.
