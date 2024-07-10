# Utility library for turning any REST api into a typesafe client

```js
import { defineApiClient } from "@yannicel/typed-api";
import { z } from "zod";

const client = defineApiClient({
  hallo: {
    requestInit: {
      method: "POST",
    },
    requestSchema: z.object({ hallo: z.string() }),
    responseSchema: z.number(),
  },
  zwallo: {
    requestInit: {
      method: "GET",
    },
    responseSchema: z.number(),
  },
});

const hallo = await client.hallo({ hallo: "hallo" });
const zwallo = await client.hallo();
```

```js
import { defineEndpoint } from "@yannicel/typed-api";

const endpoint = defineEndpoint({
  path: "https://example.com/hallo",
  requestSchema: z.object({ hallo: z.string() }),
  responseSchema: z.number(),
});

const hallo = await endpoint({ hallo: "hallo" });
```