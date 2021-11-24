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

		it('property should be set from default-env-var', () => {
			const config = createConfig({
				testProp: param({ transformer: stringTransformer(), defaultValue: null }),
			}, {
				env: {
					'TEST_PROP': 'TestPropValueFromEnv'
				}
			})

			expect(config.getProperties().testProp).toEqual('TestPropValueFromEnv')
		})

		it('property should be set from default-env-var with prefix', () => {
			const config = createConfig({
				testProp: param({ transformer: stringTransformer(), defaultValue: null }),
			}, {
				env: {
					'MY_FANCY_PREFIX_ABC': 'TestPropValueFromEnv'
				},
				envPrefix: 'MY_FANCY_PREFIX',
			})

			expect(config.getProperties().testProp).toEqual('TestPropValueFromEnv')
		})

		it('property should be set from explicit Env-Var', () => {
			const config = createConfig({
				testProp: param({ transformer: stringTransformer(), envVar: 'ABC', defaultValue: null }),
			}, {
				env: {
					'ABC': 'TestPropValueFromEnv'
				}
			})

			expect(config.getProperties().testProp).toEqual('TestPropValueFromEnv')
		})

		it('property should be set from explicit Env-Var with prefix', () => {
			const config = createConfig({
				testProp: param({ transformer: stringTransformer(), envVar: 'ABC', defaultValue: null }),
			}, {
				env: {
					'MY_FANCY_PREFIX_ABC': 'TestPropValueFromEnv'
				},
				envPrefix: 'MY_FANCY_PREFIX',
				prefixExistingEnv: true
			})

			expect(config.getProperties().testProp).toEqual('TestPropValueFromEnv')
		})


		it('should be able to handle complex nested configs', () => {
			const config = createConfig(
				{
					testProp: param({ transformer: stringTransformer(), defaultValue: null }),
					testGroup: {
						testProp: param({ transformer: stringTransformer(), defaultValue: null }),
						testGroup: {
							testProp: param({ transformer: stringTransformer(), defaultValue: null }),
							testProp2: param({ transformer: stringTransformer(), defaultValue: null }),

						},
						testProp2: param({ transformer: stringTransformer(), defaultValue: null }),
					},
					testProp2: param({ transformer: stringTransformer(), defaultValue: null }),
				},
				{
					env: {
						// eslint-disable-next-line @typescript-eslint/naming-convention
						TEST_PROP: 'TestPropEnvValue',
						TEST_GROUP_TEST_PROP: 'TestGroupTestPropEnvValue',
						TEST_GROUP_TEST_GROUP_TEST_PROP: 'TestGroupTestGroupTestPropEnvValue',
						TEST_GROUP_TEST_GROUP_TEST_PROP2: 'TestGroupTestGroupTestProp2EnvValue',
						TEST_GROUP_TEST_PROP2: 'TestGroupTestProp2EnvValue',
						TEST_PROP2: 'TestProp2EnvValue',
					},
				},
			)

			expect(config.getProperties().testProp).toEqual('TestPropEnvValue')
			expect(config.getProperties().testGroup.testProp).toEqual('TestGroupTestPropEnvValue')
			expect(config.getProperties().testGroup.testGroup.testProp).toEqual('TestGroupTestGroupTestPropEnvValue')
			expect(config.getProperties().testGroup.testGroup.testProp2).toEqual('TestGroupTestGroupTestProp2EnvValue')
			expect(config.getProperties().testGroup.testProp2).toEqual('TestGroupTestProp2EnvValue')
			expect(config.getProperties().testProp2).toEqual('TestProp2EnvValue')
		})



	})
})
