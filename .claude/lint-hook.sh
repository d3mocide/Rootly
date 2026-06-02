#!/usr/bin/env bash
# PostToolUse hook — runs the appropriate linter after any file edit.
# Called by Claude Code after Edit or Write tool use.
# Output on failure is shown as feedback to Claude so errors are fixed immediately.

set -euo pipefail

REPO="/home/user/Rootly"

# Parse the edited file path from CLAUDE_TOOL_INPUT (JSON)
FILE=$(echo "${CLAUDE_TOOL_INPUT:-}" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('file_path',''))" 2>/dev/null || true)

if [[ -z "$FILE" ]]; then
  exit 0
fi

ERRORS=""

if [[ "$FILE" == *.py ]]; then
  RESULT=$(cd "$REPO/api" && flake8 . --max-line-length=120 --exclude=__pycache__,alembic/versions 2>&1 || true)
  if [[ -n "$RESULT" ]]; then
    ERRORS="Python (flake8):\n$RESULT"
  fi
elif [[ "$FILE" == *.ts || "$FILE" == *.tsx ]]; then
  RESULT=$(cd "$REPO" && npm run lint --silent 2>&1 || true)
  if [[ -n "$RESULT" && "$RESULT" != *"0 problems"* ]]; then
    ERRORS="TypeScript (eslint):\n$RESULT"
  fi
fi

if [[ -n "$ERRORS" ]]; then
  echo -e "Lint errors found — fix before committing:\n\n$ERRORS" >&2
  exit 1
fi

exit 0
