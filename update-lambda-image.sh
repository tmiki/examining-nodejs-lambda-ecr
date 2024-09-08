#!/bin/bash

# Define variables.
ECR_REPOSITORY_NAME=examining-ecr-repository
LAMBA_FUNCTION_NAME=examining-node-lambda-ecr-function

# Load environment variables.
if [ ! -f .env.local ]; then
  echo "Please create the \".env.local\" file to define your environment."
  exit 1;
fi
. .env.local


# Build and push the Docker image.
docker image build -t ${ECR_REPOSITORY_NAME}:latest .
docker image tag ${ECR_REPOSITORY_NAME}:latest ${CDK_DEFAULT_ACCOUNT}.dkr.ecr.${CDK_DEFAULT_REGION}.amazonaws.com/${ECR_REPOSITORY_NAME}:latest
docker image push ${CDK_DEFAULT_ACCOUNT}.dkr.ecr.${CDK_DEFAULT_REGION}.amazonaws.com/${ECR_REPOSITORY_NAME}:latest

# Update the Lambda function with the new image.
aws lambda update-function-code \
  --function-name ${LAMBA_FUNCTION_NAME} \
  --image-uri ${CDK_DEFAULT_ACCOUNT}.dkr.ecr.${CDK_DEFAULT_REGION}.amazonaws.com/${ECR_REPOSITORY_NAME}:latest

