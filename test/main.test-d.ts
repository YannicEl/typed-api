import { createServer } from "node:http";
import { describe } from "node:test";
import { beforeEach, expect, test } from "vitest";
import { z } from "zod";
import { defineApiClient } from "../src/client.js";

beforeEach(async (ctx) => {
	const server = createServer((request, response) => {
		switch (`${request.method} ${request.url}`) {
			case "POST /hallo":
			case "GET /hallo": {
				return response.end(JSON.stringify("hallo"));
			}
			default: {
				return response.end();
			}
		}
	});

	await new Promise<void>((resolve) =>
		server.listen(0, "0.0.0.0", () => {
			const address = server.address();
			if (address === null) throw new Error("Failed to start mock server");

			if (typeof address === "string") {
				ctx.mockServerUrl = address;
			} else {
				ctx.mockServerUrl = `http://${address.address}:${address.port}`;
			}

			resolve();
		}),
	);

	return () => {
		server.close();
	};
});

describe("test", () => {
	test("Response and Request schema", async ({ mockServerUrl }) => {
		const client = defineApiClient({
			baseUrl: mockServerUrl,
			endpoints: {
				hallo: {
					requestInit: {
						method: "POST",
					},
					requestSchema: z.object({ hallo: z.string() }),
					responseSchema: z.string(),
				},
			},
		});

		const hallo = await client.hallo({ hallo: "zwallo" });
		expect(typeof hallo).toBe("string");
	});

	test("Only Request schema", async ({ mockServerUrl }) => {
		const client = defineApiClient({
			baseUrl: mockServerUrl,
			endpoints: {
				hallo: {
					requestInit: {
						method: "POST",
					},
					requestSchema: z.object({ hallo: z.string() }),
				},
			},
		});

		const hallo = await client.hallo({ hallo: "zwallo" });
		expect(hallo).toBe(undefined);
	});

	test("Only Response schema", async ({ mockServerUrl }) => {
		const client = defineApiClient({
			baseUrl: mockServerUrl,
			endpoints: {
				hallo: {
					requestInit: {
						method: "GET",
					},
					responseSchema: z.string(),
				},
			},
		});

		const hallo = await client.hallo();
		expect(typeof hallo).toBe("string");
	});

	test("No Response and Request schema", async ({ mockServerUrl }) => {
		const client = defineApiClient({
			baseUrl: mockServerUrl,
			endpoints: {
				hallo: {
					requestInit: {
						method: "GET",
					},
				},
			},
		});

		const hallo = await client.hallo();
		expect(hallo).toBe(undefined);
	});
});
