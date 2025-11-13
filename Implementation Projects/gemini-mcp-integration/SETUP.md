# Gemini MCP Integration - Setup Guide

Complete installation and configuration guide for running Gemini with MCP support.

---

## Prerequisites

Before you begin, ensure you have:

1. **Node.js 18+** installed
2. **Gemini API key** from Google AI Studio
3. **MCP servers** configured (26 servers in mcp-infrastructure workspace)
4. **Claude Code config** with MCP servers registered

---

## Step 1: Install Dependencies

Navigate to the project directory and install packages:

```bash
cd "Implementation Projects/gemini-mcp-integration"
npm install
```

**Packages installed:**
- `@google/generative-ai` - Gemini API client
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `axios` - HTTP client for bridge communication
- `express` - HTTP server for MCP bridge
- `dotenv` - Environment variable management
- `express-rate-limit` - API rate limiting

---

## Step 2: Get Gemini API Key

### Option 1: Google AI Studio (Free)

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click **"Get API Key"**
4. Create a new API key
5. Copy the key

### Option 2: Google Cloud Console (Production)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Generative Language API**
3. Create credentials → API key
4. Copy the key

---

## Step 3: Configure Environment

Create `.env` file in the project directory:

```bash
cp .env.example .env
```

Edit `.env` and add your keys:

```bash
# Required: Gemini API key
GEMINI_API_KEY=your-gemini-api-key-here

# Optional: MCP Bridge API key (generates random if not set)
MCP_BRIDGE_API_KEY=your-secure-random-key-here

# Optional: MCP Bridge URL (defaults to localhost:3000)
MCP_BRIDGE_URL=http://localhost:3000
```

**Generate secure API key for bridge:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 4: Verify MCP Servers

Gemini will access MCP servers through the bridge. Verify your MCP configuration:

```bash
# Check workspace MCP config
cat .claude/mcp_config.json

# Or global config
cat ~/.claude/mcp_config.json
```

**Expected structure:**
```json
{
  "mcpServers": {
    "project-management-mcp": {
      "command": "node",
      "args": ["/path/to/mcp-servers/project-management-mcp/build/index.js"]
    },
    "task-executor-mcp": {
      "command": "node",
      "args": ["/path/to/mcp-servers/task-executor-mcp/build/index.js"]
    }
  }
}
```

---

## Step 5: Start MCP Bridge Server

The bridge server exposes MCP tools as HTTP endpoints for Gemini.

### Terminal 1: Start Bridge

```bash
npm run bridge
```

**Expected output:**
```
🚀 MCP Bridge Server running on http://localhost:3000
📊 API Docs: http://localhost:3000/mcp/tools
💚 Health: http://localhost:3000/health
```

**Keep this terminal running!** The bridge must be active for Gemini to use MCP tools.

### Verify Bridge is Working

In a new terminal:

```bash
# Check health
curl http://localhost:3000/health

# Should return:
# {"success":true,"status":"healthy","uptime":X,"mcpServers":[...]}
```

---

## Step 6: Test the Integration

### Test 1: MCP Bridge Server

```bash
npm run test:bridge
```

**Expected output:**
```
╔════════════════════════════════════════════════════╗
║           MCP Bridge Server Tests                  ║
╚════════════════════════════════════════════════════╝

Test 1: Health Check
  ✅ Passed: Server is healthy

Test 2: List MCP Tools
  ✅ Passed: Retrieved 156 tools

Test 3: Get Gemini Function Schemas
  ✅ Passed: Retrieved 156 Gemini schemas

...

✅ Tests passed: 6
❌ Tests failed: 0
```

### Test 2: Gemini MCP Integration

```bash
npm run test
```

**Expected output:**
```
╔════════════════════════════════════════════════════╗
║        Gemini MCP Integration Tests                ║
╚════════════════════════════════════════════════════╝

Test 1: Basic Chat
  ✅ Passed: Basic chat works

Test 2: PHI Detection
  ✅ Passed: PHI detected correctly

Test 3: MCP Function Calling
  ✅ Passed: MCP function called successfully
     Functions used: list_domains

...

✅ Tests passed: 5
❌ Tests failed: 0
```

---

## Step 7: Launch Gemini CLI

### Start Interactive Session

```bash
npm start
# Or directly:
node gemini-mcp-cli.js
```

**Expected output:**
```
╔════════════════════════════════════════════════════╗
║      Gemini MCP CLI - HIPAA Compliant Edition      ║
╚════════════════════════════════════════════════════╝

Initializing Gemini with MCP support...
✅ Connected to Gemini (156 MCP tools available)

📋 Available commands:
  /tools    - List available MCP tools
  /history  - Show conversation history
  /clear    - Clear conversation history
  /stats    - Show audit statistics
  /help     - Show this help message
  /exit     - Exit CLI

Type your message or command:

👤 You:
```

### Try It Out!

```
👤 You: Create a goal to implement patient portal API

🤖 Gemini: I'll create a potential goal for you. Let me use the project management tools.

[Calling MCP: create_potential_goal]

Goal created successfully!
- Name: Patient Portal API
- ID: 001
- Impact: High
- Effort: Medium
- Tier: Now

Would you like me to promote this to a selected goal?
```

---

## Usage Examples

### Example 1: List Available Tools

```
👤 You: /tools goal

📦 Available MCP Tools:

  • create_potential_goal
    Create a new potential goal in the project

  • evaluate_goal
    Analyze a goal description to estimate Impact, Effort, and tier

  • promote_to_selected
    Promote a potential goal to selected status

Showing 3 of 156 tools
```

### Example 2: Get Audit Statistics

```
👤 You: /stats

📊 Audit Statistics:

  Total entries (last 24h): 42

  Actions:
    • gemini_api_call: 15
    • mcp_call: 12
    • phi_operation: 3

  PHI Detection:
    • Total: 3 (7.14%)
    • Types detected:
      - patient_name: 2
      - ssn: 1

  Top MCP Tools:
    1. project-management-mcp.create_potential_goal: 5 calls
    2. task-executor-mcp.get_workflow_status: 4 calls
    3. workspace-brain-mcp.log_event: 3 calls
```

### Example 3: PHI Protection in Action

```
👤 You: Patient John Doe, SSN 123-45-6789, has appointment tomorrow

⚠️  PHI detected: patient_name, ssn
✓ PHI removed before processing

🤖 Gemini: I've noted the appointment for tomorrow. The patient information
has been safely de-identified. Would you like me to log this as an event?
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  Gemini CLI (gemini-mcp-cli.js)                     │
│  - Interactive REPL                                  │
│  - PHI detection & de-identification                 │
│  - Audit logging                                     │
└──────────────┬──────────────────────────────────────┘
               │
               │ Gemini API calls
               │
┌──────────────▼──────────────────────────────────────┐
│  Gemini Client (gemini-client.js)                   │
│  - Google Generative AI SDK                          │
│  - Function calling handler                          │
└──────────────┬──────────────────────────────────────┘
               │
               │ HTTP requests to execute functions
               │
┌──────────────▼──────────────────────────────────────┐
│  MCP Bridge Server (mcp-bridge-server.js)           │
│  - Express HTTP server (port 3000)                   │
│  - REST API for MCP tools                            │
│  - Authentication & rate limiting                    │
└──────────────┬──────────────────────────────────────┘
               │
               │ MCP protocol
               │
┌──────────────▼──────────────────────────────────────┐
│  MCP Clients (mcp-client.js)                        │
│  - Connects to 26 MCP servers                        │
│  - Tool discovery & execution                        │
└──────────────┬──────────────────────────────────────┘
               │
               │
┌──────────────▼──────────────────────────────────────┐
│  26 MCP Servers (mcp-infrastructure workspace)       │
│  - project-management-mcp                            │
│  - task-executor-mcp                                 │
│  - workspace-brain-mcp                               │
│  - spec-driven-mcp                                   │
│  - ... (22 more)                                     │
└─────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### Error: "GEMINI_API_KEY not set"

**Solution:** Add your Gemini API key to `.env`:
```bash
echo "GEMINI_API_KEY=your-key-here" >> .env
```

### Error: "Failed to connect to MCP Bridge"

**Solution:** Make sure bridge server is running:
```bash
# In separate terminal
npm run bridge
```

### Error: "MCP server 'X' not found"

**Solution:** Check MCP configuration:
```bash
# Verify MCP config exists
cat .claude/mcp_config.json

# Ensure MCP servers are built
cd ../../mcp-infrastructure/local-instances/mcp-servers/X
npm run build
```

### Bridge server won't start

**Solution:** Check if port 3000 is in use:
```bash
# Find process using port 3000
lsof -i :3000

# Kill it if needed
kill -9 <PID>

# Or use different port
MCP_BRIDGE_PORT=3001 npm run bridge
```

### PHI detected but shouldn't be

**Solution:** PHI Guard may have false positives. Check `phi-guard.js` patterns:
```bash
# View current PHI patterns
cat ../google-workspace-oauth-setup/phi-guard.js
```

### Tests failing with "Tool not found"

**Solution:** Load priority servers first:
1. Edit `mcp-bridge-server.js`
2. Update `defaultPriority` array to include only built MCP servers
3. Restart bridge and re-run tests

---

## Production Deployment

### Option 1: Deploy Bridge as Cloud Function

See [cloud-functions-migration-strategy.md](../../future-ideas/cloud-functions-migration-strategy.md) for deployment instructions.

**Benefits:**
- Always available (no need to start bridge manually)
- Auto-scaling
- FREE at your usage scale

### Option 2: Run Bridge as Background Service

Using PM2:

```bash
# Install PM2
npm install -g pm2

# Start bridge
pm2 start mcp-bridge-server.js --name gemini-mcp-bridge

# Auto-start on boot
pm2 startup
pm2 save

# Monitor
pm2 monit
```

---

## Security Best Practices

1. **Never commit `.env` file**
   - Already in `.gitignore`
   - Rotate API keys regularly

2. **Use strong bridge API key**
   - At least 32 characters
   - Randomly generated

3. **Enable HTTPS in production**
   - Use reverse proxy (nginx)
   - SSL/TLS certificates

4. **Review audit logs regularly**
   - Check `gemini-mcp-audit-log.json`
   - Monitor PHI detection counts

5. **Keep dependencies updated**
   ```bash
   npm outdated
   npm update
   ```

---

## Cost Monitoring

### Gemini API Costs

**Current model:** `gemini-2.0-flash-exp` (FREE during preview)

**Future pricing estimates:**
- Input: $0.00001875 per 1K tokens
- Output: $0.000075 per 1K tokens

**Example monthly cost (100 requests/day):**
```
Requests: 100/day × 30 = 3,000/month
Avg tokens: 500 input + 200 output per request

Input cost:  3,000 × 500 / 1000 × $0.00001875 = $0.028
Output cost: 3,000 × 200 / 1000 × $0.000075   = $0.045
Total: ~$0.07/month
```

### MCP Bridge Costs

**If deployed as Cloud Function:**
- FREE at your scale (within free tier)
- See [cloud-functions-cost-calculator.md](../../future-ideas/cloud-functions-cost-calculator.md)

---

## Next Steps

1. **Explore MCP Tools**
   ```bash
   # In Gemini CLI
   /tools
   ```

2. **Integrate with Workflows**
   - Use Gemini for patient inquiry classification
   - Automate goal creation from notes
   - Generate reports from workspace data

3. **Customize for Your Practice**
   - Add domain-specific prompts
   - Create custom MCP tools
   - Build automated workflows

4. **Monitor Performance**
   - Review audit logs daily
   - Check PHI detection accuracy
   - Monitor API costs

---

## Support

For issues or questions:

1. Check [README.md](./README.md) for architecture details
2. Review [WORKSPACE_ARCHITECTURE.md](../../WORKSPACE_ARCHITECTURE.md)
3. Test with `npm run test`
4. Check audit logs: `cat gemini-mcp-audit-log.json`

---

**Setup complete! 🎉**

You now have Gemini with full MCP access in the medical-patient-data workspace.
