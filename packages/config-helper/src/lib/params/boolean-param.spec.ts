import { booleanParam } from './boolean-param'
import { ConfigValueTransformer } from '../schema'
import { booleanTransformer } from './boolean-transformer'

function checkBooleanTransformerCompatibility(transformer: ConfigValueTransformer<boolean>, val: unknown): void {
	expect(transformer(val)).toEqual(booleanTransformer()(val))
}

describe('boolean-param', () => {
	it('should construct param with all mentioned explicit options', () => {
		const param = booleanParam({ defaultValue: null, envVar: 'ABC', optional: true })

		expect(param).toMatchObject({
			defaultValue: null,
			trimValue: true,
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
			trimValue: true,
		})
		expect(param).not.toHaveProperty('envVar')

		checkBooleanTransformerCompatibility(param.transformer, true)
		checkBooleanTransformerCompatibility(param.transformer, '0')
		checkBooleanTransformerCompatibility(param.transformer, null)
	})
})
