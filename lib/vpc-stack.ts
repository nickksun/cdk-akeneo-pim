import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";

export class VPCStack extends cdk.Stack {
  readonly vpc: ec2.Vpc;
  readonly cidr = "10.100.1.0/24";

  readonly esSecurityGroup: ec2.SecurityGroup;
  readonly mysqlSecurityGroup: ec2.SecurityGroup;
  readonly instanceSecurityGroup: ec2.SecurityGroup;
  readonly albSecurityGroup: ec2.SecurityGroup;

  readonly mySubnets: ec2.Subnet[];

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, "PIM VPC", {
      cidr: this.cidr,
      subnetConfiguration: [
        {
          cidrMask: 26,
          name: "Public - PIM VPC subnet",
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 26,
          name: "Private - PIM VPC subnet",
          subnetType: ec2.SubnetType.PRIVATE,
        },
      ],
    });



    this.instanceSecurityGroup = new ec2.SecurityGroup(
      this,
      "instance-security-group",
      {
        vpc: this.vpc,
        allowAllOutbound: true,
        securityGroupName: "EC2 instance Security Group",
      }
    );

    this.esSecurityGroup = new ec2.SecurityGroup(this, "es-security-group", {
      vpc: this.vpc,
      allowAllOutbound: true,
      securityGroupName: "ES Security Group",
    });
    this.esSecurityGroup.addIngressRule(
      this.instanceSecurityGroup,
      ec2.Port.allTraffic()
    );

    this.mysqlSecurityGroup = new ec2.SecurityGroup(
      this,
      "rds-security-group",
      {
        vpc: this.vpc,
        allowAllOutbound: true,
        securityGroupName: "MySQL Security Group",
      }
    );
    this.mysqlSecurityGroup.addIngressRule(
      this.instanceSecurityGroup,
      ec2.Port.tcp(3306)
    );

    this.albSecurityGroup = new ec2.SecurityGroup(
      this,
      "alb-security-group",
      {
        vpc: this.vpc,
        allowAllOutbound: true,
        securityGroupName: "ALB Security Group",
      }
    );
    this.albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(443)
    )
  }
}
