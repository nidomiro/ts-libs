import { err, ok } from 'neverthrow'
import { NotConvertable } from '../schema.error'
import { regexTransformer } from './regex-transformer'

describe('regex-transformer', () => {
	it.each([
		['testString', ok(/testString/)],
		['', ok(/(?:)/)],
		['.*', ok(/.*/)],
		['^\\d+$', ok(/^\d+$/)],
		[null, ok(null)],
		[1, err(NotConvertable)],
		[{}, err(NotConvertable)],
	])(`for value '%s' regexTransformer should return '%s'`, (value, expected) => {
		expect(regexTransformer()(value)).toEqual(expected)
	})
})
