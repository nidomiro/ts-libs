import { numberParam } from './number-param'
import { ConfigValueTransformer } from '../schema'
import { numberTransformer } from './number-transformer'

function checkNumberTransformerCompatibility(transformer: ConfigValueTransformer<number>, val: unknown): void {
	expect(transformer(val)).toEqual(numberTransformer()(val))
}

describe('number-param', () => {
	it('should construct param with all mentioned explicit options', () => {
		const param = numberParam({ defaultValue: null, envVar: 'ABC', optional: true })

		expect(param).toMatchObject({
			defaultValue: null,
			trimValue: true,
			envVar: 'ABC',
			optional: true,
		})

		checkNumberTransformerCompatibility(param.transformer, 42)
		checkNumberTransformerCompatibility(param.transformer, '0')
		checkNumberTransformerCompatibility(param.transformer, null)
	})

	it('should construct param with all mentioned explicit options', () => {
		const param = numberParam({ defaultValue: null })

		expect(param).toMatchObject({
			defaultValue: null,
			optional: false,
			trimValue: true,
		})
		expect(param).not.toHaveProperty('envVar')

		checkNumberTransformerCompatibility(param.transformer, 42)
		checkNumberTransformerCompatibility(param.transformer, '0')
		checkNumberTransformerCompatibility(param.transformer, null)
	})
})
