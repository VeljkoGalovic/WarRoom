cat << 'EOF' > exe_script.sh
#!/usr/bin/env bash
cd "$(dirname "$0")"

while true; do
  echo "--- Starting Claude loop iteration at $(date) ---" >> agent.log
  npx --yes @anthropic-ai/claude-code --dangerously-skip-permissions \
    "Read IMPLEMENTATION_PLAN.md. Find the first uncompleted task (- [ ]). Implement it completely, test it, mark it as completed (- [x]), commit the changes with a clear git message, and then terminate this session." \
    >> agent.log 2>&1
  
  echo "Iteration finished. Sleeping 5 seconds..." >> agent.log
  sleep 5
done
EOF
