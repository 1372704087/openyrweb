#!/usr/bin/env pwsh
# OpenYRWeb 一键启动脚本（Windows）
# 功能：检查环境 -> 安装依赖 -> 构建 vendor -> 构建客户端 -> 启动服务 -> 打开浏览器

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $ROOT

$NODE_MIN = 20
$SERVE_PORT = if ($env:PORT) { $env:PORT } else { 8080 }
$SERVE_URL = "http://127.0.0.1:$SERVE_PORT/"

function Write-Step {
    param([string]$Message)
    Write-Host "`n[$Message]" -ForegroundColor Cyan
}

function Test-Command {
    param([string]$Name)
    return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Get-NodeVersion {
    $ver = (& node --version) -replace "^v", ""
    return [int]($ver.Split(".")[0])
}

# 1. 检查 Node.js
Write-Step "检查 Node.js"
if (-not (Test-Command "node")) {
    Write-Host "错误：未找到 Node.js。请先安装 Node.js >= $NODE_MIN" -ForegroundColor Red
    Write-Host "下载地址：https://nodejs.org/"
    pause
    exit 1
}
$nodeVer = Get-NodeVersion
if ($nodeVer -lt $NODE_MIN) {
    Write-Host "错误：Node.js 版本过低（当前 $nodeVer，需要 >= $NODE_MIN）" -ForegroundColor Red
    pause
    exit 1
}
Write-Host "Node.js 版本 OK：v$nodeVer" -ForegroundColor Green

# 2. 安装依赖
if (-not (Test-Path "node_modules")) {
    Write-Step "安装 npm 依赖"
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误：npm install 失败" -ForegroundColor Red
        pause
        exit 1
    }
} else {
    Write-Host "node_modules 已存在，跳过安装" -ForegroundColor Green
}

# 3. 构建 vendor
$vendorBundle = [System.IO.Path]::Combine($ROOT, "vendor", "dist", "vendor.bundle.js")
$vendorWorker = [System.IO.Path]::Combine($ROOT, "vendor", "dist", "worker.js")
if (-not (Test-Path $vendorBundle) -or -not (Test-Path $vendorWorker)) {
    Write-Step "构建 vendor 包"
    npm run build:vendor
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误：npm run build:vendor 失败" -ForegroundColor Red
        pause
        exit 1
    }
} else {
    Write-Host "vendor 已构建，跳过" -ForegroundColor Green
}

# 4. 构建客户端
$buildIndex = [System.IO.Path]::Combine($ROOT, "build", "index.html")
if (-not (Test-Path $buildIndex)) {
    Write-Step "构建客户端"
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "错误：npm run build 失败" -ForegroundColor Red
        pause
        exit 1
    }
} else {
    Write-Host "build/ 已存在，跳过构建" -ForegroundColor Green
}

# 5. 启动服务
Write-Step "启动本地服务器"

# 先检查端口占用，避免启动后隐藏窗口吞掉 EADDRINUSE 错误
$portInUse = Get-NetTCPConnection -LocalPort $SERVE_PORT -State Listen -ErrorAction SilentlyContinue
if ($portInUse) {
    $owner = $portInUse | Select-Object -First 1 -ExpandProperty OwningProcess
    Write-Host "错误：端口 $SERVE_PORT 已被占用（PID: $owner）" -ForegroundColor Red
    Write-Host "请先停止占用该端口的进程，或换端口启动：例如 `$env:PORT=8081; .\start.ps1" -ForegroundColor Yellow
    pause
    exit 1
}

$outLog = Join-Path $ROOT "server-start.out.log"
$errLog = Join-Path $ROOT "server-start.err.log"
Remove-Item $outLog, $errLog -ErrorAction SilentlyContinue
$serveProc = Start-Process -FilePath "node" -ArgumentList "server/index.mjs", $SERVE_PORT -WorkingDirectory $ROOT -WindowStyle Hidden -PassThru -RedirectStandardOutput $outLog -RedirectStandardError $errLog

# 6. 等待服务可用
Write-Host "等待服务器启动..." -NoNewline
$maxWait = 30
$started = $false
$crashed = $false
for ($i = 0; $i -lt $maxWait; $i++) {
    Start-Sleep -Seconds 1
    if ($serveProc.HasExited) {
        $crashed = $true
        break
    }
    try {
        $resp = Invoke-WebRequest -Uri $SERVE_URL -Method HEAD -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        if ($resp.StatusCode -eq 200) {
            $started = $true
            break
        }
    } catch {
        Write-Host "." -NoNewline
    }
}

if (-not $started) {
    Write-Host "`n错误：服务器未能在 ${maxWait}s 内启动" -ForegroundColor Red
    if ($crashed) {
        Write-Host "服务器进程已提前退出。" -ForegroundColor Red
    }
    foreach ($log in @($outLog, $errLog)) {
        if (Test-Path $log) {
            $content = Get-Content $log -Raw
            if ($content) {
                Write-Host "`n--- $(Split-Path $log -Leaf) ---" -ForegroundColor Yellow
                Write-Host $content
                Write-Host "--- 日志结束 ---`n" -ForegroundColor Yellow
            }
        }
    }
    if ($serveProc -and -not $serveProc.HasExited) {
        Stop-Process -Id $serveProc.Id -Force -ErrorAction SilentlyContinue
    }
    pause
    exit 1
}

# 启动成功后清理日志
Remove-Item $outLog, $errLog -ErrorAction SilentlyContinue
Write-Host "`n服务器已启动：$SERVE_URL" -ForegroundColor Green

# 7. 打开浏览器
Write-Step "打开浏览器"
Start-Process $SERVE_URL

Write-Host "`n按任意键停止服务器并退出..." -ForegroundColor Yellow
[void][System.Console]::ReadKey($true)

# 停止服务
if ($serveProc -and -not $serveProc.HasExited) {
    Stop-Process -Id $serveProc.Id -Force
}
Remove-Item $outLog, $errLog -ErrorAction SilentlyContinue
Write-Host "已停止服务器" -ForegroundColor Green
