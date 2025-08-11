
# Walmart API Service

A NestJS 11 service that proxies search requests to the Walmart Search API, applies request validation using Zod, and exposes Swagger documentation.

- Framework: NestJS 11 (TypeScript)
- Validation: nestjs-zod + Zod (v3)
- HTTP client: @nestjs/axios (Axios)
- Config: @nestjs/config
- API Docs: @nestjs/swagger
- Port: 3111 by default

## Features

- __Search endpoints__ under `GET /search`.
- __Three result shapes__:
  - `GET /search`: array of strings “name - price”.
  - `GET /search/full`: array of rich Walmart product objects.
  - `GET /search/dev`: full Walmart API response (useful for debugging/pagination).
- __Validation__ with global `ZodValidationPipe`.
- __Swagger UI__ at `/api`.
- __Signed Walmart requests__ using RSA private key and consumer ID from env.

## Architecture

- __Entry point__: `src/main.ts`
  - Applies `patchNestJsSwagger()` and global `ZodValidationPipe`.
  - Registers Swagger docs and starts server.
- __App module__: `src/app.module.ts`
  - Loads `ConfigModule.forRoot({ isGlobal: true })`.
  - Registers `SearchModule`.
- __Search module__: `src/search/search.module.ts`
  - Imports `HttpModule` and `ConfigModule`.
  - Registers `SearchController` and `SearchService`.
- __Controller__: `src/search/search.controller.ts`
  - Defines `GET /search`, `GET /search/full`, `GET /search/dev`.
  - Adds explicit `@ApiQuery()` decorators for Swagger.
- __Service__: `src/search/search.service.ts`
  - Signs requests to Walmart API using an RSA private key.
  - Sends requests with headers: `WM_CONSUMER.ID`, `WM_CONSUMER.INTIMESTAMP`, `WM_SEC.KEY_VERSION`, `WM_SEC.AUTH_SIGNATURE`.
  - Exposes helpers to return product name/price strings, full products, or full response.
- __Validation/DTOs__:
  - Query schemas: `src/search/schemas/search.query.schemas.ts`
  - Body schemas (placeholder): `src/search/schemas/search.body.schemas.ts`
  - Response schemas: `src/search/schemas/search.result.schemas.ts`
  - DTOs: `src/search/dtos/*` using `createZodDto()` from `nestjs-zod`.

## Environment Variables

Set these before running:

- __WALMART_SEARCH_API_URL__ (required): Walmart search endpoint URL.
- __WALMART_CONSUMER_ID__ (required): Walmart API consumer ID.
- __PRIVATE_KEY_PATH__ (required): Path to your RSA private key file, used to sign requests.
- __PORT__ (optional): Server port. Defaults to `3111`.

Example `.env`:

```env
WALMART_SEARCH_API_URL=https://example.walmartapis.com/v1/search
WALMART_CONSUMER_ID=your-consumer-id
PRIVATE_KEY_PATH=./secrets/walmart_private_key.pem
PORT=3111
```

Security note: Do not commit your private key to version control.

## Installation and Running

- Install dependencies
  - pnpm install
- Development
  - pnpm run start:dev
  - Swagger UI: http://localhost:3111/api
- Build
  - pnpm run build
- Production
  - pnpm run start:prod

Project uses TypeScript path aliases (e.g., `@/search/...`). The build runs `tsc-alias` to rewrite aliases for `dist/`.

## Endpoints

All endpoints are defined in `src/search/search.controller.ts`. Query params are documented in Swagger.

- __GET `/search`__
  - Summary: Search for products and return “name - price” strings.
  - Query:
    - `query` (string, required)
    - `sort` (string, optional)
    - `order` ("asc" | "desc", optional)
    - `numItems` (number, optional; min 1, max 25)
    - `start` (number, optional; min 1)
    - `responseGroup` (string, optional)
    - `facet` (string, optional)
    - `facet.filter` (string, optional)
    - `facet.range` (string, optional)
  - Response: `string[]`

- __GET `/search/full`__
  - Summary: Search for products and return rich product objects.
  - Same query params as `/search`.
  - Response: `WalmartProduct[]` (see below)

- __GET `/search/dev`__
  - Summary: Return the full Walmart API response (debug/dev).
  - Same query params as `/search`.
  - Response: `WalmartApiResponse`

### Query Parameter Validation

Defined in `src/search/schemas/search.query.schemas.ts`.

Notes:
- Optional fields are modeled with `.optional()` (sometimes with `.nullable()` depending on shape). If you omit them, they should not be required.
- Numeric query params (`numItems`, `start`) are declared using `z.number()`. Query strings arrive as text, e.g. `?numItems=24` is "24". Without coercion (e.g., `z.coerce.number()`), validation will fail if a numeric string is provided. Either:
  - Pass numbers in a way Nest converts them (e.g., via Pipes), or
  - Change the schema to `z.coerce.number()` if you want to accept numeric strings. This repo currently uses `z.number()`.

### WalmartProduct shape

Modeled by `src/search/schemas/search.result.schemas.ts` as `WalmartProductSchema`. Key fields (non-exhaustive):
- `itemId` (number)
- `parentItemId` (number)
- `name` (string)
- `salePrice` (number)
- `upc` (string)
- `categoryPath` (string)
- `shortDescription`, `longDescription` (string)
- `brandName` (string)
- `thumbnailImage`, `mediumImage`, `largeImage` (string)
- `productTrackingUrl` (string)
- `ninetySevenCentShipping` (boolean)
- `standardShipRate` (number)
- Many other optional fields: `color`, `customerRating`, `numReviews`, `bestMarketplacePrice`, `imageEntities`, etc.

The full response shape is captured as `WalmartApiResponseSchema` containing items of `WalmartProductSchema`.

## Request Signing

Defined in `SearchService.generateSignature()`:
- Uses `WALMART_CONSUMER_ID` + current timestamp + key version "1" to build the signature message.
- Signs the message with RSA-SHA256 using the private key at `PRIVATE_KEY_PATH`.
- Sends headers:
  - `WM_CONSUMER.ID`
  - `WM_CONSUMER.INTIMESTAMP`
  - `WM_SEC.KEY_VERSION` = "1"
  - `WM_SEC.AUTH_SIGNATURE` = base64 signature

If any signing step fails (e.g., missing file), the service throws a descriptive error.

## Error Handling

- Validation errors return HTTP 400 with a JSON body describing the issues (from `ZodValidationPipe`).
- Downstream Walmart errors bubble up with HTTP 500 and an error message; the service logs relevant details.

## Swagger/OpenAPI

- Swagger plugin enabled in `nest-cli.json`:
  - `"plugins": ["@nestjs/swagger"]`
- `patchNestJsSwagger()` called in `main.ts` to integrate Zod DTOs.
- Manual `@ApiQuery()` decorators ensure query params are visible and documented in Swagger UI.
- Access at: `http://localhost:3111/api`

## Example cURL

- Get product names and prices:
```bash
curl "http://localhost:3111/search?query=toothpaste&numItems=10&start=1"
```

- Get full product objects:
```bash
curl "http://localhost:3111/search/full?query=toothpaste&order=asc&sort=price"
```

- Get full Walmart response (debug):
```bash
curl "http://localhost:3111/search/dev?query=toothpaste"
```

## Scripts

- `start:dev` – watch mode
- `build` – `nest build` then `tsc-alias` to rewrite path aliases
- `start:prod` – runs compiled app
- `lint`, `test`, `test:e2e`, etc.

## Compatibility notes (Zod + nestjs-zod)

- This project uses `nestjs-zod` and Zod v3.
- To avoid type mismatches with `createZodDto`, it’s best to define schemas using `@nest-zod/z` rather than `zod` directly. If you see a TypeScript error like:
  - “Argument of type 'ZodObject<...>' is not assignable to parameter of type 'ZodType<...>' …”
  - Unify all schema imports to `@nest-zod/z` and ensure `@nest-zod/z` is installed.
- If you need query numeric coercion, switch `z.number()` to `z.coerce.number()` in the query schemas.

## Project Structure

- `src/main.ts` – bootstrap, Swagger, validation pipe
- `src/app.module.ts` – global config, registers SearchModule
- `src/search/search.module.ts` – module wiring
- `src/search/search.controller.ts` – three GET endpoints
- `src/search/search.service.ts` – signed HTTP calls and transformations
- `src/search/dtos/*` – DTOs built from Zod schemas
- `src/search/schemas/*` – Zod schemas for queries and responses
- `src/search/types/*` – `z.infer` based types from schemas
- `nest-cli.json` – Swagger plugin enabled
- `package.json` – scripts and deps

## Troubleshooting

- __400 on missing optional params__: If Swagger shows a field as optional but validation says “required,” ensure the schema uses `.optional()` (not just `.nullable()`).
- __400 invalid type for numeric query params__: Numeric values provided as strings (e.g., `?numItems=24`) will fail with `z.number()`; use `z.coerce.number()` if you want to accept them.
- __Type error with DTOs__: If you see Zod type incompatibility errors for DTOs using `createZodDto`, unify schema imports to `@nest-zod/z`.

## License

MIT License

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
