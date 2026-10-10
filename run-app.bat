@echo off
:: Navigate to the folder where this script is located
cd /d "%~dp0"

:: Prevent a parent development shell from forcing Electron to run as Node.
set "ELECTRON_RUN_AS_NODE="

:: Launch the Electron app
npm start
