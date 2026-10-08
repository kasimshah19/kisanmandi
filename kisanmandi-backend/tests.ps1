$baseUrl = "http://localhost:8080/api"
$headers = @{ "Content-Type" = "application/json" }

function Invoke-MyWebRequest($Uri, $Method, $Body, $Headers) {
    try {
        if ($Body) {
            $res = Invoke-WebRequest -Uri $Uri -Method $Method -Headers $Headers -Body $Body -ErrorAction Stop
        } else {
            $res = Invoke-WebRequest -Uri $Uri -Method $Method -Headers $Headers -ErrorAction Stop
        }
        return $res
    } catch {
        return $_.Exception.Response
    }
}

function Show-Result($testName, $res, $expectedCode) {
    $code = 0
    if ($res -is [System.Net.HttpWebResponse]) {
        $code = [int]$res.StatusCode
    } elseif ($res -is [Microsoft.PowerShell.Commands.HtmlWebResponseObject] -or $res -is [Microsoft.PowerShell.Commands.BasicHtmlWebResponseObject]) {
        $code = $res.StatusCode
    }

    if ($code -eq $expectedCode) {
        Write-Host "[OK] $testName - Got $expectedCode" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] $testName - Expected $expectedCode but got $code" -ForegroundColor Red
    }
}

# 1. Register FARMER -> 201
$body = @{ name="Farmer 1"; email="farmer2@test.com"; password="password123"; phone="1234567890"; role="FARMER" } | ConvertTo-Json
$res = Invoke-MyWebRequest -Uri "$baseUrl/auth/register" -Method Post -Headers $headers -Body $body
Show-Result "Register FARMER" $res 201

# 2. Register CUSTOMER -> 201
$body = @{ name="Cust 1"; email="customer2@test.com"; password="password123"; phone="0987654321"; role="CUSTOMER" } | ConvertTo-Json
$res = Invoke-MyWebRequest -Uri "$baseUrl/auth/register" -Method Post -Headers $headers -Body $body
Show-Result "Register CUSTOMER" $res 201

# 6. Login correct -> 200 + token
$body = @{ email="farmer2@test.com"; password="password123" } | ConvertTo-Json
$res = Invoke-MyWebRequest -Uri "$baseUrl/auth/login" -Method Post -Headers $headers -Body $body
Show-Result "Login Correct" $res 200
$content = ""
if ($res -is [System.Net.HttpWebResponse]) {
    $reader = New-Object System.IO.StreamReader($res.GetResponseStream())
    $content = $reader.ReadToEnd()
} else {
    $content = $res.Content
}
$token = (ConvertFrom-Json $content).token

# 8. GET /api/auth/me with token -> 200; without token -> 401
$authHeaders = @{ "Content-Type" = "application/json"; "Authorization" = "Bearer $token" }
$res = Invoke-MyWebRequest -Uri "$baseUrl/auth/me" -Method Get -Headers $authHeaders
Show-Result "GET /me with token" $res 200

$res = Invoke-MyWebRequest -Uri "$baseUrl/auth/me" -Method Get -Headers $headers
Show-Result "GET /me without token" $res 401

# 10. No token on /api/farmer/ping -> 401
$res = Invoke-MyWebRequest -Uri "$baseUrl/farmer/ping" -Method Get -Headers $headers
Show-Result "No token on /farmer/ping" $res 401

# 11. FARMER token on /api/farmer/ping -> 200;
$res = Invoke-MyWebRequest -Uri "$baseUrl/farmer/ping" -Method Get -Headers $authHeaders
Show-Result "FARMER on /farmer/ping" $res 200

# 13. /health -> CONNECTED
$res = Invoke-MyWebRequest -Uri "$baseUrl/health" -Method Get -Headers $headers
Show-Result "/health" $res 200
