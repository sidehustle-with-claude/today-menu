#!/bin/bash
jq -n '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "ask",
    permissionDecisionReason: "강제 푸시입니다. 정말 실행할까요?"
  }
}'
