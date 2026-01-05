# Script to sync CORE module from fibi-test repository to COI repository (PowerShell version)
# This script pulls the latest CORE changes from fibi-test and updates COI/DB/CORE

$ErrorActionPreference = "Stop"

# Configuration
$FIBI_TEST_REPO_URL = "https://github.com/eprabhu/fibi-test.git"
$CORE_SOURCE_PATH = "Fibi-Vanilla/FIBI_CORE"
$CORE_TARGET_PATH = "DB/CORE"
$FIBI_TEST_BRANCH = "main"

Write-Host "==========================================" -ForegroundColor Green
Write-Host "CORE Module Sync Script" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Check if we're in a git repository
try {
    $null = git rev-parse --git-dir 2>$null
} catch {
    Write-Host "Error: Not in a git repository" -ForegroundColor Red
    exit 1
}

# Check if git subtree is available
try {
    $null = git subtree --help 2>$null
} catch {
    Write-Host "Error: git subtree command not available" -ForegroundColor Red
    Write-Host "Please ensure you have Git 1.7.11 or later installed"
    exit 1
}

# Get current branch
$CURRENT_BRANCH = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $CURRENT_BRANCH" -ForegroundColor Yellow
Write-Host ""

# Check if there are uncommitted changes
$hasChanges = git diff-index --quiet HEAD --
if (-not $hasChanges) {
    Write-Host "Warning: You have uncommitted changes" -ForegroundColor Yellow
    Write-Host "It's recommended to commit or stash them before syncing."
    $response = Read-Host "Continue anyway? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        exit 1
    }
}

Write-Host "Pulling latest CORE changes from fibi-test repository..." -ForegroundColor Green
Write-Host "Repository: $FIBI_TEST_REPO_URL"
Write-Host "Source path: $CORE_SOURCE_PATH"
Write-Host "Target path: $CORE_TARGET_PATH"
Write-Host "Branch: $FIBI_TEST_BRANCH"
Write-Host ""

# Check if CORE subtree already exists
$subtreeExists = git log --oneline | Select-String -Pattern "git-subtree-dir: $CORE_TARGET_PATH"

if ($subtreeExists) {
    Write-Host "CORE subtree exists. Pulling updates..." -ForegroundColor Yellow
    git subtree pull --prefix="$CORE_TARGET_PATH" --squash "$FIBI_TEST_REPO_URL" "$FIBI_TEST_BRANCH" -m "Sync CORE module from fibi-test"
} else {
    Write-Host "CORE subtree not found. Adding it..." -ForegroundColor Yellow
    
    # Check if target directory exists and has files
    if ((Test-Path $CORE_TARGET_PATH) -and ((Get-ChildItem $CORE_TARGET_PATH -ErrorAction SilentlyContinue | Measure-Object).Count -gt 0)) {
        Write-Host "Error: Directory $CORE_TARGET_PATH already exists and is not empty" -ForegroundColor Red
        Write-Host "Please remove it first or use a different target path"
        exit 1
    }
    
    git subtree add --prefix="$CORE_TARGET_PATH" --squash "$FIBI_TEST_REPO_URL" "$FIBI_TEST_BRANCH" -m "Add CORE module from fibi-test"
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Sync completed successfully!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Review the changes: git diff HEAD~1 $CORE_TARGET_PATH"
Write-Host "  2. If everything looks good, the changes are already committed"
Write-Host "  3. Push to remote: git push origin $CURRENT_BRANCH"
Write-Host ""

