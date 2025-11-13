#!/bin/bash
# GCS Backup Setup Script - Layer 5 Implementation
# This script guides you through setting up Google Cloud Storage backup

set -e

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  GCS Backup Setup - Layer 5${NC}"
echo -e "${BLUE}  Estimated time: 15-20 minutes${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Configuration
PROJECT_ID="ssd-sheets-backup"
BUCKET_NAME="ssd-sheets-backup-immutable"
BUCKET_LOCATION="us-central1"
SERVICE_ACCOUNT_NAME="github-backup-uploader"
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
KEY_FILE="$HOME/gcs-backup-key.json"

echo -e "${YELLOW}Step 1: Authenticate with Google Cloud${NC}"
echo "This will open a browser window for authentication..."
echo ""
gcloud auth login

echo ""
echo -e "${GREEN}✅ Authentication successful${NC}"
echo ""

echo -e "${YELLOW}Step 2: Create GCP Project${NC}"
echo "Creating project: $PROJECT_ID"
echo ""

# Check if project exists
if gcloud projects describe "$PROJECT_ID" &>/dev/null; then
    echo -e "${GREEN}✅ Project already exists: $PROJECT_ID${NC}"
else
    gcloud projects create "$PROJECT_ID" --name="SSD Sheets Backup"
    echo -e "${GREEN}✅ Project created: $PROJECT_ID${NC}"
fi

echo ""
echo -e "${YELLOW}Step 3: Set Active Project${NC}"
gcloud config set project "$PROJECT_ID"
echo -e "${GREEN}✅ Active project set to: $PROJECT_ID${NC}"

echo ""
echo -e "${RED}⚠️  IMPORTANT: Enable Billing${NC}"
echo "You need to enable billing for this project to use Cloud Storage."
echo "Opening Google Cloud Console..."
echo ""
echo "Please complete these steps:"
echo "1. Enable billing at: https://console.cloud.google.com/billing/projects"
echo "2. Select project: $PROJECT_ID"
echo "3. Link a billing account (free tier available)"
echo ""
read -p "Press ENTER after enabling billing..."

echo ""
echo -e "${YELLOW}Step 4: Create GCS Bucket with Versioning${NC}"
echo "Creating bucket: gs://$BUCKET_NAME"
echo ""

# Check if bucket exists
if gsutil ls -b gs://$BUCKET_NAME &>/dev/null; then
    echo -e "${GREEN}✅ Bucket already exists: gs://$BUCKET_NAME${NC}"
else
    gsutil mb -p "$PROJECT_ID" -c STANDARD -l "$BUCKET_LOCATION" "gs://$BUCKET_NAME/"
    echo -e "${GREEN}✅ Bucket created: gs://$BUCKET_NAME${NC}"
fi

echo ""
echo "Enabling versioning..."
gsutil versioning set on "gs://$BUCKET_NAME/"
echo -e "${GREEN}✅ Versioning enabled${NC}"

echo ""
echo -e "${YELLOW}Step 5: Set Retention Policy (30 days)${NC}"
echo "This prevents backups from being deleted for 30 days..."
echo ""
gsutil retention set 30d "gs://$BUCKET_NAME/"
echo -e "${GREEN}✅ 30-day retention policy set${NC}"

echo ""
echo -e "${YELLOW}Note:${NC} Retention policy is NOT locked yet."
echo "After testing for 1 week, you can lock it permanently with:"
echo "  gsutil retention lock gs://$BUCKET_NAME/"
echo ""

echo -e "${YELLOW}Step 6: Create Service Account${NC}"
echo "Creating service account: $SERVICE_ACCOUNT_NAME"
echo ""

# Check if service account exists
if gcloud iam service-accounts describe "$SERVICE_ACCOUNT_EMAIL" --project="$PROJECT_ID" &>/dev/null; then
    echo -e "${GREEN}✅ Service account already exists${NC}"
else
    gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" \
        --display-name="GitHub Actions Backup Uploader" \
        --project="$PROJECT_ID"
    echo -e "${GREEN}✅ Service account created${NC}"
fi

echo ""
echo "Granting storage admin role..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/storage.objectAdmin" \
    --quiet

echo -e "${GREEN}✅ Permissions granted${NC}"

echo ""
echo -e "${YELLOW}Step 7: Create Service Account Key${NC}"
echo "Generating key file: $KEY_FILE"
echo ""

# Remove old key if exists
if [ -f "$KEY_FILE" ]; then
    echo "Removing old key file..."
    rm "$KEY_FILE"
fi

gcloud iam service-accounts keys create "$KEY_FILE" \
    --iam-account="$SERVICE_ACCOUNT_EMAIL" \
    --project="$PROJECT_ID"

echo -e "${GREEN}✅ Service account key created${NC}"

echo ""
echo -e "${YELLOW}Step 8: Encode Key for GitHub Secrets${NC}"
echo "Encoding key to base64..."
echo ""

BASE64_KEY=$(cat "$KEY_FILE" | base64)

echo -e "${GREEN}✅ Key encoded${NC}"
echo ""
echo -e "${RED}========================================${NC}"
echo -e "${RED}  COPY THIS KEY TO GITHUB SECRETS${NC}"
echo -e "${RED}========================================${NC}"
echo ""
echo "1. Go to: https://github.com/mmaruthurssd/ssd-google-sheets-staging-production/settings/secrets/actions"
echo "2. Click 'New repository secret'"
echo "3. Name: GCS_SERVICE_ACCOUNT_KEY"
echo "4. Value: Copy the base64 key below"
echo ""
echo -e "${BLUE}--- BEGIN BASE64 KEY ---${NC}"
echo "$BASE64_KEY"
echo -e "${BLUE}--- END BASE64 KEY ---${NC}"
echo ""
echo "The key is also saved to: $KEY_FILE"
echo ""

read -p "Press ENTER after adding the key to GitHub Secrets..."

echo ""
echo -e "${YELLOW}Step 9: Verify Setup${NC}"
echo "Testing bucket access..."
echo ""

# Create test file
echo "Test backup file created on $(date)" > /tmp/gcs-test.txt

# Upload test file
gsutil cp /tmp/gcs-test.txt "gs://$BUCKET_NAME/test/"

# Verify upload
if gsutil ls "gs://$BUCKET_NAME/test/gcs-test.txt" &>/dev/null; then
    echo -e "${GREEN}✅ Bucket access verified${NC}"
    gsutil rm "gs://$BUCKET_NAME/test/gcs-test.txt"
    rm /tmp/gcs-test.txt
else
    echo -e "${RED}❌ Bucket access failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 10: Cleanup${NC}"
echo "Removing local service account key (security best practice)..."
echo ""

if [ -f "$KEY_FILE" ]; then
    echo "Key location: $KEY_FILE"
    read -p "Delete local key file? (y/N): " DELETE_KEY
    if [ "$DELETE_KEY" = "y" ] || [ "$DELETE_KEY" = "Y" ]; then
        rm "$KEY_FILE"
        echo -e "${GREEN}✅ Local key deleted${NC}"
    else
        echo -e "${YELLOW}⚠️  Key file kept at: $KEY_FILE${NC}"
        echo "   Remember to delete it manually after setup is complete!"
    fi
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  GCS Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Summary:"
echo "  Project: $PROJECT_ID"
echo "  Bucket: gs://$BUCKET_NAME"
echo "  Location: $BUCKET_LOCATION"
echo "  Versioning: Enabled"
echo "  Retention: 30 days (unlocked)"
echo "  Service Account: $SERVICE_ACCOUNT_EMAIL"
echo ""
echo "Next Steps:"
echo "  1. ✅ GCS bucket created and configured"
echo "  2. ✅ Service account key added to GitHub Secrets"
echo "  3. ⏳ Create GitHub Actions workflow"
echo "  4. ⏳ Test automated backup"
echo ""
echo "Run the GitHub Actions workflow setup:"
echo "  cd /Users/mmaruthurnew/Desktop/medical-patient-data/Implementation\\ Projects/google-sheets-version-control"
echo "  # The workflow file will be created next"
echo ""
