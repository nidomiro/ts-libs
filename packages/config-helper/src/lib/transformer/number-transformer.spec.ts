import { numberTransformer } from './number-transformer'

describe('string-transformer', () => {
	it('should return the given string', () => {
		expect(numberTransformer()(42)).toEqual(42)
	})

	it('should return null for value null', () => {
		expect(numberTransformer(24)(null)).toEqual(null)
	})

	it('should return null if default is not set and value is null', () => {
		expect(numberTransformer()(null)).toEqual(null)
	})

	it('should return default if value is undefined', () => {
		expect(numberTransformer(24)(undefined)).toEqual(24)
	})

	it('should return null if default is not set and value is empty string', () => {
		expect(numberTransformer()('')).toEqual(null)
	})

	it('should return null if default is not set and value is white-space only string', () => {
		expect(numberTransformer()(' \t')).toEqual(null)
	})

	it('should convert a number-string to a number', () => {
		expect(numberTransformer()('42')).toEqual(42)
	})

	it('should throw TypeError on a non-number-string', () => {
		expect(() => numberTransformer()('abc')).toThrow(TypeError)
	})

	it('should return TypeError on unknown Type', () => {
		expect(() => numberTransformer()({})).toThrow(TypeError)
	})
})
