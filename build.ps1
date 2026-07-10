# OpenYRWeb Build Script (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OpenYRWeb Build Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $PSScriptRoot

Write-Host "[INFO] Starting build..." -ForegroundColor Yellow
Write-Host ""

try {
    node tools/build.mjs

    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "  Build completed successfully!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
    } else {
        throw "Build failed with exit code $LASTEXITCODE"
    }
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  Build FAILED!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
