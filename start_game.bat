@echo off
setlocal

cd /d "%~dp0"

echo ========================================
echo  Hime Star Journey - Dev Launcher
echo ========================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not available in PATH.
  echo Install Node.js LTS, then run this file again.
  echo.
  pause
  exit /b 1
)

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo npm.cmd is not available in PATH.
  echo Reinstall Node.js LTS, then run this file again.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo node_modules was not found. Installing dependencies...
  call npm.cmd install
  if errorlevel 1 (
    echo.
    echo npm install failed.
    pause
    exit /b 1
  )
  echo.
)

echo Starting the game dev server...
echo URL: http://127.0.0.1:5173
echo.
echo Keep this window open while playing.
echo Press Ctrl+C to stop the server.
echo.

call npm.cmd run dev -- --port 5173

echo.
echo Dev server stopped.
pause
