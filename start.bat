@echo off
cd /d "%~dp0"
echo Starting Multigames overlay on http://localhost:8080/  (close this window to stop)
node server.mjs 8080
pause
