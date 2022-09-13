import * as fs from 'fs';
import path from 'path';
import { App } from 'aws-cdk-lib';
import * as yaml from 'js-yaml';
import { BuildConfig, ensureString } from './environment/build-config';
import { CdkpipelinesDemoPipelineStack } from './pipeline/cdkpipelines-demo-pipeline-stack';


const app = new App();

let unparsedEnv: any = yaml.load(fs.readFileSync(path.resolve('./environments/build-account.yaml'), 'utf8'));

let buildConfig: BuildConfig = {
  AWSAccountID: ensureString(unparsedEnv, 'AWSAccountID'),
  AWSProfileName: ensureString(unparsedEnv, 'AWSProfileName'),
  AWSProfileRegion: ensureString(unparsedEnv, 'AWSProfileRegion'),

  App: ensureString(unparsedEnv, 'App'),
  Version: ensureString(unparsedEnv, 'Version'),
  Environment: ensureString(unparsedEnv, 'Environment'),
  Build: ensureString(unparsedEnv, 'Build'),

  GithubBranch: ensureString(unparsedEnv, 'GithubBranch'),
  GithubRepo: ensureString(unparsedEnv, 'GithubRepo'),
  GithubSecretName: ensureString(unparsedEnv, 'GithubSecretName'),

  Parameters: {
    TestParameter: ensureString(unparsedEnv.Parameters, 'TestParameter'),
  },
};

let defaultStackName = buildConfig.App + '-' + buildConfig.Environment;
new CdkpipelinesDemoPipelineStack(app, defaultStackName, {
  env: {
    region: buildConfig.AWSProfileRegion,
    account: buildConfig.AWSAccountID,
  },
  pipelineName: 'TestPipeline'
}, buildConfig);

app.synth();