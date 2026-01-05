# Setup script to install pre-commit hook in COI repository (PowerShell version)

Write-Host "Setting up CORE protection hooks..." -ForegroundColor Green
Write-Host ""

$hookSource = "hooks\pre-commit-core-protection.ps1"
$hookTarget = ".git\hooks\pre-commit"

# Check if hook source exists
if (-not (Test-Path $hookSource)) {
    Write-Host "Error: Hook source not found: $hookSource" -ForegroundColor Red
    exit 1
}

# Check if .git/hooks directory exists
if (-not (Test-Path ".git\hooks")) {
    Write-Host "Error: .git\hooks directory not found. Are you in a git repository?" -ForegroundColor Red
    exit 1
}

# Copy hook
try {
    Copy-Item $hookSource $hookTarget -Force
    Write-Host "Hook installed successfully: $hookTarget" -ForegroundColor Green
} catch {
    Write-Host "Error installing hook: $_" -ForegroundColor Red
    exit 1
}

# Note: On Windows, Git hooks need to be executable
# Git Bash will handle this, but PowerShell might need additional setup
Write-Host ""
Write-Host "Note: For best compatibility on Windows, use Git Bash to run git commands." -ForegroundColor Yellow
Write-Host "The hook will work in Git Bash automatically." -ForegroundColor Yellow
Write-Host ""
Write-Host "Setup complete!" -ForegroundColor Green

