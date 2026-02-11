# Specification

## Summary
**Goal:** Fix the invalid production domain slug and deploy the app as a live/public build.

**Planned changes:**
- Update production deployment configuration to use a valid domain slug (5–50 characters; letters/numbers/hyphens only; no ':' or other symbols).
- Run a production/live deployment and verify it completes without the previous domain validation error.
- Confirm the public build loads the login page at `/` and supports the existing post-login flow (Details -> Upload -> Confirmation).

**User-visible outcome:** A publicly accessible live app that opens to the login page at the root route and works through the existing onboarding flow after login.
