@echo off
title CampusNest - Stop Local Services
echo ========================================================
echo       Stopping CampusNest Local Services (8080 & 5173)
echo ========================================================
echo.

echo Terminating backend process on port 8080...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    taskkill /F /PID %%a 2>nul
)

echo Terminating frontend process on port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a 2>nul
)

echo.
echo [OK] CampusNest local servers stopped.
echo ========================================================
pause
