param(
    [int]$PublicPort = 80,
    [int]$BackendPort = 5000,
    [string]$PublicIp = '54.205.90.36'
)

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $projectRoot 'backend'
$frontendPath = Join-Path $projectRoot 'frontend'
if (-not (Get-Command node.exe -ErrorAction SilentlyContinue)) {
    throw 'Node.js no esta instalado o no esta disponible en PATH.'
}

if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
    throw 'npm no esta disponible en PATH.'
}

$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw 'Ejecute PowerShell como Administrador para abrir el puerto 80 en el Firewall.'
}

$port80InUse = Get-NetTCPConnection -LocalPort $publicPort -State Listen -ErrorAction SilentlyContinue
if ($port80InUse) {
    $processIds = ($port80InUse | Select-Object -ExpandProperty OwningProcess -Unique) -join ', '
    throw "El puerto $publicPort ya esta en uso por el proceso $processIds. Detengalo antes de publicar."
}

$backendPortInUse = Get-NetTCPConnection -LocalPort $backendPort -State Listen -ErrorAction SilentlyContinue
if ($backendPortInUse) {
    $processIds = ($backendPortInUse | Select-Object -ExpandProperty OwningProcess -Unique) -join ', '
    throw "El puerto $backendPort ya esta en uso por el proceso $processIds. Detengalo antes de publicar."
}

$env:PUBLIC_PORT = $publicPort
$env:BACKEND_PORT = $backendPort
$env:NODE_ENV = 'production'
$env:FRONTEND_URL = "http://$PublicIp"

Write-Host 'Comprobando dependencias del backend...'
Push-Location $backendPath
try {
    if (-not (Test-Path (Join-Path $backendPath 'node_modules'))) {
        npm install
    }
} finally {
    Pop-Location
}

Write-Host 'Construyendo frontend React para produccion...'
Push-Location $frontendPath
try {
    npm run build
} finally {
    Pop-Location
}

Write-Host 'Configurando regla del Firewall de Windows...'
$firewallRule = Get-NetFirewallRule -DisplayName 'YESA HTTP 80' -ErrorAction SilentlyContinue
if (-not $firewallRule) {
    New-NetFirewallRule -DisplayName 'YESA HTTP 80' -Direction Inbound -Protocol TCP -LocalPort $publicPort -Action Allow | Out-Null
}

Write-Host "Iniciando backend en el puerto $backendPort..."
$backendProcess = Start-Process -FilePath 'npm.cmd' -ArgumentList 'start' -WorkingDirectory $backendPath -PassThru

Write-Host "Iniciando gateway publico en el puerto $publicPort..."
$gatewayProcess = Start-Process -FilePath 'node.exe' -ArgumentList 'public-gateway.js' -WorkingDirectory $projectRoot -PassThru

Write-Host ''
Write-Host 'YESA publicado correctamente.' -ForegroundColor Green
Write-Host "URL publica: http://$PublicIp`:$publicPort/"
Write-Host "Backend interno: http://127.0.0.1:$backendPort"
Write-Host "Backend PID: $($backendProcess.Id) | Gateway PID: $($gatewayProcess.Id)"
Write-Host 'Para detenerlos: Stop-Process -Id <PID_BACKEND>,<PID_GATEWAY>'