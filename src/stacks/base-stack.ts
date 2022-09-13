import { Aspects, NestedStack, NestedStackProps, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { DefaultDashboardFactory, MonitoringFacade } from 'cdk-monitoring-constructs';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { BuildConfig } from '../environment/build-config';

export interface BaseStackProps extends StackProps {
  readonly dashboardName?: string;
  readonly alarmNamePrefix?: string;
  readonly metricNamespace?: string;
}

/**
 * Default tags for all stacks
 */
export class BaseStack extends Stack {
  readonly monitoring: MonitoringFacade;

  constructor(scope: Construct, id: string, props: BaseStackProps, buildConfig: BuildConfig) {
    super(scope, id, props);

    //Tagging
    Tags.of(this).add('Environment', `${buildConfig.Environment}`);
    Tags.of(this).add('Application', `${buildConfig.App}`);
    Tags.of(this).add('Version', `${buildConfig.Version}`);
    Tags.of(this).add('Stack', this.stackName);

    const dashboardFactory = new DefaultDashboardFactory(this, 'DefaultDashboardFactory', {
      dashboardNamePrefix: props.dashboardName ?? `${id}-dashboard`,
      createDashboard: true,
      createAlarmDashboard: true,
      createSummaryDashboard: true,      
    });
    
    this.monitoring = new MonitoringFacade(this, 'MonitoringFacade', {
      alarmFactoryDefaults: {
        alarmNamePrefix: props.alarmNamePrefix ?? `${id}-alarms`,
        actionsEnabled: false,
        datapointsToAlarm: 3,
      },
      metricFactoryDefaults: {
        namespace: props.metricNamespace,
      },
      dashboardFactory,
    });

    NagSuppressions.addResourceSuppressions(
      this.monitoring,
      [
        {
          id: 'AwsSolutions-L1',
          reason: 'External library CDK Monitoring Constructs is setting the version of the lambda function.',
        },
        {
          id: 'AwsSolutions-IAM4',
          reason: 'MonitoringFacade in CDK Monitoring Constructs is using the managed policy service-role/AWSLambdaBasicExecutionRole in its code base to create Lambda functions.'
        },
        {
          id: 'AwsSolutions-IAM5',
          reason: 'MonitoringFacade in CDK Monitoring Constructs is creating policies with *.'
        }
      ],
      true,
    );
    Aspects.of(this).add(new AwsSolutionsChecks({ verbose: true }));
  }
}

/**
 * Add tags to all nested stacks
 */
export class NestedBaseStack extends NestedStack {
  readonly monitoring: MonitoringFacade;

  constructor(scope: Construct, id: string, props?: NestedStackProps) {
    super(scope, id, props);
    this.monitoring = (this.nestedStackParent as BaseStack).monitoring;

    if (this.nestedStackParent?.tags.hasTags) {
      Object.entries(this.nestedStackParent.tags.tagValues()).forEach(([key, value]) => {
        this.tags.setTag(key, value);
      });
    }
  }
}
