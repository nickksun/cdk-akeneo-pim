import { readFileSync } from "fs";
import * as path from "path";
import * as iam from "@aws-cdk/aws-iam";
// import { PolicyStatement, Role, ServicePrincipal } from "@aws-cdk/aws-iam";
import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as autoscaling from "@aws-cdk/aws-autoscaling";
import * as elbv2 from "@aws-cdk/aws-elasticloadbalancingv2";
import * as es from "@aws-cdk/aws-opensearchservice";
import * as rds from "@aws-cdk/aws-rds";
import * as secretsmanager from "@aws-cdk/aws-secretsmanager";

import { SecurityGroup, SubnetType, UserData } from "@aws-cdk/aws-ec2";

export interface PIMStackProps extends cdk.StackProps {
  vpc: ec2.Vpc;
  es: es.Domain;
  rds: rds.DatabaseInstance;
  secret: secretsmanager.Secret;
  instanceSecurityGroup: SecurityGroup;
  albSecurityGroup: SecurityGroup;
}

export class PimStack extends cdk.Stack {  
  constructor(scope: cdk.Construct, id: string, props: PIMStackProps) {
    super(scope, id, props);

    const pimDomain = this.node.tryGetContext("pimdomain");
    const githubToken = this.node.tryGetContext("githubtoken");

    const pimALB = new elbv2.ApplicationLoadBalancer(this, "LB", {
      vpc: props.vpc,
      internetFacing: true,
      securityGroup: props.albSecurityGroup
    });

    const userData = UserData.forLinux();
    userData.addCommands(
      readFileSync(path.resolve(process.cwd(), "userdata/bootstrap.sh"), {
        encoding: "utf-8",
      }).replace("%GITHUB_TOKEN%", githubToken)
    );

    userData.addCommands(
      readFileSync(path.resolve(process.cwd(), "userdata/setenv.sh"), {
        encoding: "utf-8",
      })
        .replace("%SECRET_ARN%", props.secret.secretArn)
        .replace("%DB_ENDPOINT%", props.rds.dbInstanceEndpointAddress)
        .replace("%DB_PORT%", props.rds.dbInstanceEndpointPort)
        .replace("%ES_ENDPOINT%", "https://" + props.es.domainEndpoint + ":443")
        .replace("%AKENEO_PIM_URL%", "https://" + pimDomain)        
    );

    userData.addCommands(
      readFileSync(path.resolve(process.cwd(), "userdata/setup-pim.sh"), {
        encoding: "utf-8",
      })
    );

    const pimInstanceRole = new iam.Role(this, `${id}-PIMInstanceRole`, {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      roleName: "PIMInstanceRole",
    });

    pimInstanceRole.addToPolicy(
      new iam.PolicyStatement({
        resources: [props.secret.secretArn],
        actions: ["secretsmanager:GetSecretValue"],
      })
    );

    pimInstanceRole.addManagedPolicy(
      iam.ManagedPolicy.fromManagedPolicyArn(
        this,
        `${id}-SSMManagedPolicy`,
        "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
      )
    );

    const ebsVolumeSize = 20;
    const pimASG = new autoscaling.AutoScalingGroup(this, "PIM-ASG", {
      vpc: props.vpc,
      userData: userData,
      role: pimInstanceRole,
      securityGroup: props.instanceSecurityGroup,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.LARGE
      ),
      machineImage: new ec2.AmazonLinuxImage(),
      blockDevices: [
        {
          deviceName: "/dev/xvda",
          volume: autoscaling.BlockDeviceVolume.ebs(ebsVolumeSize, {
            volumeType: autoscaling.EbsDeviceVolumeType.GP2,
          }),
        },
      ],
    });

    const listener = pimALB.addListener("Listener", {
      port: 80,
    });

    listener.addTargets("Target", {
      port: 8080,
      targets: [pimASG],
    });

    listener.connections.allowDefaultPortFromAnyIpv4("Open to the world");
  }
}
