#!/bin/bash

# Script to sync CORE module from fibi-test repository to COI repository
# This script pulls the latest CORE changes from fibi-test and updates COI/DB/CORE

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
FIBI_TEST_REPO_URL="https://github.com/eprabhu/fibi-test.git"
CORE_SOURCE_PATH="Fibi-Vanilla/FIBI_CORE"
CORE_TARGET_PATH="DB/CORE"
FIBI_TEST_BRANCH="main"

echo -e "${GREEN}=========================================="
echo "CORE Module Sync Script"
echo "==========================================${NC}"
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi

# Check if git subtree is available
if ! git subtree --help > /dev/null 2>&1; then
    echo -e "${RED}Error: git subtree command not available${NC}"
    echo "Please ensure you have Git 1.7.11 or later installed"
    exit 1
fi

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${YELLOW}Current branch: ${CURRENT_BRANCH}${NC}"
echo ""

# Check if there are uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}Warning: You have uncommitted changes${NC}"
    echo "It's recommended to commit or stash them before syncing."
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}Pulling latest CORE changes from fibi-test repository...${NC}"
echo "Repository: $FIBI_TEST_REPO_URL"
echo "Source path: $CORE_SOURCE_PATH"
echo "Target path: $CORE_TARGET_PATH"
echo "Branch: $FIBI_TEST_BRANCH"
echo ""

# Check if CORE subtree already exists
if git log --oneline | grep -q "git-subtree-dir: $CORE_TARGET_PATH"; then
    echo -e "${YELLOW}CORE subtree exists. Pulling updates...${NC}"
    git subtree pull --prefix="$CORE_TARGET_PATH" --squash "$FIBI_TEST_REPO_URL" "$FIBI_TEST_BRANCH" -m "Sync CORE module from fibi-test"
else
    echo -e "${YELLOW}CORE subtree not found. Adding it...${NC}"
    
    # Check if target directory exists and has files
    if [ -d "$CORE_TARGET_PATH" ] && [ "$(ls -A $CORE_TARGET_PATH 2>/dev/null)" ]; then
        echo -e "${RED}Error: Directory $CORE_TARGET_PATH already exists and is not empty${NC}"
        echo "Please remove it first or use a different target path"
        exit 1
    fi
    
    git subtree add --prefix="$CORE_TARGET_PATH" --squash "$FIBI_TEST_REPO_URL" "$FIBI_TEST_BRANCH" -m "Add CORE module from fibi-test"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "Sync completed successfully!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Review the changes: git diff HEAD~1 $CORE_TARGET_PATH"
echo "  2. If everything looks good, the changes are already committed"
echo "  3. Push to remote: git push origin $CURRENT_BRANCH"
echo ""

