import { createConfig } from './config-helper';
import { configDef } from '@nidomiro/config-helper';

describe('configHelper', () => {
	describe('schema tests', () => {
		it('should add env var to schema on first level', () => {
			const config = createConfig({
				testProp: configDef(() => 'testPropValue'),
			});
			expect(config.getSchema().testProp.envVar).toEqual('TEST_PROP');
		});

		it('should keep existing env var definitions', () => {
			const config = createConfig({
				testProp: configDef(() => 'testPropValue', { envVar: 'TEST_ENV_VAR' }),
			});

			expect(config.getSchema().testProp.envVar).toEqual('TEST_ENV_VAR');
		});

		it('should add env var definitions to nested config', () => {
			const config = createConfig({
				group: {
					testProp: configDef(() => 'testPropValue'),
					innerGroup: {
						testProp: configDef(() => 'testPropValue'),
					},
				},
			});

			expect(config.getSchema().group.testProp.envVar).toEqual('GROUP_TEST_PROP');
			expect(config.getSchema().group.innerGroup.testProp.envVar).toEqual('GROUP_INNER_GROUP_TEST_PROP');
		});

		describe('env-var prefix tests', () => {
			it('should prefix generated env-vars', () => {
				const config = createConfig(
					{
						testProp: configDef(() => 'testPropValue'),
					},
					{
						envPrefix: 'PREFIX',
					}
				);

				expect(config.getSchema().testProp.envVar).toEqual('PREFIX_TEST_PROP');
			});

			it('should not prefix existing env-vars if not configured', () => {
				const config = createConfig(
					{
						testProp: configDef(() => 'testPropValue', { envVar: 'EXISTING_PROP' }),
					},
					{
						envPrefix: 'PREFIX',
					}
				);
				expect(config.getSchema().testProp.envVar).toEqual('EXISTING_PROP');
			});

			it('should prefix existing env-vars if configured', () => {
				const config = createConfig(
					{
						testProp: configDef(() => 'testPropValue', { envVar: 'EXISTING_PROP' }),
					},
					{
						envPrefix: 'PREFIX',
						prefixExistingEnv: true,
					}
				);

				expect(config.getSchema().testProp.envVar).toEqual('PREFIX_EXISTING_PROP');
			});
		});
	});

	describe('property structure tests', () => {
		it('should use process.env as default env-source', () => {
			const config = createConfig({
				testProp: configDef<string | null>(() => 'testPropValue', {optional: true}),
				groupA: {
					testPropA: configDef(() => 'groupA.testPropValue'),
				},
			});

			expect(config.getProperties().testProp).toEqual('testPropValue');
			expect(config.getProperties().groupA.testPropA).toEqual('groupA.testPropValue');
		});

		it('env should be overrideable from config', () => {
			const config = createConfig(
				{
					testProp: configDef(() => 'testPropValue'),
				},
				{
					env: {
						// eslint-disable-next-line @typescript-eslint/naming-convention
						TEST_PROP: 'TestPropValueFromConfigEnv',
					},
				}
			);

			expect(config.getProperties().testProp).toEqual('TestPropValueFromConfigEnv');
		});
	});

	describe('env tests', () => {
		it('should use process.env as default env-source', () => {
			process.env['TEST_PROP'] = 'TestPropValueFromProcessEnv';
			const config = createConfig({
				testProp: configDef(() => 'testPropValue'),
			});

			expect(config.getProperties().testProp).toEqual('TestPropValueFromProcessEnv');
		});

		it('env should be overrideable from config', () => {
			const config = createConfig(
				{
					testProp: configDef(() => 'testPropValue'),
				},
				{
					env: {
						// eslint-disable-next-line @typescript-eslint/naming-convention
						TEST_PROP: 'TestPropValueFromConfigEnv',
					},
				}
			);

			expect(config.getProperties().testProp).toEqual('TestPropValueFromConfigEnv');
		});
	});
});

