import { Properties } from './properties'
import { NoValue, Schema } from './schema'
import { IllegalNullValue, NotConvertable, SchemaError } from './schema.error'
import { Config } from './config'
import { isNormalizedSchemaObject, NormalizedConfigDefinition, NormalizeSchema } from './normalized-schema'
import { ConfigOptions } from './config-options'
import { normalizeSchema } from './create-config'
import { lazy } from './utils/lazy'
import { err, ok, Result } from 'neverthrow'
import assertNever from 'assert-never'
import { ConfigError } from './config.error'
import { ConfigHelperError } from './config-helper.error'
import { envVarLoader, fileEnvVarLoader, Loader } from './loader'
import { defaultLoader } from './loader/default.loader'

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
		const processNormalizedSchemaObject = <TProp>(
			obj: NormalizedConfigDefinition<TProp>,
			propertyPath: string[],
		): Result<TProp | null, ConfigHelperError> => {
			const potentialValueGenerators: Loader[] = [envVarLoader, fileEnvVarLoader, defaultLoader]

			const valueTransformer = (
				value: TProp | string | null | typeof NoValue,
			): Result<TProp | null | typeof NoValue, SchemaError> => {
				if (value === NoValue) {
					return ok(NoValue)
				}
				const transformedValue = obj.transformer(value)

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

			const propValue = potentialValueGenerators.reduce<Result<TProp | null | typeof NoValue, ConfigHelperError>>(
				(acc, currentValue) => {
					if ((acc.isOk() && acc.value !== NoValue) || acc.isErr()) {
						return acc
					}
					const rawValueResult = currentValue<TProp>(this.environment, obj, propertyPath)
					if (rawValueResult.isErr()) {
						return err(rawValueResult.error)
					}
					return valueTransformer(rawValueResult.value)
				},
				ok(NoValue),
			)

			if (propValue.isErr()) {
				return err(propValue.error)
			} else if (propValue.value === NoValue) {
				return obj.optional
					? ok(null)
					: err({
							errorType: IllegalNullValue,
							propertyPath: propertyPath,
							inputValue: NoValue,
					  } as SchemaError)
			} else if (propValue.value == null) {
				return obj.optional
					? ok(null)
					: err({
							errorType: IllegalNullValue,
							propertyPath: propertyPath,
							inputValue: null,
					  } as SchemaError)
			} else {
				return ok(propValue.value)
			}
		}

		return this._convertNormalizedSchemaToProps(this.schema, [], processNormalizedSchemaObject)
	}

	private _convertNormalizedSchemaToProps(
		currentObject: NormalizeSchema<TSchema>,
		currentPath: string[],
		schemaObjectConverter: <TProp>(
			obj: NormalizedConfigDefinition<TProp>,
			propertyPath: string[],
		) => Result<TProp | null, ConfigHelperError>,
	): Result<Properties<TSchema>, ConfigHelperError[]>

	private _convertNormalizedSchemaToProps<TProp>(
		currentObject: NormalizeSchema<TSchema> | NormalizedConfigDefinition<TProp>,
		currentPath: string[],
		schemaObjectConverter: (
			obj: NormalizedConfigDefinition<TProp>,
			propertyPath: string[],
		) => Result<TProp | null, ConfigHelperError>,
	): Result<Properties<TSchema> | TProp | null, ConfigHelperError[]>

	private _convertNormalizedSchemaToProps<TProp>(
		currentObject: NormalizeSchema<TSchema> | NormalizedConfigDefinition<TProp>,
		currentPath: string[],
		schemaObjectConverter: (
			obj: NormalizedConfigDefinition<TProp>,
			propertyPath: string[],
		) => Result<TProp | null, ConfigHelperError>,
	): Result<Properties<TSchema> | TProp | null, ConfigHelperError[]> {
		if (isNormalizedSchemaObject(currentObject)) {
			const processValue = schemaObjectConverter(currentObject, currentPath)
			if (processValue.isErr()) {
				return err([processValue.error])
			} else {
				return ok(processValue.value)
			}
		} else {
			const alteredObjects: Array<Result<NormalizeSchema<TSchema>, ConfigHelperError[]>> = Object.entries(
				currentObject,
			).map((entry) => {
				const [key, value] = entry
				if (typeof value === 'object' && value != null) {
					const iterateResult = this._convertNormalizedSchemaToProps<TProp>(
						value as NormalizeSchema<TSchema>,
						[...currentPath, key],
						schemaObjectConverter,
					)
					if (iterateResult.isErr()) {
						return err(iterateResult.error)
					} else {
						return ok({
							[key]: iterateResult.value,
						} as NormalizeSchema<TSchema>)
					}
				} else {
					return ok({
						[key]: value,
					} as NormalizeSchema<TSchema>)
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
