import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import {PimStack} from '../lib/pim-stack';
import {VPCStack} from '../lib/vpc-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const vpcStack = new VPCStack(app,'VPCStack')
    // const pimStack = new PimStack(app, 'MyTestStack',{vpc:vpcStack.vpc});
    // THEN
    expectCDK(vpcStack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))

    // expectCDK(pimStack).to(matchTemplate({
    //   "Resources": {}
    // }, MatchStyle.EXACT))
});
