@echo off
chcp 65001 >nul
title OpenYRWeb 一键启动
cd /d "%~dp0"

echo.
echo  OpenYRWeb 一键启动器
echo  将自动检查环境、安装依赖、构建并启动本地服务器
echo.

powershell -ExecutionPolicy Bypass -File "start.ps1"

if errorlevel 1 (
    echo.
    echo 启动失败，请查看上方错误信息。
    pause
    exit /b 1
)
