import { numberTransformer } from './number-transformer'
import { err, ok } from 'neverthrow'
import { NotConvertable } from '../schema.error'

describe('number-transformer', () => {
	it.each([
		[42, ok(42)],
		[null, ok(null)],
		['', ok(null)],
		[' \t', err(NotConvertable)],
		['42', ok(42)],
		['abc', err(NotConvertable)],
		[{}, err(NotConvertable)],
	])(`for value '%s' numberTransformer should return '%s'`, (value, expected) => {
		expect(numberTransformer()(value)).toEqual(expected)
	})
})
