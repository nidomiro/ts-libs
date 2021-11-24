import { Properties } from './properties'
import { NoDefaultValue, NoValue, Schema } from './schema'
import { Config } from './config'
import { isNormalizedSchemaObject, NormalizedConfigDefinition, NormalizeSchema } from './normalized-schema'
import { ConfigOptions } from './config-options'
import { normalizeSchema } from './create-config'
import { lazy } from './utils/lazy'
import { trimString } from './utils/string-util'

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

	getProperties(): Properties<TSchema> {
		return this._properties.value
	}

	private _calculateProperties(): Properties<TSchema> {
		const processNormalizedSchemaObject = <TProp>(
			propName: string,
			obj: NormalizedConfigDefinition<TProp>,
		): TProp | null => {
			const potentialValues: Array<TProp | string | null | typeof NoValue> = [
				this._getEnvVarValue(obj.envVar, obj.trimValue),
				obj.defaultValue === NoDefaultValue ? NoValue : obj.defaultValue,
			]

			const propValue = potentialValues.reduce((previousValue: TProp | null | typeof NoValue, currentValue) => {
				if (previousValue == NoValue) {
					if (currentValue == NoValue) {
						return currentValue
					} else {
						return obj.transformer(currentValue)
					}
				} else {
					return previousValue
				}
			}, NoValue)

			if ((propValue == null || propValue === NoValue) && !obj.optional) {
				throw new RangeError(`${propName} (envVar: ${obj.envVar}) has to be defined`) // TODO: replace with better error, maybe Result and no throw => accumulate errors
			}
			return propValue === NoValue ? null : propValue
		}

		function iterate(currentObject: NormalizeSchema<TSchema>, currentPath: string[]): Properties<TSchema>
		function iterate<TProp>(
			currentObject: NormalizeSchema<TSchema> | NormalizedConfigDefinition<TProp>,
			currentPath: string[],
		): Properties<TSchema> | TProp | null {
			if (isNormalizedSchemaObject(currentObject)) {
				const propPath: string = currentPath.join('.')
				return processNormalizedSchemaObject(propPath, currentObject)
			} else {
				const alteredObjects: Array<NormalizeSchema<TSchema>> = Object.entries(currentObject).map((entry) => {
					const [key, value] = entry
					let newVal = value
					if (typeof value === 'object' && value != null) {
						newVal = iterate(value as NormalizeSchema<TSchema>, [...currentPath, key])
					}
					return {
						[key]: newVal,
					} as NormalizeSchema<TSchema>
				})
				// eslint-disable-next-line @typescript-eslint/no-unsafe-return
				return Object.assign({}, ...alteredObjects)
			}
		}

		return iterate(this.schema, [])
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
}
