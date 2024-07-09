import { z, type Schema } from "zod";

export type DefineEndpointParams<RequestBody, ResponeBody> = {
	path: string | URL;
	requestInit?: RequestInit;
	requestSchema?: Schema<RequestBody>;
	responseSchema?: Schema<ResponeBody>;
};

export type ApiEndpoint<RequestBody, ResponseBody> =
	| ((body: RequestBody) => Promise<ResponseBody>)
	| ((body: RequestBody) => Promise<undefined>)
	| (() => Promise<RequestBody>)
	| (() => Promise<undefined>);

export function defineEndpoint<RequestBody, ResponseBody>({
	path,
	requestInit,
	requestSchema,
	responseSchema,
}: DefineEndpointParams<RequestBody, ResponseBody>): ApiEndpoint<
	RequestBody,
	ResponseBody
> {
	return async (body: RequestBody extends object ? true : RequestBody) => {
		if (requestSchema) requestSchema.parse(body);
		if (requestInit) requestInit.body = JSON.stringify(body);

		const res = await fetch(path, requestInit);

		const json = await res.json();
		const parsed = responseSchema?.parse(json);
		return parsed as RequestBody;
	};
}

export function test<RequestBody, ResponeBody>(params: {
	requestSchema: Schema<RequestBody>;
	responseSchema: Schema<ResponeBody>;
}): (params: RequestBody) => Promise<ResponeBody>;

export function test<RequestBody, ResponeBody>(params: {
	requestSchema: Schema<RequestBody>;
}): (params: RequestBody) => Promise<undefined>;

export function test<RequestBody, ResponeBody>(params: {
	responseSchema: Schema<ResponeBody>;
}): () => Promise<ResponeBody>;

export function test(): () => Promise<undefined>;

export function test<RequestBody, ResponeBody>(
	req?: RequestBody,
	res?: ResponeBody,
): ApiEndpoint<RequestBody, ResponeBody> {
	if (req && res) return async (req: RequestBody) => res;
	if (req) return async (req: RequestBody) => undefined;
	if (res) return async () => res;
	return async () => undefined;
}

const requestSchema = z.object({ hallo: z.string() });
const responseSchema = z.string();

const lol1 = test({ requestSchema, responseSchema });
const lol2 = test({ requestSchema });
const lol3 = test({ responseSchema });
const lol4 = test();
