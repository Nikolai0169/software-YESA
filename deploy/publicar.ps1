$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $root 'frontend'
$backend = Join-Path $root 'backend'
$proxy = Join-Path $PSScriptRoot 'proxy.js'
$publicIp = '184.72.139.211'

Write-Host 'Building frontend...' -ForegroundColor Cyan
$env:REACT_APP_API_URL = "http://$publicIp/api"
$env:FRONTEND_URL = "http://$publicIp"
$env:BACKEND_URL = 'http://127.0.0.1:5000'
npm --prefix $frontend run build

Write-Host 'Opening Windows Firewall port 80...' -ForegroundColor Cyan
$rule = Get-NetFirewallRule -DisplayName 'YESA HTTP 80' -ErrorAction SilentlyContinue
if (-not $rule) {
    New-NetFirewallRule -DisplayName 'YESA HTTP 80' -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow | Out-Null
}

Write-Host 'Starting backend on port 5000...' -ForegroundColor Cyan
Start-Process -FilePath 'npm.cmd' -ArgumentList 'start' -WorkingDirectory $backend -WindowStyle Minimized

Write-Host 'Starting public gateway on port 80...' -ForegroundColor Cyan
$env:PUBLIC_PORT = '80'
$env:BACKEND_HOST = '127.0.0.1'
$env:BACKEND_PORT = '5000'
Start-Process -FilePath 'node.exe' -ArgumentList $proxy -WorkingDirectory $root

Write-Host "YESA is available at http://$publicIp" -ForegroundColor Green
Write-Host 'Keep this PowerShell window open only long enough to confirm both processes started.'