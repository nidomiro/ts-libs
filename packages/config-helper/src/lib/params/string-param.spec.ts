import { stringParam } from './string-param'
import { ConfigValueTransformer } from '../schema'
import { stringTransformer } from './string-transformer'

function checkStringTransformerCompatibility(transformer: ConfigValueTransformer<string>, val: unknown): void {
	expect(transformer(val)).toEqual(stringTransformer()(val))
}

describe('string-param', () => {
	it('should construct param with all mentioned explicit options', () => {
		const param = stringParam({ defaultValue: null, trimValue: 'start', envVar: 'ABC', optional: true })

		expect(param).toMatchObject({
			defaultValue: null,
			trimValue: 'start',
			envVar: 'ABC',
			optional: true,
		})

		checkStringTransformerCompatibility(param.transformer, 'str')
		checkStringTransformerCompatibility(param.transformer, '0')
		checkStringTransformerCompatibility(param.transformer, null)
	})

	it('should construct param with all mentioned explicit options', () => {
		const param = stringParam({ defaultValue: null })

		expect(param).toMatchObject({
			defaultValue: null,
			optional: false,
		})
		expect(param).not.toHaveProperty('trimValue')
		expect(param).not.toHaveProperty('envVar')

		checkStringTransformerCompatibility(param.transformer, 'str')
		checkStringTransformerCompatibility(param.transformer, '0')
		checkStringTransformerCompatibility(param.transformer, null)
	})
})
