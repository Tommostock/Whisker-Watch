#!/bin/bash

# Performance Check Script
# Runs Lighthouse CI and saves results for tracking
# Usage: ./scripts/performance-check.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Whisker Watch Performance Check${NC}"
echo "======================================"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found. Please install Node.js and npm.${NC}"
    exit 1
fi

# Check if lhci is installed
if ! npx -y lhci --version &> /dev/null; then
    echo -e "${YELLOW}⚠️  Installing Lighthouse CI...${NC}"
    npm install --save-dev @lhci/cli@0.12.x
fi

# Step 1: Build
echo -e "${YELLOW}📦 Building application...${NC}"
npm run build
BUILD_SIZE=$(du -sh .next | awk '{print $1}')
echo -e "${GREEN}✅ Build complete (${BUILD_SIZE})${NC}"
echo ""

# Step 2: Start server
echo -e "${YELLOW}🚀 Starting production server...${NC}"
npm start > /tmp/next-server.log 2>&1 &
SERVER_PID=$!

# Wait for server to be ready
echo -e "${YELLOW}⏳ Waiting for server to start...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server ready on http://localhost:3000${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ Server failed to start${NC}"
        cat /tmp/next-server.log
        exit 1
    fi
    sleep 1
done
echo ""

# Step 3: Run Lighthouse
echo -e "${YELLOW}📊 Running Lighthouse CI (3 runs)...${NC}"
npx lhci autorun 2>&1 | tee /tmp/lighthouse-results.log

# Step 4: Extract and display results
echo ""
echo -e "${YELLOW}📈 Performance Summary${NC}"
echo "======================================"

# Parse results from log
RESULTS_URL=$(grep -i "permanent storage" /tmp/lighthouse-results.log | tail -1 | awk '{print $NF}' || echo "N/A")

echo -e "Build Size: ${BUILD_SIZE}"
echo -e "Server PID: ${SERVER_PID}"

if [ "$RESULTS_URL" != "N/A" ]; then
    echo -e "Results URL: ${GREEN}${RESULTS_URL}${NC}"
else
    echo -e "Results URL: ${YELLOW}View logs above${NC}"
fi

echo ""

# Step 5: Cleanup
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true
echo -e "${GREEN}✅ Server stopped${NC}"

echo ""
echo -e "${GREEN}✅ Performance check complete!${NC}"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "  - Results are saved in temporary storage (expires in 7 days)"
echo "  - For persistent storage, set up GitHub integration"
echo "  - Review the PERFORMANCE.md guide for optimization tips"
echo "  - Run this script weekly to monitor trends"
