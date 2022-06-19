import { createConfig } from './create-config'
import { stringParam } from './params'
import { err } from 'neverthrow'
import { RequiredButNull, NotConvertable, SchemaError } from './schema.error'
import { NoValue } from './schema'
import { numberParam } from './params/number-param'
import { ConfigError } from './config.error'
import { envVarLoader, fileEnvVarLoader, FileNotFound, FilePermissionError } from './loader'
import { ConfigHelperError } from './config-helper.error'
import { defaultLoader } from './loader/default.loader'

describe('configHelper', () => {
	describe('schema tests', () => {
		it('should add env var to schema on first level', () => {
			const config = createConfig({
				testProp: stringParam({ defaultValue: 'testPropValue' }),
			})
			expect(config.getSchema().testProp.envVar).toEqual('TEST_PROP')
		})

		it('should keep existing env var definitions', () => {
			const config = createConfig({
				testProp: stringParam({
					defaultValue: 'testPropValue',
					envVar: 'TEST_ENV_VAR',
				}),
			})

			expect(config.getSchema().testProp.envVar).toEqual('TEST_ENV_VAR')
		})

		it('should add env var definitions to nested config', () => {
			const config = createConfig({
				group: {
					testProp: stringParam({ defaultValue: 'testPropValue' }),
					innerGroup: {
						testProp: stringParam({ defaultValue: 'testPropValue' }),
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
						testProp: stringParam({ defaultValue: 'testPropValue' }),
					},
					{
						envPrefix: 'PREFIX_',
					},
				)

				expect(config.getSchema().testProp.envVar).toEqual('PREFIX_TEST_PROP')
			})

			it('should not prefix existing env-vars if not configured', () => {
				const config = createConfig(
					{
						testProp: stringParam({
							defaultValue: 'testPropValue',
							envVar: 'EXISTING_PROP',
						}),
					},
					{
						envPrefix: 'PREFIX_',
					},
				)
				expect(config.getSchema().testProp.envVar).toEqual('EXISTING_PROP')
			})

			it('should prefix existing env-vars if configured', () => {
				const config = createConfig(
					{
						testProp: stringParam({
							defaultValue: 'testPropValue',
							envVar: 'EXISTING_PROP',
						}),
					},
					{
						envPrefix: 'PREFIX_',
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
				testProp: stringParam({ defaultValue: 'testPropValue' }),
			})

			const properties = config.getPropertiesOrThrow()

			expect(properties.testProp).toEqual('TestPropValueFromProcessEnv')
			delete process.env.TEST_PROP
		})

		it('env should be overrideable from config', () => {
			const config = createConfig(
				{
					testProp: stringParam({ defaultValue: 'testPropValue' }),
				},
				{
					env: {
						// eslint-disable-next-line @typescript-eslint/naming-convention
						TEST_PROP: 'TestPropValueFromConfigEnv',
					},
				},
			)
			const properties = config.getPropertiesOrThrow()

			expect(properties.testProp).toEqual('TestPropValueFromConfigEnv')
		})
	})

	describe('property env-var parse tests', () => {
		it('should return RequiredButNull SchemaError if required prop is null', () => {
			const config = createConfig({
				testProp: stringParam({ defaultValue: null }),
			})
			const propertiesResult = config.getProperties()

			expect(propertiesResult).toEqual(
				err([
					{
						errorType: RequiredButNull,
						propertyPath: ['testProp'],
						inputValue: null,
					} as SchemaError,
				]),
			)
		})

		it('should return RequiredButNull SchemaError for all required prop that are null', () => {
			const config = createConfig({
				testProp: stringParam({ defaultValue: null }),
				group: {
					testProp: stringParam({ defaultValue: null }),
				},
				testProp2: stringParam({ defaultValue: null }),
				testProp3: stringParam({ defaultValue: null, optional: true }),
			})
			const propertiesResult = config.getProperties()

			expect(propertiesResult).toEqual(
				err([
					{
						errorType: RequiredButNull,
						propertyPath: ['testProp'],
						inputValue: null,
					} as SchemaError,
					{
						errorType: RequiredButNull,
						propertyPath: ['group', 'testProp'],
						inputValue: null,
					} as SchemaError,
					{
						errorType: RequiredButNull,
						propertyPath: ['testProp2'],
						inputValue: null,
					} as SchemaError,
				]),
			)
		})

		it('should return SchemaError for all props with invalid data', () => {
			const config = createConfig(
				{
					testProp: numberParam({ defaultValue: null }),
					group: {
						testProp: numberParam({ defaultValue: null }),
					},
					testProp2: stringParam({ defaultValue: null }),
					testProp3: stringParam({ defaultValue: null, optional: true }),
				},
				{
					env: {
						TEST_PROP: 'abc',
						GROUP_TEST_PROP: 'abc',
					},
				},
			)
			const propertiesResult = config.getProperties()

			expect(propertiesResult).toEqual(
				err([
					{
						errorType: NotConvertable,
						propertyPath: ['testProp'],
						inputValue: 'abc',
					} as SchemaError,
					{
						errorType: NotConvertable,
						propertyPath: ['group', 'testProp'],
						inputValue: 'abc',
					} as SchemaError,
					{
						errorType: RequiredButNull,
						propertyPath: ['testProp2'],
						inputValue: null,
					} as SchemaError,
				]),
			)
		})

		it('property should be null if optional', () => {
			const config = createConfig({
				testProp: stringParam({ defaultValue: null, optional: true }),
			})
			const properties = config.getPropertiesOrThrow()

			expect(properties.testProp).toEqual(null)
		})

		it('property should be set from default-env-var', () => {
			const config = createConfig(
				{
					testProp: stringParam({ defaultValue: null }),
				},
				{
					env: {
						TEST_PROP: 'TestPropValueFromEnv',
					},
				},
			)
			const properties = config.getPropertiesOrThrow()

			expect(properties.testProp).toEqual('TestPropValueFromEnv')
		})

		it('property should be set from default-env-var with prefix', () => {
			const config = createConfig(
				{
					testProp: stringParam({ defaultValue: null }),
				},
				{
					env: {
						MY_FANCY_PREFIX_TEST_PROP: 'TestPropValueFromEnv',
					},
					envPrefix: 'MY_FANCY_PREFIX_',
				},
			)
			const properties = config.getPropertiesOrThrow()

			expect(properties.testProp).toEqual('TestPropValueFromEnv')
		})

		it('property should be set from explicit Env-Var', () => {
			const config = createConfig(
				{
					testProp: stringParam({ envVar: 'ABC', defaultValue: null }),
				},
				{
					env: {
						ABC: 'TestPropValueFromEnv',
					},
				},
			)
			const properties = config.getPropertiesOrThrow()

			expect(properties.testProp).toEqual('TestPropValueFromEnv')
		})

		it('property should be set from explicit Env-Var with prefix', () => {
			const config = createConfig(
				{
					testProp: stringParam({ envVar: 'ABC', defaultValue: null }),
				},
				{
					env: {
						MY_FANCY_PREFIX_ABC: 'TestPropValueFromEnv',
					},
					envPrefix: 'MY_FANCY_PREFIX_',
					prefixExistingEnv: true,
				},
			)
			const properties = config.getPropertiesOrThrow()

			expect(properties.testProp).toEqual('TestPropValueFromEnv')
		})

		it('should be able to handle complex nested configs', () => {
			const config = createConfig(
				{
					testProp: stringParam({ defaultValue: null }),
					testGroup: {
						testProp: stringParam({ defaultValue: null }),
						testGroup: {
							testProp: stringParam({ defaultValue: null }),
							testProp2: stringParam({ defaultValue: null }),
						},
						testProp2: stringParam({ defaultValue: null }),
					},
					testProp2: stringParam({ defaultValue: null }),
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

			const properties = config.getPropertiesOrThrow()

			expect(properties.testProp).toEqual('TestPropEnvValue')
			expect(properties.testGroup.testProp).toEqual('TestGroupTestPropEnvValue')
			expect(properties.testGroup.testGroup.testProp).toEqual('TestGroupTestGroupTestPropEnvValue')
			expect(properties.testGroup.testGroup.testProp2).toEqual('TestGroupTestGroupTestProp2EnvValue')
			expect(properties.testGroup.testProp2).toEqual('TestGroupTestProp2EnvValue')
			expect(properties.testProp2).toEqual('TestProp2EnvValue')
		})

		it('property should set every property referencing the same env-var', () => {
			const config = createConfig(
				{
					testProp: stringParam({ envVar: 'ABC', defaultValue: null }),
					testProp2: stringParam({ envVar: 'ABC', defaultValue: null }),
					testProp3: stringParam({ envVar: 'ABC', defaultValue: null }),
				},
				{
					env: {
						ABC: 'TestPropValueFromEnv',
					},
				},
			)
			const properties = config.getPropertiesOrThrow()

			expect(properties.testProp).toEqual('TestPropValueFromEnv')
			expect(properties.testProp2).toEqual('TestPropValueFromEnv')
			expect(properties.testProp3).toEqual('TestPropValueFromEnv')
		})
	})

	describe('property trim tests', () => {
		it.each([
			[` \tabc \t`, true, `abc`],
			[` \tabc \t`, 'start' as const, `abc \t`],
			[` \tabc \t`, 'end' as const, ` \tabc`],
			[` \tabc \t`, false, ` \tabc \t`],
			[` \t`, true, null],
		])(
			`for value '%s' and trimValue '%s' property should be '%s'`,
			(envVal: string, trimValue: boolean | 'start' | 'end', expected: string | null) => {
				const config = createConfig(
					{
						testProp: stringParam({ defaultValue: null, optional: true, trimValue: trimValue }),
					},
					{
						env: {
							TEST_PROP: envVal,
						},
					},
				)
				const properties = config.getPropertiesOrThrow()

				expect(properties.testProp).toEqual(expected)
			},
		)

		it(`should trim nothing of property if trim is not set`, () => {
			const config = createConfig(
				{
					testProp: stringParam({ defaultValue: null }),
				},
				{
					env: {
						TEST_PROP: ' \tabc \t',
					},
				},
			)
			const properties = config.getPropertiesOrThrow()

			expect(properties.testProp).toEqual(' \tabc \t')
		})
	})

	describe('getPropertyOrThrow', () => {
		it(`should throw if an error occurred`, () => {
			const config = createConfig({
				testProp: stringParam({ defaultValue: null, optional: false }),
			})

			expect(() => config.getPropertiesOrThrow()).toThrow(ConfigError)
			try {
				config.getPropertiesOrThrow()
				fail()
			} catch (configError) {
				if (configError instanceof ConfigError) {
					expect(configError.errors).toEqual([
						{ errorType: RequiredButNull, propertyPath: ['testProp'], inputValue: null },
					])
				} else {
					fail()
				}
			}
		})
	})

	describe('property _FILE-env-var tests', () => {
		it('should parse the path given by the *_FILE env-var', () => {
			const config = createConfig(
				{
					testProp: stringParam({ defaultValue: null }),
				},
				{
					env: {
						TEST_PROP_FILE: `${__dirname}/test-files/test-prop-file.env-file`,
					},
				},
			)
			const propertiesResult = config.getPropertiesOrThrow()
			expect(propertiesResult.testProp).toEqual('testPropContentFromFile')
		})

		it('should return FileNotFound if file does not exist', () => {
			const config = createConfig(
				{
					testProp: stringParam({ defaultValue: null }),
				},
				{
					env: {
						TEST_PROP_FILE: `${__dirname}/test-files/test-prop-file-not-existent`,
					},
				},
			)
			const propertiesResult = config.getProperties()
			expect(propertiesResult).toEqual(
				err([
					{
						errorType: FileNotFound,
						propertyPath: ['testProp'],
						filePath: `${__dirname}/test-files/test-prop-file-not-existent`,
						cause: new (class extends Error {
							code = 'ENOENT'
							errno = -2
							path = `${__dirname}/test-files/test-prop-file-not-existent`
							syscall = 'open'
						})(),
					},
				] as ConfigHelperError[]),
			)
		})

		it.skip('should return FilePermissionError if file is not accessible due to permissions', () => {
			// TODO: find a way to test this properly #38
			const config = createConfig(
				{
					testProp: stringParam({ defaultValue: null }),
				},
				{
					env: {
						TEST_PROP_FILE: `${__dirname}/test-files/test-prop-file-wrong-permissions`,
					},
				},
			)
			const propertiesResult = config.getProperties()
			expect(propertiesResult).toEqual(
				err([
					{
						errorType: FilePermissionError,
						propertyPath: ['testProp'],
						filePath: `${__dirname}/test-files/test-prop-file-wrong-permissions`,
						cause: new (class extends Error {
							code = 'ENOENT'
							errno = -2
							path = `${__dirname}/test-files/test-prop-file-wrong-permissions`
							syscall = 'open'
						})(),
					},
				] as ConfigHelperError[]),
			)
		})
	})

	describe('property altEnvVar tests', () => {
		it('should parse the autogenerated Env-Var', () => {
			const config = createConfig(
				{
					testProp: stringParam({ defaultValue: null, altEnvVars: ['TestProp2'] }),
				},
				{
					env: {
						TEST_PROP: `MyValue`,
					},
				},
			)
			const propertiesResult = config.getPropertiesOrThrow()
			expect(propertiesResult.testProp).toEqual('MyValue')
		})

		it('should parse use the altEnvVar if autogenerated Env-Var does not exist', () => {
			const config = createConfig(
				{
					testProp: stringParam({ defaultValue: null, altEnvVars: ['TEST_PROP2'] }),
				},
				{
					env: {
						TEST_PROP2: `MyValue`,
					},
				},
			)
			const propertiesResult = config.getPropertiesOrThrow()
			expect(propertiesResult.testProp).toEqual('MyValue')
		})

		it.each([
			[['TEST_PROP2'], { TEST_PROP2: `MyValue2` }, 'MyValue2'],
			[['TEST_PROP2', 'TEST_PROP1'], { TEST_PROP2: `MyValue2` }, 'MyValue2'],
			[['TEST_PROP2', 'TEST_PROP1'], { TEST_PROP1: `MyValue1`, TEST_PROP2: `MyValue2` }, 'MyValue2'],
			[
				['TEST_PROP2', 'TEST_PROP1'],
				{ TEST_PROP: `MyValue`, TEST_PROP1: `MyValue1`, TEST_PROP2: `MyValue2` },
				'MyValue',
			],
		])(`for altEnvVars '%s' and env '%s' prop value should be '%s'`, (altEnvVars, env, expectedValue) => {
			const config = createConfig(
				{
					testProp: stringParam({ defaultValue: null, altEnvVars: altEnvVars }),
				},
				{
					env,
				},
			)
			const propertiesResult = config.getPropertiesOrThrow()
			expect(propertiesResult.testProp).toEqual(expectedValue)
		})
	})

	describe('property _FILE-alt-env-var tests', () => {
		it('should parse the path given by the *_FILE env-var', () => {
			const config = createConfig(
				{
					testProp: stringParam({ defaultValue: null, altEnvVars: ['TEST'] }),
				},
				{
					env: {
						TEST_PROP_FILE: `${__dirname}/test-files/test-prop-file.env-file`,
					},
				},
			)
			const propertiesResult = config.getPropertiesOrThrow()
			expect(propertiesResult.testProp).toEqual('testPropContentFromFile')
		})

		it('should return FileNotFound if file does not exist, even if altEnvVars exist', () => {
			const config = createConfig(
				{
					testProp: stringParam({ defaultValue: null, altEnvVars: ['TEST'] }),
				},
				{
					env: {
						TEST_PROP_FILE: `${__dirname}/test-files/test-prop-file-not-existent`,
						TEST_FILE: `${__dirname}/test-files/test-prop-file.env-file`,
					},
				},
			)
			const propertiesResult = config.getProperties()
			expect(propertiesResult).toEqual(
				err([
					{
						errorType: FileNotFound,
						propertyPath: ['testProp'],
						filePath: `${__dirname}/test-files/test-prop-file-not-existent`,
						cause: new (class extends Error {
							code = 'ENOENT'
							errno = -2
							path = `${__dirname}/test-files/test-prop-file-not-existent`
							syscall = 'open'
						})(),
					},
				] as ConfigHelperError[]),
			)
		})

		it('should parse the path given by the *_FILE inside altEnvVars if envVar does not exist', () => {
			const config = createConfig(
				{
					testProp: stringParam({ defaultValue: null, altEnvVars: ['TEST'] }),
				},
				{
					env: {
						TEST_FILE: `${__dirname}/test-files/test-prop-file.env-file`,
					},
				},
			)
			const propertiesResult = config.getPropertiesOrThrow()
			expect(propertiesResult.testProp).toEqual('testPropContentFromFile')
		})
	})

	describe('provided valueLoaders tests', () => {
		it.each([
			[undefined, 'TestPropFromEnv'],
			[[envVarLoader], 'TestPropFromEnv'],
			[[fileEnvVarLoader], 'testPropContentFromFile'],
			[[defaultLoader], 'DefaultValue'],
			[[defaultLoader, envVarLoader], 'DefaultValue'],
			[[defaultLoader, fileEnvVarLoader, envVarLoader], 'DefaultValue'],
		])(`using '%s' as valueLoaders should result in '%s'`, (valueLoaders, result) => {
			const config = createConfig(
				{
					testProp: stringParam({ defaultValue: 'DefaultValue' }),
				},
				{
					env: {
						TEST_PROP: `TestPropFromEnv`,
						TEST_PROP_FILE: `${__dirname}/test-files/test-prop-file.env-file`,
					},
					valueLoaders,
				},
			)

			const propertiesResult = config.getPropertiesOrThrow()
			expect(propertiesResult.testProp).toEqual(result)
		})

		it(`using '[]' as valueLoaders should result in 'RequiredButNull'-Error for required props`, () => {
			const config = createConfig(
				{
					testProp: stringParam({ defaultValue: 'DefaultValue' }),
				},
				{
					env: {
						TEST_PROP: `TestPropFromEnv`,
						TEST_PROP_FILE: `${__dirname}/test-files/test-prop-file.env-file`,
					},
					valueLoaders: [],
				},
			)

			const propertiesResult = config.getProperties()

			if (propertiesResult.isErr()) {
				expect(propertiesResult.error).toEqual([
					{ errorType: RequiredButNull, propertyPath: ['testProp'], inputValue: NoValue },
				])
			} else {
				throw new Error(`Expected error, but got: ${JSON.stringify(propertiesResult)}`) // workaround for https://github.com/facebook/jest/issues/11698
			}
		})

		it(`using '[]' as valueLoaders should result in 'null' for optional props`, () => {
			const config = createConfig(
				{
					testProp: stringParam({ defaultValue: 'DefaultValue', optional: true }),
				},
				{
					env: {
						TEST_PROP: `TestPropFromEnv`,
						TEST_PROP_FILE: `${__dirname}/test-files/test-prop-file.env-file`,
					},
					valueLoaders: [],
				},
			)

			const propertiesResult = config.getPropertiesOrThrow()
			expect(propertiesResult.testProp).toBeNull()
		})
	})
})
