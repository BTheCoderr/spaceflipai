#!/usr/bin/env bash
# SpaceFlip Pro — start Metro for iPhone testing (keep this terminal open)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "SpaceFlip Pro dev server"
echo "========================"
echo "• Keep this terminal open while testing on iPhone"
echo "• iPhone must be on the same Wi‑Fi as this Mac"
echo "• If LAN fails, run: npm run dev:tunnel"
echo ""

if [[ ! -f .env ]]; then
  echo "⚠️  Missing .env — copy .env.example and add Supabase keys for Storage/DB tests."
  echo ""
fi

if [[ ! -f assets/icon.png ]]; then
  echo "Generating brand assets..."
  python3 scripts/generate-brand-assets.py
  echo ""
fi

exec npx expo start -c --lan
