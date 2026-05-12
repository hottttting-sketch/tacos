# Tabasco Daily Backup Script
$sourceDir = "C:\Users\hotta_yoshihiko2\.gemini\antigravity\scratch\tabasco"
$backupRoot = "C:\Users\hotta_yoshihiko2\.gemini\antigravity\backups"
$date = Get-Date -Format "yyyy-MM-dd_HHmm"
$backupName = "tabasco_backup_$date.zip"
$destFile = Join-Path $backupRoot $backupName

# Create backup directory if it doesn't exist
if (!(Test-Path $backupRoot)) {
    New-Item -ItemType Directory -Path $backupRoot
}

Write-Host "Creating backup: $backupName ..." -ForegroundColor Cyan

# Exclude large/unnecessary folders
$exclude = @("node_modules", ".vite", "dist", ".git", ".next")

# Creating a temporary directory for clean backup
$tempDir = Join-Path $backupRoot "temp_backup"
if (Test-Path $tempDir) { Remove-Item -Path $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir

# Copying files excluding unnecessary folders
Get-ChildItem -Path $sourceDir -Exclude $exclude | Copy-Item -Destination $tempDir -Recurse -Force

# Compress the temp folder
Compress-Archive -Path "$tempDir\*" -DestinationPath $destFile -Force

# Cleanup temp
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "Backup completed successfully!" -ForegroundColor Green
Write-Host "Saved to: $destFile"
