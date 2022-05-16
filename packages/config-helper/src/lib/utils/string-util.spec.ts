import { prefixStringOrStringArrayIfDefined, trimString } from './string-util'

describe(`string-util`, () => {
	describe(`prefixStringIfDefined`, () => {
		it.each([
			[`TestPre`, `TestVal`, 'TestPreTestVal'],
			[`TestPre`, null, null],
			[`TestPre`, undefined, undefined],
			[`TestPre`, [`TestVal`, `TestVal2`], [`TestPreTestVal`, `TestPreTestVal2`]],
		])(`for prefix '%s' and str '%s' return value should be '%s'`, (prefix, str, expected) => {
			expect(prefixStringOrStringArrayIfDefined(prefix, str)).toEqual(expected)
		})
	})

	describe(`trimString`, () => {
		it.each([
			[` \tabc \t`, true, `abc`],
			[` \tabc \t`, 'start' as const, `abc \t`],
			[` \tabc \t`, 'end' as const, ` \tabc`],
			[` \tabc \t`, false, ` \tabc \t`],
			[` \t`, true, ''],
		])(
			`for value '%s' and trimValue '%s' return value should be '%s'`,
			(value: string, trimValue: boolean | 'start' | 'end', expected: string | null) => {
				const trimmedValue = trimString(value, trimValue)

				expect(trimmedValue).toEqual(expected)
			},
		)
	})
})
