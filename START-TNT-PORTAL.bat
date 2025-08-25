@echo off
echo Starting TNT Driver Portal...
cd /d "C:\Users\spder\Documents\GitHub\tnt-driver-portal"
echo Installing dependencies...
npm install
echo Starting development server...
npm run dev
echo.
echo TNT Driver Portal should open at: http://localhost:3000
echo Press Ctrl+C to stop the server
pause