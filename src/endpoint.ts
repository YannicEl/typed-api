import type { Schema } from "zod";

export type DefineEndpointParams<
	RequestBody = unknown,
	ResponeBody = unknown,
> = {
	path: string | URL;
	requestInit?: RequestInit;
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

type BaseParams = {
	path: string | URL;
	requestInit?: RequestInit;
};

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

		const res = await fetch(path, requestInit);

		if (responseSchema) {
			const json = await res.json();
			const parsed = responseSchema?.parse(json);
			return parsed;
		}
	};
}
