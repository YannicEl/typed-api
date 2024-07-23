export type Optional<T, Key extends keyof T> = Pick<Partial<T>, Key> &
	Omit<T, Key>;

export type NonEmptyObject<T extends Record<string, unknown>> =
	T extends Record<string, never> ? never : T;

type IsPathParameter<Path> = Path extends `:${infer PathParam}`
	? PathParam
	: never;

type ExtractPathParameter<Path> = (
	Path extends `${infer PathPart}?${string}`
		? PathPart
		: Path
) extends `${infer PartA}/${infer PartB}`
	? IsPathParameter<PartA> | ExtractPathParameter<PartB>
	: IsPathParameter<Path>;

type IsSearchParameter<Path> = Path extends `&${infer SearchParam}`
	? SearchParam
	: never;

type ExtractSearchParameter<Path> = (
	Path extends `${string}?${infer SearchPart}`
		? SearchPart
		: Path
) extends `${infer PartA}&${infer PartB}`
	? IsSearchParameter<`&${PartA}`> | ExtractSearchParameter<PartB>
	: IsSearchParameter<Path>;

export type UrlParams<Path = ""> = Path extends never
	? never
	: {
			[Key in
				| ExtractPathParameter<Path>
				| ExtractSearchParameter<Path>]: string;
		};
