import { CfnOutput, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import { Construct } from 'constructs';

export class ExaminingEcrStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create a new ECR repository
    const repository = new Repository(this, 'ExaminingEcrRepository', {
      repositoryName: 'examining-ecr-repository',
      imageScanOnPush: false,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Output the repository URI
    new CfnOutput(this, 'RepositoryUri', {
      value: repository.repositoryUri,
      description: 'The URI of the ECR repository',
    });
  }
}
