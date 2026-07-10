@echo off
chcp 65001 >nul
echo ========================================
echo   OpenYRWeb Build Script
echo ========================================
echo.

cd /d "%~dp0"

echo [INFO] Starting build...
echo.

node tools/build.mjs

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   Build completed successfully!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo   Build FAILED!
    echo ========================================
    pause
    exit /b 1
)
