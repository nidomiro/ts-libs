import { regexParam } from './regex-param'
import { ConfigValueTransformer } from '../schema'
import { regexTransformer } from './regex-transformer'

function checkRegexTransformerCompatibility(
	transformer: ConfigValueTransformer<string>,
	regex: RegExp,
	val: unknown,
): void {
	expect(transformer(val)).toEqual(regexTransformer(regex)(val))
}

describe('regex-param', () => {
	it('should construct param with all mentioned explicit options', () => {
		const regex = /\d+/

		const param = regexParam({ defaultValue: null, regex, optional: true, trimValue: 'start', envVar: 'ABC' })

		expect(param).toMatchObject({
			defaultValue: null,
			trimValue: 'start',
			envVar: 'ABC',
			optional: true,
		})

		checkRegexTransformerCompatibility(param.transformer, regex, 'str')
		checkRegexTransformerCompatibility(param.transformer, regex, '0')
		checkRegexTransformerCompatibility(param.transformer, regex, null)
	})

	it('should construct param with all mentioned explicit options', () => {
		const regex = /\d+/

		const param = regexParam({ defaultValue: null, regex })

		expect(param).toMatchObject({
			defaultValue: null,
			optional: false,
		})
		expect(param).not.toHaveProperty('trimValue')
		expect(param).not.toHaveProperty('envVar')

		checkRegexTransformerCompatibility(param.transformer, regex, 'str')
		checkRegexTransformerCompatibility(param.transformer, regex, '0')
		checkRegexTransformerCompatibility(param.transformer, regex, null)
	})
})
