import { ConfigDefinitionOptional, ConfigDefinitionRequired } from './schema'

// eslint-disable-next-line @typescript-eslint/no-type-alias
export type Properties<T> = {
	[P in keyof T]: T[P] extends ConfigDefinitionOptional<infer U>
		? U | null
		: T[P] extends ConfigDefinitionRequired<infer U>
		? NonNullable<U>
		: Properties<T[P]>
}
