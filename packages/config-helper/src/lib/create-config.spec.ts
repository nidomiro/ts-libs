import { createConfig } from './create-config'
import { stringTransformer } from './transformer'
import { param } from './parm'

describe('configHelper', () => {
	describe('schema tests', () => {
		it('should add env var to schema on first level', () => {
			const config = createConfig({
				testProp: param({ transformer: stringTransformer(), defaultValue: 'testPropValue' }),
			})
			expect(config.getSchema().testProp.envVar).toEqual('TEST_PROP')
		})

		it('should keep existing env var definitions', () => {
			const config = createConfig({
				testProp: param({
					transformer: stringTransformer(),
					defaultValue: 'testPropValue',
					envVar: 'TEST_ENV_VAR',
				}),
			})

			expect(config.getSchema().testProp.envVar).toEqual('TEST_ENV_VAR')
		})

		it('should add env var definitions to nested config', () => {
			const config = createConfig({
				group: {
					testProp: param({ transformer: stringTransformer(), defaultValue: 'testPropValue' }),
					innerGroup: {
						testProp: param({ transformer: stringTransformer(), defaultValue: 'testPropValue' }),
					},
				},
			})

			expect(config.getSchema().group.testProp.envVar).toEqual('GROUP_TEST_PROP')
			expect(config.getSchema().group.innerGroup.testProp.envVar).toEqual('GROUP_INNER_GROUP_TEST_PROP')
		})

		describe('env-var prefix tests', () => {
			it('should prefix generated env-vars', () => {
				const config = createConfig(
					{
						testProp: param({ transformer: stringTransformer(), defaultValue: 'testPropValue' }),
					},
					{
						envPrefix: 'PREFIX',
					},
				)

				expect(config.getSchema().testProp.envVar).toEqual('PREFIX_TEST_PROP')
			})

			it('should not prefix existing env-vars if not configured', () => {
				const config = createConfig(
					{
						testProp: param({
							transformer: stringTransformer(),
							defaultValue: 'testPropValue',
							envVar: 'EXISTING_PROP',
						}),
					},
					{
						envPrefix: 'PREFIX',
					},
				)
				expect(config.getSchema().testProp.envVar).toEqual('EXISTING_PROP')
			})

			it('should prefix existing env-vars if configured', () => {
				const config = createConfig(
					{
						testProp: param({
							transformer: stringTransformer(),
							defaultValue: 'testPropValue',
							envVar: 'EXISTING_PROP',
						}),
					},
					{
						envPrefix: 'PREFIX',
						prefixExistingEnv: true,
					},
				)

				expect(config.getSchema().testProp.envVar).toEqual('PREFIX_EXISTING_PROP')
			})
		})
	})

	describe('environment override tests', () => {
		it('should use process.env as default env-source', () => {
			process.env.TEST_PROP = 'TestPropValueFromProcessEnv'
			const config = createConfig({
				testProp: param({ transformer: stringTransformer(), defaultValue: 'testPropValue' }),
			})

			expect(config.getProperties().testProp).toEqual('TestPropValueFromProcessEnv')
			delete process.env.TEST_PROP
		})

		it('env should be overrideable from config', () => {
			const config = createConfig(
				{
					testProp: param({ transformer: stringTransformer(), defaultValue: 'testPropValue' }),
				},
				{
					env: {
						// eslint-disable-next-line @typescript-eslint/naming-convention
						TEST_PROP: 'TestPropValueFromConfigEnv',
					},
				},
			)

			expect(config.getProperties().testProp).toEqual('TestPropValueFromConfigEnv')
		})
	})

	describe('property parse tests', () => {
		it('should parse single prop', () => {
			const config = createConfig(
				{
					testProp: param({ transformer: stringTransformer(), defaultValue: 'testPropValue' }),
				},
				{
					env: {
						// eslint-disable-next-line @typescript-eslint/naming-convention
						TEST_PROP: 'TestPropEnvValue',
					},
				},
			)

			expect(config.getProperties().testProp).toEqual('TestPropEnvValue')
		})

		it('should throw RangeError if required prop is null', () => {
			const config = createConfig({
				testProp: param({ transformer: stringTransformer(), defaultValue: null }),
			})

			expect(() => config.getProperties().testProp).toThrow(RangeError)
		})

		it('property should be null if optional', () => {
			const config = createConfig({
				testProp: param({ transformer: stringTransformer(), defaultValue: null, optional: true }),
			})

			expect(config.getProperties().testProp).toEqual(null)
		})
	})
})
