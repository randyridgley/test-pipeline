import * as fs from 'fs';
import path from 'path';
import * as yaml from 'js-yaml';

export interface BuildConfig {
  readonly AWSAccountID : string;
  readonly AWSProfileName : string;
  readonly AWSProfileRegion : string;

  readonly App : string;
  readonly Environment : string;
  readonly Version : string;
  readonly Build : string;

  readonly GithubSecretName: string;
  readonly GithubRepo: string;
  readonly GithubBranch: string;

  readonly Parameters: Parameters;
}

export interface Parameters {
  readonly TestParameter?: string;
}

export function ensureString(object: { [name: string]: any }, propName: string ): string {
  if (!object[propName] || object[propName].trim().length === 0) {throw new Error(propName +' does not exist or is empty');}

  return object[propName];
}

export function getConfig(env: string) {
  let unparsedEnv: any = yaml.load(fs.readFileSync(path.resolve('./environments/'+env+'.yaml'), 'utf8'));

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

  return buildConfig;
}