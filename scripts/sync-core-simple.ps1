# Simple sync script that copies CORE files from fibi-test to COI
# Alternative approach: Direct file copy (simpler but requires both repos in same workspace)

$ErrorActionPreference = "Stop"

# Configuration - adjust paths as needed
$FIBI_TEST_PATH = "..\fibi-test"
$CORE_SOURCE_PATH = "Fibi-Vanilla\FIBI_CORE"
$CORE_TARGET_PATH = "DB\CORE"

Write-Host "==========================================" -ForegroundColor Green
Write-Host "Simple CORE Module Sync Script" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Check if source exists
$sourceFullPath = Join-Path $FIBI_TEST_PATH $CORE_SOURCE_PATH
if (-not (Test-Path $sourceFullPath)) {
    Write-Host "Error: Source path not found: $sourceFullPath" -ForegroundColor Red
    Write-Host "Please ensure fibi-test repository is accessible at: $FIBI_TEST_PATH" -ForegroundColor Yellow
    exit 1
}

# Check if we're in a git repository
try {
    $null = git rev-parse --git-dir 2>$null
} catch {
    Write-Host "Error: Not in a git repository" -ForegroundColor Red
    exit 1
}

# Get current branch
$CURRENT_BRANCH = git rev-parse --abbrev-ref HEAD
Write-Host "Current branch: $CURRENT_BRANCH" -ForegroundColor Yellow
Write-Host ""

# Check for uncommitted changes
$hasChanges = git diff-index --quiet HEAD --
if (-not $hasChanges) {
    Write-Host "Warning: You have uncommitted changes" -ForegroundColor Yellow
    $response = Read-Host "Continue anyway? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        exit 1
    }
}

Write-Host "Syncing CORE module..." -ForegroundColor Green
Write-Host "Source: $sourceFullPath"
Write-Host "Target: $CORE_TARGET_PATH"
Write-Host ""

# Create target directory if it doesn't exist
if (-not (Test-Path $CORE_TARGET_PATH)) {
    New-Item -ItemType Directory -Path $CORE_TARGET_PATH -Force | Out-Null
    Write-Host "Created target directory: $CORE_TARGET_PATH" -ForegroundColor Yellow
}

# Remove existing files (except .git if it exists)
if (Test-Path $CORE_TARGET_PATH) {
    Get-ChildItem $CORE_TARGET_PATH -Exclude ".git" | Remove-Item -Recurse -Force
}

# Copy files
Write-Host "Copying files..." -ForegroundColor Green
Copy-Item -Path "$sourceFullPath\*" -Destination $CORE_TARGET_PATH -Recurse -Force

Write-Host ""
Write-Host "Files synced successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Review changes: git status"
Write-Host "  2. Stage changes: git add $CORE_TARGET_PATH"
Write-Host "  3. Commit: git commit -m 'Sync CORE module from fibi-test'"
Write-Host "  4. Push: git push origin $CURRENT_BRANCH"
Write-Host ""

