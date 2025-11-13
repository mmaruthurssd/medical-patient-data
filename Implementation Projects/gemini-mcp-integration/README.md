# Gemini MCP Integration

**Purpose:** Enable Google Gemini to access and use MCP (Model Context Protocol) servers in the medical-patient-data workspace
**Created:** 2025-11-09
**Status:** 🚧 In Development

---

## Overview

This project creates a bridge that allows Google Gemini to interact with the 26 MCP servers currently used by Claude Code. Since Gemini doesn't natively support MCP (an Anthropic protocol), we're building an HTTP wrapper that exposes MCP tools as Gemini function calls.

### Why This Matters

- **HIPAA Compliance:** Gemini has Google BAA coverage, allowing PHI processing
- **MCP Access:** Gemini can use project management, task execution, and workspace memory tools
- **Full Automation:** Gemini can accomplish complex tasks using the same tools as Claude Code
- **Workspace Integration:** Both AI assistants can work in the same workspace with different roles

---

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Gemini CLI (Node.js)                       │
│  - Gemini API client                                         │
│  - Function calling interface                                │
│  - PHI-safe operations                                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Function calls
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              MCP Function Bridge (HTTP Server)               │
│  - Converts Gemini function calls → MCP tool calls          │
│  - Handles authentication                                    │
│  - Routes to appropriate MCP server                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ MCP protocol
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                   26 MCP Servers                             │
│  - project-management-mcp                                    │
│  - task-executor-mcp                                         │
│  - workspace-brain-mcp                                       │
│  - spec-driven-mcp                                           │
│  - ... (22 more)                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User interacts with Gemini CLI:**
   ```
   User: "Create a goal to implement patient portal API"
   ```

2. **Gemini processes request and calls function:**
   ```javascript
   functionCall: {
     name: "create_potential_goal",
     parameters: {
       goalName: "Patient Portal API",
       description: "REST API for patient portal access",
       ...
     }
   }
   ```

3. **MCP Bridge receives function call:**
   ```javascript
   POST /mcp/project-management/create_potential_goal
   Body: { goalName: "...", description: "..." }
   ```

4. **Bridge calls actual MCP tool:**
   ```javascript
   const mcpClient = new MCPClient('project-management-mcp');
   const result = await mcpClient.callTool('create_potential_goal', params);
   ```

5. **Result returned to Gemini:**
   ```javascript
   {
     success: true,
     goalId: "001",
     message: "Goal created successfully"
   }
   ```

6. **Gemini responds to user:**
   ```
   Gemini: "I've created a new potential goal 'Patient Portal API'
            (Goal ID: 001). It's ready for evaluation."
   ```

---

## Implementation Phases

### Phase 1: MCP Function Bridge (Current)
**Goal:** Create HTTP server that exposes MCP tools as REST endpoints

**Components:**
- `mcp-bridge-server.js` - HTTP server for MCP access
- `mcp-tool-registry.js` - Maps Gemini functions to MCP tools
- `mcp-client.js` - MCP protocol client
- `schema-converter.js` - Converts MCP schemas to Gemini function schemas

**Priority MCP Tools:**
1. `project-management-mcp`:
   - `create_potential_goal`
   - `evaluate_goal`
   - `promote_to_selected`
2. `task-executor-mcp`:
   - `create_workflow`
   - `complete_task`
   - `get_workflow_status`
3. `workspace-brain-mcp`:
   - `log_event`
   - `query_events`
   - `get_automation_opportunities`

### Phase 2: Gemini CLI with MCP Support
**Goal:** Build custom Gemini CLI that can use MCP functions

**Components:**
- `gemini-mcp-cli.js` - Main CLI interface
- `gemini-client.js` - Gemini API client with function calling
- `phi-guard-integration.js` - PHI detection before processing
- `audit-logger.js` - HIPAA-compliant audit logging

**Features:**
- Interactive CLI mode
- Function calling with MCP tools
- PHI detection and de-identification
- Audit logging for all PHI operations
- Session management

### Phase 3: Integration Testing
**Goal:** Validate Gemini can successfully use MCP tools

**Test Scenarios:**
1. **Goal Management:**
   - Create potential goal via Gemini
   - Evaluate goal using AI estimator
   - Promote goal to selected
2. **Task Execution:**
   - Create workflow from goal
   - Complete tasks
   - Archive completed workflow
3. **Workspace Memory:**
   - Log telemetry events
   - Query event history
   - Generate insights

### Phase 4: Production Deployment
**Goal:** Deploy for daily use in medical-patient-data workspace

**Deployment:**
- MCP Bridge as Cloud Function (always available)
- Gemini CLI as local command
- Integration with existing workflows
- Documentation for staff usage

---

## Technical Specifications

### MCP Bridge Server

**Port:** 3000
**Base URL:** http://localhost:3000/mcp
**Authentication:** API key (stored in .env)

**Endpoints:**

```
POST /mcp/{serverName}/{toolName}
Content-Type: application/json
Authorization: Bearer {API_KEY}

Body: {
  "parameters": { ... }
}

Response: {
  "success": true,
  "result": { ... }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/mcp/project-management/create_potential_goal \
  -H "Authorization: Bearer abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "projectPath": "/Users/mmaruthurnew/Desktop/medical-patient-data",
      "goalName": "Patient Portal API",
      "goalDescription": "REST API for patient portal"
    }
  }'
```

### Gemini Function Schemas

MCP tools are automatically converted to Gemini function schemas:

**MCP Tool Schema:**
```json
{
  "name": "create_potential_goal",
  "description": "Create a new potential goal",
  "inputSchema": {
    "type": "object",
    "properties": {
      "projectPath": { "type": "string" },
      "goalName": { "type": "string" },
      "goalDescription": { "type": "string" }
    },
    "required": ["projectPath", "goalName", "goalDescription"]
  }
}
```

**Gemini Function Schema:**
```json
{
  "name": "create_potential_goal",
  "description": "Create a new potential goal",
  "parameters": {
    "type": "object",
    "properties": {
      "projectPath": { "type": "string" },
      "goalName": { "type": "string" },
      "goalDescription": { "type": "string" }
    },
    "required": ["projectPath", "goalName", "goalDescription"]
  }
}
```

---

## Security & HIPAA Compliance

### PHI Protection

1. **Pre-Processing Check:**
   ```javascript
   // Before sending to Gemini
   const detection = phiGuard.detectPHI(userInput);
   if (detection.hasPHI) {
     const deidentified = phiGuard.deidentify(userInput);
     processedInput = deidentified.deidentifiedText;
   }
   ```

2. **Audit Logging:**
   ```javascript
   auditLogger.log({
     timestamp: new Date().toISOString(),
     action: 'gemini_mcp_call',
     tool: 'create_potential_goal',
     hasPHI: false,
     user: 'automation@ssdspc.com',
     result: 'success'
   });
   ```

3. **Google BAA Coverage:**
   - Gemini API covered by Google Workspace BAA
   - All PHI processing compliant
   - Audit logs synced to Google Drive

### MCP Bridge Security

1. **API Key Authentication:**
   - Bridge requires valid API key
   - Keys stored in .env (never committed)
   - Rotation policy: 90 days

2. **Rate Limiting:**
   - 100 requests/minute per client
   - Prevents abuse and excessive costs

3. **Input Validation:**
   - All parameters validated before MCP call
   - Prevent injection attacks

---

## Cost Analysis

### MCP Bridge as Cloud Function

**Configuration:**
- Memory: 512 MB (0.5 GB)
- Avg execution time: 2 seconds
- Expected usage: 100 calls/day

**Monthly Usage:**
```
Invocations: 100/day × 30 = 3,000/month
GB-seconds: 0.5 GB × 2 sec × 3,000 = 3,000 GB-seconds

Within free tier? YES (3,000 << 2M invocations, 3,000 << 400K GB-seconds)
Monthly cost: $0.00
```

### Gemini API

**Configuration:**
- Model: gemini-2.0-flash-exp (free during preview)
- Input tokens: ~500/request
- Output tokens: ~200/request

**Monthly Usage:**
```
Requests: 100/day × 30 = 3,000/month
Input tokens: 500 × 3,000 = 1,500,000
Output tokens: 200 × 3,000 = 600,000

Current cost: $0.00 (free preview)
Future cost (if paid): ~$3-5/month at standard rates
```

**Total Monthly Cost: $0.00** (both within free tiers)

---

## Usage Examples

### Example 1: Create and Manage Goal

```bash
$ gemini-mcp

Gemini CLI (with MCP support)
Type 'exit' to quit, 'help' for commands

You: Create a goal to implement patient portal API with OAuth authentication

Gemini: I'll create a potential goal for you. Let me use the project management tools.

[Calling MCP: create_potential_goal]

Goal created successfully!
- Name: Patient Portal API
- ID: 001
- Impact: High (affects all patients accessing portal)
- Effort: Medium (requires OAuth setup, API design, testing)
- Tier: Now (high priority for patient engagement)

Would you like me to promote this to a selected goal?

You: Yes, promote it with high priority

Gemini: [Calling MCP: promote_to_selected]

Goal promoted! It's now in your selected goals list with High priority.
Next action: Create specification using spec-driven MCP.

Would you like me to start the specification workflow?
```

### Example 2: Task Workflow Management

```bash
You: Create a workflow for implementing the patient portal API

Gemini: [Calling MCP: create_workflow]

Workflow created: "patient-portal-api-implementation"
Tasks (8 total):
1. Design OAuth 2.0 authentication flow
2. Create API endpoint specifications
3. Implement authentication middleware
4. Build patient data endpoints (GET /patients/:id)
5. Build appointment endpoints (GET/POST /appointments)
6. Add PHI detection and logging
7. Write integration tests
8. Deploy to Cloud Functions

Ready to start? I can mark tasks as complete as you finish them.

You: I finished task 1, the OAuth design is in /docs/oauth-flow.md

Gemini: [Calling MCP: complete_task with verification]

Checking if task 1 is truly complete...
✓ Found /docs/oauth-flow.md
✓ File contains OAuth flow diagram
✓ Authentication strategy documented

Task 1 marked complete! 7 tasks remaining.
Next task: Create API endpoint specifications

Would you like suggestions for the API spec format?
```

### Example 3: Workspace Insights

```bash
You: Show me what I've been working on this week

Gemini: [Calling MCP: query_events]

This week's activity (Nov 4-9, 2025):
- 12 tasks completed across 3 workflows
- 2 new goals created (Patient Portal API, V7 Metadata Extractor)
- 8 MCP tools used most frequently
- Avg task completion time: 2.3 hours

Top accomplishments:
1. Google Workspace OAuth Setup (Phases 1-5 complete)
2. Cloud Functions migration planning
3. 5-layer architecture planning for Live Practice

[Calling MCP: get_automation_opportunities]

I noticed you're manually processing patient inquiries hourly.
Automation opportunity: Cloud Function triggered by new sheet rows
- Saves ~5 hours/week
- Cost: $0 (within free tier)
- ROI: High

Would you like me to create a goal for this automation?
```

---

## Development Roadmap

### Week 1: Foundation
- [x] Project structure
- [ ] MCP Bridge server implementation
- [ ] Schema converter
- [ ] Test with 3 MCP tools

### Week 2: Gemini Integration
- [ ] Gemini CLI implementation
- [ ] Function calling integration
- [ ] PHI Guard integration
- [ ] Audit logging

### Week 3: Testing
- [ ] Unit tests for bridge
- [ ] Integration tests for Gemini CLI
- [ ] End-to-end workflow tests
- [ ] HIPAA compliance validation

### Week 4: Production
- [ ] Deploy MCP Bridge to Cloud Functions
- [ ] Documentation for staff usage
- [ ] Training materials
- [ ] Monitoring and alerts setup

---

## Success Metrics

1. **Functionality:**
   - ✅ Gemini can call all 26 MCP tools
   - ✅ Function calling success rate > 95%
   - ✅ Response time < 3 seconds

2. **HIPAA Compliance:**
   - ✅ All PHI operations logged
   - ✅ Audit logs synced to Google Drive
   - ✅ No PHI sent to Gemini without de-identification

3. **Cost Efficiency:**
   - ✅ Stay within free tiers (Gemini + Cloud Functions)
   - ✅ Monthly cost < $10

4. **User Experience:**
   - ✅ CLI is intuitive and responsive
   - ✅ Error messages are helpful
   - ✅ Gemini provides useful task assistance

---

## Related Documentation

- [Google Workspace OAuth Setup](../google-workspace-automation-infrastructure/README.md)
- [Cloud Functions Migration Strategy](../../future-ideas/cloud-functions-migration-strategy.md)
- [Cloud Functions Cost Calculator](../../future-ideas/cloud-functions-cost-calculator.md)
- [Workspace Architecture](../../WORKSPACE_ARCHITECTURE.md)

---

**Last Updated:** 2025-11-09
**Next Review:** After Phase 1 completion
