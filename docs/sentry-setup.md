# Sentry Setup

Use this when the Sentry project has to be recreated from zero.

## 1. Create the Sentry project

Create a new React Native project in the `viral-development-llc` organization, or update the values below if the org or slug changed.

- Organization slug: `viral-development-llc`
- Project slug: `habitsapp`
- URL: `https://sentry.io/`

After creation, copy the DSN from Sentry project settings.

## 2. Create the tokens

You need two auth paths in practice:

- `SENTRY_AUTH_TOKEN` for Expo/EAS sourcemap upload and release creation.
- `SENTRY_ACCESS_TOKEN` for the local stdio MCP server in `.mcp.json`.

For `SENTRY_AUTH_TOKEN`, create an Organization Auth Token from Sentry Developer Settings. Expo documents this token for source map upload.

For `SENTRY_ACCESS_TOKEN`, create a user or personal token with the scopes required by the official Sentry MCP server:

- `org:read`
- `project:read`
- `project:write`
- `team:read`
- `team:write`
- `event:write`

## 3. Populate local env

Create a local `.env` from `.env.example` and fill in:

- `EXPO_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ACCESS_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_URL`

`EXPO_PUBLIC_SENTRY_DSN` is used by the app at runtime.
`SENTRY_AUTH_TOKEN` is used by the Expo plugin and build-time sourcemap upload.
`SENTRY_ACCESS_TOKEN` is used by the local MCP server.

## 4. MCP install

This repo now includes the official Sentry MCP entry in `.mcp.json`:

```json
{
  "mcpServers": {
    "sentry": {
      "command": "npx",
      "args": ["-y", "@sentry/mcp-server@latest"]
    }
  }
}
```

After updating `.env`, restart the MCP client so it picks up `SENTRY_ACCESS_TOKEN`, `EMBEDDED_AGENT_PROVIDER`, and `OPENAI_API_KEY`.

## 5. Verify local tooling

Run:

```bash
npx -y @sentry/mcp-server@latest --help
```

If that works, the package is reachable and the MCP server is installable in this environment.

## 6. Verify app wiring

- Start the app with the new `.env`.
- Force a test error.
- Confirm the event lands in the recreated Sentry project.
- Confirm the event is tagged with the expected `environment`, `release`, and `dist`.

## 7. Verify build-time uploads

For preview and production builds, ensure EAS or CI provides `SENTRY_AUTH_TOKEN` before expecting symbolicated stacks.
