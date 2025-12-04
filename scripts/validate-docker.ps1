try {
  $docker = docker --version 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker not found. Install Docker Desktop: https://www.docker.com/products/docker-desktop"
    exit 1
  }
  Write-Host "Docker: $docker"

  # Check docker compose (v2 uses 'docker compose')
  $compose = docker compose version 2>$null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker Compose (v2) not available as 'docker compose'. Try 'docker-compose' or update Docker Desktop."
  } else {
    Write-Host "Docker Compose v2 available"
  }
} catch {
  Write-Host "Error checking Docker: $_"
  exit 1
}
