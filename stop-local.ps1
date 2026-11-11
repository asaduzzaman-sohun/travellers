$ports = @(3000, 5000, 5001, 5002)

foreach ($port in $ports) {
    $lines = netstat -ano | Select-String ":$port\s+" | Select-String "LISTENING"
    foreach ($line in $lines) {
        $parts = ($line.ToString().Trim() -split "\s+")
        $procId = $parts[-1]
        if ($procId -match "^\d+$" -and [int]$procId -gt 0) {
            try {
                Stop-Process -Id ([int]$procId) -Force -ErrorAction SilentlyContinue
                Write-Host "Stopped process PID $procId listening on port $port" -ForegroundColor Yellow
            } catch {
                # Ignore already exited process
            }
        }
    }
}

Write-Host "All TourFlow local processes stopped." -ForegroundColor Green
