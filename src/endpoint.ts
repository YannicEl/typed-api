import type { Schema, ZodTypeAny } from "zod";
import type { NonEmptyObject, UrlParams } from "./type.js";

export type FetchParams = {
	path: URL;
	requestInit: RequestInit;
};

export type BeforeRequestHook = (
	params: FetchParams,
) => Promise<FetchParams> | FetchParams;

export type AfterRequestHook = (
	response: Response,
) => Promise<Response> | Response;

export type EndpointHooks = {
	beforeRequest: BeforeRequestHook;
	afterRequest: AfterRequestHook;
};

export type BaseParams = {
	path: string | URL;
	requestInit?: RequestInit;
	hooks?: Partial<EndpointHooks>;
};

export type DefineEndpointParams<
	RequestBodySchema extends ZodTypeAny = ZodTypeAny,
	ResponeBodySchema extends ZodTypeAny = ZodTypeAny,
> = BaseParams & {
	requestSchema?: RequestBodySchema;
	responseSchema?: ResponeBodySchema;
};

export type ApiEndpoint<
	RequestBody,
	ResponseBody,
	Path = never,
> = RequestBody extends undefined
	? ResponseBody extends undefined
		? NonEmptyObject<UrlParams<Path>> extends never
			? () => Promise<undefined>
			: (urlParams: UrlParams<Path>) => Promise<undefined>
		: NonEmptyObject<UrlParams<Path>> extends never
			? () => Promise<ResponseBody>
			: (urlParams: UrlParams<Path>) => Promise<ResponseBody>
	: ResponseBody extends undefined
		? NonEmptyObject<UrlParams<Path>> extends never
			? (body: RequestBody) => Promise<undefined>
			: (body: RequestBody, urlParams: UrlParams<Path>) => Promise<undefined>
		: NonEmptyObject<UrlParams<Path>> extends never
			? (body: RequestBody) => Promise<ResponseBody>
			: (
					body: RequestBody,
					urlParams: UrlParams<Path>,
				) => Promise<ResponseBody>;

export function defineEndpoint<RequestBody, ResponeBody>(
	params: {
		requestSchema: Schema<RequestBody>;
		responseSchema: Schema<ResponeBody>;
	} & BaseParams,
): (body: RequestBody) => Promise<ResponeBody>;

export function defineEndpoint<RequestBody, ResponeBody>(
	params: {
		requestSchema: Schema<RequestBody>;
	} & BaseParams,
): (body: RequestBody) => Promise<undefined>;

export function defineEndpoint<RequestBody, ResponeBody>(
	params: {
		responseSchema: Schema<ResponeBody>;
	} & BaseParams,
): () => Promise<ResponeBody>;

export function defineEndpoint<RequestBody, ResponeBody>(
	params: BaseParams,
): () => Promise<undefined>;

export function defineEndpoint<RequestBody, ResponeBody>({
	path,
	requestInit = {},
	hooks,
	requestSchema,
	responseSchema,
}: {
	requestSchema?: Schema<RequestBody>;
	responseSchema?: Schema<ResponeBody>;
} & BaseParams) {
	return async (
		...args:
			| [body: RequestBody, params: UrlParams]
			| [params: UrlParams]
			| [body: RequestBody]
			| []
	) => {
		let fetchParams: FetchParams = {
			path: new URL(path),
			requestInit,
		};

		let body: RequestBody | undefined;
		if (args.length >= 1 && requestSchema) body = args[0] as RequestBody;

		let params: UrlParams = {};
		if (args.length === 1 && !requestSchema) params = args[0] as UrlParams;
		if (args.length === 2) params = args[1] as UrlParams;

		if (requestSchema) {
			requestSchema.parse(body);
			requestInit.body = JSON.stringify(body);
		}

		for (const [key, value] of Object.entries(params)) {
			fetchParams.path.pathname = fetchParams.path.pathname.replace(
				`:${key}`,
				value as string,
			);

			if (fetchParams.path.searchParams.has(key)) {
				fetchParams.path.searchParams.set(key, value as string);
			}
		}

		if (hooks?.beforeRequest) {
			fetchParams = await hooks.beforeRequest(fetchParams);
		}

		let res = await fetch(fetchParams.path, fetchParams.requestInit);

		if (hooks?.afterRequest) {
			res = await hooks.afterRequest(res);
		}

		if (!res.ok) {
			const error = await res.json();
			throw error;
		}

		if (responseSchema) {
			const json = await res.json();
			const parsed = responseSchema.parse(json);
			return parsed;
		}
	};
}
