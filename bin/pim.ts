#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { VPCStack } from "../lib/vpc-stack";
import { PimStack } from "../lib/pim-stack";
import { DBStack } from "../lib/db-stack";

const app = new cdk.App();
const vpcStack = new VPCStack(app, "PimVPCStack", {});

const dbStack = new DBStack(app, "PimDBStack", {
  vpc: vpcStack.vpc,
  esSecurityGroup: vpcStack.esSecurityGroup,
  mysqlSecurityGroup: vpcStack.mysqlSecurityGroup,  
  // subnets: vpcStack.mySubnets,
});

const pimStack = new PimStack(app, "PimStack", {
  vpc: vpcStack.vpc,
  instanceSecurityGroup: vpcStack.instanceSecurityGroup,
  albSecurityGroup: vpcStack.albSecurityGroup,
  es: dbStack.es,
  rds: dbStack.rds,
  secret: dbStack.secret,
});
