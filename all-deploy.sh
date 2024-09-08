#!/bin/bash

# Define variables.
CDK_DIR=./examining-nle-cdk
ECR_REPOSITORY_NAME=examining-ecr-repository

# Load environment variables.
if [ ! -f .env.local ]; then
  echo "Please create the \".env.local\" file to define your environment."
  exit 1;
fi
. .env.local

# Change directory to the CDK directory.
cd ${CDK_DIR}

# Install CDK dependencies.
npm install

# Bootstrap the CDK environment.
cdk bootstrap aws://${CDK_DEFAULT_ACCOUNT}/${CDK_DEFAULT_REGION}

# Create ECR repositories at first.
cdk deploy --require-approval never examining-ecr

# push arbitrary docker images to the ECR repositories created above.
## pull the hello-world image.
docker image pull public.ecr.aws/docker/library/hello-world:linux

## login to the ECR service.
aws ecr get-login-password --region ${CDK_DEFAULT_REGION} | docker login --username AWS --password-stdin ${CDK_DEFAULT_ACCOUNT}.dkr.ecr.${CDK_DEFAULT_REGION}.amazonaws.com

## Push the image to the ECR repository.
docker image tag public.ecr.aws/docker/library/hello-world:linux ${CDK_DEFAULT_ACCOUNT}.dkr.ecr.${CDK_DEFAULT_REGION}.amazonaws.com/${ECR_REPOSITORY_NAME}:latest
docker image push ${CDK_DEFAULT_ACCOUNT}.dkr.ecr.${CDK_DEFAULT_REGION}.amazonaws.com/${ECR_REPOSITORY_NAME}:latest

# Deploy the rest of the CDK stacks.
cdk deploy --require-approval never --all --concurrency 4
