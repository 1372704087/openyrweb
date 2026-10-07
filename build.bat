@echo off
chcp 65001 >nul
echo ========================================
echo   OpenYRWeb Build Script
echo ========================================
echo.

cd /d "%~dp0"

echo [INFO] Starting build...
echo.

rem npm run build = tools/build.mjs + tools/emit-permodule.mjs（缺后者则逐模块 404）
rem 必须用 call：npm 是 npm.cmd，不加 call 会直接移交控制权，跳过后面的成败判断
call npm run build

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo   Build completed successfully!
    echo ========================================
    pause
) else (
    echo.
    echo ========================================
    echo   Build FAILED!
    echo ========================================
    pause
    exit /b 1
)
