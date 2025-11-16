# Workspace Health Check - Quick Reference

## Quick Start

```bash
# Standard check (fast)
./scripts/workspace-health-check.sh

# Quiet mode (only show issues)
./scripts/workspace-health-check.sh --quiet

# Deep check (includes actual API tests)
./scripts/workspace-health-check.sh --deep

# JSON output (for automation)
./scripts/workspace-health-check.sh --json
```

## Health Score Guide

- **85-100:** Healthy (Green) - All systems operational
- **70-84:** Needs attention (Yellow) - Some issues to address
- **0-69:** Critical (Red) - Immediate action required

## Exit Codes

- `0` - Healthy (score ≥ 85)
- `1` - Needs attention (score 70-84)
- `2` - Critical issues (score < 70)

## What Gets Checked

1. **OAuth/Delegation** - Service account and API authentication
2. **Security Scanning** - Pre-commit hooks, GitHub Actions, .gitignore
3. **Cross-Workspace Links** - Symlinks to operations-workspace
4. **Project Orchestration** - .ai-planning/project-state.json
5. **Google Sheets VC** - Version control and backups
6. **Documentation** - Critical docs present and current

## Common Issues & Quick Fixes

### Warning: .gitignore missing patterns

```bash
# Add to .gitignore
cat >> .gitignore << 'EOF'
configuration/
*.key
service-account*.json
credentials.json
EOF
```

### Error: Broken symlink

```bash
# Remove and recreate
rm broken-link
ln -s ../operations-workspace/target-dir broken-link
```

### Error: Pre-commit hook not executable

```bash
chmod +x .git/hooks/pre-commit
```

## When to Run

- **Before every commit** (infrastructure changes)
- **After pulling updates** from git
- **Weekly** (automated maintenance)
- **Before deployment** (validation)
- **Monthly deep check** (--deep flag)

## Integration Examples

### Git Pre-Commit

```bash
# In .git/hooks/pre-commit
./scripts/workspace-health-check.sh --quiet || exit 1
```

### CI/CD Pipeline

```yaml
- name: Health Check
  run: ./scripts/workspace-health-check.sh --json
```

### Cron Job

```bash
# Weekly Monday 9 AM
0 9 * * 1 /path/to/workspace-health-check.sh --quiet
```

## Full Documentation

See: `/Users/mmaruthurnew/Desktop/medical-patient-data/docs/WORKSPACE-HEALTH-CHECK.md`

Or via symlink: `./docs/WORKSPACE-HEALTH-CHECK.md`
