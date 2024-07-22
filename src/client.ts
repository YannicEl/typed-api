import type { Schema, z } from "zod";
import type {
	ApiEndpoint,
	BaseParams,
	DefineEndpointParams,
	EndpointHooks,
} from "./endpoint.js";
import { defineEndpoint } from "./endpoint.js";
import type { Optional } from "./type.js";

export type EndpointParams = Optional<BaseParams, "path"> &
	(
		| {
				requestSchema?: Schema;
				responseSchema?: Schema;
				endpoints?: never;
		  }
		| {
				endpoints?: EndpointGroup;
				requestSchema?: never;
				responseSchema?: never;
		  }
	);

export type EndpointGroup = Record<string, EndpointParams>;

export type DefineApiClientParams<T> = {
	baseUrl: string | URL;
	globalHeaders?: HeadersInit;
	globalHooks?: Partial<EndpointHooks>;
	endpoints: {
		[Key in keyof T]: T[Key];
	};
};

export type ApiClient<T extends EndpointGroup> = {
	[Key in keyof T]: T[Key]["endpoints"] extends EndpointGroup
		? ApiClient<T[Key]["endpoints"]>
		: ApiEndpoint<
				T[Key]["requestSchema"] extends Schema
					? z.infer<T[Key]["requestSchema"]>
					: undefined,
				T[Key]["responseSchema"] extends Schema
					? z.infer<T[Key]["responseSchema"]>
					: undefined
			>;
};

export function defineApiClient<T extends EndpointGroup>({
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
		if (typeof endpointParams.path === "string") {
			const url = new URL(baseUrl);
			url.pathname = [
				url.pathname.substring(1),
				...endpointParams.path.split("/").filter(Boolean),
			].join("/");
			endpointParams.path = url;
		}

		if ("endpoints" in endpointParams && endpointParams.endpoints) {
			client[key] = defineApiClient({
				baseUrl: endpointParams.path,
				globalHooks: endpointParams.hooks ?? globalHooks,
				globalHeaders: endpointParams.requestInit?.headers ?? globalHeaders,
				endpoints: endpointParams.endpoints,
			}) as ApiClient<T>[keyof T];
		} else {
			// Merge global headers with endpoint headers
			if (globalHeaders) {
				const endpointHeaders = new Headers(endpointParams.requestInit.headers);
				new Headers(globalHeaders).forEach((value, key) => {
					if (!endpointHeaders.has(key)) endpointHeaders.set(key, value);
				});

				endpointParams.requestInit.headers = endpointHeaders;
			}

			endpointParams.hooks = {
				...globalHooks,
				...(endpointParams.hooks ?? {}),
			};

			const endpoint = defineEndpoint(endpointParams as DefineEndpointParams);
			client[key] = endpoint as ApiClient<T>[keyof T];
		}
	}

	return client;
}
