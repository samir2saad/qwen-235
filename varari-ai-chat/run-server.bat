@echo off
title Varari AI Chat Server
echo ========================================
echo    Varari AI Chat Server
echo ========================================
echo.
echo Starting server...
echo Open http://localhost:3000 in your browser
echo.
echo To stop the server, close this window or press Ctrl+C
echo.

REM Change to the directory where this batch file is located
cd /d "%~dp0"

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm dependencies are installed
if not exist node_modules (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Start the server
echo.
echo Server starting...
node server.js

REM If we get here, the server stopped
echo.
echo Server has stopped.
pause
