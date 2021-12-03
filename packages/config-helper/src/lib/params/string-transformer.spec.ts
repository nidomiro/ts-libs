import { stringTransformer } from './string-transformer'
import { err, ok } from 'neverthrow'
import { NotConvertable } from '../schema'

describe('string-transformer', () => {
	it.each([
		['testString', ok('testString')],
		[null, ok(null)],
		[1, err(NotConvertable)],
		[{}, err(NotConvertable)],
	])(`for value '%s' stringTransformer should return '%s'`, (value, expected) => {
		expect(stringTransformer()(value)).toEqual(expected)
	})
})
