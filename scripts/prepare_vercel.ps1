# Prepare Vercel Build - Merge frontend and backend into single Next.js app structure
# This script creates a unified app/ directory at the root for Vercel deployment

Write-Host "Preparing Vercel deployment structure..." -ForegroundColor Cyan

# Clean existing root app directory if it exists
if (Test-Path "app") {
    Write-Host "Cleaning existing app directory..." -ForegroundColor Yellow
    Remove-Item -Path "app" -Recurse -Force -ErrorAction SilentlyContinue
}

# Create root app directory
Write-Host "Creating root app directory..." -ForegroundColor Green
New-Item -ItemType Directory -Path "app" -Force | Out-Null

# Copy frontend app content to root app (all routes, pages, layouts)
Write-Host "Copying frontend app content..." -ForegroundColor Green
Copy-Item -Path "frontend/app/*" -Destination "app/" -Recurse -Force

# Copy backend API routes to root app/api
Write-Host "Merging backend API routes..." -ForegroundColor Green

# Create app/api/health
New-Item -ItemType Directory -Path "app/api/health" -Force | Out-Null
Copy-Item -Path "backend/app/api/health/route.ts" -Destination "app/api/health/route.ts" -Force

# Create app/api/ingest structure
New-Item -ItemType Directory -Path "app/api/ingest/upload" -Force | Out-Null
New-Item -ItemType Directory -Path "app/api/ingest/url" -Force | Out-Null
Copy-Item -Path "backend/app/api/ingest/upload/route.ts" -Destination "app/api/ingest/upload/route.ts" -Force
Copy-Item -Path "backend/app/api/ingest/url/route.ts" -Destination "app/api/ingest/url/route.ts" -Force

# Create app/api/tenant-example
New-Item -ItemType Directory -Path "app/api/tenant-example" -Force | Out-Null
Copy-Item -Path "backend/app/api/tenant-example/route.ts" -Destination "app/api/tenant-example/route.ts" -Force

# Merge components directories
Write-Host "Merging components..." -ForegroundColor Green

# Clean existing root components directory if it exists
if (Test-Path "components") {
    Remove-Item -Path "components" -Recurse -Force -ErrorAction SilentlyContinue
}

New-Item -ItemType Directory -Path "components" -Force | Out-Null

# Copy frontend components
Copy-Item -Path "frontend/components/*" -Destination "components/" -Recurse -Force

# Copy backend components (without overwriting frontend ones)
Get-ChildItem -Path "backend/components" -Recurse | ForEach-Object {
    $targetPath = $_.FullName.Replace("backend\components", "components")
    if (-not (Test-Path $targetPath)) {
        if ($_.PSIsContainer) {
            New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
        } else {
            Copy-Item -Path $_.FullName -Destination $targetPath -Force
        }
    }
}

# Merge lib directories
Write-Host "Merging lib directories..." -ForegroundColor Green

# Clean existing root lib directory if it exists
if (Test-Path "lib") {
    Remove-Item -Path "lib" -Recurse -Force -ErrorAction SilentlyContinue
}

New-Item -ItemType Directory -Path "lib" -Force | Out-Null

# Copy frontend lib
Copy-Item -Path "frontend/lib/*" -Destination "lib/" -Recurse -Force

# Copy backend lib (without overwriting frontend ones)
Get-ChildItem -Path "backend/lib" -Recurse | ForEach-Object {
    $targetPath = $_.FullName.Replace("backend\lib", "lib")
    if (-not (Test-Path $targetPath)) {
        if ($_.PSIsContainer) {
            New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
        } else {
            Copy-Item -Path $_.FullName -Destination $targetPath -Force
        }
    }
}

# Merge public directories
Write-Host "Merging public directories..." -ForegroundColor Green

# Clean existing root public directory if it exists
if (Test-Path "public") {
    Remove-Item -Path "public" -Recurse -Force -ErrorAction SilentlyContinue
}

New-Item -ItemType Directory -Path "public" -Force | Out-Null

# Copy frontend public
if (Test-Path "frontend/public") {
    Copy-Item -Path "frontend/public/*" -Destination "public/" -Recurse -Force -ErrorAction SilentlyContinue
}

# Copy assets directories (needed for fonts)
Write-Host "Copying assets..." -ForegroundColor Green

# Clean existing root assets directory if it exists
if (Test-Path "assets") {
    Remove-Item -Path "assets" -Recurse -Force -ErrorAction SilentlyContinue
}

New-Item -ItemType Directory -Path "assets" -Force | Out-Null

# Copy frontend assets (fonts, etc.)
if (Test-Path "frontend/assets") {
    Copy-Item -Path "frontend/assets/*" -Destination "assets/" -Recurse -Force -ErrorAction SilentlyContinue
}

# Copy backend assets if needed
if (Test-Path "backend/assets") {
    Get-ChildItem -Path "backend/assets" -Recurse | ForEach-Object {
        $targetPath = $_.FullName.Replace("backend\assets", "assets")
        if (-not (Test-Path $targetPath)) {
            if ($_.PSIsContainer) {
                New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
            } else {
                Copy-Item -Path $_.FullName -Destination $targetPath -Force
            }
        }
    }
}

# Copy types directory
Write-Host "Copying types..." -ForegroundColor Green

# Clean existing root types directory if it exists
if (Test-Path "types") {
    Remove-Item -Path "types" -Recurse -Force -ErrorAction SilentlyContinue
}

New-Item -ItemType Directory -Path "types" -Force | Out-Null

# Copy frontend types
Copy-Item -Path "frontend/types/*" -Destination "types/" -Recurse -Force -ErrorAction SilentlyContinue

# Copy backend types (without overwriting frontend ones)
if (Test-Path "backend/types") {
    Get-ChildItem -Path "backend/types" -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
        $targetPath = $_.FullName.Replace("backend\types", "types")
        if (-not (Test-Path $targetPath)) {
            if ($_.PSIsContainer) {
                New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
            } else {
                Copy-Item -Path $_.FullName -Destination $targetPath -Force
            }
        }
    }
}

# Copy middleware from frontend (it has more complete auth logic)
Write-Host "Copying middleware..." -ForegroundColor Green
Copy-Item -Path "frontend/middleware.ts" -Destination "middleware.ts" -Force

# Copy auth.ts from frontend if it exists
if (Test-Path "frontend/auth.ts") {
    Copy-Item -Path "frontend/auth.ts" -Destination "auth.ts" -Force
}

Write-Host "Vercel deployment structure prepared successfully!" -ForegroundColor Green
Write-Host "Structure created:" -ForegroundColor Cyan
Write-Host "   - app/ (frontend pages + backend API routes)" -ForegroundColor White
Write-Host "   - components/ (merged UI components)" -ForegroundColor White
Write-Host "   - lib/ (merged utilities)" -ForegroundColor White
Write-Host "   - public/ (merged static assets)" -ForegroundColor White
Write-Host "   - types/ (merged TypeScript types)" -ForegroundColor White
Write-Host "   - middleware.ts (auth middleware)" -ForegroundColor White
