import { ProjCDKTypescriptProject } from '@randyridgley/awscdk-app-ts';
const project = new ProjCDKTypescriptProject({
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  devDeps: ['@randyridgley/awscdk-app-ts'],
  name: 'test-pipeline',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();