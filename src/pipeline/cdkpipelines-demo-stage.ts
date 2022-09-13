
import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BuildConfig, getConfig } from '../environment/build-config';
import { DefaultStack } from '../stacks/default-stack';

/**
 * Deployable unit of web service app
 */
export class CdkpipelinesDemoStage extends Stage {
  public readonly service: DefaultStack;
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    let buildConfig: BuildConfig = getConfig(id);

    let defaultStackName = buildConfig.App + '-' + buildConfig.Environment + '-default';
    const defaultStack = new DefaultStack(this, defaultStackName, {
      env: {
        region: buildConfig.AWSProfileRegion,
        account: buildConfig.AWSAccountID,
      },
    }, buildConfig);

    this.service = defaultStack;
  }
}