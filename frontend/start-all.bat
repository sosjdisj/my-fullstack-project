@echo off
echo 正在启动主应用和微应用...

:: 启动微应用
start "微应用" cmd /k "cd /d micro-app && npm run dev"

:: 等待几秒让微应用启动
timeout /t 5 /nobreak >nul

:: 启动主应用
start "主应用" cmd /k "npm run dev"

echo 主应用和微应用已启动，请稍候...