@echo off
echo Starting Varari AI Chat Server...
echo Server will run at http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
echo Current directory: %CD%
cd /d "%~dp0"
echo Changed to: %CD%
echo.
echo Checking if package.json exists...
if exist package.json (
    echo package.json found - starting server...
    npm start
) else (
    echo ERROR: package.json not found!
    echo Make sure you're in the correct directory.
    echo Looking for files in current directory:
    dir
)
echo.
echo Server stopped or failed to start.
pause
