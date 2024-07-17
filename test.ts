import { type Schema, z } from "zod";
import {
	type ApiEndpoint,
	type DefineEndpointParams,
	type EndpointHooks,
	defineEndpoint,
} from "./src/endpoint";
import type { Optional } from "./src/type";

type Extends<T1, T2> = T1 extends T2 ? true : false;
const obj = {
	req: z.string(),
	res: z.string(),
	lol: true,
};
const lol = {} as Extends<typeof obj, { req?: Schema; res?: Schema }>;

type EndpointParams<Req = any, Res = any> = Optional<
	DefineEndpointParams<Req, Res>,
	"path"
>;

type Test = Record<string, EndpointParams | Record<string, EndpointParams>>;

type Endpoints<T> = {
	[Key in keyof T]: T[Key] extends {
		requestSchema: Schema<infer Req>;
		responseSchema: Schema<infer Res>;
	}
		? EndpointParams<Req, Res>
		: T[Key];
};

export type DefineApiClientParams<T> = {
	baseUrl: string | URL;
	globalHeaders?: HeadersInit;
	globalHooks?: Partial<EndpointHooks>;
	endpoints: Endpoints<T>;
};

type ApiClient<T> = {
	[Key in keyof T]: T[Key] extends {
		requestSchema?: Schema;
		responseSchema?: Schema;
	}
		? ApiEndpoint<
				T[Key]["requestSchema"] extends Schema<infer U> ? U : undefined,
				T[Key]["responseSchema"] extends Schema<infer U> ? U : undefined
			>
		: ApiClient<T[Key]>;
};

function test<T extends Test>({
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
		endpointParams.path = new URL(endpointParams.path as string | URL, baseUrl);

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

const client = test({
	baseUrl: "http://localhost:3000",
	endpoints: {
		sdfs: {},
		hi: {
			requestSchema: z.string(),
			responseSchema: z.string(),
		},
		lol: {},
		two: {
			requestSchema: z.object({ hallo: z.string() }),
			responseSchema: z.string(),
			sfsdf: {
				requestSchema: z.object({ hallo: z.string() }),
				responseSchema: z.string(),
			},
		},
		hallo: {
			zwallo: {
				requestSchema: z.object({ hallo: z.string() }),
				responseSchema: z.string(),
			},
		},
	},
});

const one = client.hallo.zwallo({ hallo: "hallo" });
client.hallo.zwallo({ hallo: "hallo" });
client.lol();
