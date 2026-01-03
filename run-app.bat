@echo off
:: Navigate to the folder where this script is located
cd /d "%~dp0"

:: Rebuild native modules for Electron
.\node_modules\.bin\electron-rebuild -f -w robotjs

:: Launch the Electron app
npm start