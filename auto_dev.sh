#!/usr/bin/env bash
# auto_dev.sh - Autonomous execution loop with auto-recovery for Claude Code

set -u

# Maximum consecutive retry attempts on API failure/timeout
MAX_RETRIES=5
RETRY_DELAY=10

run_claude_phase() {
    local phase_name="$1"
    local initial_prompt="$2"
    local attempt=0
    local success=false

    echo "=========================================="
    echo "Starting Phase: $phase_name"
    echo "=========================================="

    # First run of the phase
    claude -p --dangerously-skip-permissions "$initial_prompt"
    if [ $? -eq 0 ]; then
        echo "Phase '$phase_name' completed successfully."
        return 0
    fi

    # Auto-resume loop if an error or timeout occurs
    while [ $attempt -lt $MAX_RETRIES ]; do
        attempt=$((attempt + 1))
        echo "⚠️ Phase '$phase_name' interrupted or timed out. Auto-resuming (Attempt $attempt/$MAX_RETRIES) in ${RETRY_DELAY}s..."
        sleep $RETRY_DELAY

        # --continue resumes the exact same session context and prompts it to keep going
        claude -p --continue --dangerously-skip-permissions "An error or timeout occurred. Check the current status, fix any partially written files, and continue exactly where you left off."
        
        if [ $? -eq 0 ]; then
            echo "Phase '$phase_name' recovered and completed."
            return 0
        fi
    done

    echo "❌ Phase '$phase_name' failed after $MAX_RETRIES recovery attempts."
    exit 1
}

# -------------------------------------------------------------
# PIPELINE EXECUTION
# -------------------------------------------------------------

# Step 1: Breakdown & Plan
run_claude_phase "Plan & Design" "
Inspect the project structure. We need to implement the initial schema, database models, and agent core modules for our application.
1. Pick apart the requirements into modular subproblems.
2. Write a detailed step-by-step implementation plan and save it to 'docs/PLAN.md'.
3. Create a task checklist inside 'docs/PLAN.md' with checkboxes for each file/feature to be built.
"

# Step 2: Implementation & Verification Loop
run_claude_phase "Autonomous Implementation" "
Read 'docs/PLAN.md'. Implement all tasks listed in the checklist sequentially.
Rules for implementation:
- Implement one task at a time.
- After creating or modifying files for a task, run verification commands (e.g., 'npx tsc --noEmit', 'npm test', or database checks) to confirm zero errors.
- Update the checkbox in 'docs/PLAN.md' to marked [x] upon success.
- Continue down the list until all tasks in 'docs/PLAN.md' are complete.
"

# Step 3: Final Verification & Cleanup Pass
run_claude_phase "Quality Verification" "
Run the full project build and test suite. Fix any remaining TypeScript, linting, or runtime errors. Summarize what was built in 'docs/COMPLETED_WORK.md'.
"

echo "🎉 All autonomous development phases completed!"
