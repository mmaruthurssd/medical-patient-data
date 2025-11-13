#!/bin/bash

##############################################################################
# Claude Code Automation Server
# Purpose: Automatically process prompts from Google Sheets using claude CLI
#
# Features:
# - Monitors automation/prompt-queue/pending/ for new prompts
# - Executes prompts using 'claude --print' (non-interactive)
# - Writes responses to automation/prompt-queue/responses/
# - Runs continuously in background
#
# Usage:
#   Start: ./claude-automation-server.sh start
#   Stop:  ./claude-automation-server.sh stop
#   Status: ./claude-automation-server.sh status
##############################################################################

set -e

# Configuration
WORKSPACE_DIR="$HOME/Desktop/medical-patient-data"
QUEUE_DIR="$WORKSPACE_DIR/automation/prompt-queue"
PENDING_DIR="$QUEUE_DIR/pending"
PROCESSING_DIR="$QUEUE_DIR/processing"
COMPLETED_DIR="$QUEUE_DIR/completed"
RESPONSES_DIR="$QUEUE_DIR/responses"
LOG_FILE="$QUEUE_DIR/automation-server.log"
PID_FILE="$QUEUE_DIR/automation-server.pid"

# Claude CLI configuration
CLAUDE_BIN="/usr/local/bin/claude"
CHECK_INTERVAL=30  # Check for new prompts every 30 seconds

##############################################################################
# Logging functions
##############################################################################

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "$LOG_FILE" >&2
}

##############################################################################
# Process a single prompt
##############################################################################

process_prompt() {
    local prompt_file="$1"
    local prompt_id=$(basename "$prompt_file" .json | sed 's/prompt-//')

    log "Processing prompt: $prompt_id"

    # Move to processing
    mv "$prompt_file" "$PROCESSING_DIR/" || {
        log_error "Failed to move prompt to processing: $prompt_file"
        return 1
    }

    local processing_file="$PROCESSING_DIR/$(basename "$prompt_file")"

    # Parse prompt details
    local prompt_text=$(jq -r '.prompt' "$processing_file")
    local prompt_type=$(jq -r '.type // "general"' "$processing_file")
    local priority=$(jq -r '.priority // "normal"' "$processing_file")
    local context=$(jq -r '.context // {}' "$processing_file")

    log "Type: $prompt_type | Priority: $priority"

    # Record start time
    local start_time=$(date +%s)

    # Execute prompt using claude CLI
    log "Executing with claude --print..."

    local response_text=""
    local exit_code=0

    # Run claude --print with the prompt
    # Add workspace directory and any context as system prompt
    response_text=$("$CLAUDE_BIN" --print \
        --model sonnet \
        --append-system-prompt "Workspace: $WORKSPACE_DIR. Context: $context" \
        "$prompt_text" 2>&1) || exit_code=$?

    # Calculate duration
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    # Create response file
    local response_file="$RESPONSES_DIR/response-${prompt_id}.json"

    if [ $exit_code -eq 0 ]; then
        log "Success! Duration: ${duration}s"

        # Create successful response
        cat > "$response_file" <<EOF
{
  "promptId": "$prompt_id",
  "executed": "$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")",
  "status": "completed",
  "result": {
    "response": $(echo "$response_text" | jq -Rs .),
    "summary": "Executed successfully"
  },
  "duration": "${duration} seconds",
  "exitCode": 0
}
EOF
    else
        log_error "Failed! Exit code: $exit_code"

        # Create error response
        cat > "$response_file" <<EOF
{
  "promptId": "$prompt_id",
  "executed": "$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")",
  "status": "error",
  "error": {
    "message": "Claude execution failed",
    "details": $(echo "$response_text" | jq -Rs .),
    "exitCode": $exit_code
  },
  "duration": "${duration} seconds"
}
EOF
    fi

    # Move to completed
    mv "$processing_file" "$COMPLETED_DIR/" || {
        log_error "Failed to move prompt to completed"
    }

    log "Response written to: $response_file"
    echo "---"
}

##############################################################################
# Main processing loop
##############################################################################

process_queue() {
    log "Automation server started (PID: $$)"
    log "Checking for prompts every ${CHECK_INTERVAL}s"
    log "Workspace: $WORKSPACE_DIR"

    while true; do
        # Find all pending prompts
        prompt_count=$(find "$PENDING_DIR" -name "prompt-*.json" 2>/dev/null | wc -l | tr -d ' ')

        if [ "$prompt_count" -gt 0 ]; then
            log "Found $prompt_count pending prompt(s)"

            # Process prompts by priority (high → normal → low)
            for priority in "urgent" "high" "normal" "low"; do
                for prompt_file in "$PENDING_DIR"/prompt-*.json; do
                    if [ -f "$prompt_file" ]; then
                        # Check if this prompt matches current priority
                        file_priority=$(jq -r '.priority // "normal"' "$prompt_file")

                        if [ "$file_priority" = "$priority" ]; then
                            process_prompt "$prompt_file"
                        fi
                    fi
                done
            done
        fi

        # Wait before next check
        sleep "$CHECK_INTERVAL"
    done
}

##############################################################################
# Daemon management
##############################################################################

start_server() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo "Automation server is already running (PID: $pid)"
            exit 1
        else
            echo "Removing stale PID file"
            rm -f "$PID_FILE"
        fi
    fi

    echo "Starting Claude automation server..."

    # Ensure directories exist
    mkdir -p "$PENDING_DIR" "$PROCESSING_DIR" "$COMPLETED_DIR" "$RESPONSES_DIR"

    # Start in background
    nohup "$0" _run >> "$LOG_FILE" 2>&1 &
    local pid=$!
    echo $pid > "$PID_FILE"

    echo "Automation server started (PID: $pid)"
    echo "Log file: $LOG_FILE"
    echo ""
    echo "To view logs in real-time:"
    echo "  tail -f $LOG_FILE"
}

stop_server() {
    if [ ! -f "$PID_FILE" ]; then
        echo "Automation server is not running"
        exit 1
    fi

    local pid=$(cat "$PID_FILE")

    if ps -p "$pid" > /dev/null 2>&1; then
        echo "Stopping automation server (PID: $pid)..."
        kill "$pid"
        rm -f "$PID_FILE"
        echo "Server stopped"
    else
        echo "Server not running (stale PID file)"
        rm -f "$PID_FILE"
    fi
}

status_server() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            echo "✅ Automation server is RUNNING (PID: $pid)"
            echo ""
            echo "Queue status:"
            echo "  Pending:    $(find "$PENDING_DIR" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')"
            echo "  Processing: $(find "$PROCESSING_DIR" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')"
            echo "  Completed:  $(find "$COMPLETED_DIR" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')"
            echo "  Responses:  $(find "$RESPONSES_DIR" -name "*.json" 2>/dev/null | wc -l | tr -d ' ')"
            echo ""
            echo "Recent activity (last 10 lines):"
            tail -10 "$LOG_FILE" 2>/dev/null || echo "  No logs yet"
        else
            echo "❌ Server not running (stale PID file)"
            rm -f "$PID_FILE"
        fi
    else
        echo "❌ Automation server is NOT running"
    fi
}

test_prompt() {
    echo "Sending test prompt..."

    local test_id=$(uuidgen | tr '[:upper:]' '[:lower:]')
    local test_file="$PENDING_DIR/prompt-$test_id.json"

    cat > "$test_file" <<'EOF'
{
  "id": "TEST_ID",
  "created": "TIMESTAMP",
  "priority": "normal",
  "type": "test",
  "prompt": "Hello! Please respond with: 'Automation server is working correctly. Test ID: TEST_ID'",
  "status": "pending"
}
EOF

    # Replace placeholders
    sed -i '' "s/TEST_ID/$test_id/g" "$test_file"
    sed -i '' "s/TIMESTAMP/$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")/g" "$test_file"

    echo "Test prompt created: $test_file"
    echo ""
    echo "If server is running, check responses in ~30 seconds:"
    echo "  ls -la $RESPONSES_DIR/"
    echo ""
    echo "Or monitor logs:"
    echo "  tail -f $LOG_FILE"
}

##############################################################################
# Main
##############################################################################

case "${1:-}" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    status)
        status_server
        ;;
    restart)
        stop_server
        sleep 1
        start_server
        ;;
    test)
        test_prompt
        ;;
    _run)
        # Internal: actual processing loop
        process_queue
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|test}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the automation server in background"
        echo "  stop    - Stop the automation server"
        echo "  restart - Restart the automation server"
        echo "  status  - Check server status and queue statistics"
        echo "  test    - Send a test prompt to verify server is working"
        echo ""
        echo "Log file: $LOG_FILE"
        exit 1
        ;;
esac
