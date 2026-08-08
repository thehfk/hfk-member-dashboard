#!/usr/bin/env bash
# Prompts for password (never printed), builds encrypted index.html, commits, and pushes.
# Usage: ./deploy.sh
set -euo pipefail

cd "$(dirname "$0")"

# Prompt password twice on first build; single prompt on rebuild
if [ ! -f index.html ]; then
  read -r -s -p "새 비밀번호 (최소 6자): " PW1; echo
  read -r -s -p "비밀번호 다시:           " PW2; echo
  if [ "$PW1" != "$PW2" ]; then
    echo "❌ 비밀번호가 일치하지 않습니다." >&2
    exit 1
  fi
  if [ "${#PW1}" -lt 6 ]; then
    echo "❌ 비밀번호는 6자 이상이어야 합니다." >&2
    exit 1
  fi
  PW="$PW1"
  unset PW1 PW2
else
  echo "이미 index.html이 있습니다. 비밀번호를 바꾸려면 index.html을 지운 뒤 다시 실행."
  read -r -s -p "현재 비밀번호: " PW; echo
fi

export DASHBOARD_PW="$PW"
unset PW
node build.mjs
unset DASHBOARD_PW

# Commit + push
git add -A
if git diff --cached --quiet; then
  echo "변경 사항 없음. push 스킵."
else
  git commit -m "deploy: $(date +%Y%m%d-%H%M%S)" >/dev/null
  git push
  echo "✅ 배포 완료. Pages 반영까지 약 1분 걸립니다."
fi
