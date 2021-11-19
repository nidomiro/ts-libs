export interface SchemaObj<T> {
	default: T | null;
	format?: (val: unknown) => asserts val is T;
	env?: string;
	maskValueInToString?: boolean;
	description?: string;
	optional?: boolean;
}

export type Schema<T> = {
	[P in keyof T]: T[P] extends { default: unknown } ? SchemaObj<T[P]['default']> : Schema<T[P]>;
};

