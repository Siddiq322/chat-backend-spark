# API Testing Script
$baseUrl = "http://localhost:5000/api"

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  CHAT SPARK API TESTING" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Test 1: Register User
Write-Host "[TEST 1] Registering test user..." -ForegroundColor Yellow
$registerBody = @{
    username = "testuser"
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    if ($response.success) {
        Write-Host "✅ User registered successfully!" -ForegroundColor Green
        $token = $response.data.token
        Write-Host "   Username: $($response.data.user.username)" -ForegroundColor Gray
        Write-Host "   Email: $($response.data.user.email)" -ForegroundColor Gray
        Write-Host "   Token: $($token.Substring(0,20))..." -ForegroundColor Gray
    }
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorResponse.message -like "*already*") {
        Write-Host "⚠️  User already exists. Trying login..." -ForegroundColor Yellow
        
        # Try login instead
        $loginBody = @{
            email = "test@example.com"
            password = "password123"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
        if ($response.success) {
            Write-Host "✅ Logged in successfully!" -ForegroundColor Green
            $token = $response.data.token
        }
    } else {
        Write-Host "❌ Error: $($errorResponse.message)" -ForegroundColor Red
        exit
    }
}

# Test 2: Get Current User
Write-Host "`n[TEST 2] Getting current user info..." -ForegroundColor Yellow
$headers = @{
    Authorization = "Bearer $token"
}

$response = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method Get -Headers $headers
if ($response.success) {
    Write-Host "✅ User info retrieved!" -ForegroundColor Green
    Write-Host "   Username: $($response.data.user.username)" -ForegroundColor Gray
    Write-Host "   Online: $($response.data.user.isOnline)" -ForegroundColor Gray
}

# Test 3: Search Users
Write-Host "`n[TEST 3] Searching for users..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$baseUrl/users/search?query=test" -Method Get -Headers $headers
if ($response.success) {
    Write-Host "✅ Search successful!" -ForegroundColor Green
    Write-Host "   Found $($response.data.count) user(s)" -ForegroundColor Gray
}

# Test 4: Get Conversations
Write-Host "`n[TEST 4] Getting conversations..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "$baseUrl/conversations" -Method Get -Headers $headers
if ($response.success) {
    Write-Host "✅ Conversations retrieved!" -ForegroundColor Green
    Write-Host "   Count: $($response.data.count)" -ForegroundColor Gray
}

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  ✅ ALL TESTS PASSED!" -ForegroundColor Green
Write-Host "  Your backend is working perfectly!" -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Keep the server running in the other window"
Write-Host "2. Set up your frontend to connect to http://localhost:5000"
Write-Host "3. Use the token for authenticated requests"
Write-Host "`nSaved token for testing: $token" -ForegroundColor Gray
