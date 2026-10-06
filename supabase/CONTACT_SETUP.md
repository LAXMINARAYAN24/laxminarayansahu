# Portfolio database and notifications

## Status

Project: **portfolio-contact**, Mumbai, organization **LAXMINARAYAN24**.
Project reference: `chfwwlkdkzwvqtajsmby`.

The local `.env` is connected. Validated messages save in `public.contact_messages`; public reads and edits are blocked. The notification function and database INSERT webhook are deployed. Its authentication secret is stored in Vault and Edge Function secrets, not in migration files.

**Email delivery is pending a Resend API key.** The webhook reaches the function, which currently returns HTTP 500 because the provider key is missing. Messages still save. Failed notifications are not automatically retried.

## Finish Resend setup

1. Create a [Resend account](https://resend.com/signup) using `sahulucky2411@gmail.com` and verify the email.
2. Open [API Keys](https://resend.com/api-keys). Create a key named `portfolio-contact` with **Sending access**.
3. Open [Supabase secrets](https://supabase.com/dashboard/project/chfwwlkdkzwvqtajsmby/functions/secrets). Add `RESEND_API_KEY` with that key and save. Keep it out of chat, Git, and all `VITE_` variables.
4. The configured sender `onboarding@resend.dev` is for testing and sends only to your Resend account email. For production, [verify a domain](https://resend.com/domains) with the provided DNS records and change the Supabase `NOTIFY_FROM_EMAIL` secret to an address on that domain.
5. Submit a NEW message from the portfolio and verify both the saved row and the email, including Spam. Check the function and Resend logs if delivery fails. Earlier messages are not emailed automatically after adding the key.

The recipient `NOTIFY_TO_EMAIL` is already set to `sahulucky2411@gmail.com`. The other secrets are configured. `.env.notifications.local` contains a local webhook secret backup and is ignored by Git. Rotating it requires updating both the function secret and Vault entry `portfolio_contact_webhook_secret`.

## View messages

Open [Table Editor](https://supabase.com/dashboard/project/chfwwlkdkzwvqtajsmby/editor), select **contact_messages**, and sort `created_at` newest first. Two labeled setup-test messages were left as verification evidence.

## Deploy when you are ready

1. In your hosting provider's environment settings, replace `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` with the exact values in `.env.example`. They are public frontend settings.
2. Commit the source, `.env.example`, Supabase configuration, migrations, and this guide. Do not commit `.env`, `.env.notifications.local`, `supabase/.temp`, or `node_modules`.
3. Push when ready. Netlify build command: `npm run build`; publish directory: `dist`. Rebuild after changing settings because Vite embeds them at build time.
4. Test the deployed form and confirm its message appears in this new database.

Nothing has been pushed or deployed to your frontend host. The published site keeps using its old settings until rebuilt.

## Migration history and old messages

Active migration filenames match this project's applied history. Old migrations are preserved in `legacy-migrations` and must not be applied to this project: they describe the previous profile/admin system.

The old project `rmoqcjdlvwwauftszucw` and your separate `my-first-db` were not modified. Existing messages were not copied. Export them from the original owner's account if access is recovered.

## Verification

- Valid submission: HTTP 201; saved row checked in the new database.
- Public read/update: HTTP 401.
- Invalid short message: rejected by row policy.
- Unauthenticated notification request: HTTP 401.
- Database webhook reaches the function; email provider key still missing.
- Supabase security advisor: no findings after schema and trigger setup.

## References

- [Supabase database webhooks](https://supabase.com/docs/guides/database/webhooks)
- [Resend API keys](https://resend.com/docs/dashboard/api-keys/introduction)
- [Resend test sender restrictions](https://resend.com/docs/knowledge-base/403-error-resend-dev-domain)
