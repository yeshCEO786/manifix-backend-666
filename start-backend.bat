@echo off
cd /d E:\manifix-backend-666
REM Ensure node_modules/.bin is in PATH
set PATH=%PATH%;node_modules\.bin
npm run dev
pause
