#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ExaminingEcrStack } from '../lib/examining-ecr-stack';
import { ExaminingVpcStack } from '../lib/examining-vpc-stack';
import { ExaminingNleCdkStack } from '../lib/examining-nle-cdk-stack';

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();
new ExaminingEcrStack(app, 'examining-ecr', { env: env });
new ExaminingVpcStack(app, 'examining-vpc', { env: env });
new ExaminingNleCdkStack(app, 'examining-nle-cdk', { env: env });
