import { lazy } from './lazy'

describe(`lazy`, () => {
	it(`should not call the initializer if value is not accessed`, () => {
		const initializer = jest.fn()
		lazy(initializer)

		expect(initializer).toHaveBeenCalledTimes(0)
	})

	it(`should call the initializer if value is accessed`, () => {
		const initializer = jest.fn()
		const lazyVal = lazy(initializer)
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		lazyVal.value

		expect(initializer).toHaveBeenCalledTimes(1)
	})

	it(`value should return the return value from the initializer`, () => {
		const initializer = jest.fn()
		initializer.mockReturnValue('TestValue')
		const lazyVal = lazy(initializer)

		expect(lazyVal.value).toEqual('TestValue')
		expect(initializer).toHaveBeenCalledTimes(1)
	})

	it(`should call the initializer only once`, () => {
		const initializer = jest.fn()
		initializer.mockReturnValue('TestValue')
		const lazyVal = lazy(initializer)

		expect(lazyVal.value).toEqual('TestValue')
		expect(lazyVal.value).toEqual('TestValue')
		expect(initializer).toHaveBeenCalledTimes(1)
	})

	it(`reset should remove the stored value`, () => {
		const initializer = jest.fn()
		initializer.mockReturnValue('TestValue')
		const lazyVal = lazy(initializer)

		expect(lazyVal.value).toEqual('TestValue')
		initializer.mockReturnValue('TestValue2')
		lazyVal.reset()
		expect(lazyVal.value).toEqual('TestValue2')
		expect(initializer).toHaveBeenCalledTimes(2)
	})
})
