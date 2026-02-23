<#
start-all.ps1
Script PowerShell pour démarrer (Windows) :
- MongoDB via Docker (conteneur `agrismart-mongo`) en montant le dossier `spring_boot-main/mongodb` pour les scripts d'init
- Backend Spring Boot via `mvnw.cmd spring-boot:run`
- Frontend Angular via `npm start`

Usage: Ouvrir PowerShell en tant qu'administrateur (si nécessaire) et exécuter:
  powershell -ExecutionPolicy Bypass -File .\start-all.ps1
#>

Set-StrictMode -Version Latest

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $root 'spring_boot-main'
$frontendDir = Join-Path $root 'SprintWeb-mohamed\agrismart-web'
$mongoInitDir = Join-Path $backendDir 'mongodb'

function Start-Mongo {
    Write-Host "Vérification du service MongoDB..."

    $mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue

    if ($mongoService -and $mongoService.Status -eq "Running") {
        Write-Host "MongoDB est en cours d'exécution sur le port 27017." -ForegroundColor Green
    } else {
        Write-Host "MongoDB n'est pas démarré." -ForegroundColor Red
        Write-Host "Ouvrez PowerShell en administrateur et exécutez : net start MongoDB"
    }
}

function Start-Backend {
    if (-Not (Test-Path -LiteralPath (Join-Path $backendDir 'mvnw.cmd'))) {
        Write-Host "Fichier 'mvnw.cmd' introuvable dans $backendDir. Exécutez Maven si installé globalement." -ForegroundColor Yellow
    }
    Write-Host "Lancement du backend (Spring Boot) dans une nouvelle fenêtre PowerShell..."
    Start-Process -FilePath 'powershell' -ArgumentList '-NoExit','-Command',"Set-Location -LiteralPath '$backendDir'; .\mvnw.cmd spring-boot:run" -WorkingDirectory $backendDir
}

function Start-Frontend {
    Write-Host "Lancement du frontend (Angular) dans une nouvelle fenêtre PowerShell..."
    Start-Process -FilePath 'powershell' -ArgumentList '-NoExit','-Command',"Set-Location -LiteralPath '$frontendDir'; if (Test-Path package.json) { npm install }; npm start" -WorkingDirectory $frontendDir
}

Write-Host "Racine détectée : $root"
Write-Host "Backend : $backendDir"
Write-Host "Frontend : $frontendDir"
Write-Host ""

Start-Mongo

# Attendre quelques secondes que Mongo monte (si déjà en cours d'exécution)
Start-Sleep -Seconds 2

Start-Backend
Start-Frontend

Write-Host "Tous les démarrages ont été lancés."
Write-Host "- Backend: http://localhost:8080"
Write-Host "- Frontend: http://localhost:4200"
Write-Host ""
Write-Host "MongoDB local doit rester en cours d'exécution. Vérifiez qu'il n'est pas arrêté."
