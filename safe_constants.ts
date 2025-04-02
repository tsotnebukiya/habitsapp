// safe_constants.ts
// This file CAN be committed to version control, but these files also can be defined in .env files

// This file contains constants that are considered "safe" to be used in the app.
// This means they can be committed to version control without causing issues.
// Unsafe constants should be defined in .env files, which are not committed to version control.
// Examples of unsafe constants include unprotected API keys (like a Supabase master key) and secrets (like a Stripe secret key).
export const SUPABASE_URL=""
export const SUPABASE_ANON_KEY=""
export const SENTRY_DSN="SENTRY_DSN"
export const POSTHOG_API_KEY=""
export const GOOGLE_SIGN_IN_URL_SCHEME="com.googleusercontent.apps.XXXXX"
export const GOOGLE_SIGN_IN_IOS_CLIENT_ID="<IOS_CLIENT_ID>.apps.googleusercontent.com"
export const REVENUECAT_IOS_KEY = "";
export const REVENUECAT_ANDROID_KEY = "";
