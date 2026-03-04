$ErrorActionPreference = "Stop"

git config core.hooksPath .githooks
Write-Host "Configured Git hooks path: .githooks"
