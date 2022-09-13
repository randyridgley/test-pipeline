import { Aspects, NestedStack, NestedStackProps, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { DashboardRenderingPreference, DefaultDashboardFactory, MonitoringFacade } from 'cdk-monitoring-constructs';
import { AwsSolutionsChecks } from 'cdk-nag';
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
      renderingPreference: DashboardRenderingPreference.INTERACTIVE_AND_BITMAP,
    },
    );

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
