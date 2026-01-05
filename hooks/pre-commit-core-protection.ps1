# Pre-commit hook to prevent modifications to CORE module in COI repository (PowerShell version)
# This ensures CORE can only be modified in fibi-test repository

# Get list of staged files
$stagedFiles = git diff --cached --name-only

# Check if any files in DB/CORE are being modified
$coreModifications = $stagedFiles | Where-Object { $_ -like "DB/CORE/*" }

if ($coreModifications) {
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host "ERROR: CORE Module Protection" -ForegroundColor Red
    Write-Host "==========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "You are attempting to modify files in the CORE module:" -ForegroundColor Yellow
    Write-Host ""
    foreach ($file in $coreModifications) {
        Write-Host "  - $file" -ForegroundColor Yellow
    }
    Write-Host ""
    Write-Host "The CORE module is READ-ONLY in this repository." -ForegroundColor Yellow
    Write-Host "All CORE modifications must be made in the fibi-test repository." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To update CORE in this repository:" -ForegroundColor Cyan
    Write-Host "  1. Make changes in fibi-test repository"
    Write-Host "  2. Run: .\scripts\sync-core-from-fibi-test.ps1"
    Write-Host "  3. Commit the synced changes"
    Write-Host ""
    Write-Host "If you need to make changes to CORE, please:" -ForegroundColor Cyan
    Write-Host "  - Switch to fibi-test repository"
    Write-Host "  - Make your changes there"
    Write-Host "  - Then sync to this repository"
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Red
    exit 1
}

exit 0

