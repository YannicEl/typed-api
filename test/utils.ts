import { createServer } from "node:http";
import type { RequestListener } from "node:http";

type MockServer = {
	url: URL;
	[Symbol.asyncDispose](): Promise<void>;
};

type StartServerParams = Record<string, RequestListener>;

export async function startMockServer(
	routes: StartServerParams,
): Promise<MockServer> {
	const server = createServer(async (request, response) => {
		for await (const [route, handler] of Object.entries(routes)) {
			const parts = route.split(" ");

			if (parts.length === 1) {
				if (request.url === parts[0]) {
					return handler(request, response);
				}
			} else {
				if (request.method === parts[0] && request.url === parts[1]) {
					return handler(request, response);
				}
			}
		}

		response.statusCode = 404;
		response.end();
	});

	const url = await new Promise<URL>((resolve) =>
		server.listen(0, "0.0.0.0", () => {
			const address = server.address();
			if (address === null) throw new Error("Failed to start mock server");

			if (typeof address === "string") {
				resolve(new URL(address));
			} else {
				resolve(new URL(`http://${address.address}:${address.port}`));
			}
		}),
	);

	return {
		url,
		[Symbol.asyncDispose]: async () => {
			await new Promise<void>((resolve) => {
				server.close(() => resolve());
			});
		},
	};
}
