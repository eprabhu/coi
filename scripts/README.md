# CORE Module Synchronization

## Overview
The CORE module in this repository is synchronized from the `fibi-test` repository. It is **read-only** in this repository to prevent conflicts and ensure a single source of truth.

## Making Changes to CORE

### ❌ DO NOT modify CORE directly in this repository
Any attempts to modify files in `DB/CORE/` will be blocked by the pre-commit hook.

### ✅ Correct Process:
1. **Make changes in fibi-test repository**
   - Navigate to `fibi-test/Fibi-Vanilla/FIBI_CORE/`
   - Make your changes
   - Commit and push to fibi-test repository

2. **Sync changes to this repository**
   ```bash
   ./scripts/sync-core-from-fibi-test.sh
   ```

3. **Review and push**
   ```bash
   git diff HEAD~1 DB/CORE
   git push origin <your-branch>
   ```

## Sync Script Usage

### Basic Usage
```bash
./scripts/sync-core-from-fibi-test.sh
```

This script will:
- Pull the latest CORE changes from fibi-test repository
- Update `DB/CORE/` in this repository
- Create a commit with the synced changes

### Requirements
- Git 1.7.11 or later (for git subtree support)
- Access to fibi-test repository
- Clean working directory (or stash uncommitted changes)

## Troubleshooting

### Error: "CORE subtree not found"
If this is the first time syncing, the script will automatically add the subtree.

### Error: "Directory already exists"
If `DB/CORE` exists but isn't a subtree, you may need to:
1. Backup the existing directory
2. Remove it
3. Run the sync script again

### Conflict Resolution
If there are conflicts during sync:
1. Resolve conflicts manually
2. Complete the merge
3. Commit the resolution

## Protection Mechanism

The pre-commit hook (`hooks/pre-commit-core-protection.sh`) automatically prevents any modifications to `DB/CORE/` in this repository. If you try to commit changes to CORE, you'll see an error message with instructions.

