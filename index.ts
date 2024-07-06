import { defineApiClient } from "./src/client";
import { z } from "zod";

const client = defineApiClient({
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
});

const hallo = await client.hallo({ hallo: "zwallo" });
const zwallo = await client.zwallo({ zwallo: 123 });
