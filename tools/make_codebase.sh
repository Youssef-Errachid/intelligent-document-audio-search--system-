#!/usr/bin/env bash
# Usage:
#   ./tools/make_codebase.sh            -> backend + frontend
#   ./tools/make_codebase.sh backend    -> backend only
#   ./tools/make_codebase.sh frontend   -> frontend only
set -euo pipefail

# Always run from the project root, no matter where you call the script from
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

TARGET="${1:-all}"

build() {
  local part="$1"
  echo "==> Building codebase_${part}.md"
  npx --yes ai-digest -i "$part" -o "codebase_${part}.md" --show-output-files sort
}

case "$TARGET" in
  backend)  build backend ;;
  frontend) build frontend ;;
  all)      build backend; build frontend ;;
  *)        echo "Unknown target: $TARGET (use backend | frontend | all)"; exit 1 ;;
esac

echo "Done."
