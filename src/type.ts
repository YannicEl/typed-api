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

export type Split<
	String,
	Character extends string,
> = String extends `${infer PartA}${Character}${infer PartB}`
	? PartA | Split<PartB, Character>
	: String;

type ExtractSearchParameter<Path> = Path extends `${string}?${infer SearchPart}`
	? Split<SearchPart, "&">
	: never;

export type UrlParams<Path = ""> = Path extends never
	? never
	: {
			[Key in
				| ExtractPathParameter<Path>
				| ExtractSearchParameter<Path>]: string;
		};
