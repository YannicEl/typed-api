import type { Schema } from "zod";

export type AddRouteParams<RequestBody, ResponeBody> = {
	requestSchema: Schema<RequestBody>;
	requestBody: RequestBody;
	responseSchema: Schema<ResponeBody>;
};

export async function addRoute<RequestBody, ResponeBody>({
	requestSchema,
	requestBody,
	responseSchema,
}: AddRouteParams<RequestBody, ResponeBody>) {
	requestSchema.parse(requestBody);

	const res = responseSchema.parse({ hallo: "zwallo" });
	return res;
}
