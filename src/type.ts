export type Optional<T, Key extends keyof T> = Pick<Partial<T>, Key> &
	Omit<T, Key>;

export type NonEmptyObject<T extends Record<string, unknown>> =
	T extends Record<string, never> ? never : T;
