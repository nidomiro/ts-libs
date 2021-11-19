import { createConfig } from './config-helper';

describe('configHelper', () => {

	describe('schema tests', () => {

		it('should add env var to schema on first level', () => {
			const config = createConfig({
				testProp: {
					default: 'testPropValue',
				},
			});

			expect(config.getSchema().testProp.env).toEqual('TEST_PROP');
		});

		it('should keep existing env var definitions', () => {
			const config = createConfig({
				testProp: {
					default: 'testPropValue',
					env: 'TEST_ENV_VAR',
				},
			});

			expect(config.getSchema().testProp.env).toEqual('TEST_ENV_VAR');
		});

		it('should add env var definitions to nested config', () => {
			const config = createConfig({
				group: {
					testProp: {
						default: 'testPropValue',
					},
					innerGroup: {
						testProp: {
							default: 'testPropValue',
						},
					},
				},
			});

			expect(config.getSchema().group.testProp.env).toEqual('GROUP_TEST_PROP');
			expect(config.getSchema().group.innerGroup.testProp.env).toEqual('GROUP_INNER_GROUP_TEST_PROP');
		});

		describe('env-var prefix tests', () => {
			it('should prefix generated env-vars', () => {
				const config = createConfig(
					{
						testProp: {
							default: 'testPropValue',
						},
					},
					{
						envPrefix: 'PREFIX',
					}
				);

				expect(config.getSchema().testProp.env).toEqual('PREFIX_TEST_PROP');
			});

			it('should not prefix existing env-vars if not configured', () => {
				const config = createConfig(
					{
						testProp: {
							default: 'testPropValue',
							env: 'EXISTING_PROP',
						},
					},
					{
						envPrefix: 'PREFIX',
					}
				);

				expect(config.getSchema().testProp.env).toEqual('EXISTING_PROP');
			});

			it('should prefix existing env-vars if configured', () => {
				const config = createConfig(
					{
						testProp: {
							default: 'testPropValue',
							env: 'EXISTING_PROP',
						},
					},
					{
						envPrefix: 'PREFIX',
						prefixExistingEnv: true,
					}
				);

				expect(config.getSchema().testProp.env).toEqual('PREFIX_EXISTING_PROP');
			});
		});
	})

	describe('env tests', () => {


		it('should use process.env as default env-source', () => {
			process.env['TEST_PROP'] = 'TestPropValueFromProcessEnv'
			const config = createConfig({
				testProp: {
					default: 'testPropValue',
				},
			});

			expect(config.getProperties().testProp).toEqual('TestPropValueFromProcessEnv');
		})

		it('env should be overrideable from config', () => {
			const config = createConfig({
				testProp: {
					default: 'testPropValue',
				},
			}, {
				env: {
					// eslint-disable-next-line @typescript-eslint/naming-convention
					'TEST_PROP': 'TestPropValueFromConfigEnv'
				}
			});

			expect(config.getProperties().testProp).toEqual('TestPropValueFromConfigEnv');
		})


		it('properties should be nullable for optional types', () => {
			const config = createConfig({
				testProp: {
					default: true,
					optional: true
				},
			});

			config.getProperties().testProp

			expect(config.getProperties().testProp).toEqual('TestPropValueFromConfigEnv');
		})

	})
});

