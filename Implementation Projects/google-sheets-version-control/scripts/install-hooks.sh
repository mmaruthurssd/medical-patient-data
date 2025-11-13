#!/bin/bash
# Install git hooks from scripts/ directory

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Installing git hooks for Google Sheets version control..."
echo "Repository: $REPO_ROOT"
echo ""

# Install pre-commit hook
if [ -f "$SCRIPT_DIR/enhanced-pre-commit-hook.sh" ]; then
  cp "$SCRIPT_DIR/enhanced-pre-commit-hook.sh" "$REPO_ROOT/.git/hooks/pre-commit"
  chmod +x "$REPO_ROOT/.git/hooks/pre-commit"
  echo "✅ Installed: pre-commit hook"
else
  echo "❌ Not found: enhanced-pre-commit-hook.sh"
fi

# Install pre-push hook
if [ -f "$SCRIPT_DIR/pre-push-hook.sh" ]; then
  cp "$SCRIPT_DIR/pre-push-hook.sh" "$REPO_ROOT/.git/hooks/pre-push"
  chmod +x "$REPO_ROOT/.git/hooks/pre-push"
  echo "✅ Installed: pre-push hook"
else
  echo "❌ Not found: pre-push-hook.sh"
fi

echo ""
echo "Hook installation complete!"
echo ""
echo "To test:"
echo "  cd $REPO_ROOT"
echo "  git status"
echo "  # Try committing - hooks will run automatically"
