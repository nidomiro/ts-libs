import { createConfig } from '@nidomiro/config-helper';

describe('configHelper', () => {

	it('should add env var to schema on first level', () => {

		const config = createConfig({
			testProp: {
				default: 'testPropValue'
			}
		});

		expect(config.getSchema().properties).toHaveProperty('testProp.env');
		// @ts-ignore
		expect(config.getSchema().properties['testProp']['env']).toEqual('TEST_PROP');
	});

	it('should keep existing env var definitions', () => {

		const config = createConfig({
			testProp: {
				default: 'testPropValue',
				env: 'TEST_ENV_VAR'
			}
		});

		expect(config.getSchema().properties).toHaveProperty('testProp.env');
		// @ts-ignore
		expect(config.getSchema().properties['testProp']['env']).toEqual('TEST_ENV_VAR');
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
				}
			}

		});

		console.log(config.getSchema())
		console.log(config.getSchemaString())

		expect(config.getSchema().properties).toHaveProperty('group.properties.testProp.env');

		// @ts-expect-error
		expect(config.getSchema().properties.group.properties.testProp.env).toEqual('GROUP_TEST_PROP');

		expect(config.getSchema().properties).toHaveProperty('group.properties.innerGroup.properties.testProp.env');
		// @ts-expect-error
		expect(config.getSchema().properties.group.properties.innerGroup.properties.testProp.env).toEqual('GROUP_INNER_GROUP_TEST_PROP');
	});

});
