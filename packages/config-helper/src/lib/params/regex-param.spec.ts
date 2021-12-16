import { regexParam } from './regex-param'
import { ConfigValueTransformer } from '../schema'
import { regexTransformer } from './regex-transformer'

function checkRegexTransformerCompatibility(transformer: ConfigValueTransformer<RegExp>, val: unknown): void {
	expect(transformer(val)).toEqual(regexTransformer()(val))
}

describe('regex-param', () => {
	it('should construct param with all mentioned explicit options', () => {
		const param = regexParam({ defaultValue: null, optional: true, envVar: 'ABC' })

		expect(param).toMatchObject({
			defaultValue: null,
			trimValue: true,
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
			trimValue: true,
		})
		expect(param).not.toHaveProperty('envVar')

		checkRegexTransformerCompatibility(param.transformer, 'str')
		checkRegexTransformerCompatibility(param.transformer, '^\\d+$')
		checkRegexTransformerCompatibility(param.transformer, null)
	})
})
