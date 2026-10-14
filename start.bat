@echo off
cd /d "%~dp0"
echo Starting Beat Saber overlay on http://localhost:8080/
node server.mjs 8080
pause
