import { err, ok } from 'neverthrow'
import { NotConvertable } from '../schema.error'
import { enumTransformer } from './enum-transformer'

describe('enum-transformer', () => {
	it.each([
		['TEST1', { possibleValues: ['TEST1', 'TEST2'], matchCaseInsensitive: false }, ok('TEST1')],
		['TEST2', { possibleValues: ['TEST1', 'TEST2'], matchCaseInsensitive: false }, ok('TEST2')],
		['TEST3', { possibleValues: ['TEST1', 'TEST2'], matchCaseInsensitive: false }, err(NotConvertable)],
		['', { possibleValues: ['TEST1', 'TEST2'], matchCaseInsensitive: false }, err(NotConvertable)],
		[null, { possibleValues: ['TEST1', 'TEST2'], matchCaseInsensitive: false }, ok(null)],
		[undefined, { possibleValues: ['TEST1', 'TEST2'], matchCaseInsensitive: false }, ok(null)],
		['test1', { possibleValues: ['TEST1', 'TEST2'], matchCaseInsensitive: false }, err(NotConvertable)],
		['test1', { possibleValues: ['TEST1', 'TEST2'], matchCaseInsensitive: true }, ok('TEST1')],
	])(`For '%s' as value and options '%s' the result should be '%s'`, (input, options, result) => {
		expect(enumTransformer(options.possibleValues, options.matchCaseInsensitive)(input)).toEqual(result)
	})
})
