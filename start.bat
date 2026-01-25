@echo off
title Pokedex Full-Stack Launcher
color 0A

echo ====================================
echo   POKEDEX FULL-STACK APPLICATION
echo ====================================
echo.

:: Vérifier Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installé!
    echo Téléchargez-le sur: https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js detecte
node --version
echo.

:: Vérifier si les dépendances sont installées
if not exist "node_modules\" (
    echo [INFO] Installation des dependances racine...
    call npm install
)

if not exist "backend\node_modules\" (
    echo [INFO] Installation des dependances backend...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules\" (
    echo [INFO] Installation des dependances frontend...
    cd frontend
    call npm install
    cd ..
)

echo.
echo [INFO] Demarrage de l'application...
echo.
echo   - Backend:  http://localhost:3000
echo   - Frontend: http://localhost:3001
echo.
echo Appuyez sur Ctrl+C pour arreter
echo.

:: Lancer l'application
call npm start

pause
