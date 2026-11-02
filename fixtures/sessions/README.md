# 가상 세션 기록 (시험용)

`-fake-project/` 아래의 jsonl은 책의 스크립트를 시험하려고 지어낸 가짜 기록입니다. 실제 대화가 아닙니다.
이메일과 전화번호도 가짜입니다(`example.com`, 예시 번호).
도구 결과 줄, `isMeta` 줄, 깨진 줄, 필드가 없는 줄을 일부러 섞어 두었습니다.

```bash
python3 scripts/extract-my-messages.py --root fixtures/sessions --out /tmp/my-messages.tsv
python3 scripts/count-corrections.py /tmp/my-messages.tsv
```

내 진짜 기록(`~/.claude/projects`)은 저장소에 올리지 않습니다.
