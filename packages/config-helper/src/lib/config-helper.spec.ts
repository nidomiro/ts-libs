import { configuration } from '@nidomiro/config-helper';

describe('configHelper', () => {

	it('should add env var to schema on first level', () => {

		const config = configuration({
			testProp: {
				default: 'testPropValue'
			}
		});

		expect(config.getSchema().properties).toHaveProperty('testProp.env');
		// @ts-ignore
		expect(config.getSchema().properties['testProp']['env']).toEqual('TEST_PROP');
	});

});
