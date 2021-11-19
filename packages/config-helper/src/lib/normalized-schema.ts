
export interface NormalizedSchemaObj<T> {
	default: T | null
	format: (val: unknown) => asserts val is T;
	env: string;
	maskValueInToString: boolean;
	description: string | null;
	optional: boolean
}

export type NormalizedSchema<T> = {
	[P in keyof T]: T[P] extends { default: unknown } ? NormalizedSchemaObj<T[P]['default']> : NormalizedSchema<T[P]>;
};
