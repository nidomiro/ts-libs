import { stringTransformer } from './string-transformer'
import { err, ok } from 'neverthrow'
import { NotConvertable } from '../schema.error'

describe('string-transformer', () => {
	it.each([
		['testString', ok('testString')],
		[null, ok(null)],
		[1, err(NotConvertable)],
		[{}, err(NotConvertable)],
	])(`for value '%s' stringTransformer should return '%s'`, (value, expected) => {
		expect(stringTransformer()(value)).toEqual(expected)
	})

	it.each([
		['testString', undefined, ok('testString')],
		['testString', /\d+/, err(NotConvertable)],
		['', /\d+/, err(NotConvertable)],
		['0', /\d+/, ok('0')],
		['0155764', /\d+/, ok('0155764')],
		[null, /\d+/, ok(null)],
		[1, /\d+/, err(NotConvertable)],
		[{}, /\d+/, err(NotConvertable)],
	])(`for value '%s' and regex '%s' stringTransformer should return '%s'`, (value, regex, expected) => {
		expect(stringTransformer(regex)(value)).toEqual(expected)
	})
})
