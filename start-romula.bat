@echo off
echo Starting ROMULA v2...

echo [1/3] Setting up Database...
cd c:\Users\acer\OneDrive\Desktop\CODING\APLIKASI\romula\backend
call npx prisma generate
call npx prisma db push

echo [2/3] Starting Backend API on Port 4000...
start cmd /k "title ROMULA-BACKEND && npm run dev"

echo [3/3] Starting Frontend Next.js on Port 3000...
cd c:\Users\acer\OneDrive\Desktop\CODING\APLIKASI\romula\frontend
start cmd /k "title ROMULA-FRONTEND && npm run dev"

echo.
echo =======================================================
echo ✅ ROMULA v2 is Starting!
echo.
echo The backend and frontend are opening in new windows.
echo Please wait about 5-10 seconds for the Next.js server to start.
echo.
echo Application URL: http://localhost:3000
echo =======================================================
echo.
pause
