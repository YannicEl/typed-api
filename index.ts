import { z } from "zod";
import { defineApiClient } from "./src/client";
import { defineEndpoint } from "./src/endpoint";

const client = defineApiClient({
	baseUrl: "https://example.com",
	endpoints: {
		hallo: {
			path: "/hallo",
			requestSchema: z.object({ hallo: z.string() }),
			responseSchema: z.number(),
		},
		zwallo: {
			path: "/zwallo",
			requestSchema: z.object({ zwallo: z.number() }),
			responseSchema: z.string(),
		},
	},
});

const hallo = await client.hallo({ hallo: "zwallo" });
const zwallo = await client.zwallo({ zwallo: 123 });
const drallo = await client.zwallo({ zwallo: "123" });

const endpoint = defineEndpoint({
	path: "/hallo",
	requestSchema: z.object({ hallo: z.string() }),
	responseSchema: z.number(),
});

const lol = await endpoint({ hallo: 123 });
