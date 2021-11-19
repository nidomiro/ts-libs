export type Properties<T> = {
	[P in keyof T]: T[P] extends { default: unknown, optional: true }
		? T[P]['default'] | null
		: T[P] extends { default: unknown }
		? NonNullable<T[P]['default']>
		: Properties<T[P]>;
};
