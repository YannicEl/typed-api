import type { Schema, z } from "zod";
import type { ApiEndpoint, DefineEndpointParams } from "./endpoint";

export type ApiClientParams<T> = {
	// basePath: string;
	// [Key in keyof T]: {
	// 	requestSchema: Schema<TRequest>;
	// 	responseSchema: Schema<TResponse>;
	// };
	// [Key in keyof T]: DefineEndpointParams<TRequest, TResponse>;
	[Key in keyof T]: T[Key];
};

export type ApiClient<T> = {
	[Key in keyof T]: T[Key] extends DefineEndpointParams<
		infer TRequest,
		infer TResponse
	>
		? ApiEndpoint<TRequest, TResponse>
		: never;
};

export function defineApiClient<T>(routes: ApiClientParams<T>): ApiClient<T> {
	return {} as ApiClient<T>;
}
