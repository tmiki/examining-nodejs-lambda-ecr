FROM public.ecr.aws/lambda/nodejs:20

# --------------------------------------------------------------------------------
# Section 1. Install the Lambda function source code that runs `cdk deploy` command 
# --------------------------------------------------------------------------------

WORKDIR ${LAMBDA_TASK_ROOT}

## Specify the directory where Lambda source code is stored.
ENV LAMBD_SRC_DIR=./examining-nle-lambda

## Copy the function code and dependencies files.
COPY ${LAMBD_SRC_DIR}/src/index.mjs ./
COPY ${LAMBD_SRC_DIR}/package.json ${LAMBD_SRC_DIR}/package-lock.json ./

# Install dependencies for the Lambda application.
RUN npm install

# --------------------------------------------------------------------------------
# Section 2. Install the AWS CDK source code and its dependencies.
# --------------------------------------------------------------------------------

# Specify the directory where CDK source should be placed.
ENV CDK_DEST_DIR=/var/cdk

WORKDIR ${CDK_DEST_DIR}

# Copy CDK source code files.
COPY ./examining-nle-cdk ${CDK_DEST_DIR}

# Set up Node.js modules that AWS CDK needs.
RUN npm install -g typescript aws-cdk && npm install

# Make the "cdk.context.json" writable.
# Because CDK needs to update the "cdk.context.json" file when it runs.
RUN rm -f ./cdk.context.json && ln -s /tmp/cdk.context.json ./cdk.context.json

# Set the "natGateways" property of target environments.
RUN dnf install -y jq
RUN jq '.context.environments.examining.vpc.natGateways = 0' cdk.json > cdk.json.tmp && mv cdk.json.tmp cdk.json
RUN jq '.context.environments.dev.vpc.natGateways = 0' cdk.json > cdk.json.tmp && mv cdk.json.tmp cdk.json

# --------------------------------------------------------------------------------
# Section 3. Adapt the container image to AWS Lambda specifications.
# --------------------------------------------------------------------------------

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "index.handler" ]

WORKDIR ${LAMBDA_TASK_ROOT}
