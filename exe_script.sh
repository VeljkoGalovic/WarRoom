#!/usr/bin/env bash

# Load standard user binary paths on Fedora/Linux
export PATH="$PATH:$HOME/.local/bin:$HOME/.npm-global/bin"

# Load NVM if present
[ -s "$HOME/.nvm/nvm.sh" ] && \. "$HOME/.nvm/nvm.sh"

# Determine executable command
if command -v claude &> /dev/null; then
    CLAUDE_EXEC="claude"
else
    CLAUDE_EXEC="npx @anthropic-ai/claude-code"
fi

echo "Using Claude CLI executable: $CLAUDE_EXEC"

while true; do
  $CLAUDE_EXEC --dangerously-skip-permissions "Read IMPLEMENTATION_PLAN.md. Find the first uncompleted task (- [ ]). Implement it completely, test it, mark it as completed (- [x]), commit the changes with a clear git message, and then terminate this session." || break
done
