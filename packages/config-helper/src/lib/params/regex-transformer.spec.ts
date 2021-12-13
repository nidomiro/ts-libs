import { err, ok } from 'neverthrow'
import { NotConvertable } from '../schema.error'
import { regexTransformer } from './regex-transformer'

describe('regex-transformer', () => {
	it.each([
		['testString', /\d+/, err(NotConvertable)],
		['', /\d+/, err(NotConvertable)],
		['0', /\d+/, ok('0')],
		['0155764', /\d+/, ok('0155764')],
		[null, /\d+/, ok(null)],
		[1, /\d+/, err(NotConvertable)],
		[{}, /\d+/, err(NotConvertable)],
	])(`for value '%s' regexTransformer should return '%s'`, (value, regex, expected) => {
		expect(regexTransformer(regex)(value)).toEqual(expected)
	})
})
