# Start backend, run smoke verification, then stop backend
param()

Write-Host "Killing any existing node processes..."
taskkill /F /IM node.exe /T 2>$null | Out-Null
Start-Sleep -Seconds 1

Write-Host "Starting backend in background..."
$job = Start-Job -ScriptBlock { Set-Location 'c:\Users\91994\OneDrive - DAV BHEL Ranipet\Documents\WorkflowForge'; node index.js } 
Start-Sleep -Seconds 5

try {
    Write-Host "Running smoke verification..."
    node test-step6-verify.js
} catch {
    Write-Error "Smoke script failed: $_"
} finally {
    Write-Host "Stopping background backend job..."
    Stop-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -ErrorAction SilentlyContinue
}
