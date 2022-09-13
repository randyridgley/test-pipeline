import { SecureBucket } from '@randyridgley/cdk-constructs';
import { Duration } from 'aws-cdk-lib';
import { Key } from 'aws-cdk-lib/aws-kms';
import { BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { BuildConfig } from '../environment/build-config';
import { BaseStack, BaseStackProps } from './base-stack';

export interface DefaultStackProps extends BaseStackProps {
  readonly eventsKey?: Key;
}

export class DefaultStack extends BaseStack {
  private readonly buildConfig: BuildConfig;

  constructor(scope: Construct, id: string, props: DefaultStackProps, buildConfig: BuildConfig) {
    super(scope, id, props, buildConfig);
    this.buildConfig = buildConfig;
    console.log(this.buildConfig.Parameters.TestParameter);

    const kmsKey = props.eventsKey
    ? props.eventsKey
    : new Key(this, 'StackKmsKey', {
      enableKeyRotation: true,
      alias: `${id}-kms-key`,
      pendingWindow: Duration.days(7),
    });

    const logBucket = new SecureBucket(this, 'EventsLogBucket', {
      lifecycleRules: [
        {
          expiration: Duration.days(180),
        },
      ],
      encryptionKey: kmsKey,
      encryption: BucketEncryption.KMS,
      bucketKeyEnabled: true,
    });

    NagSuppressions.addResourceSuppressions(logBucket, [
      {
        id: 'AwsSolutions-S1',
        reason: 'This bucket itself is for server access log from other buckets, so does not have server access log enabled',
      },
    ]);

    new SecureBucket(this, 'TestBucketFromPipeline', {
      serverAccessLogsBucket: logBucket
    });
  }
}
