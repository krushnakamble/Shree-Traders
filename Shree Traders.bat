@echo off
title Shree Traders ERP Launcher
color 0A
echo ===================================================
echo        STARTING SHREE TRADERS ERP SYSTEM
echo ===================================================
echo.

echo [+] Starting the Java Backend Server (Database API)...
start cmd /k "title ERP Backend && cd backend && .\mvnw.cmd spring-boot:run"

echo [+] Waiting 5 seconds before starting Frontend...
timeout /t 5 /nobreak > NUL

echo [+] Starting the React JS Frontend Server...
start cmd /k "title ERP Frontend && cd frontend && npm run dev"

echo [+] Waiting 3 seconds for the UI to be ready...
timeout /t 3 /nobreak > NUL

echo [+] Opening the ERP Dashboard in your default Web Browser...
start http://localhost:5173/

echo.
echo ===================================================
echo SYSTEM RUNNING!
echo You can now close this launcher window.
echo Note: Do not close the two black command windows 
echo (ERP Backend and ERP Frontend) while using the app!
echo ===================================================
timeout /t 10
exit
