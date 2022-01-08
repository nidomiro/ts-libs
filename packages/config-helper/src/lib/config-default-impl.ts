import { Properties } from './properties'
import { ConfigValueTransformer, NoValue, Schema } from './schema'
import { IllegalNullValue, NotConvertable, SchemaError } from './schema.error'
import { Config } from './config'
import { isNormalizedSchemaObject, NormalizedConfigDefinition, NormalizeSchema } from './normalized-schema'
import { ConfigOptions } from './config-options'
import { lazy } from './utils/lazy'
import { err, ok, Result } from 'neverthrow'
import assertNever from 'assert-never'
import { ConfigError } from './config.error'
import { ConfigHelperError } from './config-helper.error'
import { envVarLoader, fileEnvVarLoader, Loader } from './loader'
import { defaultLoader } from './loader/default.loader'
import { normalizeSchema } from './schema-normalizer'

function executeValueTransformer<TProp>(
	value: TProp | string | null | typeof NoValue,
	transformer: ConfigValueTransformer<TProp>,
	propertyPath: string[],
): Result<TProp | null | typeof NoValue, SchemaError> {
	if (value === NoValue) {
		return ok(NoValue)
	}
	const transformedValue = transformer(value)

	if (transformedValue.isErr()) {
		if (transformedValue.error === NotConvertable) {
			return err({
				errorType: NotConvertable,
				propertyPath,
				inputValue: value,
			} as SchemaError)
		} else {
			assertNever(transformedValue.error)
		}
	} else {
		return ok(transformedValue.value)
	}
}

function resolvePropValue<TProp>(
	valueLoaders: Loader[],
	configDefinition: NormalizedConfigDefinition<TProp>,
	propertyPath: string[],
	environment: NodeJS.ProcessEnv,
) {
	return valueLoaders.reduce<Result<TProp | null | typeof NoValue, ConfigHelperError>>((acc, valueLoader) => {
		if ((acc.isOk() && acc.value !== NoValue) || acc.isErr()) {
			return acc
		}
		const rawValueResult = valueLoader<TProp>(environment, configDefinition, propertyPath)
		if (rawValueResult.isErr()) {
			return err(rawValueResult.error)
		}
		return executeValueTransformer(rawValueResult.value, configDefinition.transformer, propertyPath)
	}, ok(NoValue))
}

function convertSchemaObjectToProperty<TProp>(
	configDefinition: NormalizedConfigDefinition<TProp>,
	propertyPath: string[],
	environment: NodeJS.ProcessEnv,
): Result<TProp | null, ConfigHelperError> {
	const valueLoaders: Loader[] = [envVarLoader, fileEnvVarLoader, defaultLoader]

	const propValue = resolvePropValue(valueLoaders, configDefinition, propertyPath, environment)

	return propValue.match<Result<TProp | null, ConfigHelperError>>((value) => {
		if (!(value === NoValue || value == null)) {
			return ok(value)
		} else if (configDefinition.optional) {
			return ok(null)
		} else {
			return err({
				errorType: IllegalNullValue,
				propertyPath: propertyPath,
				inputValue: value,
			} as SchemaError)
		}
	}, err)
}

export class ConfigDefaultImpl<TSchema extends Schema<unknown>> implements Config<TSchema> {
	public readonly schema: NormalizeSchema<TSchema>

	public get environment(): NodeJS.ProcessEnv {
		return this._environment
	}

	private _environment: NodeJS.ProcessEnv

	private readonly _originalSchema: TSchema

	private readonly _properties = lazy(() => this._calculateProperties())

	constructor(schema: TSchema, private readonly _opts?: ConfigOptions) {
		this._originalSchema = schema
		this.schema = normalizeSchema(this._originalSchema, this._opts)
		this._environment = _opts?.env ?? process.env
	}

	setEnvironment(newEnv: NodeJS.ProcessEnv): void {
		this._environment = newEnv
		this._properties.reset()
	}

	getSchema(): NormalizeSchema<TSchema> {
		return this.schema
	}

	getProperties(): Result<Properties<TSchema>, ConfigHelperError[]> {
		return this._properties.value
	}

	getPropertiesOrThrow(): Properties<TSchema> {
		const properties = this.getProperties()
		if (properties.isErr()) {
			throw new ConfigError(properties.error)
		}
		return properties.value
	}

	private _calculateProperties(): Result<Properties<TSchema>, ConfigHelperError[]> {
		return this._convertNormalizedSchemaToProps(this.schema, [], convertSchemaObjectToProperty)
	}

	private _convertNormalizedSchemaToProps(
		currentObject: NormalizeSchema<TSchema>,
		currentPath: string[],
		schemaObjectToPropertyConverter: <TProp>(
			obj: NormalizedConfigDefinition<TProp>,
			propertyPath: string[],
			environment: NodeJS.ProcessEnv,
		) => Result<TProp | null, ConfigHelperError>,
	): Result<Properties<TSchema>, ConfigHelperError[]>

	private _convertNormalizedSchemaToProps<TProp>(
		currentObject: NormalizeSchema<TSchema> | NormalizedConfigDefinition<TProp>,
		currentPath: string[],
		schemaObjectToPropertyConverter: (
			obj: NormalizedConfigDefinition<TProp>,
			propertyPath: string[],
			environment: NodeJS.ProcessEnv,
		) => Result<TProp | null, ConfigHelperError>,
	): Result<Properties<TSchema> | TProp | null, ConfigHelperError[]>

	private _convertNormalizedSchemaToProps<TProp>(
		currentObject: NormalizeSchema<TSchema> | NormalizedConfigDefinition<TProp>,
		currentPath: string[],
		schemaObjectToPropertyConverter: (
			obj: NormalizedConfigDefinition<TProp>,
			propertyPath: string[],
			environment: NodeJS.ProcessEnv,
		) => Result<TProp | null, ConfigHelperError>,
	): Result<Properties<TSchema> | TProp | null, ConfigHelperError[]> {
		if (isNormalizedSchemaObject(currentObject)) {
			const propertyConversionResult = schemaObjectToPropertyConverter(
				currentObject,
				currentPath,
				this.environment,
			)

			return propertyConversionResult.match<Result<TProp | null, ConfigHelperError[]>>(ok, (error) =>
				err([error]),
			)
		} else {
			const alteredObjects: Array<Result<Properties<TSchema>, ConfigHelperError[]>> = Object.entries(
				currentObject,
			).map(([key, value]) => {
				if (typeof value === 'object' && value != null) {
					const iterateResult = this._convertNormalizedSchemaToProps<TProp>(
						value as NormalizeSchema<TSchema>,
						[...currentPath, key],
						schemaObjectToPropertyConverter,
					)

					return iterateResult.match<Result<Properties<TSchema>, ConfigHelperError[]>>(
						(val) =>
							ok({
								[key]: val,
							} as Properties<TSchema>),
						err,
					)
				} else {
					return ok({
						[key]: value,
					} as Properties<TSchema>)
				}
			})
			const errors = alteredObjects.flatMap((x) => (x.isErr() ? x.error : []))

			if (errors.length > 0) {
				return err(errors)
			} else {
				const props = alteredObjects.flatMap((x) => (x.isOk() ? [x.value] : []))
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				return ok(Object.assign({}, ...props))
			}
		}
	}
}
