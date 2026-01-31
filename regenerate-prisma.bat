@echo off
echo Closing any Node processes that might be holding files...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Deleting temp files...
del "%~dp0node_modules\.prisma\client\query_engine-windows.dll.node.tmp*" 2>nul

echo Generating Prisma Client...
cd /d "%~dp0"
npx prisma generate

echo Done!
pause
