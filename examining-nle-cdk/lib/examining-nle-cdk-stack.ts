import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import { DockerImageCode, DockerImageFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Effect, ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

export class ExaminingNleCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    if (!props?.env?.account || !props?.env?.region) {
      throw new Error('Environment variable CDK_DEFAULT_ACCOUNT or CDK_DEFAULT_ACCOUNT is not defined');
    }

    // Create a Lambda Function
    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda.DockerImageFunction.html
    const lambdaFunction = new DockerImageFunction(this, 'ExaminingNodeLambdaEcrFunction', {
      functionName: 'examining-node-lambda-ecr-function',
      code: DockerImageCode.fromEcr(
        Repository.fromRepositoryName(this, 'ExaminingEcrRepository', 'examining-ecr-repository')
      ),
      role: this.createLambdaIamRole(),
      timeout: Duration.minutes(5),
      memorySize: 1024,
      environment: {
        ENV_NAME: 'examining',
        CDK_DEFAULT_ACCOUNT: props?.env?.account,
        CDK_DEFAULT_REGION: props?.env?.region,
      },
    });

    // Output the Lambda Function ARN
    new CfnOutput(this, 'LambdaFunctionArn', {
      value: lambdaFunction.functionArn,
      description: 'The ARN of the Lambda function',
    });
  }

  private createLambdaIamRole(): Role {
    const lambdaRole = new Role(this, 'ExaminingNodeLambdaEcrFunctionRole', {
      roleName: 'examining-node-lambda-ecr-function-role',
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
        ManagedPolicy.fromAwsManagedPolicyName('AWSCloudFormationFullAccess'),
      ],
    });

    lambdaRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['iam:PassRole', 'sts:AssumeRole'],
        resources: ['*'],
      })
    );

    lambdaRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['ec2:describe*'],
        resources: ['*'],
      })
    );

    return lambdaRole;
  }
}
