# Learning Optimizer MCP Setup Guide

**Created:** November 13, 2025
**Status:** Configuration Required

---

## Problem

The Learning Optimizer MCP is not automatically logging issues because it can't find the domain configuration files. When you call `track_issue`, it returns "Unknown domain" errors.

## Root Cause

The Learning Optimizer MCP server needs an environment variable to know where to find domain configurations:

```
LEARNING_OPTIMIZER_CONFIG_DIR=/Users/mmaruthurnew/Desktop/operations-workspace/configuration/learning-optimizer-configs
```

Without this variable, the MCP server can't load the domain configurations (like `github-actions-setup.json`).

## Solution

You need to configure the environment variable in your MCP settings. The location depends on which Claude client you're using:

### For Claude Code (if using MCP config file)

Look for your MCP configuration file and add the environment variable to the `learning-optimizer` server entry.

**Expected format:**
```json
{
  "mcpServers": {
    "learning-optimizer": {
      "command": "node",
      "args": ["/path/to/learning-optimizer-mcp/dist/index.js"],
      "env": {
        "LEARNING_OPTIMIZER_CONFIG_DIR": "/Users/mmaruthurnew/Desktop/operations-workspace/configuration/learning-optimizer-configs"
      }
    }
  }
}
```

### Testing After Configuration

After adding the environment variable and restarting Claude Code:

```bash
# This command should now show 3 domains:
mcp__learning-optimizer__list_domains

# Expected output:
# - google-sheets
# - mcp-installation
# - github-actions-setup

# Then you can track issues:
mcp__learning-optimizer__track_issue({
  domain: "github-actions-setup",
  title: "Test issue",
  symptom: "Test symptom",
  solution: "Test solution"
})
```

---

## Current Domain Configurations

**Location:** `/Users/mmaruthurnew/Desktop/operations-workspace/configuration/learning-optimizer-configs/`

**Available Domains:**
1. **google-sheets** - Google Sheets automation issues (6 categories)
2. **mcp-installation** - MCP server installation issues (6 categories)
3. **github-actions-setup** - GitHub Actions configuration issues (5 categories) ✅ NEW

---

## Fallback Solution

Until the MCP is properly configured, I've created local troubleshooting docs:

**GitHub Actions Issues:**
- `/Users/mmaruthurnew/Desktop/medical-patient-data/docs/TROUBLESHOOTING-GITHUB-ACTIONS.md`

**Comprehensive MCP Analysis:**
- `/Users/mmaruthurnew/Desktop/medical-patient-data/README-LEARNING-OPTIMIZER-ANALYSIS.md`
- `/Users/mmaruthurnew/Desktop/medical-patient-data/ANALYSIS-SUMMARY.md`
- `/Users/mmaruthurnew/Desktop/medical-patient-data/LEARNING-OPTIMIZER-CONFIG-ANALYSIS.md`
- `/Users/mmaruthurnew/Desktop/medical-patient-data/LEARNING-OPTIMIZER-QUICK-REFERENCE.md`

---

## Next Steps

1. **Immediate:** Configure `LEARNING_OPTIMIZER_CONFIG_DIR` environment variable in MCP settings
2. **After restart:** Test with `list_domains` to verify domains are loaded
3. **Test logging:** Try tracking the GitHub Actions issue
4. **If still not working:** Check MCP server logs for errors during startup

---

## Why This Matters

The Learning Optimizer MCP is designed to:
- Automatically track issues when they occur
- Detect patterns and recurring problems
- Build a knowledge base over time
- Trigger preventive actions when high-impact issues repeat
- Help you avoid solving the same problem multiple times

Without proper configuration, this core workspace functionality isn't active.
