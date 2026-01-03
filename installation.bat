@echo off
:: Navigate to the folder where this script is located
cd /d "%~dp0"

:: Install dependencies
npm i

:: Install robotjs
npm i robotjs

echo Installation complete. Run launch.vbs to start the application in the background.

timeout /t 10

exit /b 0