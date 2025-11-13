#!/bin/bash
# Git safety wrapper for dangerous operations
# Usage: ./git-safety-wrapper.sh {reset-hard|clean}

REPO_ROOT="/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"

# Color codes
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

# Function to verify backup exists
verify_backup() {
    echo -e "${GREEN}Verifying backup...${NC}"
    cd "$REPO_ROOT" || exit 1
    LATEST_COMMIT=$(git rev-parse HEAD 2>/dev/null)
    echo "Latest commit: $LATEST_COMMIT"

    # Check if config file exists in git history
    if git show "$LATEST_COMMIT:config/sheet-registry.json" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backup verified in git history${NC}"
        return 0
    else
        echo -e "${RED}❌ WARNING: Cannot verify backup!${NC}"
        return 1
    fi
}

# Function to create emergency backup before dangerous operation
create_emergency_backup() {
    echo -e "${YELLOW}Creating emergency backup before operation...${NC}"
    cd "$REPO_ROOT" || exit 1
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    BACKUP_DIR="$HOME/.google-sheets-emergency-backups"
    mkdir -p "$BACKUP_DIR"

    # Create tarball of critical directories
    tar -czf "$BACKUP_DIR/emergency-backup-${TIMESTAMP}.tar.gz" \
        production-sheets/ \
        staging-sheets/ 2>/dev/null \
        config/sheet-registry.json \
        2>/dev/null

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Emergency backup created:${NC}"
        echo "   $BACKUP_DIR/emergency-backup-${TIMESTAMP}.tar.gz"
        echo "   Size: $(du -h "$BACKUP_DIR/emergency-backup-${TIMESTAMP}.tar.gz" | cut -f1)"

        # List recent backups
        echo ""
        echo "Recent emergency backups:"
        ls -lth "$BACKUP_DIR" | head -6
        return 0
    else
        echo -e "${RED}❌ Failed to create emergency backup${NC}"
        return 1
    fi
}

# Function to show current state
show_state() {
    echo ""
    echo -e "${YELLOW}Current repository state:${NC}"
    cd "$REPO_ROOT" || exit 1

    PROD_COUNT=$(ls -d production-sheets/sheet-* 2>/dev/null | wc -l | xargs)
    echo "  Production sheets: $PROD_COUNT"

    echo "  Git status:"
    git status --short | head -10

    echo "  Last 3 commits:"
    git log --oneline -3
    echo ""
}

# Main wrapper
case "$1" in
    reset-hard)
        echo -e "${RED}⚠️  WARNING: git reset --hard will lose uncommitted changes!${NC}"
        echo ""

        show_state
        verify_backup || exit 1
        create_emergency_backup || exit 1

        echo ""
        echo -e "${RED}This operation will discard all uncommitted changes.${NC}"
        echo "Type 'YES' to confirm reset --hard:"
        read -r REPLY

        if [ "$REPLY" = "YES" ]; then
            cd "$REPO_ROOT" || exit 1
            if [ -n "$2" ]; then
                git reset --hard "$2"
            else
                git reset --hard HEAD
            fi
            echo -e "${GREEN}✅ Reset complete${NC}"
            show_state
        else
            echo "Cancelled"
            exit 1
        fi
        ;;

    clean)
        echo -e "${RED}⚠️  WARNING: git clean will remove untracked files!${NC}"
        echo ""

        show_state
        create_emergency_backup || exit 1

        echo ""
        echo -e "${YELLOW}Files that would be removed:${NC}"
        cd "$REPO_ROOT" || exit 1
        git clean -n

        echo ""
        echo -e "${RED}Remove these files?${NC}"
        echo "Type 'YES' to confirm:"
        read -r REPLY

        if [ "$REPLY" = "YES" ]; then
            cd "$REPO_ROOT" || exit 1
            git clean -fd
            echo -e "${GREEN}✅ Clean complete${NC}"
            show_state
        else
            echo "Cancelled"
            exit 1
        fi
        ;;

    verify-count)
        cd "$REPO_ROOT" || exit 1
        PROD_COUNT=$(ls -d production-sheets/sheet-* 2>/dev/null | wc -l | xargs)
        echo "Production sheets: $PROD_COUNT (expected: 588)"

        if [ "$PROD_COUNT" -eq 588 ]; then
            echo -e "${GREEN}✅ Count correct${NC}"
            exit 0
        else
            echo -e "${RED}❌ Count mismatch!${NC}"
            exit 1
        fi
        ;;

    list-backups)
        BACKUP_DIR="$HOME/.google-sheets-emergency-backups"
        if [ -d "$BACKUP_DIR" ]; then
            echo "Emergency backups in $BACKUP_DIR:"
            ls -lth "$BACKUP_DIR"
        else
            echo "No emergency backups found"
        fi
        ;;

    restore-backup)
        BACKUP_DIR="$HOME/.google-sheets-emergency-backups"
        if [ -z "$2" ]; then
            echo "Usage: $0 restore-backup <backup-filename>"
            echo ""
            echo "Available backups:"
            ls -1 "$BACKUP_DIR" 2>/dev/null || echo "No backups found"
            exit 1
        fi

        BACKUP_FILE="$BACKUP_DIR/$2"
        if [ ! -f "$BACKUP_FILE" ]; then
            echo -e "${RED}❌ Backup file not found: $BACKUP_FILE${NC}"
            exit 1
        fi

        echo -e "${YELLOW}Restoring from backup: $2${NC}"
        echo "This will extract files to current directory"
        echo "Type 'YES' to confirm:"
        read -r REPLY

        if [ "$REPLY" = "YES" ]; then
            cd "$REPO_ROOT" || exit 1
            tar -xzf "$BACKUP_FILE"
            echo -e "${GREEN}✅ Restore complete${NC}"
            show_state
        else
            echo "Cancelled"
            exit 1
        fi
        ;;

    *)
        echo "Git Safety Wrapper - Protect against accidental data loss"
        echo ""
        echo "Usage: $0 {command}"
        echo ""
        echo "Commands:"
        echo "  reset-hard [commit]  - Safely perform git reset --hard"
        echo "  clean                - Safely remove untracked files"
        echo "  verify-count         - Verify production sheet count"
        echo "  list-backups         - List emergency backups"
        echo "  restore-backup FILE  - Restore from emergency backup"
        echo ""
        echo "All dangerous operations create emergency backups first."
        exit 1
        ;;
esac
