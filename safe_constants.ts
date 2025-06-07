// safe_constants.ts
// This file CAN be committed to version control, but these files also can be defined in .env files

// This file contains constants that are considered "safe" to be used in the app.
// This means they can be committed to version control without causing issues.
// Unsafe constants should be defined in .env files, which are not committed to version control.
// Examples of unsafe constants include unprotected API keys (like a Supabase master key) and secrets (like a Stripe secret key).
export const SUPABASE_URL = 'https://jmkqqbzjdndmxrtfibsa.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impta3FxYnpqZG5kbXhydGZpYnNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5NTgxNzgsImV4cCI6MjA1ODUzNDE3OH0.Jp71pEwCnSTThtGsW7V9gP6mAPEFipOGWy9sV7hFoYk';
export const SENTRY_DSN =
  'https://809e5a347882a3c34f49745a04466018@o4509084921233408.ingest.us.sentry.io/4509084924641280';
export const POSTHOG_API_KEY =
  'phc_QH8lkxARYc5iCkH2f992nl8EcbOBWeQ7nwo7XlOYfyM';
export const GOOGLE_SIGN_IN_URL_SCHEME =
  'com.googleusercontent.apps.837545270747-ceogif38qd67fhua53ttp5g0hq45vg8i';
export const GOOGLE_SIGN_IN_IOS_CLIENT_ID =
  '837545270747-ceogif38qd67fhua53ttp5g0hq45vg8i.apps.googleusercontent.com';

// Facebook constants
export const FACEBOOK_APP_ID = '1938696366898999';
export const FACEBOOK_CLIENT_TOKEN = '870e81c61564d34b9b71b13155b56e93';

// Change to Superwall
export const SUPERWALL_IOS_KEY =
  'pk_d2c6fffef9269bf986d44f399fdde452d5ae8fcb2d7a776b';
export const SUPERWALL_ANDROID_KEY =
  'pk_f4e5875ecf0124e849be07bbb51d16ea5df8800f95aa183d';
