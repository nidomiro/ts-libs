
export interface NormalizedSchemaObj<T> {
	default: T | null;
	transformer: (val: unknown) => T;
	env: string;
	maskValueInToString: boolean;
	description: string | null;
	optional: boolean;
}

export type NormalizedSchema<T> = {
	[P in keyof T]: T[P] extends { default: infer U } ? NormalizedSchemaObj<U> : NormalizedSchema<T[P]>;
};

export function isNormalizedSchemaObject<T>(x: NormalizedSchema<T> | NormalizedSchemaObj<T>): x is NormalizedSchemaObj<T> {
	return 'default' in x;
}
