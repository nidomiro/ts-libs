import { err, ok } from 'neverthrow'
import { NotConvertable } from '../schema.error'
import { booleanTransformer } from './boolean-transformer'

describe('boolean-transformer', () => {
	it.each([
		[true, ok(true)],
		[false, ok(false)],
		[null, ok(null)],
		['', ok(null)],
		[' \t', err(NotConvertable)],
		['true', ok(true)],
		['1', ok(true)],
		[1, ok(true)],
		['false', ok(false)],
		['0', ok(false)],
		[0, ok(false)],
		['abc', err(NotConvertable)],
		[41, err(NotConvertable)],
		[{}, err(NotConvertable)],
	])(`for value '%s' booleanTransformer should return '%s'`, (value, expected) => {
		expect(booleanTransformer()(value)).toEqual(expected)
	})
})
