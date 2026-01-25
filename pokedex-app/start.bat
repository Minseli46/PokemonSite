@echo off
echo ========================================
echo    Demarrage de l'application Pokedex
echo ========================================
echo.

echo [Backend] Lancement du serveur...
start "Pokedex Backend" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak >nul

echo [Frontend] Lancement du client...
start "Pokedex Frontend" cmd /k "cd client && npm run dev"

echo.
echo ========================================
echo   Les serveurs sont en cours de lancement
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3000
echo ========================================
echo.
pause
