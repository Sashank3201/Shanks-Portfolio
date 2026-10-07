#!/bin/bash
# SessionStart hook for Claude Code cloud sessions: installs dependencies so lint,
# typecheck, unit tests and Playwright E2E work immediately. No-op on local machines.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

# Use the pnpm version pinned in package.json#packageManager when corepack is available.
if command -v corepack >/dev/null 2>&1; then
  corepack enable >/dev/null 2>&1 || true
fi

# `pnpm install` (not frozen) so the cached container state can be reused between sessions.
pnpm install --prefer-offline

if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  echo 'export NEXT_TELEMETRY_DISABLED=1' >> "$CLAUDE_ENV_FILE"
  # Cloud containers ship a Chromium build; point Playwright at it instead of downloading.
  if [ -x /opt/pw-browsers/chromium ]; then
    echo 'export PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/opt/pw-browsers/chromium' >> "$CLAUDE_ENV_FILE"
  fi
fi
