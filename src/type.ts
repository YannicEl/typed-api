export type Optional<T, Key extends keyof T> = Pick<Partial<T>, Key> &
	Omit<T, Key>;
