import { stringParam } from './string-param'

describe('string-param', () => {
	it('should construct param with all mentioned explicit options', () => {
		const param = stringParam({ defaultValue: null, trimValue: 'start', envVar: 'ABC', optional: true })

		expect(param).toMatchObject({
			defaultValue: null,
			trimValue: 'start',
			envVar: 'ABC',
			optional: true,
		})

		expect(param.transformer('str')).toEqual('str')
		expect(param.transformer('0')).toEqual('0')
		expect(param.transformer(null)).toEqual(null)
	})

	it('should construct param with all mentioned explicit options', () => {
		const param = stringParam({ defaultValue: null })

		expect(param).toMatchObject({
			defaultValue: null,
			optional: false,
		})
		expect(param).not.toHaveProperty('trimValue')
		expect(param).not.toHaveProperty('envVar')

		expect(param.transformer('str')).toEqual('str')
		expect(param.transformer('0')).toEqual('0')
		expect(param.transformer(null)).toEqual(null)
	})
})
