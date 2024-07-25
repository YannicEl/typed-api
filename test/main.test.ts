import { describe } from "node:test";
import { expect, test } from "vitest";
import { z } from "zod";
import { defineApiClient } from "../src/client.js";
import { startMockServer } from "./utils.js";

describe("test", () => {
	test("Response and Request schema", async () => {
		await using server = await startMockServer({
			"POST /hallo": (req, res) => {
				res.end(JSON.stringify({ hallo: "zwallo" }));
			},
		});

		const client = defineApiClient({
			baseUrl: server.url,
			endpoints: {
				hallo: {
					requestInit: {
						method: "POST",
					},
					requestSchema: z.object({ hallo: z.string() }),
					responseSchema: z.object({ hallo: z.string() }),
				},
			},
		});

		const hallo = await client.hallo({ hallo: "zwallo" });
		expect(hallo).toStrictEqual({ hallo: "zwallo" });
	});

	test("Only Request schema", async () => {
		await using server = await startMockServer({
			"POST /hallo": (req, res) => {
				res.end("hallo");
			},
		});

		const client = defineApiClient({
			baseUrl: server.url,
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

	test("Only Response schema", async () => {
		await using server = await startMockServer({
			"GET /hallo": (req, res) => {
				res.end(JSON.stringify({ hallo: "zwallo" }));
			},
		});

		const client = defineApiClient({
			baseUrl: server.url,
			endpoints: {
				hallo: {
					requestInit: {
						method: "GET",
					},
					responseSchema: z.object({ hallo: z.string() }),
				},
			},
		});

		const hallo = await client.hallo();
		expect(hallo).toStrictEqual({ hallo: "zwallo" });
	});

	test("No Response and Request schema", async () => {
		await using server = await startMockServer({
			"GET /hallo": (req, res) => {
				res.end();
			},
		});

		const client = defineApiClient({
			baseUrl: server.url,
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

	test("Nesting works", async () => {
		await using server = await startMockServer({
			"GET /hallo/zwallo": (req, res) => {
				res.end();
			},
		});

		const client = defineApiClient({
			baseUrl: server.url,
			endpoints: {
				hallo: {
					endpoints: {
						zwallo: {
							requestInit: {
								method: "GET",
							},
						},
					},
				},
			},
		});

		const hallo = await client.hallo.zwallo();
		expect(hallo).toBe(undefined);
	});

	test("Url paramter work", async () => {
		await using server = await startMockServer({
			"GET /hallo_param/zwallo_param/drallo": (req, res) => {
				res.end(JSON.stringify({ url: req.url }));
			},
		});

		const client = defineApiClient({
			baseUrl: server.url,
			endpoints: {
				hallo: {
					path: "/:hallo/:zwallo/drallo?search&param",
					responseSchema: z.object({ url: z.string() }),
				},
			},
		});

		const params = {
			hallo: "hallo_param",
			zwallo: "zwallo_param",
			search: "search_param",
			param: "param_param",
		};

		const { url } = await client.hallo(params);
		expect(url).toBe(
			`/${params.hallo}/${params.zwallo}/drallo?search=${params.search}&param=${params.param}`,
		);
	});
});
