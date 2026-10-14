# SpaceFlip Pro — Disposable Guest Deletion Release Test

Status: NOT EXECUTED. This is a release gate, not evidence of a passing test.

## Safety prerequisites
- Use the verified project `fslxwcehapelumttwmcf`; do not use the unrelated inactive `spaceflip` project.
- Confirm the project has no real user data before creating a disposable identity.
- Never upload real property photos or use a production user's session.
- Keep the existing deployed `delete-user-workspace` function unchanged until the test passes in an isolated environment.
- Do not manipulate `storage.objects` directly to simulate uploads or deletions. Use Supabase Storage APIs.
- Verify that the Edge Function requires a valid user JWT, and that only the calling user's `users/{uid}/` prefix is affected.

## Test cases
1. Create two disposable anonymous identities, A and B, using the same guest-auth flow as the app.
2. Upload 125 tiny synthetic JPEG fixtures into A's `users/{uid}/inputs/` prefix, including nested directories. Upload 2 distinct fixtures for B.
3. Create a disposable generation job and project owned by A, if the schema requires it. Do not create actual AI generations.
4. Confirm A can list/access its own objects but not B's, and B cannot access A's.
5. Deploy the candidate function ONLY to an isolated test environment configured with the same Storage policies. Invoke it as A.
6. Verify all 125 A objects are gone, A's project and job rows are gone, and A's Auth identity is removed. Confirm B's objects, records, and identity remain.
7. Retry the same flow with simulated Storage removal failure; function must return failure and preserve A's identity so cleanup can be retried.
8. Check the function response is non-success when no bearer token is supplied, or when a token is invalid.
9. Confirm the function's maximum batch bound is sufficient for the supported guest workspace size; if exceeded, it must fail closed rather than claiming success.
10. Repeat a successful full cleanup on a new disposable user after any fix, then deploy to production with JWT verification enabled.

## Evidence to record
- Tested function version and Git commit SHA
- Test environment/project ID, date, and test account identifiers (do not publish tokens)
- Count of Storage objects before/after for A and B
- Row counts and Auth identity state before/after
- HTTP status and response for success, failure, unauthenticated cases
- Security advisor results and CI run link

## Production gate
Do not mark deletion or Apple review readiness as complete until the above evidence exists. Physical iOS guest/photo/plan/save/reopen/PDF/deletion testing remains a separate gate.
