# AWS Deployment Guide for EcoPilot Frontend

## Prerequisites

1. **AWS CLI**: Install and configure AWS CLI

   ```bash
   aws configure
   ```

   You'll need:
   - AWS Access Key ID
   - AWS Secret Access Key
   - Default region (e.g., us-east-1)
   - Output format (json)

2. **Docker**: Make sure Docker is installed and running

3. **AWS Account**: You need an AWS account with appropriate permissions

## Deployment Options

### Option 1: Amazon ECS with Fargate (Recommended)

**Pros**: Full control, scalable, cost-effective for consistent traffic
**Cons**: More complex setup

#### Steps:

1. **Update the deployment script variables**:
   - Edit `aws-deployment/deploy-to-ecs.ps1`
   - Replace `YOUR_ACCOUNT_ID` with your AWS account ID
   - Update the AWS region if needed

2. **Set up IAM roles** (one-time setup):

   ```powershell
   # Create execution role for ECS tasks
   aws iam create-role --role-name ecsTaskExecutionRole --assume-role-policy-document file://aws-deployment/ecs-execution-role-trust-policy.json
   aws iam attach-role-policy --role-name ecsTaskExecutionRole --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

   # Create task role for the application
   aws iam create-role --role-name ecsTaskRole --assume-role-policy-document file://aws-deployment/ecs-task-role-trust-policy.json
   ```

3. **Run the deployment**:

   ```powershell
   cd C:\Users\User\Desktop\Projet_Ecopilot\EcoPilot
   .\aws-deployment\deploy-to-ecs.ps1 -AWSAccountId "YOUR_ACCOUNT_ID" -AWSRegion "us-east-1"
   ```

4. **Set up networking** (first time only):
   - Create a VPC with public subnets
   - Create a security group allowing HTTP traffic on port 80
   - Update the service creation command with your subnet and security group IDs

#### Cost Estimate:

- ~$15-30/month for a single Fargate task

### Option 2: AWS App Runner (Easiest)

**Pros**: Extremely simple, automatic scaling, pay-per-use
**Cons**: More expensive for consistent traffic

#### Steps:

1. **Push your code to a Git repository** (GitHub, GitLab, etc.)

2. **Create App Runner service**:
   - Go to AWS App Runner console
   - Click "Create service"
   - Choose "Source code repository"
   - Connect your repository
   - Use the `apprunner.yaml` configuration file
   - Deploy

#### Cost Estimate:

- ~$25-50/month depending on usage

### Option 3: AWS Amplify (Good for static apps)

**Pros**: Simple for static sites, built-in CI/CD, CDN included
**Cons**: Less control, mainly for static content

#### Steps:

1. **Push your code to a Git repository**

2. **Create Amplify app**:
   - Go to AWS Amplify console
   - Click "New app" > "Host web app"
   - Connect your repository
   - Use the `amplify.yml` build settings
   - Deploy

#### Cost Estimate:

- ~$1-5/month for small apps

### Option 4: Amazon Lightsail (Simple VPS)

**Pros**: Simple, predictable pricing, good for learning
**Cons**: Less scalable, manual management

#### Steps:

1. **Create Lightsail instance**:
   - Go to Lightsail console
   - Create Ubuntu instance ($5-20/month)
   - Install Docker on the instance

2. **Deploy your container**:
   ```bash
   # On the Lightsail instance
   git clone your-repo
   cd your-repo
   docker-compose up -d
   ```

## Recommended Approach

For your use case, I recommend **Option 1 (ECS with Fargate)** because:

1. Your app is already containerized
2. You have good Docker configuration
3. It's cost-effective and scalable
4. You maintain full control

## Next Steps

1. Choose your deployment option
2. Set up AWS CLI credentials
3. Update the configuration files with your AWS account details
4. Run the deployment script
5. Set up a custom domain (optional) using Route 53 and CloudFront

## Security Considerations

- Use HTTPS in production (set up SSL certificate)
- Configure proper security groups
- Use IAM roles with minimal permissions
- Consider using AWS WAF for additional protection

## Monitoring

- Set up CloudWatch alarms
- Monitor application logs
- Use AWS X-Ray for distributed tracing (optional)

Would you like me to help you with any specific deployment option or set up the IAM roles?
