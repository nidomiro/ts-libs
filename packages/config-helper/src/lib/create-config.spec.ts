import { createConfig } from './create-config'
import { stringParam } from './params'
import { err } from 'neverthrow'
import { IllegalNullValue, NotConvertable, SchemaError, schemaErrorToString } from './schema.error'
import { numberParam } from './params/number-param'
import { ConfigError } from '@nidomiro/config-helper'

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
						envPrefix: 'PREFIX',
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
						envPrefix: 'PREFIX',
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
				testProp: stringParam({ defaultValue: 'testPropValue' }),
			})

			const propertiesResult = config.getProperties()

			if (propertiesResult.isErr()) {
				throw new Error(`Errors occurred: ${propertiesResult.error.map(schemaErrorToString).toString()}`)
			}
			const properties = propertiesResult.value

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
			const propertiesResult = config.getProperties()

			if (propertiesResult.isErr()) {
				throw new Error(`Errors occurred: ${propertiesResult.error.map(schemaErrorToString).toString()}`)
			}
			const properties = propertiesResult.value

			expect(properties.testProp).toEqual('TestPropValueFromConfigEnv')
		})
	})

	describe('property env-var parse tests', () => {
		it('should return IllegalNullValue SchemaError if required prop is null', () => {
			const config = createConfig({
				testProp: stringParam({ defaultValue: null }),
			})
			const propertiesResult = config.getProperties()

			expect(propertiesResult).toEqual(
				err([
					{
						errorType: IllegalNullValue,
						propertyPath: ['testProp'],
						inputValue: null,
					} as SchemaError,
				]),
			)
		})

		it('should return IllegalNullValue SchemaError for all required prop that are null', () => {
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
						errorType: IllegalNullValue,
						propertyPath: ['testProp'],
						inputValue: null,
					} as SchemaError,
					{
						errorType: IllegalNullValue,
						propertyPath: ['group', 'testProp'],
						inputValue: null,
					} as SchemaError,
					{
						errorType: IllegalNullValue,
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
						errorType: IllegalNullValue,
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
			const propertiesResult = config.getProperties()

			if (propertiesResult.isErr()) {
				throw new Error(`Errors occurred: ${propertiesResult.error.map(schemaErrorToString).toString()}`)
			}
			const properties = propertiesResult.value

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
			const propertiesResult = config.getProperties()

			if (propertiesResult.isErr()) {
				throw new Error(`Errors occurred: ${propertiesResult.error.map(schemaErrorToString).toString()}`)
			}
			const properties = propertiesResult.value

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
					envPrefix: 'MY_FANCY_PREFIX',
				},
			)
			const propertiesResult = config.getProperties()

			if (propertiesResult.isErr()) {
				throw new Error(`Errors occurred: ${propertiesResult.error.map(schemaErrorToString).toString()}`)
			}
			const properties = propertiesResult.value

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
			const propertiesResult = config.getProperties()

			if (propertiesResult.isErr()) {
				throw new Error(`Errors occurred: ${propertiesResult.error.map(schemaErrorToString).toString()}`)
			}
			const properties = propertiesResult.value

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
					envPrefix: 'MY_FANCY_PREFIX',
					prefixExistingEnv: true,
				},
			)
			const propertiesResult = config.getProperties()

			if (propertiesResult.isErr()) {
				throw new Error(`Errors occurred: ${propertiesResult.error.map(schemaErrorToString).toString()}`)
			}
			const properties = propertiesResult.value

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

			const propertiesResult = config.getProperties()

			if (propertiesResult.isErr()) {
				throw new Error(`Errors occurred: ${propertiesResult.error.map(schemaErrorToString).toString()}`)
			}
			const properties = propertiesResult.value

			expect(properties.testProp).toEqual('TestPropEnvValue')
			expect(properties.testGroup.testProp).toEqual('TestGroupTestPropEnvValue')
			expect(properties.testGroup.testGroup.testProp).toEqual('TestGroupTestGroupTestPropEnvValue')
			expect(properties.testGroup.testGroup.testProp2).toEqual('TestGroupTestGroupTestProp2EnvValue')
			expect(properties.testGroup.testProp2).toEqual('TestGroupTestProp2EnvValue')
			expect(properties.testProp2).toEqual('TestProp2EnvValue')
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
				const propertiesResult = config.getProperties()

				if (propertiesResult.isErr()) {
					throw new Error(`Errors occurred: ${propertiesResult.error.map(schemaErrorToString).toString()}`)
				}
				const properties = propertiesResult.value

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
			const propertiesResult = config.getProperties()

			if (propertiesResult.isErr()) {
				throw new Error(`Errors occurred: ${propertiesResult.error.map(schemaErrorToString).toString()}`)
			}
			const properties = propertiesResult.value

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
						{ errorType: IllegalNullValue, propertyPath: ['testProp'], inputValue: null },
					])
				} else {
					fail()
				}
			}
		})
	})
})
