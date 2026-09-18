# SignOnline — custom-domain deployment

Target: `https://signonline.rebeccayener.com`

Status: source prepared; no hosting resources have been created and DNS has not been changed. Do not announce the app as live until hosted authentication, uploads, participant isolation, and HTTPS have been verified.

## Hosting

This is a server application, not a GitHub Pages website. Use Cloudflare Pages advanced mode with a D1 database and a private R2 bucket. Keep Rebecca's existing GitHub Pages website and Porkbun nameservers.

Create a Cloudflare account and a Pages project connected to `High4Ferrum/Rebeccashub`. Select branch `signonline-app` and root directory `_apps/signonline`. Build command: `npm run build:pages`. Output directory: `pages-dist`. Use Node 22 or newer. Set the runtime compatibility date to `2026-05-15` and compatibility flag `nodejs_compat`. Do not set NODE_ENV to development in production.

Create a D1 database and bind it as `DB`. Apply the committed SQL migrations in `drizzle/` once, in order, before serving requests. Create an R2 bucket and bind it as `BUCKET`; keep public access disabled. Do not use the local placeholder database ID in production. Redeploy after changing bindings or runtime variables. R2 activation may require billing details; the account owner must review applicable charges.

## Sign-in

The original local preview identity is not trusted in production. Production uses the OpenID Connect authorization-code flow with PKCE, state, nonce, signed identity-token verification, and eight-hour Secure/HttpOnly sessions.

Configure a Google OAuth web client, or another compatible OpenID Connect provider that returns a verified email. For Google, use issuer `https://accounts.google.com`, scopes `openid email profile`, and authorized redirect URI `https://signonline.rebeccayener.com/auth/callback`. Configure the consent screen and authorized test users during testing; review the provider's publishing requirements before inviting clients.

Set these runtime variables in Pages:

- `APP_ORIGIN`: `https://signonline.rebeccayener.com`
- `OIDC_ISSUER`: the exact issuer URL, without an extra trailing slash
- `OIDC_CLIENT_ID`: provider-issued client ID
- `WORKSPACE_OWNER_EMAIL`: Rebecca's verified sign-in email; only this user may create transactions

Set these as encrypted secrets, never commit them:

- `OIDC_CLIENT_SECRET`: provider-issued client secret
- `AUTH_SESSION_SECRET`: a randomly generated secret with at least 32 bytes of entropy

Sign-in fails closed until configured. Buyers, sellers, and agents must sign in with the exact verified email added to a transaction. New identities cannot read someone else's transactions. No production test data or customer documents are included in this repository.

## Connect Porkbun

First add `signonline.rebeccayener.com` under the Pages project's Custom domains. Cloudflare will show the assigned `<project>.pages.dev` target. Do not guess that target before the project exists.

At Porkbun, replace only the `signonline` CNAME (currently observed pointing to `uixie.porkbun.com`) with that exact Pages target. Leave the apex, www, mail, and other records unchanged. Wait for domain verification and the HTTPS certificate to become active.

Cloudflare Pages supports subdomains on external DNS: https://developers.cloudflare.com/pages/configuration/custom-domains/

## Release verification

1. Verify HTTPS and a real provider login on the custom domain.
2. Create an owner transaction and upload a test-only PDF.
3. Invite a second test email; confirm it can see only its assigned transaction.
4. Place text, date, checkbox, initials, and signature fields; complete them as the correct signers.
5. Download the completed PDF and visually compare all field positions.
6. Confirm forged identity headers, expired sessions, and uninvited identities cannot access documents.
7. Add a SignOnline link to the main website's Real Estate page after verification.

## Current limits

- Email invitations open a draft in the user's email client. Automatic invitation and completed-copy delivery require a connected email service.
- Signatures are typed entries with per-field timestamps and an activity log. This implementation is not a certified signature service, cryptographic PDF-signing system, or verified compliance solution.
- PDF uploads only; 15 MB per file. The field editor has not received visual browser QA because local browser access was declined.
- Live OAuth and Cloudflare account integration cannot be verified until the accounts are configured.

## Local development

Run `npm ci`, `npm run dev`, and open the printed local address. The local preview sign-in simulates a test user only in development. Build with `npm run build:pages`. D1 migrations are under `drizzle/`; local D1/R2 data is ignored and never deployed.
