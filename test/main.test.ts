import { createServer } from "node:http";
import { test } from "vitest";
import { expect } from "vitest";
import { beforeEach } from "vitest";
import { z } from "zod";
import { defineApiClient } from "../src/client";

const MOCK_SERVER_PORT = 1234;
const MOCK_SERVER_URL = `http://localhost:${MOCK_SERVER_PORT}`;

beforeEach(() => {
	const server = createServer((request, response) => {
		switch (`${request.method} ${request.url}`) {
			case "POST /hallo": {
				return response.end(JSON.stringify("hallo"));
			}
			case "GET /drallo": {
				return response.end(JSON.stringify(123));
			}
			default: {
				return response.end();
			}
		}
	});
	server.listen(MOCK_SERVER_PORT);

	return () => {
		server.close();
	};
});

test("test", async () => {
	const client = defineApiClient({
		baseUrl: MOCK_SERVER_URL,
		endpoints: {
			hallo: {
				requestInit: {
					method: "POST",
				},
				requestSchema: z.object({ hallo: z.string() }),
				responseSchema: z.string(),
			},
			zwallo: {
				requestInit: {
					method: "POST",
				},
				requestSchema: z.object({ hallo: z.string() }),
			},
			drallo: {
				responseSchema: z.number(),
			},
			prallo: {},
		},
	});

	const hallo = await client.hallo({ hallo: "zwallo" });
	expect(typeof hallo).toBe("string");

	const zwallo = await client.zwallo({ hallo: "zwallo" });
	expect(zwallo).toBe(undefined);

	const drallo = await client.drallo();
	expect(typeof drallo).toBe("number");

	const prallo = await client.prallo();
	expect(prallo).toBe(undefined);
});
