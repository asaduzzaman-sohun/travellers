param(
    [switch]$Rebuild
)

$ErrorActionPreference = "Stop"

$RootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendDir = Join-Path $RootDir "backend"
$ApiProjectDir = Join-Path $BackendDir "TourFlow.Api"
$LbProjectDir = Join-Path $BackendDir "TourFlow.LoadBalancer"
$FrontendDir = Join-Path $RootDir "frontend"

$ApiDll = Join-Path $ApiProjectDir "bin\Debug\net10.0\TourFlow.Api.dll"
$LbDll = Join-Path $LbProjectDir "bin\Debug\net11.0\TourFlow.LoadBalancer.dll"
$NextBuildId = Join-Path $FrontendDir ".next\BUILD_ID"

function Test-PortListening([int]$Port) {
    $hit = netstat -ano | Select-String ":$Port\s+" | Select-String "LISTENING"
    return $null -ne $hit
}

function Wait-HttpReady([string]$Url, [int]$TimeoutSeconds = 20) {
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $res = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
            if ($res.StatusCode -eq 200) {
                return $true
            }
        } catch {
            # Service warming up
        }
        Start-Sleep -Milliseconds 250
    }
    return $false
}

if ($Rebuild -or -not (Test-Path $ApiDll) -or -not (Test-Path $LbDll)) {
    Write-Host "Compiling backend binaries..." -ForegroundColor Cyan
    Push-Location $BackendDir
    dotnet build TourFlow.slnx --verbosity minimal
    Pop-Location
}

if (-not (Test-PortListening 5001)) {
    Write-Host "Starting API Node 1 on http://localhost:5001..." -ForegroundColor Green
    $node1Cmd = "Set-Location '$ApiProjectDir'; `$env:ASPNETCORE_ENVIRONMENT='Development'; `$env:INSTANCE_ID='api-node-1'; dotnet '$ApiDll' --urls http://localhost:5001"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $node1Cmd -WindowStyle Minimized | Out-Null
}

if (-not (Test-PortListening 5000)) {
    Write-Host "Starting YARP Load Balancer on http://localhost:5000..." -ForegroundColor Green
    $lbCmd = "Set-Location '$LbProjectDir'; `$env:ASPNETCORE_ENVIRONMENT='Development'; dotnet '$LbDll' --urls http://localhost:5000"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $lbCmd -WindowStyle Minimized | Out-Null
}

if (-not (Test-PortListening 3000)) {
    $feScript = if ((Test-Path $NextBuildId) -and -not $Rebuild) { "start" } else { "dev" }
    Write-Host "Starting Next.js Frontend ($feScript mode) on http://localhost:3000..." -ForegroundColor Green
    $feCmd = "Set-Location '$FrontendDir'; npm.cmd run $feScript"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $feCmd -WindowStyle Minimized | Out-Null
}

# Wait briefly for primary API node readiness before starting second replica
$null = Wait-HttpReady "http://localhost:5001/api/health/ready" 20

if (-not (Test-PortListening 5002)) {
    Write-Host "Starting API Node 2 on http://localhost:5002..." -ForegroundColor Green
    $node2Cmd = "Set-Location '$ApiProjectDir'; `$env:ASPNETCORE_ENVIRONMENT='Development'; `$env:INSTANCE_ID='api-node-2'; dotnet '$ApiDll' --urls http://localhost:5002"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $node2Cmd -WindowStyle Minimized | Out-Null
}

$null = Wait-HttpReady "http://localhost:5000/lb-status" 15
$null = Wait-HttpReady "http://localhost:3000" 20

Write-Host "TourFlow local cluster is LIVE! Opening http://localhost:3000 ..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"
