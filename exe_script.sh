#!/usr/bin/env bash
export PATH="$PATH:/usr/local/bin:/usr/bin:/bin:$HOME/.local/bin:$HOME/.npm-global/bin"
[ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh"

echo "=== DIAGNOSTICS ==="
which node || echo "Node.js not found in PATH"
which npx || echo "npx not found in PATH"

while true; do
  npx --yes @anthropic-ai/claude-code --dangerously-skip-permissions \
    "Read IMPLEMENTATION_PLAN.md. Find the first uncompleted task (- [ ]). Implement it completely, test it, mark it as completed (- [x]), commit the changes with a clear git message, and then terminate this session."
  sleep 5
done
