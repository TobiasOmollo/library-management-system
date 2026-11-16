$ErrorActionPreference = "Continue"

Write-Host "=== Starting Library API server for verification ==="
$env:PORT = "3000"
$serverProcess = Start-Process -FilePath "node" -ArgumentList "dist/main.js" -WorkingDirectory "C:\Users\HomePC\Documents\PLP\MEARN\Week1\library-api\api" -PassThru -NoNewWindow

Start-Sleep -Seconds 4

$baseUrl = "http://localhost:3000"

try {
    Write-Host "`n1. Testing Register Member, Login, and GET /auth/me..."
    $regBody = @{
        email = "alice_test@example.com"
        password = "Password123!"
        name = "Alice Test"
    } | ConvertTo-Json

    $regRes = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $regBody -ContentType "application/json"
    Write-Host "Register Response:" ($regRes | ConvertTo-Json -Compress)

    $loginBody = @{
        email = "alice_test@example.com"
        password = "Password123!"
    } | ConvertTo-Json

    $loginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $memberToken = $loginRes.access_token
    Write-Host "Member Login: Access Token received (length: $($memberToken.Length))"

    $meRes = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method Get -Headers @{ Authorization = "Bearer $memberToken" }
    Write-Host "Member /auth/me:" ($meRes | ConvertTo-Json -Compress)


    Write-Host "`n2. Testing Login as Seeded Librarian..."
    $libLoginBody = @{
        email = "librarian@example.com"
        password = "Librarian123!"
    } | ConvertTo-Json

    $libLoginRes = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $libLoginBody -ContentType "application/json"
    $libToken = $libLoginRes.access_token
    Write-Host "Librarian Login: Access Token received (length: $($libToken.Length))"

    $libMeRes = Invoke-RestMethod -Uri "$baseUrl/auth/me" -Method Get -Headers @{ Authorization = "Bearer $libToken" }
    Write-Host "Librarian /auth/me:" ($libMeRes | ConvertTo-Json -Compress)


    Write-Host "`n3. Testing Member tries POST /books (Expect 403)..."
    $genres = Invoke-RestMethod -Uri "$baseUrl/genres" -Method Get
    $firstGenre = $genres[0]
    Write-Host "Using Genre: $($firstGenre.name) ($($firstGenre.id))"

    $bookCreateBody = @{
        title = "Member Book Attempt"
        author = "Member"
        genreId = $firstGenre.id
    } | ConvertTo-Json

    try {
        $res = Invoke-RestMethod -Uri "$baseUrl/books" -Method Post -Body $bookCreateBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $memberToken" }
        Write-Host "ERROR: Expected 403, got success"
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        Write-Host "Expected 403 received: HTTP $status"
    }


    Write-Host "`n4. Testing Librarian CRUD on Books..."
    $newBookBody = @{
        title = "Test Automation Handbook"
        author = "John Doe"
        isbn = "978-1122334455"
        description = "A comprehensive testing guide."
        publishedYear = 2026
        copies = 5
        available = 5
        genreId = $firstGenre.id
    } | ConvertTo-Json

    $createdBook = Invoke-RestMethod -Uri "$baseUrl/books" -Method Post -Body $newBookBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $libToken" }
    Write-Host "Book Created: $($createdBook.title) (ID: $($createdBook.id))"

    $updateBookBody = @{
        title = "Test Automation Handbook (2nd Edition)"
        copies = 8
    } | ConvertTo-Json

    $updatedBook = Invoke-RestMethod -Uri "$baseUrl/books/$($createdBook.id)" -Method Patch -Body $updateBookBody -ContentType "application/json" -Headers @{ Authorization = "Bearer $libToken" }
    Write-Host "Book Updated: $($updatedBook.title), Copies: $($updatedBook.copies)"

    $delRes = Invoke-RestMethod -Uri "$baseUrl/books/$($createdBook.id)" -Method Delete -Headers @{ Authorization = "Bearer $libToken" }
    Write-Host "Book Deleted:" ($delRes | ConvertTo-Json -Compress)


    Write-Host "`n5. Testing GET /books?q=...&genreId=..."
    $searchRes = Invoke-RestMethod -Uri "$baseUrl/books?q=great" -Method Get
    Write-Host "Search q=great: total=$($searchRes.total), returned=$($searchRes.data.Count) book(s)"

    $genreFilterRes = Invoke-RestMethod -Uri "$baseUrl/books?genreId=$($firstGenre.id)&page=1&limit=2" -Method Get
    Write-Host "Filter genreId=$($firstGenre.id): total=$($genreFilterRes.total), page=$($genreFilterRes.page), limit=$($genreFilterRes.limit)"


    Write-Host "`n6. Testing Invalid Body (Expect 400)..."
    $invalidBody = @{
        email = "not-an-email"
        password = "short"
    } | ConvertTo-Json

    try {
        Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $invalidBody -ContentType "application/json"
        Write-Host "ERROR: Expected 400, got success"
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $body = $reader.ReadToEnd()
        Write-Host "Expected 400 received: HTTP $status - $body"
    }


    Write-Host "`n7. Testing Login Rate Limiting (6 rapid attempts expect 429)..."
    for ($i = 1; $i -le 6; $i++) {
        try {
            $r = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
            Write-Host "Attempt $($i): HTTP 200/201 Success"
        } catch {
            $status = $_.Exception.Response.StatusCode.value__
            Write-Host "Attempt $($i): HTTP $status (Rate limit triggered!)"
        }
    }

} finally {
    Write-Host "`nStopping server process..."
    Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
}
