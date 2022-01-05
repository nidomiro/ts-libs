import { ConfigHelperError } from './config-helper.error'

export const NotConvertable: unique symbol = Symbol('NotConvertable')
export const IllegalNullValue: unique symbol = Symbol('IllegalNullValue')

export interface SchemaError extends ConfigHelperError {
	errorType: typeof NotConvertable | typeof IllegalNullValue
	propertyPath: string[]
	inputValue: unknown
}
