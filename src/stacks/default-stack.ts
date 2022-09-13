import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';
import { BuildConfig } from '../environment/build-config';
import { BaseStack, BaseStackProps } from './base-stack';

export interface DefaultStackProps extends BaseStackProps {

}

export class DefaultStack extends BaseStack {
  private readonly buildConfig: BuildConfig;

  constructor(scope: Construct, id: string, props: DefaultStackProps, buildConfig: BuildConfig) {
    super(scope, id, props, buildConfig);
    this.buildConfig = buildConfig;
    console.log(this.buildConfig.Parameters.TestParameter);

    const restApi = new RestApi(this, 'ApiGateway', { });
    restApi.root.addMethod('ANY');
  }
}
