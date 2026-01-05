#!/bin/bash

# Pre-commit hook to prevent modifications to CORE module in COI repository
# This ensures CORE can only be modified in fibi-test repository

# Get list of staged files
STAGED_FILES=$(git diff --cached --name-only)

# Check if any files in DB/CORE are being modified
CORE_MODIFICATIONS=$(echo "$STAGED_FILES" | grep "^DB/CORE/")

if [ -n "$CORE_MODIFICATIONS" ]; then
    echo "=========================================="
    echo "ERROR: CORE Module Protection"
    echo "=========================================="
    echo ""
    echo "You are attempting to modify files in the CORE module:"
    echo ""
    echo "$CORE_MODIFICATIONS" | sed 's/^/  - /'
    echo ""
    echo "The CORE module is READ-ONLY in this repository."
    echo "All CORE modifications must be made in the fibi-test repository."
    echo ""
    echo "To update CORE in this repository:"
    echo "  1. Make changes in fibi-test repository"
    echo "  2. Run: ./scripts/sync-core-from-fibi-test.sh"
    echo "  3. Commit the synced changes"
    echo ""
    echo "If you need to make changes to CORE, please:"
    echo "  - Switch to fibi-test repository"
    echo "  - Make your changes there"
    echo "  - Then sync to this repository"
    echo ""
    echo "=========================================="
    exit 1
fi

exit 0

