import { execSync } from 'child_process';

const CDK_OUTPUT_DIR = '/tmp/cdk.out';
const ENV_NAME = process.env.ENV_NAME;



export const handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const result = await deleteNatGateway();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello from Lambda!', result }),
    };
  } catch (error) {
    console.error('Error:', error);

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};

export const deleteNatGateway = async (event) => {
  // Assuming the repo is cloned and available in the Lambda layer
  console.log('Deleting NAT Gateways by updating the VPC stack.');

  try {
    const execCdkDeployOutput = execSync(
      `cd /var/cdk && cdk deploy --output ${CDK_OUTPUT_DIR} --require-approval never ${ENV_NAME}-vpc`,
      {
        encoding: 'utf-8',
      }
    );
    console.log(execCdkDeployOutput);

    const message = 'the VPC stack has been updated.';
    console.log(message);

    return { message };
  } catch (error) {
    console.error(`Error executing command: ${error.message}`);
    throw error;
  }
};
