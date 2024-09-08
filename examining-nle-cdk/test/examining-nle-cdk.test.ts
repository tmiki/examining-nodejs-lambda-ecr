import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as ExaminingNleCdk from '../lib/examining-nle-cdk-stack';

describe('ExaminingNleCdkStack', () => {
  const app = new cdk.App();
  const stack = new ExaminingNleCdk.ExaminingNleCdkStack(app, 'TestExaminingNleCdkStack');
  const template = Template.fromStack(stack);

  test('Lambda Function Created', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      PackageType: 'Image',
    });
  });

  test('CloudFormation Output Created', () => {
    template.hasOutput('LambdaFunctionArn', {
      Description: 'The ARN of the Lambda function',
    });
  });
});