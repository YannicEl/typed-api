import { z } from "zod";
import { defineApiClient } from "./src/client";
import { defineEndpoint } from "./src/endpoint";

const client = defineApiClient({
	baseUrl: "https://example.com",
	endpoints: {
		post: {
			path: "/hallo",
			requestInit: {
				method: "POST",
			},
			requestSchema: z.object({ hallo: z.string() }),
		},
		get: {
			path: "/zwallo",
			requestInit: {
				method: "GET",
			},
			responseSchema: z.string(),
		},
	},
});

const post = await client.post({ hallo: "hallo" });
const get = await client.get();

const endpoint = defineEndpoint({
	path: "/hallo",
	// requestSchema: z.object({ hallo: z.string() }),
	// responseSchema: z.number(),
});

const lol = await endpoint();
