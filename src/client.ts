import type { Schema, z } from "zod";
import type {
	ApiEndpoint,
	DefineEndpointParams,
	EndpointHooks,
} from "./endpoint.js";
import { defineEndpoint } from "./endpoint.js";
import type { NonEmptyObject, Optional } from "./type.js";

export type Endpoints<T = any> = {
	[Key in keyof T]: T[Key] extends DefineEndpointParams
		? Optional<DefineEndpointParams, "path">
		: Endpoints<T[Key]>;
};

export type DefineApiClientParams<T extends Endpoints> = {
	baseUrl: string | URL;
	globalHeaders?: HeadersInit;
	globalHooks?: Partial<EndpointHooks>;
	endpoints: {
		[Key in keyof T]: T[Key];
	};
};

export type ApiClient<T extends Endpoints> = {
	[Key in keyof T]: T[Key] extends Endpoints & NonEmptyObject<T[Key]>
		? ApiClient<T[Key]>
		: ApiEndpoint<
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
	globalHeaders,
	globalHooks,
	endpoints,
}: DefineApiClientParams<T>): ApiClient<T> {
	if (typeof baseUrl === "string") baseUrl = new URL(baseUrl);

	const client = {} as ApiClient<T>;
	for (const key in endpoints) {
		const endpointParams = endpoints[key];
		if (!endpointParams.requestInit) endpointParams.requestInit = {};

		// Use the key as the path if it's not provided
		if (!endpointParams.path) endpointParams.path = key;
		endpointParams.path = new URL(endpointParams.path, baseUrl);

		// Merge global headers with endpoint headers
		if (globalHeaders) {
			const endpointHeaders = new Headers(endpointParams.requestInit.headers);
			new Headers(globalHeaders).forEach((value, key) => {
				if (!endpointHeaders.has(key)) endpointHeaders.set(key, value);
			});

			endpointParams.requestInit.headers = endpointHeaders;
		}

		endpointParams.hooks = { ...globalHooks, ...(endpointParams.hooks ?? {}) };

		const endpoint = defineEndpoint(endpointParams as DefineEndpointParams);
		client[key] = endpoint as ApiClient<T>[keyof T];
	}

	return client;
}
