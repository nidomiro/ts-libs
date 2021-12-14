import { Properties } from './properties'
import { NoValue, Schema } from './schema'
import { NotConvertable, IllegalNullValue, SchemaError } from './schema.error'
import { Config } from './config'
import { isNormalizedSchemaObject, NormalizedConfigDefinition, NormalizeSchema } from './normalized-schema'
import { ConfigOptions } from './config-options'
import { normalizeSchema } from './create-config'
import { lazy } from './utils/lazy'
import { trimString } from './utils/string-util'
import { err, ok, Result } from 'neverthrow'
import assertNever from 'assert-never'
import { ConfigError } from './config.error'

export class ConfigDefaultImpl<TSchema extends Schema<unknown>> implements Config<TSchema> {
	public readonly schema: NormalizeSchema<TSchema>
	public readonly environment: NodeJS.ProcessEnv

	private readonly _originalSchema: TSchema

	private readonly _properties = lazy(() => this._calculateProperties())

	constructor(schema: TSchema, private readonly _opts?: ConfigOptions) {
		this._originalSchema = schema
		this.schema = normalizeSchema(this._originalSchema, this._opts)
		this.environment = _opts?.env ?? process.env
	}

	getSchema(): NormalizeSchema<TSchema> {
		return this.schema
	}

	getProperties(): Result<Properties<TSchema>, SchemaError[]> {
		return this._properties.value
	}
	getPropertiesOrThrow(): Properties<TSchema> {
		const properties = this.getProperties()
		if (properties.isErr()) {
			throw new ConfigError(properties.error)
		}
		return properties.value
	}

	private _calculateProperties(): Result<Properties<TSchema>, SchemaError[]> {
		const processNormalizedSchemaObject = <TProp>(
			obj: NormalizedConfigDefinition<TProp>,
			propertyPath: string[],
		): Result<TProp | null, SchemaError> => {
			const potentialValues: Array<TProp | string | null | typeof NoValue> = [
				this._getEnvVarValue(obj.envVar, obj.trimValue),
				obj.defaultValue,
			]

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

			const transformedPotentialValues = potentialValues.map(valueTransformer)

			const propValue =
				transformedPotentialValues.find(
					(value) => (value.isOk() && value.value !== NoValue) || value.isErr(),
				) ?? ok(NoValue)

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

	private _getEnvVarValue(key: string, trim: boolean | 'start' | 'end'): string | typeof NoValue {
		const value = this.environment[key]
		if (value == null) {
			return NoValue
		} else {
			const trimmedValue = trimString(value, trim)
			if (trimmedValue.length === 0) {
				return NoValue
			} else {
				return trimmedValue
			}
		}
	}

	private _convertNormalizedSchemaToProps(
		currentObject: NormalizeSchema<TSchema>,
		currentPath: string[],
		schemaObjectConverter: <TProp>(
			obj: NormalizedConfigDefinition<TProp>,
			propertyPath: string[],
		) => Result<TProp | null, SchemaError>,
	): Result<Properties<TSchema>, SchemaError[]>

	private _convertNormalizedSchemaToProps<TProp>(
		currentObject: NormalizeSchema<TSchema> | NormalizedConfigDefinition<TProp>,
		currentPath: string[],
		schemaObjectConverter: (
			obj: NormalizedConfigDefinition<TProp>,
			propertyPath: string[],
		) => Result<TProp | null, SchemaError>,
	): Result<Properties<TSchema> | TProp | null, SchemaError[]>

	private _convertNormalizedSchemaToProps<TProp>(
		currentObject: NormalizeSchema<TSchema> | NormalizedConfigDefinition<TProp>,
		currentPath: string[],
		schemaObjectConverter: (
			obj: NormalizedConfigDefinition<TProp>,
			propertyPath: string[],
		) => Result<TProp | null, SchemaError>,
	): Result<Properties<TSchema> | TProp | null, SchemaError[]> {
		if (isNormalizedSchemaObject(currentObject)) {
			const processValue = schemaObjectConverter(currentObject, currentPath)
			if (processValue.isErr()) {
				return err([processValue.error])
			} else {
				return ok(processValue.value)
			}
		} else {
			const alteredObjects: Array<Result<NormalizeSchema<TSchema>, SchemaError[]>> = Object.entries(
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
			const errors = alteredObjects.reduce<SchemaError[]>((acc, x) => acc.concat(x.isErr() ? x.error : []), []) // simulating flatmap
			if (errors.length > 0) {
				return err(errors)
			} else {
				// prettier-ignore
				const props = alteredObjects.reduce<Array<NormalizeSchema<TSchema>>>((acc, x) => acc.concat(x.isOk() ? [x.value] : []), [],) // simulating flatmap
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				return ok(Object.assign({}, ...props))
			}
		}
	}
}
