# Gemini MCP Integration - Quick Start

Get Gemini with MCP support running in under 5 minutes.

---

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ Gemini API key from [Google AI Studio](https://aistudio.google.com/)
- ✅ MCP servers configured (already done in this workspace)

---

## 1. Setup (1 minute)

```bash
# Navigate to project
cd "Implementation Projects/gemini-mcp-integration"

# Already done - dependencies installed!

# Create .env file
cp .env.example .env

# Add your Gemini API key
echo "GEMINI_API_KEY=your-api-key-here" >> .env

# Generate bridge API key
echo "MCP_BRIDGE_API_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" >> .env
```

---

## 2. Start MCP Bridge (30 seconds)

**Terminal 1:**
```bash
npm run bridge
```

**Expected:**
```
🚀 MCP Bridge Server running on http://localhost:3000
📊 API Docs: http://localhost:3000/mcp/tools
💚 Health: http://localhost:3000/health
```

✅ **Leave this running!**

---

## 3. Test (1 minute)

**Terminal 2:**
```bash
npm run test
```

**Expected:**
```
✅ Tests passed: 5
❌ Tests failed: 0
```

---

## 4. Launch Gemini CLI (30 seconds)

**Terminal 2:**
```bash
npm start
```

**Expected:**
```
╔════════════════════════════════════════════════════╗
║      Gemini MCP CLI - HIPAA Compliant Edition      ║
╚════════════════════════════════════════════════════╝

✅ Connected to Gemini (156 MCP tools available)

👤 You:
```

---

## 5. Try It! (2 minutes)

### Example 1: List Tools
```
👤 You: /tools goal

📦 Available MCP Tools:
  • create_potential_goal
  • evaluate_goal
  • promote_to_selected
```

### Example 2: Create a Goal
```
👤 You: Create a goal to implement patient portal

🤖 Gemini: I'll create a potential goal for you.

[Calling MCP: create_potential_goal]

Goal created successfully!
- Name: Patient Portal
- ID: 001
```

### Example 3: Get Statistics
```
👤 You: /stats

📊 Audit Statistics:
  Total entries: 12
  MCP calls: 8
  PHI detections: 0
```

---

## That's It! 🎉

You now have Gemini with full MCP access.

**Next steps:**
- Read [SETUP.md](./SETUP.md) for detailed configuration
- Read [README.md](./README.md) for architecture details
- Explore `/tools` to see all 156 available MCP tools

**Common commands:**
- `/tools` - List available tools
- `/history` - Show conversation
- `/stats` - Show audit statistics
- `/help` - Show all commands
- `/exit` - Exit CLI

---

## Troubleshooting

### "GEMINI_API_KEY not set"
→ Add to `.env`: `GEMINI_API_KEY=your-key`

### "Failed to connect to MCP Bridge"
→ Start bridge in Terminal 1: `npm run bridge`

### Tests failing
→ Check bridge is running on port 3000

---

**Total setup time: ~5 minutes**
