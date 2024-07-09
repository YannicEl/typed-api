import type { Schema, z } from "zod";
import type { ApiEndpoint, DefineEndpointParams } from "./endpoint.js";
import { defineEndpoint } from "./endpoint.js";
import type { Optional } from "./type.js";

export type Endpoints = Record<string, Optional<DefineEndpointParams, "path">>;

export type DefineApiClientParams<T extends Endpoints> = {
	baseUrl: string | URL;
	endpoints: {
		[Key in keyof T]: T[Key];
	};
};

export type ApiClient<T extends Endpoints> = {
	[Key in keyof T]: ApiEndpoint<
		T[Key]["requestSchema"] extends Schema
			? z.infer<T[Key]["requestSchema"]>
			: undefined,
		T[Key]["responseSchema"] extends Schema
			? z.infer<T[Key]["responseSchema"]>
			: undefined
	>;
};

export function defineApiClient<T extends Endpoints>({
	baseUrl,
	endpoints,
}: DefineApiClientParams<T>): ApiClient<T> {
	if (typeof baseUrl === "string") baseUrl = new URL(baseUrl);

	const client = {} as ApiClient<T>;
	for (const key in endpoints) {
		const endpointParams = endpoints[key];
		if (!endpointParams.path) endpointParams.path = key;
		endpointParams.path = new URL(endpointParams.path, baseUrl);
		const endpoint = defineEndpoint(endpointParams as DefineEndpointParams);
		client[key] = endpoint as ApiClient<T>[keyof T];
	}

	return client;
}
