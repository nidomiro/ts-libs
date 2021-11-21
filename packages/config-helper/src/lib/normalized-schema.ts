import { ConfigDefinition, ConfigDefinitionOptional, ConfigDefinitionRequired } from "./schema";

export interface NormalizedConfigDefinition<T> {
	transformer: (val: unknown) => T;
	envVar: string;
	optional: boolean
}

export type NormalizedSchema<T> = {
	[P in keyof T]: T[P] extends object ? NormalizedSchema<T[P]> : NormalizedConfigDefinition<T[P]>
}

export type NormalizeSchema<T> = {
	[P in keyof T]: T[P] extends ConfigDefinition<infer U>
		? Omit<T[P], 'envVar'> & {envVar: string}
		: NormalizeSchema<T[P]>
}




export function isNormalizedSchemaObject<T>(x: NormalizedSchema<T> | NormalizedConfigDefinition<T>): x is NormalizedConfigDefinition<T> {
	return 'default' in x;
}
