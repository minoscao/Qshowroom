$taskRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$serverPath = Join-Path $taskRoot 'server.mjs'
$running = Get-NetTCPConnection -LocalPort 43917 -State Listen -ErrorAction SilentlyContinue
if (-not $running) {
  Start-Process -FilePath 'node.exe' -ArgumentList @('"' + $serverPath + '"') -WorkingDirectory $taskRoot -WindowStyle Hidden
  Start-Sleep -Milliseconds 800
}
Start-Process 'http://127.0.0.1:43917'
