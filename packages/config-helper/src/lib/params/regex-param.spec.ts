import { regexParam } from './regex-param'
import { ConfigValueTransformer } from '../schema'
import { regexTransformer } from './regex-transformer'

function checkRegexTransformerCompatibility(transformer: ConfigValueTransformer<RegExp>, val: unknown): void {
	expect(transformer(val)).toEqual(regexTransformer()(val))
}

describe('regex-param', () => {
	it('should construct param with all mentioned explicit options', () => {
		const param = regexParam({ defaultValue: null, optional: true, trimValue: 'start', envVar: 'ABC' })

		expect(param).toMatchObject({
			defaultValue: null,
			trimValue: 'start',
			envVar: 'ABC',
			optional: true,
		})

		checkRegexTransformerCompatibility(param.transformer, 'str')
		checkRegexTransformerCompatibility(param.transformer, '^\\d+$')
		checkRegexTransformerCompatibility(param.transformer, null)
	})

	it('should construct param with all mentioned explicit options', () => {
		const param = regexParam({ defaultValue: null })

		expect(param).toMatchObject({
			defaultValue: null,
			optional: false,
		})
		expect(param).not.toHaveProperty('trimValue')
		expect(param).not.toHaveProperty('envVar')

		checkRegexTransformerCompatibility(param.transformer, 'str')
		checkRegexTransformerCompatibility(param.transformer, '^\\d+$')
		checkRegexTransformerCompatibility(param.transformer, null)
	})
})
