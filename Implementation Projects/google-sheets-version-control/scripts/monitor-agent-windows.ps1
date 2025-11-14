# Monitor Windows Backup status and report to central dashboard
# Platform: Windows 10/11
# Installation: Run install-workstation-monitor.ps1

$WebhookUrl = "YOUR_APPS_SCRIPT_WEBHOOK_URL"
$DeviceId = $env:COMPUTERNAME
$User = $env:USERNAME

# Initialize variables
$status = "❌ ERROR"
$message = "Unknown error"
$destination = "N/A"
$lastBackupDate = (Get-Date).ToUniversalTime()

# Check File History status
try {
    $fhStatus = Get-WmiObject -Namespace "root\Microsoft\Windows\FileHistory" -Class MSFT_FhConfigInfo -ErrorAction Stop

    if ($fhStatus) {
        $lastBackup = $fhStatus.LastBackupTime
        $destination = $fhStatus.TargetUrl

        if ($lastBackup -and $lastBackup -ne "Not Available") {
            try {
                $lastBackupDate = [DateTime]::ParseExact($lastBackup, "yyyyMMddHHmmss.ffffff-000", $null)
                $ageHours = ([DateTime]::UtcNow - $lastBackupDate).TotalHours

                if ($ageHours -lt 24) {
                    $status = "✅ ACTIVE"
                    $message = "Backup $([Math]::Floor($ageHours)) hours old"
                } else {
                    $status = "⚠️ STALE"
                    $message = "Backup $([Math]::Floor($ageHours)) hours old"
                }
            } catch {
                $status = "⚠️ WARNING"
                $message = "Cannot parse backup timestamp"
            }
        } else {
            $status = "⚠️ WARNING"
            $message = "File History configured but no backup found"
        }
    } else {
        $status = "⚠️ WARNING"
        $message = "File History not configured"
    }
} catch {
    # Try alternative: Windows Backup (legacy)
    try {
        $backupStatus = Get-WBSummary -ErrorAction Stop
        if ($backupStatus) {
            $lastBackupDate = $backupStatus.LastBackupTime
            $ageHours = ([DateTime]::UtcNow - $lastBackupDate).TotalHours

            if ($ageHours -lt 24) {
                $status = "✅ ACTIVE"
                $message = "Windows Backup: $([Math]::Floor($ageHours)) hours old"
            } else {
                $status = "⚠️ STALE"
                $message = "Windows Backup: $([Math]::Floor($ageHours)) hours old"
            }
            $destination = "Windows Backup"
        }
    } catch {
        $status = "❌ ERROR"
        $message = "No backup system configured (File History or Windows Backup)"
    }
}

# Create JSON payload
$payload = @{
    device_id = $DeviceId
    user = $User
    platform = "Windows"
    backup_type = if ($destination -eq "Windows Backup") { "Windows Backup" } else { "File History" }
    status = $status
    last_backup = $lastBackupDate.ToString("yyyy-MM-ddTHH:mm:ssZ")
    destination = if ($destination) { $destination } else { "N/A" }
    message = $message
    timestamp = [DateTime]::UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
} | ConvertTo-Json

# Send to webhook
try {
    Invoke-RestMethod -Uri $WebhookUrl -Method Post -Body $payload -ContentType "application/json" -ErrorAction Stop | Out-Null
    # Success - optionally log
    # Add-Content -Path "$env:USERPROFILE\.workstation-monitor\monitor.log" -Value "$(Get-Date): Reported status: $status"
} catch {
    # Silent fail - will retry next hour
    # Optionally log error
    # Add-Content -Path "$env:USERPROFILE\.workstation-monitor\monitor.log" -Value "$(Get-Date): Error sending status: $_"
}

exit 0
