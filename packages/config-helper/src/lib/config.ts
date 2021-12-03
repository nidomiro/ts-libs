import { NormalizeSchema } from './normalized-schema'
import { NotConvertable, Schema } from './schema'
import { Properties } from './properties'
import { Result } from 'neverthrow'

export const IllegalNullValue: unique symbol = Symbol('IllegalNullValue')

export interface SchemaError {
	errorType: typeof NotConvertable | typeof IllegalNullValue
	propertyPath: string[]
	inputValue: unknown
}

export function schemaErrorToString(error: SchemaError) {
	return `SchemaError: {"errorType": ${error.errorType.toString()}, "propertyPath": ${JSON.stringify(
		error.propertyPath,
	)},"inputValue": ${JSON.stringify(error.inputValue)}}`
}

export interface Config<TSchema extends Schema<unknown>> {
	getSchema: () => NormalizeSchema<TSchema>

	getProperties: () => Result<Properties<TSchema>, SchemaError[]>
}
