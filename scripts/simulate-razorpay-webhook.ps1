<#
.SYNOPSIS
    Simulates a Razorpay Webhook delivery to KisanMandi backend.
.DESCRIPTION
    Generates a valid HMAC-SHA256 signature for the raw payload using the provided webhook secret
    and posts it to the /api/payments/razorpay/webhook endpoint.
.EXAMPLE
    .\scripts\simulate-razorpay-webhook.ps1 -OrderId "order_test_123" -PaymentId "pay_test_456" -AmountPaise 50000
#>

param(
    [string]$Url = "http://localhost:8080/api/payments/razorpay/webhook",
    [string]$Secret = $env:RAZORPAY_WEBHOOK_SECRET,
    [string]$OrderId = "order_test_12345",
    [string]$PaymentId = "pay_test_67890",
    [long]$AmountPaise = 50000,
    [string]$Event = "payment.captured",
    [string]$EventId = [System.Guid]::NewGuid().ToString()
)

if ([string]::IsNullOrWhiteSpace($Secret)) {
    $Secret = "mock_webhook_secret_key"
    Write-Host "[WARN] No RAZORPAY_WEBHOOK_SECRET specified. Using default: $Secret" -ForegroundColor Yellow
}

$payloadObj = @{
    entity = "event"
    account_id = "acc_test_123"
    event = $Event
    contains = @("payment")
    payload = @{
        payment = @{
            entity = @{
                id = $PaymentId
                entity = "payment"
                amount = $AmountPaise
                currency = "INR"
                status = "captured"
                order_id = $OrderId
                method = "upi"
                captured = $true
            }
        }
    }
    created_at = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
}

$rawJson = $payloadObj | ConvertTo-Json -Depth 5 -Compress

# Compute HMAC-SHA256 in hex
$hmac = New-Object System.Security.Cryptography.HMACSHA256
$hmac.Key = [System.Text.Encoding]::UTF8.GetBytes($Secret)
$hashBytes = $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($rawJson))
$signature = -join ($hashBytes | ForEach-Object { "{0:x2}" -f $_ })

Write-Host "Sending Razorpay Webhook Simulation:" -ForegroundColor Cyan
Write-Host "  URL:       $Url"
Write-Host "  Event:     $Event"
Write-Host "  Event ID:  $EventId"
Write-Host "  Order ID:  $OrderId"
Write-Host "  Payment:   $PaymentId"
Write-Host "  Signature: $signature"

try {
    $headers = @{
        "Content-Type"           = "application/json"
        "X-Razorpay-Signature"   = $signature
        "x-razorpay-event-id"     = $EventId
    }

    $response = Invoke-RestMethod -Uri $Url -Method Post -Headers $headers -Body $rawJson
    Write-Host "[SUCCESS] Webhook delivered successfully!" -ForegroundColor Green
    if ($response) {
        $response | ConvertTo-Json
    }
}
catch {
    Write-Host "[ERROR] Failed to send webhook: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "Server Response Body: $body" -ForegroundColor Red
    }
}

