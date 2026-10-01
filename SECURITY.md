# Security Policy

Security fixes target the current default branch and current release candidates.

Report vulnerabilities privately through GitHub when they could expose user accounts, private property photos, Supabase data, signed URLs, AI-provider credentials, or privileged Edge Function behavior.

Extra review is expected for Auth/RLS policies, private Storage buckets, signed URL generation, account deletion, generation jobs, server-side provider keys, and project ownership checks.

Never commit service-role keys, provider secrets, private photos, or real user data.
