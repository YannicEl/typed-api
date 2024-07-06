import type { Schema } from "zod";

export type DefineEndpointParams<RequestBody, ResponeBody> = {
	path: string;
	requestSchema: Schema<RequestBody>;
	responseSchema: Schema<ResponeBody>;
};

export type ApiEndpoint<RequestBody, ResponseBody> = (
	body: RequestBody,
) => Promise<ResponseBody>;

export function defineEndpoint<RequestBody, ResponseBody>({
	path,
	requestSchema,
	responseSchema,
}: DefineEndpointParams<RequestBody, ResponseBody>): ApiEndpoint<
	RequestBody,
	ResponseBody
> {
	return async (body: RequestBody) => {
		requestSchema.parse(body);

		const res = await fetch(path, {});
		const json = await res.json();
		const parsed = responseSchema.parse(json);
		return parsed;
	};
}
