#!/usr/bin/env pwsh
# Quick smoke test — starts backend, runs a health check, then stops
param()

$ErrorActionPreference = 'Stop'
$ROOT = Split-Path -Parent $PSScriptRoot

Write-Host 'Starting backend...'
$job = Start-Job -ScriptBlock { param($r) Set-Location $r; node index.js } -ArgumentList $ROOT
Start-Sleep -Seconds 6

try {
    $health = Invoke-RestMethod -Uri http://localhost:5000/ -TimeoutSec 10
    Write-Host "Backend health: $($health.message)"

    Invoke-RestMethod -Uri http://localhost:5000/api/auth/register `
        -Method POST -ContentType 'application/json' `
        -Body '{"name":"Smoke","email":"smoke@test.local","password":"smoke123"}' `
        -ErrorAction SilentlyContinue | Out-Null
    $login = Invoke-RestMethod -Uri http://localhost:5000/api/auth/login `
        -Method POST -ContentType 'application/json' `
        -Body '{"email":"smoke@test.local","password":"smoke123"}'
    $h = @{ Authorization = "Bearer $($login.token)" }

    $workflows = Invoke-RestMethod -Uri http://localhost:5000/api/workflows -Headers $h
    Write-Host "Workflows: $($workflows.Count)"

    Write-Host 'Smoke test PASSED'
} catch {
    Write-Error "Smoke test FAILED: $_"
    exit 1
} finally {
    Stop-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -ErrorAction SilentlyContinue
}
