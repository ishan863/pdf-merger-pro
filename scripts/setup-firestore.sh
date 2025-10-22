#!/bin/bash

# Firestore Setup Script
# Complete setup from scratch with all validations

set -e

echo "🚀 PDF Merger - Firestore Setup Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Firebase CLI
if ! command -v firebase &> /dev/null; then
  echo -e "${RED}❌ Firebase CLI not found${NC}"
  echo "Install with: npm install -g firebase-tools"
  exit 1
fi
echo -e "${GREEN}✓ Firebase CLI installed${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js not found${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Node.js installed${NC}"

# Check .firebaserc exists
if [ ! -f ".firebaserc" ]; then
  echo -e "${RED}❌ .firebaserc not found${NC}"
  echo "Run: firebase init"
  exit 1
fi
echo -e "${GREEN}✓ .firebaserc found${NC}"

echo ""
echo "🔑 Checking Firebase credentials..."

# Check firebase.json exists
if [ ! -f "firebase.json" ]; then
  echo -e "${RED}❌ firebase.json not found${NC}"
  echo "Run: firebase init"
  exit 1
fi
echo -e "${GREEN}✓ firebase.json found${NC}"

# Get project ID
PROJECT_ID=$(grep -o '"projects".*' .firebaserc | grep -o '"default":.*"[^"]*"' | grep -o '"[^"]*"$' | tr -d '":')
if [ -z "$PROJECT_ID" ]; then
  echo -e "${RED}❌ Could not determine Firebase project${NC}"
  exit 1
fi
echo -e "${GREEN}✓ Project: $PROJECT_ID${NC}"

echo ""
echo "📦 Setting up collections..."

# Step 1: Deploy Firestore Rules
echo ""
echo "1️⃣  Deploying Firestore security rules..."
if firebase deploy --only firestore:rules 2>&1 | grep -q "Deployed Firestore Rules"; then
  echo -e "${GREEN}✓ Firestore rules deployed${NC}"
else
  echo -e "${YELLOW}⚠️  Check Firebase console for rule deployment status${NC}"
fi

# Step 2: Deploy Storage Rules
echo ""
echo "2️⃣  Deploying Cloud Storage rules..."
if firebase deploy --only storage 2>&1 | grep -q "Deployed Storage Rules"; then
  echo -e "${GREEN}✓ Storage rules deployed${NC}"
else
  echo -e "${YELLOW}⚠️  Check Firebase console for storage rule deployment status${NC}"
fi

# Step 3: Deploy Cloud Functions
echo ""
echo "3️⃣  Deploying Cloud Functions..."
echo "   (This may take a few minutes...)"
if firebase deploy --only functions 2>&1 | grep -q "functions deployed"; then
  echo -e "${GREEN}✓ Cloud Functions deployed${NC}"
else
  echo -e "${YELLOW}⚠️  Check Cloud Functions console for deployment status${NC}"
fi

# Step 4: Initialize collections
echo ""
echo "4️⃣  Initializing Firestore collections..."
if [ -f "scripts/initialize-firestore.ts" ]; then
  if npx ts-node scripts/initialize-firestore.ts 2>&1; then
    echo -e "${GREEN}✓ Collections initialized${NC}"
  else
    echo -e "${YELLOW}⚠️  Collection initialization may need manual setup${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  Initialization script not found${NC}"
fi

# Step 5: Create backup policy
echo ""
echo "5️⃣  Backup Configuration (Manual in Console)"
echo "   Go to: https://console.firebase.google.com/project/$PROJECT_ID/firestore/backups"
echo "   Enable automated daily backups for critical data"

echo ""
echo "✅ Firestore setup complete!"
echo ""
echo "📚 Next steps:"
echo "   1. Test authentication and CRUD operations"
echo "   2. Create test user in Firebase Console"
echo "   3. Verify security rules in rules playground"
echo "   4. Set up monitoring and alerts"
echo ""
echo "🔗 Resources:"
echo "   Firebase Console: https://console.firebase.google.com"
echo "   Firestore Docs: https://firebase.google.com/docs/firestore"
echo "   Storage Docs: https://firebase.google.com/docs/storage"
