// import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';

export class ExaminingVpcStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Retrieve the environment name.
    const envName = this.node.tryGetContext('env') || 'examining';
    
    // Retrieve the variables of the specified environment.
    const envSettings = this.node.tryGetContext('environments')[envName];

    if (!envSettings) {
      throw new Error(`Undefined environment: ${envName}`);
    }

    let vpcConfig = envSettings['vpc'];

    // Creating a VPC and belonging resources.
    //
    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ec2.Vpc.html
    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ec2.SubnetConfiguration.html
    // https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_ec2.SubnetType.html

    // Build the VPC Construct props with basic settings.
    const vpcProps = {
      vpcName: id,
      ipAddresses: ec2.IpAddresses.cidr(vpcConfig.cidr),
      maxAzs: 3,
      reservedAzs: 1,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          name: 'public-reserved',
          subnetType: ec2.SubnetType.PUBLIC,
          reserved: true,
        },
        {
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          name: 'private-reserved',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
          reserved: true,
        },
        {
          name: 'isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
        {
          name: 'isolated-reserved',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          reserved: true,
        },
      ],
      restrictDefaultSecurityGroup: false,
      natGateways: vpcConfig.natGateways,
    };

    // Create a VPC in practice.
    const vpc = new ec2.Vpc(this, 'ExaminingVpc', vpcProps);

    // Put the VPC ID into SSM Parameter Store instead of Output.
    new StringParameter(this, 'VpcIdParameter', {
      parameterName: '/cdk/vpc/vpc-id',
      stringValue: vpc.vpcId,
    });
  }
}
