import { configHelperErrorToString } from './config-helper.error'

describe(`ConfigHelperError`, () => {
	describe(`configHelperErrorToString`, () => {
		it(`should print values correctly`, () => {
			const result = configHelperErrorToString({
				errorType: Symbol('TestSymbol'),
				propertyPath: ['testProp'],
				inputValue: null,
			})
			expect(result).toEqual(`{"errorType":"Symbol(TestSymbol)","propertyPath":["testProp"],"inputValue":null}`)
		})
	})
})
