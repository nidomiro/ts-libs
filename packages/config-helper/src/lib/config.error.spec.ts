import { ConfigError } from './config.error'
import { IllegalNullValue, NotConvertable } from './schema.error'

describe(`ConfigError`, () => {
	describe(`toString`, () => {
		it(`should print empty errors Array`, () => {
			const error = new ConfigError([])

			expect(error.toString()).toEqual(`ConfigError: {"errors": []}`)
		})

		it(`should print errors`, () => {
			const error = new ConfigError([
				{
					errorType: NotConvertable,
					propertyPath: ['testProp'],
					inputValue: 'abc',
				},
				{
					errorType: IllegalNullValue,
					propertyPath: ['anotherProp'],
					inputValue: null,
				},
			])

			expect(error.toString()).toEqual(
				`ConfigError: {"errors": [\n` +
					`\t{"errorType":"Symbol(NotConvertable)","propertyPath":["testProp"],"inputValue":"abc"},\n` +
					`\t{"errorType":"Symbol(IllegalNullValue)","propertyPath":["anotherProp"],"inputValue":null},\n` +
					`]}`,
			)
		})
	})
})
