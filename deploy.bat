@echo off
REM EcoPilot Frontend Deployment Script for AWS EC2 (Windows)

echo 🚀 Starting EcoPilot Frontend Deployment...

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not running. Please start Docker and try again.
    exit /b 1
)

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ docker-compose not found. Please install docker-compose.
    exit /b 1
)

REM Build and deploy
echo 📦 Building Docker image...
docker-compose build

echo 🔄 Stopping existing containers...
docker-compose down

echo 🚀 Starting new containers...
docker-compose up -d

echo ⏳ Waiting for containers to be healthy...
timeout /t 10 /nobreak >nul

REM Check if container is running
docker-compose ps | findstr "Up" >nul
if errorlevel 1 (
    echo ❌ Deployment failed. Container is not running.
    echo 📝 Checking logs...
    docker-compose logs
    exit /b 1
)

echo ✅ Deployment successful!
echo 🌐 Application is running on:
echo    - HTTP: http://localhost
echo    - Health check: http://localhost/health

echo.
echo 📋 Container Status:
docker-compose ps

echo.
echo 📝 Recent logs:
docker-compose logs --tail=20

echo.
echo 🎉 Deployment completed successfully!
echo 💡 Useful commands:
echo    - View logs: docker-compose logs -f
echo    - Stop application: docker-compose down
echo    - Restart: docker-compose restart
echo    - Update: deploy.bat