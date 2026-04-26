# Sentry Rollout Checklist

Bootstrap from zero:
- Follow [docs/sentry-setup.md](/Users/tsotnebukiya/Desktop/Projects/habitsapp/docs/sentry-setup.md) first if the Sentry project or token has been deleted.

## Runtime expectations

- Navigation tracing is enabled through the registered React Navigation integration.
- Sentry `environment` comes from Expo `extra.appVariant`.
- Sentry `release` format is:
  - `<applicationId>@<appVersion>+<buildNumber>`
- Sampling:
  - `development`: `1.0`
  - preview or internal variants: `0.5`
  - `production`: `0.2`

## Sourcemap verification

Before trusting preview or production stack traces, verify the build environment actually has the Sentry auth secret required by the Expo plugin upload step.

1. Confirm EAS or CI exposes `SENTRY_AUTH_TOKEN` for the preview and production pipelines.
2. Trigger one preview validation build and one production validation build.
3. Force a test error on each build and confirm:
   - the event lands in the correct Sentry `environment`
   - the event is tagged with the expected `release` and `dist`
   - the stack trace is symbolicated

If `SENTRY_AUTH_TOKEN` is missing, expect unsigned sourcemap uploads and unsymbolicated production stacks even though the plugin configuration is present in the repo.
