import { NotConvertable, IllegalNullValue, schemaErrorToString } from './schema.error'

describe(`SchemaError`, () => {
	describe(`schemaErrorToString`, () => {
		it(`should print null input value correctly`, () => {
			const result = schemaErrorToString({
				errorType: IllegalNullValue,
				propertyPath: ['testProp'],
				inputValue: null,
			})
			expect(result).toEqual(
				`SchemaError: {"errorType": Symbol(IllegalNullValue), "propertyPath": ["testProp"],"inputValue": null}`,
			)
		})

		it(`should print string input value correctly`, () => {
			const result = schemaErrorToString({
				errorType: NotConvertable,
				propertyPath: ['testProp'],
				inputValue: 'abc',
			})
			expect(result).toEqual(
				`SchemaError: {"errorType": Symbol(NotConvertable), "propertyPath": ["testProp"],"inputValue": "abc"}`,
			)
		})

		it(`should print number input value correctly`, () => {
			const result = schemaErrorToString({
				errorType: NotConvertable,
				propertyPath: ['testProp'],
				inputValue: 2,
			})
			expect(result).toEqual(
				`SchemaError: {"errorType": Symbol(NotConvertable), "propertyPath": ["testProp"],"inputValue": 2}`,
			)
		})

		it(`should print array input value correctly`, () => {
			const result = schemaErrorToString({
				errorType: NotConvertable,
				propertyPath: ['testProp'],
				inputValue: ['abc'],
			})
			expect(result).toEqual(
				`SchemaError: {"errorType": Symbol(NotConvertable), "propertyPath": ["testProp"],"inputValue": ["abc"]}`,
			)
		})
	})
})
