@echo off
:: Navigate to the folder where this script is located
cd /d "%~dp0"

echo [1/2] Installing dependencies...
call npm install

echo [2/2] No native modules need to be built.

echo.
echo ======================================================
echo Installation complete! 
echo Use launch.vbs to start the Actions Ring silently.
echo ======================================================
echo.

:: Waits for 10 seconds before closing the window
timeout /t 5

exit /b 0
