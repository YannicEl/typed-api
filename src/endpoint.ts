import type { Schema } from "zod";

type BaseParams = {
	path: string | URL;
	requestInit?: RequestInit;
	hooks?: Partial<{
		beforeRequest: (params: {
			path: string | URL;
			requestInit: RequestInit;
		}) => { path: string | URL; requestInit: RequestInit };
	}>;
};

export type DefineEndpointParams<
	RequestBody = unknown,
	ResponeBody = unknown,
> = BaseParams & {
	requestSchema?: Schema<RequestBody>;
	responseSchema?: Schema<ResponeBody>;
};

export type ApiEndpoint<RequestBody, ResponseBody> =
	RequestBody extends undefined
		? ResponseBody extends undefined
			? () => Promise<undefined>
			: () => Promise<ResponseBody>
		: ResponseBody extends undefined
			? (body: RequestBody) => Promise<undefined>
			: (body: RequestBody) => Promise<ResponseBody>;

export function defineEndpoint<RequestBody, ResponeBody>(
	params: {
		requestSchema: Schema<RequestBody>;
		responseSchema: Schema<ResponeBody>;
	} & BaseParams,
): (params: RequestBody) => Promise<ResponeBody>;

export function defineEndpoint<RequestBody, ResponeBody>(
	params: {
		requestSchema: Schema<RequestBody>;
	} & BaseParams,
): (params: RequestBody) => Promise<undefined>;

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
	return async (body: RequestBody) => {
		if (requestSchema) {
			requestSchema.parse(body);
			requestInit.body = JSON.stringify(body);
		}

		if (hooks?.beforeRequest) {
			const fetchParams = hooks.beforeRequest({ path, requestInit });
			path = fetchParams.path;
			requestInit = fetchParams.requestInit;
		}

		const res = await fetch(path, requestInit);

		if (responseSchema) {
			const json = await res.json();
			const parsed = responseSchema?.parse(json);
			return parsed;
		}
	};
}
