#!/bin/bash
# REVERIE API Deployment — Deploy updated code to Hetzner VPS
# Usage: VPS_HOST=root@api-reverie.hetzner.com ./deploy/deploy_api.sh

set -e

# Configuration
VPS_HOST="${VPS_HOST:-root@YOUR_VPS_IP}"
VPS_USER="${VPS_USER:-root}"
REMOTE_PATH="/opt/reverie-api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== REVERIE API Deployment ===${NC}"
echo "Target: $VPS_HOST:$REMOTE_PATH"
echo ""

# Verify VPS_HOST is set
if [[ "$VPS_HOST" == "root@YOUR_VPS_IP" ]]; then
  echo -e "${RED}ERROR: Set VPS_HOST environment variable${NC}"
  echo "Example: export VPS_HOST=root@api-reverie.d2mluxury.quest"
  exit 1
fi

# Sync API code (exclude __pycache__, .venv, .env)
echo -e "${YELLOW}Syncing code to VPS...${NC}"
rsync -avz --delete \
  --exclude=__pycache__ \
  --exclude=.venv \
  --exclude=.env \
  --exclude=.pytest_cache \
  --exclude=.git \
  ./api/ "$VPS_HOST:$REMOTE_PATH/"

echo -e "${GREEN}Code synced${NC}"
echo ""

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
ssh "$VPS_HOST" << 'BASH'
  cd /opt/reverie-api
  source .venv/bin/activate
  pip install -q -r requirements.txt
BASH
echo -e "${GREEN}Dependencies installed${NC}"
echo ""

# Restart service
echo -e "${YELLOW}Restarting reverie-api service...${NC}"
ssh "$VPS_HOST" systemctl restart reverie-api
sleep 2

# Check status
echo -e "${YELLOW}Service status:${NC}"
ssh "$VPS_HOST" systemctl is-active reverie-api && \
  echo -e "${GREEN}✓ reverie-api is active${NC}" || \
  echo -e "${RED}✗ reverie-api failed to start${NC}"

echo ""
echo -e "${YELLOW}Recent logs:${NC}"
ssh "$VPS_HOST" journalctl -u reverie-api -n 10 --no-pager

echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
