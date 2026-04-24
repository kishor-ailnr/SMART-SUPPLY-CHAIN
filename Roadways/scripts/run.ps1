# Roadways 2.0 Startup Script
Write-Host "Initializing ROADWAYS 2.0 Neural Network..." -ForegroundColor Cyan

# Check for node_modules
if (!(Test-Path "node_modules") -or !(Test-Path "backend/node_modules") -or !(Test-Path "frontend/node_modules")) {
    Write-Host "Installing missing dependencies..." -ForegroundColor Yellow
    npm install
    npm install --prefix backend
    npm install --prefix frontend
}

# Seed DB if not exists
if (!(Test-Path "db/roadways.sqlite")) {
    Write-Host "Initializing database..." -ForegroundColor Yellow
    node backend/db/init.js
    node backend/db/seed.js
    node backend/db/seed_infra.js
}

Write-Host "Launching Control Room v2.0.0..." -ForegroundColor Green
npm run dev
