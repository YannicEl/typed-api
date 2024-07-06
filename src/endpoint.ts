import type { Schema } from "zod";

export type DefineEndpointParams<RequestBody, ResponeBody> = {
	path: string | URL;
	requestInit?: RequestInit;
	requestSchema: Schema<RequestBody>;
	responseSchema: Schema<ResponeBody>;
};

export type ApiEndpoint<RequestBody, ResponseBody> = (
	body: RequestBody,
) => Promise<ResponseBody>;

export function defineEndpoint<RequestBody, ResponseBody>({
	path,
	requestInit,
	requestSchema,
	responseSchema,
}: DefineEndpointParams<RequestBody, ResponseBody>): ApiEndpoint<
	RequestBody,
	ResponseBody
> {
	return async (body: RequestBody) => {
		requestSchema.parse(body);
		if (requestInit) requestInit.body = JSON.stringify(body);

		const res = await fetch(path, requestInit);
		const json = await res.json();
		const parsed = responseSchema.parse(json);
		return parsed;
	};
}
