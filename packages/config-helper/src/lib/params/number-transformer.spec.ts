import { numberTransformer } from './number-transformer'
import { err, ok } from 'neverthrow'
import { NotConvertable } from '../schema'

describe('number-transformer', () => {
	it.each([
		[42, ok(42)],
		[null, ok(null)],
		['', ok(null)],
		[' \t', ok(null)],
		['42', ok(42)],
		['abc', err(NotConvertable)],
		[{}, err(NotConvertable)],
	])(`for value '%s' numberTransformer should return '%s'`, (value, expected) => {
		expect(numberTransformer()(value)).toEqual(expected)
	})
})
