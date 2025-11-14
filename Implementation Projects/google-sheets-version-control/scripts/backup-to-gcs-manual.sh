#!/bin/bash
# Manual backup to Google Cloud Storage
# Usage: ./scripts/backup-to-gcs-manual.sh

set -e

REPO_ROOT="/Users/mmaruthurnew/Desktop/medical-patient-data/Implementation Projects/google-sheets-version-control"
cd "$REPO_ROOT" || exit 1

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Manual GCS Backup ===${NC}"
echo ""

# Check gcloud authentication
if ! gcloud auth list 2>/dev/null | grep -q ACTIVE; then
    echo -e "${RED}❌ Not authenticated with gcloud${NC}"
    echo "Run: gcloud auth login"
    exit 1
fi

# Check bucket access
if ! gsutil ls gs://ssd-sheets-backup-immutable/ &>/dev/null; then
    echo -e "${RED}❌ Cannot access GCS bucket${NC}"
    echo "Make sure you have access to: gs://ssd-sheets-backup-immutable/"
    exit 1
fi

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="ssd-sheets-backup-manual-${TIMESTAMP}.tar.gz"
TEMP_DIR="/tmp"

echo "Creating backup archive..."
echo "  Timestamp: $TIMESTAMP"
echo ""

# Create backup in temp directory
tar -czf "${TEMP_DIR}/${BACKUP_FILE}" \
  --exclude='.git/objects' \
  production-sheets/ \
  config/ \
  scripts/ \
  docs/ \
  .github/ \
  .git/ \
  PROJECT-OVERVIEW.md \
  README.md \
  .gitattributes

echo -e "${GREEN}✅ Archive created${NC}"

# Calculate checksum
echo "Calculating checksum..."
sha256sum "${TEMP_DIR}/${BACKUP_FILE}" > "${TEMP_DIR}/${BACKUP_FILE}.sha256"
echo -e "${GREEN}✅ Checksum calculated${NC}"

# Get file size
BACKUP_SIZE=$(du -h "${TEMP_DIR}/${BACKUP_FILE}" | cut -f1)
echo "  Backup size: $BACKUP_SIZE"
echo ""

# Upload to GCS
echo "Uploading to GCS..."
echo "  Destination: gs://ssd-sheets-backup-immutable/manual-backups/"

COMMIT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

gsutil -h "x-goog-meta-timestamp:${TIMESTAMP}" \
       -h "x-goog-meta-commit:${COMMIT_SHA}" \
       -h "x-goog-meta-branch:${BRANCH}" \
       -h "x-goog-meta-size:${BACKUP_SIZE}" \
       -h "x-goog-meta-type:manual" \
       cp "${TEMP_DIR}/${BACKUP_FILE}" \
       gs://ssd-sheets-backup-immutable/manual-backups/

gsutil cp "${TEMP_DIR}/${BACKUP_FILE}.sha256" \
       gs://ssd-sheets-backup-immutable/manual-backups/

echo -e "${GREEN}✅ Upload complete${NC}"

# Verify upload
echo "Verifying upload..."
if gsutil ls -l "gs://ssd-sheets-backup-immutable/manual-backups/${BACKUP_FILE}" &>/dev/null; then
    echo -e "${GREEN}✅ Verification successful${NC}"
else
    echo -e "${RED}❌ Verification failed${NC}"
    exit 1
fi

# Clean up local temp files
echo "Cleaning up local files..."
rm "${TEMP_DIR}/${BACKUP_FILE}" "${TEMP_DIR}/${BACKUP_FILE}.sha256"
echo -e "${GREEN}✅ Cleanup complete${NC}"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Manual Backup Complete${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Backup Details:"
echo "  File:     ${BACKUP_FILE}"
echo "  Size:     ${BACKUP_SIZE}"
echo "  Location: gs://ssd-sheets-backup-immutable/manual-backups/"
echo "  Time:     ${TIMESTAMP}"
echo "  Commit:   ${COMMIT_SHA}"
echo "  Branch:   ${BRANCH}"
echo ""
echo "Protected by:"
echo "  - 30-day retention lock (cannot delete)"
echo "  - Automatic versioning (restore any version)"
echo "  - SHA256 checksum verification"
echo ""
echo "To list all backups:"
echo "  gsutil ls gs://ssd-sheets-backup-immutable/manual-backups/"
echo ""
echo "To download this backup:"
echo "  gsutil cp gs://ssd-sheets-backup-immutable/manual-backups/${BACKUP_FILE} /tmp/"
echo ""
