# Bash loop execution script
while true; do
  claude --dangerously-skip-permissions "Read IMPLEMENTATION_PLAN.md. Find the first uncompleted task (- [ ]). Implement it completely, test it, mark it as completed (- [x]), commit the changes with a clear git message, and then terminate this session." || break
done
