@echo off
title QCO Intelligence Dashboard - Vietnam Samho
echo ===============================================================
echo     VIETNAM SAMHO - LEAN / TPM DIVISION
echo     QUICK CHANGEOVER (QCO) INTELLIGENCE DASHBOARD
echo ===============================================================
echo Dang khoi dong web server tai http://localhost:8080 ...
start "" http://localhost:8080/index.html
python -m http.server 8080
pause
