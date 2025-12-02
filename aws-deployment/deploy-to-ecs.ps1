# PowerShell script for AWS ECS deployment on Windows
# Make sure to configure AWS CLI first: aws configure

param(
    [string]$AWSRegion = "us-east-1",
    [string]$AWSAccountId = "676459154698",
    [string]$ECRRepository = "ecopilot-frontend",
    [string]$ClusterName = "ecopilot-cluster",
    [string]$ServiceName = "ecopilot-frontend-service",
    [string]$TaskDefinitionFamily = "ecopilot-frontend"
)

Write-Host "Starting AWS ECS deployment for EcoPilot Frontend..." -ForegroundColor Green

try {
    # Step 1: Create ECR repository if it doesn't exist
    Write-Host "Step 1: Creating ECR repository..." -ForegroundColor Yellow
    try {
        aws ecr describe-repositories --repository-names $ECRRepository --region $AWSRegion 2>$null
    }
    catch {
        aws ecr create-repository --repository-name $ECRRepository --region $AWSRegion
    }

    # Step 2: Get ECR login token and login to Docker
    Write-Host "Step 2: Logging into ECR..." -ForegroundColor Yellow
    $loginToken = aws ecr get-login-password --region $AWSRegion
    $loginToken | docker login --username AWS --password-stdin "$AWSAccountId.dkr.ecr.$AWSRegion.amazonaws.com"

    # Step 3: Build Docker image
    Write-Host "Step 3: Building Docker image..." -ForegroundColor Yellow
    docker build -t $ECRRepository .

    # Step 4: Tag image for ECR
    Write-Host "Step 4: Tagging image for ECR..." -ForegroundColor Yellow
    docker tag "$ECRRepository`:latest" "$AWSAccountId.dkr.ecr.$AWSRegion.amazonaws.com/$ECRRepository`:latest"

    # Step 5: Push image to ECR
    Write-Host "Step 5: Pushing image to ECR..." -ForegroundColor Yellow
    docker push "$AWSAccountId.dkr.ecr.$AWSRegion.amazonaws.com/$ECRRepository`:latest"

    # Step 6: Create ECS cluster if it doesn't exist
    Write-Host "Step 6: Creating ECS cluster..." -ForegroundColor Yellow
    try {
        aws ecs describe-clusters --clusters $ClusterName --region $AWSRegion 2>$null
    }
    catch {
        aws ecs create-cluster --cluster-name $ClusterName --capacity-providers FARGATE --region $AWSRegion
    }

    # Step 7: Create CloudWatch log group
    Write-Host "Step 7: Creating CloudWatch log group..." -ForegroundColor Yellow
    try {
        aws logs create-log-group --log-group-name "/ecs/$TaskDefinitionFamily" --region $AWSRegion 2>$null
    }
    catch {
        Write-Host "Log group already exists" -ForegroundColor Gray
    }

    # Step 8: Update task definition with correct values
    Write-Host "Step 8: Updating task definition..." -ForegroundColor Yellow
    $taskDefPath = "aws-deployment\ecs-task-definition.json"
    $taskDefContent = Get-Content $taskDefPath -Raw
    $taskDefContent = $taskDefContent -replace "YOUR_ACCOUNT_ID", $AWSAccountId
    $taskDefContent = $taskDefContent -replace "YOUR_REGION", $AWSRegion
    Set-Content $taskDefPath $taskDefContent

    # Step 9: Register task definition
    Write-Host "Step 9: Registering ECS task definition..." -ForegroundColor Yellow
    aws ecs register-task-definition --cli-input-json "file://aws-deployment/ecs-task-definition.json" --region $AWSRegion

    # Step 10: Create or update ECS service
    Write-Host "Step 10: Creating/updating ECS service..." -ForegroundColor Yellow
    
    # Note: You'll need to update the subnet and security group IDs
    Write-Host "Note: You'll need to manually update the subnet and security group IDs in the service creation command" -ForegroundColor Red

    Write-Host "Deployment completed successfully!" -ForegroundColor Green
    Write-Host "Your application will be available once the task is running." -ForegroundColor Yellow
    Write-Host "Check the ECS console for the public IP address." -ForegroundColor Yellow
}
catch {
    Write-Host "Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}