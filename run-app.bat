@echo off
:: Navigate to the folder where this script is located
cd /d "%~dp0"

echo [1/4] Closing any running app processes...
:: Taskkill stops any background Electron instances to avoid folder locking
taskkill /F /IM electron.exe /T >nul 2>&1

echo [2/4] Installing base dependencies...
call npm install

echo [3/4] Installing robotjs...
call npm install robotjs

echo [4/4] Rebuilding for Electron...
:: This ensures the module version matches Version 140
call .\node_modules\.bin\electron-rebuild -f -w robotjs

echo.
echo ======================================================
echo Installation complete! 
echo Use launch.vbs to start the Actions Ring silently.
echo ======================================================
echo.

:: Waits for 10 seconds before closing the window
timeout /t 10 /nobreak

exit /b 0