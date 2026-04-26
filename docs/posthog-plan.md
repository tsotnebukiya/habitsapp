# HabitsLab PostHog Rollout

## Current state

- PostHog project: `HabitsLab`
- PostHog host: `https://us.i.posthog.com`
- Project API key is wired in `safe_constants.ts`
- Experiment `368449` (`Onboarding Variant v1`) remains in `DRAFT`
- The app now sends `app_env` from Expo `extra.appVariant`, not only `__DEV__`

## Onboarding contract

- Common onboarding flow:
  - `intro`
  - `wizard`
  - `commitment`
  - `login`
  - `notifications`
  - first in-app activation
- Variants only change the wizard body:
  - `control` -> local `standard`
  - `quick` -> `quick`
  - `preview` -> `preview`
  - `complete` -> `complete`
- Recovery state is stored separately from analytics milestones:
  - `resumeRoute` drives signed-out recovery
  - `completedAt` remains the wizard completion milestone timestamp
- Intro renders immediately on cold signed-out launch
- Intro and wizard analytics still wait for flag resolution or fallback control

## Shared properties

- App-level properties registered on the client:
  - `platform`
  - `app_version`
  - `build_number`
  - `app_env`
- Onboarding events additionally include:
  - `onboarding_session_id`
  - `onboarding_variant`
  - `experiment_variant`
  - `onboarding_flow_version`
  - `preferred_language` when available

## Event surface

- Onboarding:
  - `onboarding_variant_exposed`
  - `onboarding_variant_fallback_used`
  - `intro_viewed`
  - `intro_completed`
  - `onboarding_started`
  - `onboarding_step_completed`
  - `onboarding_step_previous`
  - `onboarding_question_answered`
  - `onboarding_completed`
  - `commitment_screen_viewed`
  - `commitment_completed`
  - `login_screen_viewed`
  - `user_authenticated`
  - `notifications_screen_viewed`
  - `notifications_setup_completed`
- Premium intent and paywalls:
  - `premium_feature_access_attempted`
  - `onboarding_paywall_presented`
  - `onboarding_paywall_dismissed`
  - `onboarding_paywall_skipped`
  - `onboarding_paywall_error`
  - `paywall_presented`
  - `paywall_dismissed`
  - `paywall_skipped`
  - `paywall_error`
- Subscription lifecycle:
  - `subscription_status_changed`
  - `subscription_activated`
  - `subscription_deactivated`
  - `subscription_activated` may now include:
    - `conversion_paywall_placement`
    - `conversion_paywall_variant_id`
    - `conversion_entrypoint`
    - `seconds_since_paywall_presented`
- Habit creation funnel:
  - `habit_creation_started`
  - `habit_category_selected`
  - `habit_template_selected`
  - `habit_custom_selected`
  - `habit_creation_cancelled`
  - `habit_created`
- Habit lifecycle:
  - `habit_progress_started`
  - `habit_completed`
  - `habit_skipped`
  - `habit_updated`
  - `habit_deleted`
- Notifications:
  - `notification_preference_changed`
  - `notification_permission_result`
  - `notification_received`
  - `notification_opened`
- Retention and churn:
  - `achievement_unlocked`
  - `review_prompt_requested`
  - `sign_out_confirmed`
  - `account_deletion_requested`
  - `account_deleted`

## Experiment metrics

- Primary metric:
  - `habit_created`
- Secondary metrics:
  - `user_authenticated`
  - `notifications_setup_completed`
  - `subscription_activated`

## Rollout order

1. Ship the app-side instrumentation and verify:
   - signed-out cold launch renders intro immediately
   - onboarding resumes from `resumeRoute`
   - tab revisits emit focus-based screen events
   - paywall events and subscription attribution appear with the expected context
2. Wait for the first real end-to-end events to land in `HabitsLab`.
3. After first ingestion, attach experiment metrics to experiment `368449`.
4. Build dashboards:
   - onboarding command center
   - premium/paywall performance
   - activation and retention
   - notifications and churn
5. Launch the experiment only after:
   - the in-app flag resolves correctly
   - metrics are attached
   - a real onboarding smoke run is visible in PostHog

## Status

- App-side rollout: ready for validation
- Experiment launch: blocked on first real ingestion into `HabitsLab`
- Experiment status before ingestion: `DRAFT`
