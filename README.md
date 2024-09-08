# Overview

This project provides a sample for executing CDK commands on an AWS Lambda function (Node.js).
While it uses AWS CDK to build AWS resources, the Lambda function utilizes an ECR image type, so the sample construction is not completed with just `cdk deploy --all`.
The construction follows these steps:

1. Deploy the CDK stack to build the necessary AWS resources
2. Build the container image for the Lambda function
3. Push the built container image to ECR and update the Lambda function

# Purpose/Motivation

In some cases, we want to stop or delete certain AWS resources to reduce AWS costs.  
While it's easy to stop server-like services such as EC2 or RDS instances, it's more challenging to delete NAT Gateways.
Since NAT Gateways are interconnected with other resources like Elastic IPs and route tables, we can't simply delete and recreate them.

The most straightforward approach is to implement the VPC and its related resources using the AWS CDK L2 construct, change the `natGateways` property to 0, and run `cdk deploy`.
This project enables you to adopt this method to reduce AWS costs effectively.

# File/Directory Structure

| Path | Description |
|------|-------------|
| `./` | Root directory of this project |
| `README.md` | Project description (this file) |
| `examining-nle-cdk/` | Directory containing AWS CDK definitions |
| `examining-nle-cdk/bin/examining-nle-cdk.ts` | Entry point for the CDK application |
| `examining-nle-cdk/lib/` | Contains stacks defined with AWS CDK |
| `examining-nle-cdk/package.json` | Dependency definitions for the CDK application |
| `examining-nle-cdk/cdk.json` | Defines environment-specific customization values |
| `examining-nle-lambda/` | Source code directory for the Lambda function |
| `examining-nle-lambda/src/index.mjs` | Main logic of the Lambda function |
| `examining-nle-lambda/package.json` | Dependency definitions for the Lambda function |
| `all-deploy.sh` | Shell script to build AWS resources |
| `update-lambda-image.sh` | Shell script to update the Lambda function |

# Verified Environment

This project has been verified to work in the following environment:

- Node.js v20.11.1
- AWS CDK CLI 2.159.1
- Docker version 27.2.1

# Setup

1. Clone the repository:
    ```
    git clone https://github.com/tmiki/examining-nodejs-lambda-ecr.git
    cd ./examining-nodejs-lambda-ecr/
    ```

2. Change the environment variable file:
    ```
    vi .env.local
    ```

    ```
    export AWS_PROFILE={your aws cli profile}
    export CDK_DEFAULT_ACCOUNT={your AWS account ID}
    export CDK_DEFAULT_REGION={AWS region you want to deploy}
    ```

3. Install dependencies for the CDK project:
    ```
    cd ./examining-nle-cdk/
    npm install
    cd ../
    ```

# Deployment

1. Execute the CDK deployment script:
    ```
    bash all-deploy.sh
    ```

2. Build and push the container image, then update the Lambda function:
    ```
    bash update-lambda-image.sh
    ```

# Usage

After deployment, a VPC stack including one NAT Gateway and a Lambda function named `examining-node-lambda-ecr-function` will be created.

To use the function:

1. Open this Lambda function from the AWS Management Console.
2. Execute it from the "Test" section.

Note: The function does not check the `event` data passed to it, so its behavior will remain the same regardless of the data sent.

When executed, the Lambda function performs the following actions:

1. It runs `cdk deploy` to update the VPC stack.
2. It sets the `natGateways` property to 0 in the VPC L2 construct configuration.
3. This action results in the deletion of all NAT Gateways in the VPC.
