import * as cdk from "@aws-cdk/core";

import {
  DatabaseInstance,
  DatabaseInstanceEngine,
  MysqlEngineVersion,
  Credentials,
} from "@aws-cdk/aws-rds";
import { Secret } from "@aws-cdk/aws-secretsmanager";
import * as opensearch from "@aws-cdk/aws-opensearchservice";
import * as iam from "@aws-cdk/aws-iam";

import {
  InstanceClass,
  InstanceSize,
  Port,
  Peer,
  SubnetType,
  SecurityGroup,
  InstanceType,
  Vpc,
} from "@aws-cdk/aws-ec2";

export interface DBStackProps extends cdk.StackProps {
  vpc: Vpc;
  esSecurityGroup: SecurityGroup;
  mysqlSecurityGroup: SecurityGroup;
}

export class DBStack extends cdk.Stack {
  readonly secret: Secret;
  readonly rds: DatabaseInstance;
  readonly es: opensearch.Domain;

  constructor(scope: cdk.App, id: string, props: DBStackProps) {
    super(scope, id, props);

    const esDomainName = "akeneo";

    const esDomainArn =
      "arn:aws:es:" +
      this.region +
      ":" +
      this.account +
      ":domain/" +
      esDomainName +
      "/*";

    this.es = new opensearch.Domain(this, "ESDomain", {
      version: opensearch.EngineVersion.OPENSEARCH_1_2,
      domainName: esDomainName,
      accessPolicies: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          resources: [esDomainArn],
          actions: ["es:*"],
          principals: [new iam.AnyPrincipal()],
        }),
      ],
      enableVersionUpgrade: true,
      securityGroups: [props.esSecurityGroup],
      capacity: {
        dataNodes: 2,
        dataNodeInstanceType: "t3.medium.search",
      },
      ebs: {
        volumeSize: 20,
      },
      vpc: props.vpc,
      vpcSubnets: [props.vpc.selectSubnets({ subnetType: SubnetType.PRIVATE })],
      zoneAwareness: {
        availabilityZoneCount: 2,
        enabled: true,
      },
    });

    this.secret = new Secret(this, "RDSCreds", {
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: "admin" }),
        generateStringKey: "password",
        excludePunctuation: true,
      },
    });

    this.rds = new DatabaseInstance(this, "MySQLRDSInstance", {
      engine: DatabaseInstanceEngine.mysql({
        version: MysqlEngineVersion.VER_8_0_21,
      }),
      instanceType: InstanceType.of(InstanceClass.MEMORY4, InstanceSize.LARGE),
      vpc: props.vpc,
      vpcSubnets: { subnetType: SubnetType.PRIVATE },
      storageEncrypted: true,
      multiAz: true,
      autoMinorVersionUpgrade: false,
      allocatedStorage: 30,
      //   storageType: StorageType.GP2,
      deletionProtection: false,
      securityGroups: [props.mysqlSecurityGroup],
      credentials: Credentials.fromSecret(this.secret, "admin"),
      databaseName: "akeneo",
      //   backupRetention: cdk.Duration.days(3),
      port: 3306,
    });
  }
}
