# Script PowerShell de démarrage Pokédex Full-Stack
# Version: 2.0.0

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  POKEDEX FULL-STACK APPLICATION" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier Node.js
try {
    $nodeVersion = node --version
    Write-Host "[OK] Node.js détecté: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Node.js n'est pas installé!" -ForegroundColor Red
    Write-Host "Téléchargez-le sur: https://nodejs.org" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host ""

# Fonction pour vérifier et installer les dépendances
function Install-Dependencies {
    param($path, $name)
    
    if (-not (Test-Path "$path\node_modules")) {
        Write-Host "[INFO] Installation des dépendances $name..." -ForegroundColor Yellow
        Push-Location $path
        npm install
        Pop-Location
    } else {
        Write-Host "[OK] Dépendances $name déjà installées" -ForegroundColor Green
    }
}

# Vérifier les dépendances
Install-Dependencies "." "racine"
Install-Dependencies "backend" "backend"
Install-Dependencies "frontend" "frontend"

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "[INFO] Démarrage de l'application..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Backend:  " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Frontend: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur Ctrl+C pour arrêter" -ForegroundColor Gray
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Lancer l'application
npm start
