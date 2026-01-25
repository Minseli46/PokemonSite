# Script de démarrage de l'application Pokédex
# Lance le frontend et le backend simultanément

Write-Host "🚀 Démarrage de l'application Pokédex..." -ForegroundColor Cyan
Write-Host ""

# Chemin du projet
$projectPath = $PSScriptRoot

# Démarre le backend dans une nouvelle fenêtre PowerShell
Write-Host "⚙️  Lancement du backend (port 3000)..." -ForegroundColor Yellow
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$projectPath\server'; npm run dev"

# Attend 3 secondes pour que le backend démarre
Start-Sleep -Seconds 3

# Démarre le frontend dans une nouvelle fenêtre PowerShell
Write-Host "🎨 Lancement du frontend (port 5173)..." -ForegroundColor Green
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$projectPath\client'; npm run dev"

Write-Host ""
Write-Host "✅ Les deux serveurs sont en cours de démarrage !" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "📍 Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour arrêter les serveurs, fermez les fenêtres PowerShell ouvertes." -ForegroundColor Yellow
