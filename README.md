# GraphQL Documentation Generator

Automatically fetch GraphQL schemas and generate beautiful documentation.

## Quick Start

1. Install dependencies:
```bash
pnpm install
```

2. Create `.env` file or `cp .example.env .env`:
```env
API=http://api.domain.com/graphql
```

3. Generate docs:
```bash
pnpm start
```

Documentation will be available at `http://localhost:4545`

## Commands

- `pnpm start` - Fetch schema, generate docs, and start server
- `pnpm run get-schema` - Fetch schema from API
- `pnpm run generated:docs` - Generate HTML documentation
- `pnpm run start:docs` - Start local server

## What it does

1. Fetches GraphQL schema via introspection
2. Processes and sorts the schema data
3. Generates HTML documentation using graphdoc
4. Serves docs locally on port 4545

## License

MIT - David Costa
