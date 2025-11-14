# Install workstation backup monitoring agent for Windows
# Supports: Windows 10/11 (File History and Windows Backup)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Workstation Backup Monitor Installer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Detected platform: Windows (File History / Windows Backup)" -ForegroundColor Green
Write-Host ""

# Prompt for webhook URL
Write-Host "You need the Apps Script webhook URL to proceed."
Write-Host "Get this from your team lead or the Google Sheets monitoring dashboard."
Write-Host ""
$WebhookUrl = Read-Host "Enter Apps Script webhook URL"

if ([string]::IsNullOrWhiteSpace($WebhookUrl)) {
    Write-Host "Error: Webhook URL required" -ForegroundColor Red
    exit 1
}

# Validate URL format
if ($WebhookUrl -notmatch '^https://script\.google\.com/macros/s/.*/exec$') {
    Write-Host "Warning: URL doesn't look like a Google Apps Script webhook" -ForegroundColor Yellow
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne 'y' -and $continue -ne 'Y') {
        Write-Host "Installation cancelled"
        exit 0
    }
}

Write-Host ""
Write-Host "Installing monitoring agent..." -ForegroundColor Cyan

# Create installation directory
$InstallDir = "$env:USERPROFILE\.workstation-monitor"
New-Item -ItemType Directory -Force -Path $InstallDir | Out-Null

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Check if monitoring script exists
$MonitorScript = "$ScriptDir\monitor-agent-windows.ps1"
if (-not (Test-Path $MonitorScript)) {
    Write-Host "Error: monitor-agent-windows.ps1 not found in $ScriptDir" -ForegroundColor Red
    Write-Host "Please ensure all installation files are in the same directory." -ForegroundColor Red
    exit 1
}

# Copy monitoring script
Copy-Item $MonitorScript "$InstallDir\monitor-agent.ps1"

# Update webhook URL
(Get-Content "$InstallDir\monitor-agent.ps1") -replace 'YOUR_APPS_SCRIPT_WEBHOOK_URL', $WebhookUrl | Set-Content "$InstallDir\monitor-agent.ps1"

Write-Host "Monitoring script installed to $InstallDir\monitor-agent.ps1" -ForegroundColor Green

# Create scheduled task
Write-Host "Creating scheduled task..." -ForegroundColor Cyan

# Remove existing task if it exists
$existingTask = Get-ScheduledTask -TaskName "WorkstationBackupMonitor" -ErrorAction SilentlyContinue
if ($existingTask) {
    Write-Host "Removing existing scheduled task..." -ForegroundColor Yellow
    Unregister-ScheduledTask -TaskName "WorkstationBackupMonitor" -Confirm:$false
}

# Create new task
$Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$InstallDir\monitor-agent.ps1`""
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date) -RepetitionInterval (New-TimeSpan -Hours 1)
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited
$Settings = New-ScheduledTaskSettingsSet -Hidden -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

try {
    Register-ScheduledTask -TaskName "WorkstationBackupMonitor" -Action $Action -Trigger $Trigger -Principal $Principal -Settings $Settings -Force | Out-Null
    Write-Host "Scheduled task created successfully (runs hourly)" -ForegroundColor Green
} catch {
    Write-Host "Warning: Could not create scheduled task: $_" -ForegroundColor Yellow
    Write-Host "You may need to run this installer as Administrator" -ForegroundColor Yellow
}

# Test the script
Write-Host ""
Write-Host "Testing monitoring agent..." -ForegroundColor Cyan
Write-Host "Running: $InstallDir\monitor-agent.ps1" -ForegroundColor Cyan
Write-Host ""

try {
    & "$InstallDir\monitor-agent.ps1"
    Write-Host ""
    Write-Host "Test successful! Status report sent to monitoring dashboard." -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "Test completed with warnings: $_" -ForegroundColor Yellow
    Write-Host "Check the script for errors." -ForegroundColor Yellow
}

# Final instructions
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor White
Write-Host "  - Monitoring agent: $InstallDir\monitor-agent.ps1"
Write-Host "  - Schedule: Every hour"
Write-Host "  - Platform: Windows"
Write-Host "  - Webhook: $($WebhookUrl.Substring(0, [Math]::Min(50, $WebhookUrl.Length)))..."
Write-Host ""
Write-Host "Monitoring:" -ForegroundColor White
Write-Host "  - Check Google Sheets in ~1 hour for your device status"
Write-Host "  - Device will appear as: $env:COMPUTERNAME"
Write-Host ""
Write-Host "Manual Commands:" -ForegroundColor White
Write-Host "  - Test now:       PowerShell -File `"$InstallDir\monitor-agent.ps1`""
Write-Host "  - View task:      Get-ScheduledTask -TaskName 'WorkstationBackupMonitor'"
Write-Host "  - View logs:      Get-Content `"$InstallDir\monitor.log`""
Write-Host "  - Uninstall:      Unregister-ScheduledTask -TaskName 'WorkstationBackupMonitor'"
Write-Host ""
Write-Host "Troubleshooting:" -ForegroundColor White
Write-Host "  - If device doesn't appear in sheet after 1 hour:"
Write-Host "    1. Check webhook URL is correct"
Write-Host "    2. Run test manually and check for errors"
Write-Host "    3. Open Task Scheduler and verify task is enabled"
Write-Host "    4. Contact team lead for help"
Write-Host ""
Write-Host "Thank you for helping keep our backups monitored!" -ForegroundColor Green
Write-Host ""
