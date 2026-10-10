@echo off
title CampusNest - Local Startup
echo ========================================================
echo       CAMPUSNEST - SMART LIBRARY MANAGEMENT SYSTEM
echo       Your Books. Your Campus. Your Progress.
echo ========================================================
echo.

:: 1. Check MySQL
echo [1/3] Checking MySQL database on port 3306...
netstat -ano | findstr 127.0.0.1:3306 >nul
if %errorlevel% neq 0 (
    echo [!] MySQL is not running on port 3306.
    echo     Please ensure your MySQL 8 service is started with campusnest_db loaded.
    echo     Schema script: database\schema.sql
    echo     Sample data:   database\sample-data.sql
    echo.
) else (
    echo [OK] MySQL is active and listening on port 3306.
)

:: 2. Start Backend
echo.
echo [2/3] Starting Java 21 Spring Boot Backend on port 8080...
if exist "backend\target\campusnest-backend-1.0.0.jar" (
    start "CampusNest Backend [Port 8080]" cmd /k "cd /d %~dp0backend && java -jar target\campusnest-backend-1.0.0.jar"
) else (
    start "CampusNest Backend [Port 8080]" cmd /k "cd /d %~dp0backend && mvn spring-boot:run"
)

:: 3. Start Frontend
echo.
echo [3/3] Starting React 18 / Vite Frontend on port 5173...
start "CampusNest Frontend [Port 5173]" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo   CampusNest services are launching!
echo   Frontend Portal: http://localhost:5173
echo   Backend REST API: http://localhost:8080/api
echo   Health Check:     http://localhost:8080/api/health
echo.
echo   Demo Accounts:
echo   - Admin:   username: admin           password: AdminPassword123!
echo   - Student: username: STU2026001     password: StudentPassword123!
echo   - Faculty: username: FAC2026001     password: FacultyPassword123!
echo ========================================================
pause
