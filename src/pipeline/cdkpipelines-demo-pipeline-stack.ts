import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { CodeBuildStep, CodePipeline, CodePipelineSource, ConfirmPermissionsBroadening, ManualApprovalStep, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { BuildConfig } from '../environment/build-config';
import { CdkpipelinesDemoStage } from './cdkpipelines-demo-stage';


export interface CdkpipelinesDemoPipelineStackProps extends StackProps {

}
/**
 * The stack that defines the application pipeline
 */
export class CdkpipelinesDemoPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: CdkpipelinesDemoPipelineStackProps, buildConfig: BuildConfig) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      // The pipeline name
      pipelineName: 'ServicePipeline',

      // Required for cross account access to S3
      crossAccountKeys: true,

      // How it will be built and synthesized
      synth: new ShellStep('Synth', {
        // Where the source can be found
        input: CodePipelineSource.gitHub(buildConfig.GithubRepo!, buildConfig.GithubBranch!, {
          authentication: SecretValue.secretsManager(buildConfig.GithubSecretName!),
        }),

        // Install dependencies, build and run cdk synth
        commands: [
          'yarn install --frozen-lockfile',
          'npx projen build',
          'npx projen synth',
        ],
      }),
    });

    pipeline.addWave('BuildWave', {
      post: [
        new CodeBuildStep('BuildSource', {
          commands: ['echo Build and unit tests go here.', 'echo Maybe a docker build and push too.'],

        }),
      ],
    });

    const preprod = new CdkpipelinesDemoStage(this, 'dev', {
      env: { account: props.env?.account, region: 'us-east-1' },
    });

    pipeline.addStage(preprod, {
      pre: [
        new ConfirmPermissionsBroadening('PermissionCheck', { stage: preprod }),
      ],
      // post: [
      //   new ShellStep('TestService', {
      //     commands: [
      //       // Use 'curl' to GET the given URL and fail if it returns an error
      //       'curl -Ssf $ENDPOINT_URL',
      //     ],
      //     envFromCfnOutputs: {
      //       // Get the stack Output from the Stage and make it available in
      //       // the shell script as $ENDPOINT_URL.
      //       ENDPOINT_URL: preprod.urlOutput,
      //     },
      //   }),

      // ],
    });


    const prod = new CdkpipelinesDemoStage(this, 'prod', {
      env: { account: props.env?.account, region: 'us-west-2' },
    });

    pipeline.addStage(prod, {
      stackSteps: [{
        stack: prod.service,
        changeSet: [
          new ManualApprovalStep('PromoteToProd', {
            comment: 'Do you want to promote this build to production?',
          }),
        ],
      }],
    });
  }
}