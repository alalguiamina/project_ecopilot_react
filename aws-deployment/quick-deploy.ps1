# Quick deployment script for updates
# Run this whenever you make changes to your React app

Write-Host "Building React app..." -ForegroundColor Green
npm run build

Write-Host "Uploading to S3..." -ForegroundColor Green
aws s3 sync build/ s3://ecopilot-frontend-676459154698 --region us-east-1 --delete

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Your app is live at: http://ecopilot-frontend-676459154698.s3-website-us-east-1.amazonaws.com" -ForegroundColor Yellow