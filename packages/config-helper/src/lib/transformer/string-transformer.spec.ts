import { stringTransformer } from "./string-transformer";


describe('string-transformer', () => {

	it('should return the given string', () => {
		expect(stringTransformer()('testString')).toEqual('testString')
	})

	it('should return the default value for null', () => {
		expect(stringTransformer('defaultValue')(null)).toEqual('defaultValue')
	})

	it('should return null if default is not set and value is null', () => {
		expect(stringTransformer()(null)).toEqual(null)
	})

	it('should return TypeError on unknown Type', () => {
		expect(() => stringTransformer()(1)).toThrow(TypeError)
	})
})
