#!/bin/bash

# AWS ECS Deployment Script for EcoPilot Frontend
# Make sure to configure AWS CLI first: aws configure

set -e

# Configuration - Update these values
AWS_REGION="us-east-1"  # Change to your preferred region
AWS_ACCOUNT_ID="YOUR_ACCOUNT_ID"  # Replace with your AWS account ID
ECR_REPOSITORY="ecopilot-frontend"
CLUSTER_NAME="ecopilot-cluster"
SERVICE_NAME="ecopilot-frontend-service"
TASK_DEFINITION_FAMILY="ecopilot-frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting AWS ECS deployment for EcoPilot Frontend...${NC}"

# Step 1: Create ECR repository if it doesn't exist
echo -e "${YELLOW}Step 1: Creating ECR repository...${NC}"
aws ecr describe-repositories --repository-names $ECR_REPOSITORY --region $AWS_REGION 2>/dev/null || \
aws ecr create-repository --repository-name $ECR_REPOSITORY --region $AWS_REGION

# Step 2: Get ECR login token and login to Docker
echo -e "${YELLOW}Step 2: Logging into ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Step 3: Build Docker image
echo -e "${YELLOW}Step 3: Building Docker image...${NC}"
docker build -t $ECR_REPOSITORY .

# Step 4: Tag image for ECR
echo -e "${YELLOW}Step 4: Tagging image for ECR...${NC}"
docker tag $ECR_REPOSITORY:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest

# Step 5: Push image to ECR
echo -e "${YELLOW}Step 5: Pushing image to ECR...${NC}"
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY:latest

# Step 6: Create ECS cluster if it doesn't exist
echo -e "${YELLOW}Step 6: Creating ECS cluster...${NC}"
aws ecs describe-clusters --clusters $CLUSTER_NAME --region $AWS_REGION 2>/dev/null || \
aws ecs create-cluster --cluster-name $CLUSTER_NAME --capacity-providers FARGATE --region $AWS_REGION

# Step 7: Create CloudWatch log group
echo -e "${YELLOW}Step 7: Creating CloudWatch log group...${NC}"
aws logs create-log-group --log-group-name /ecs/$TASK_DEFINITION_FAMILY --region $AWS_REGION 2>/dev/null || echo "Log group already exists"

# Step 8: Update task definition with correct values
echo -e "${YELLOW}Step 8: Updating task definition...${NC}"
sed -i "s/YOUR_ACCOUNT_ID/$AWS_ACCOUNT_ID/g" aws-deployment/ecs-task-definition.json
sed -i "s/YOUR_REGION/$AWS_REGION/g" aws-deployment/ecs-task-definition.json

# Step 9: Register task definition
echo -e "${YELLOW}Step 9: Registering ECS task definition...${NC}"
aws ecs register-task-definition --cli-input-json file://aws-deployment/ecs-task-definition.json --region $AWS_REGION

# Step 10: Create or update ECS service
echo -e "${YELLOW}Step 10: Creating/updating ECS service...${NC}"

# Check if service exists
if aws ecs describe-services --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION 2>/dev/null | grep -q "ACTIVE"; then
    echo "Service exists, updating..."
    aws ecs update-service --cluster $CLUSTER_NAME --service $SERVICE_NAME --task-definition $TASK_DEFINITION_FAMILY --region $AWS_REGION
else
    echo "Creating new service..."
    # You'll need to replace these subnet and security group IDs with your own
    aws ecs create-service \
        --cluster $CLUSTER_NAME \
        --service-name $SERVICE_NAME \
        --task-definition $TASK_DEFINITION_FAMILY \
        --desired-count 1 \
        --launch-type FARGATE \
        --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxxxxxx],securityGroups=[sg-xxxxxxxxx],assignPublicIp=ENABLED}" \
        --region $AWS_REGION
fi

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${YELLOW}Your application will be available once the task is running.${NC}"
echo -e "${YELLOW}Check the ECS console for the public IP address.${NC}"