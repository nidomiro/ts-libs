import { booleanParam } from './boolean-param'
import { ConfigValueTransformer } from '../schema'
import { booleanTransformer } from './boolean-transformer'

function checkBooleanTransformerCompatibility(transformer: ConfigValueTransformer<boolean>, val: unknown): void {
	expect(transformer(val)).toEqual(booleanTransformer()(val))
}

describe('boolean-param', () => {
	it('should construct param with all mentioned explicit options', () => {
		const param = booleanParam({ defaultValue: null, trimValue: 'start', envVar: 'ABC', optional: true })

		expect(param).toMatchObject({
			defaultValue: null,
			trimValue: 'start',
			envVar: 'ABC',
			optional: true,
		})

		checkBooleanTransformerCompatibility(param.transformer, true)
		checkBooleanTransformerCompatibility(param.transformer, '0')
		checkBooleanTransformerCompatibility(param.transformer, null)
	})

	it('should construct param with all mentioned explicit options', () => {
		const param = booleanParam({ defaultValue: null })

		expect(param).toMatchObject({
			defaultValue: null,
			optional: false,
		})
		expect(param).not.toHaveProperty('trimValue')
		expect(param).not.toHaveProperty('envVar')

		checkBooleanTransformerCompatibility(param.transformer, true)
		checkBooleanTransformerCompatibility(param.transformer, '0')
		checkBooleanTransformerCompatibility(param.transformer, null)
	})
})
