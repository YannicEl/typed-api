import type { z } from "zod";
import type { ApiEndpoint, DefineEndpointParams } from "./endpoint.js";
import { defineEndpoint } from "./endpoint.js";

export type Endpoints = Record<string, DefineEndpointParams<unknown, unknown>>;

export type DefineApiClientParams<T extends Endpoints> = {
	baseUrl: string | URL;
	endpoints: {
		[Key in keyof T]: T[Key];
	};
};

export type ApiClient<T extends Endpoints> = {
	[Key in keyof T]: ApiEndpoint<
		z.infer<T[Key]["requestSchema"]>,
		z.infer<T[Key]["responseSchema"]>
	>;
};

export function defineApiClient<T extends Endpoints>({
	baseUrl,
	endpoints,
}: DefineApiClientParams<T>): ApiClient<T> {
	if (typeof baseUrl === "string") baseUrl = new URL(baseUrl);

	const client = {} as ApiClient<T>;
	for (const path in endpoints) {
		const endpointParams = endpoints[path];
		endpointParams.path = new URL(endpointParams.path, baseUrl);
		const endpoint = defineEndpoint(endpointParams);
		client[path] = endpoint;
	}

	return client;
}
