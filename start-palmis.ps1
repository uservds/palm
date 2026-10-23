param(
    [switch]$KeepPorts
)

$ErrorActionPreference = 'Stop'

$here = $PSScriptRoot
$backendDir = Join-Path $here 'backend'
$frontendDir = Join-Path $here 'frontend'

function Stop-DevPortOwner {
    param(
        [int]$Port
    )

    try {
        $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue

        if (-not $conns) {
            return
        }

        $procIds = $conns | Select-Object -ExpandProperty OwningProcess -Unique

        foreach ($procId in $procIds) {
            try {
                $p = Get-Process -Id $procId -ErrorAction Stop

                if ($p.ProcessName -match '^(node|npm|npx|cmd|powershell|pwsh)$') {
                    Write-Host "  Port $Port occupied by $($p.ProcessName) PID $procId. Stopping..." -ForegroundColor Yellow
                    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                } else {
                    Write-Warning "Port $Port occupied by $($p.ProcessName) PID $procId. Not stopping. Close it manually or run with -KeepPorts."
                }
            } catch {
                # ignore
            }
        }
    } catch {
        # ignore
    }
}

function Wait-BackendHealth {
    for ($i = 0; $i -lt 20; $i++) {
        try {
            $resp = Invoke-WebRequest -Uri 'http://127.0.0.1:3001/health' -UseBasicParsing -TimeoutSec 2

            if ($resp.StatusCode -eq 200) {
                return $true
            }
        } catch {
            # ignore
        }

        Start-Sleep -Seconds 1
    }

    return $false
}

if (-not $KeepPorts) {
    Stop-DevPortOwner -Port 3001
    Stop-DevPortOwner -Port 5173
    Start-Sleep -Seconds 1
}

Write-Host ''
Write-Host '  Starting Palmis AI...' -ForegroundColor Cyan
Write-Host ''

$backendJob = Start-Process `
    -FilePath 'node' `
    -ArgumentList 'src/server.js' `
    -WorkingDirectory $backendDir `
    -PassThru `
    -NoNewWindow

Write-Host "  Backend PID: $($backendJob.Id)" -ForegroundColor Green

if (-not (Wait-BackendHealth)) {
    Write-Error 'Backend did not become healthy on http://127.0.0.1:3001/health'

    try {
        & taskkill /PID $backendJob.Id /T /F 2>$null | Out-Null
    } catch {
        # ignore
    }

    Stop-Process -Id $backendJob.Id -Force -ErrorAction SilentlyContinue
    exit 1
}

Write-Host '  Backend health OK' -ForegroundColor Green

$frontendJob = Start-Process `
    -FilePath 'cmd.exe' `
    -ArgumentList '/c', 'npx vite --port 5173 --strictPort' `
    -WorkingDirectory $frontendDir `
    -PassThru `
    -NoNewWindow

Write-Host "  Frontend PID: $($frontendJob.Id)" -ForegroundColor Green

Start-Sleep -Seconds 2

Write-Host ''
Write-Host '  > Backend:  http://localhost:3001' -ForegroundColor Yellow
Write-Host '  > Frontend: http://localhost:5173' -ForegroundColor Yellow
Write-Host ''
Write-Host '  Press Ctrl+C to stop.' -ForegroundColor Gray

Start-Process 'http://localhost:5173' -ErrorAction SilentlyContinue

try {
    Wait-Process -Id $backendJob.Id
} finally {
    Write-Host ''
    Write-Host '  Stopping...' -ForegroundColor Yellow

    try {
        & taskkill /PID $frontendJob.Id /T /F 2>$null | Out-Null
    } catch {
        # ignore
    }

    try {
        & taskkill /PID $backendJob.Id /T /F 2>$null | Out-Null
    } catch {
        # ignore
    }

    Stop-Process -Id $frontendJob.Id -Force -ErrorAction SilentlyContinue
    Stop-Process -Id $backendJob.Id -Force -ErrorAction SilentlyContinue

    Write-Host '  Stopped.' -ForegroundColor Green
}