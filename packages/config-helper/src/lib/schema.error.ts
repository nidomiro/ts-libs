export const NotConvertable: unique symbol = Symbol('NotConvertable')
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
