import {
	Config,
	ConfigOptions, isNormalizedSchemaObject, isSchemaObject,
	NormalizedSchema,
	NormalizedSchemaObj,
	normalizeSchema, normalizeSchemaObject,
	Schema,
	SchemaObj
} from "@nidomiro/config-helper";

export class ConfigDefaultImpl<T> implements Config<T> {

	public readonly schema: NormalizedSchema<T>
	public readonly environment: NodeJS.ProcessEnv

	private readonly originalSchema: Schema<T>

	constructor(
		schema: Schema<T>,
		private readonly opts?: ConfigOptions
	) {
		this.originalSchema = schema
		this.schema = normalizeSchema(this.originalSchema, this.opts)
		this.environment = opts?.env ?? process.env
	}


	getSchema(): NormalizedSchema<T> {
		return this.schema;
	}

	getProperties(): T {

		const processNormalizedSchemaObject = <K>(propName: string, obj: NormalizedSchemaObj<K>): K | null =>  {
			const envVarVal = this.environment[obj.env]

			const val = envVarVal ?? obj.default

			if(val == null) {
				if(obj.optional) {
					return null
				} else {
					throw new Error(`${propName} has to be defined`) // TODO: replace with better error, maybe Result and no throw => accumulate errors

				}
			} else {
				return obj.transformer(val)
			}

		}

		function iterate<K>(currentObject: NormalizedSchema<K> , currentPath: string[]): K
		function iterate<K>(currentObject: NormalizedSchema<K> | NormalizedSchemaObj<K>, currentPath: string[]): K {

			if(isNormalizedSchemaObject(currentObject)) {
				return processNormalizedSchemaObject(currentObject)
			} else {
				const alteredObjects: Array<NormalizedSchema<T>> = Object.entries(currentObject).map((entry) => {
					const [key, value] = entry;
					let newVal = value;
					if (typeof value === 'object' && value != null) {
						newVal = iterate(value as NormalizedSchema<T>, [...currentPath, key]);
					}
					return {
						[key]: newVal,
					} as NormalizedSchema<T>;
				});
				return Object.assign({}, ...alteredObjects);
			}
		}

		return iterate(this.schema, []);
	}

}
