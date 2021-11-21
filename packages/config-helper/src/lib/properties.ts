import { ConfigDefinitionOptional, ConfigDefinitionRequired } from '@nidomiro/config-helper';

export type Properties<T> = {
	[P in keyof T]: T[P] extends ConfigDefinitionOptional<infer U>
		? U | null
		: T[P] extends ConfigDefinitionRequired<infer U>
		? NonNullable<U>
		: Properties<T[P]>;
};
