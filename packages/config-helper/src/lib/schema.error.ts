import { ConfigHelperError } from './config-helper.error'

export const NotConvertable: unique symbol = Symbol('NotConvertable')
export const RequiredButNull: unique symbol = Symbol('RequiredButNull')

export interface SchemaError extends ConfigHelperError {
	errorType: typeof NotConvertable | typeof RequiredButNull
	propertyPath: string[]
	inputValue: unknown
}
