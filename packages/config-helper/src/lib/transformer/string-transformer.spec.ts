import { stringTransformer } from './string-transformer'

describe('string-transformer', () => {
	it('should return the given string', () => {
		expect(stringTransformer()('testString')).toEqual('testString')
	})

	it('should return null if default is not set and value is null', () => {
		expect(stringTransformer()(null)).toEqual(null)
	})

	it('should return TypeError on unknown Type', () => {
		expect(() => stringTransformer()(1)).toThrow(TypeError)
	})

	it('should return null if value is empty string', () => {
		expect(stringTransformer()('')).toEqual(null)
	})

	it('should return null if value is whitespace string', () => {
		expect(stringTransformer()(' \t')).toEqual(null)
	})

	it('should return same string if value is empty string and handleEmptyStringAsNull=false', () => {
		expect(stringTransformer(false)('')).toEqual('')
	})

	it('should return same string if value is whitespace string and handleEmptyStringAsNull=false', () => {
		expect(stringTransformer(false)(' \t')).toEqual(' \t')
	})
})
