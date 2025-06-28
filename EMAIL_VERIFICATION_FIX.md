# Email Verification Redirect Fix

## The Issue

You're getting redirected to the auth error page instead of the verified page after clicking the email verification link. This is typically caused by incorrect Supabase email template configuration.

## Solution Steps

### 1. Check Supabase Dashboard Settings

Go to your Supabase Dashboard → Authentication → Email Templates → Confirm signup

Make sure the **Confirm signup template** has the correct redirect URL:

```html
<!-- The confirmation URL should be: -->
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}
```

### 2. Verify Redirect URLs in Supabase

Go to Authentication → URL Configuration and ensure these URLs are added:

**For Production:**
- `https://myticketingsysem.site/auth/callback`
- `https://myticketingsysem.site/auth/verified`
- `https://*.myticketingsysem.site/auth/callback`
- `https://*.myticketingsysem.site/auth/verified`

**For Development:**
- `http://localhost:3000/auth/callback`
- `http://localhost:3000/auth/verified`

### 3. Check Site URL

In Authentication → Settings, verify your **Site URL** is set to:
- Production: `https://myticketingsysem.site`
- Development: `http://localhost:3000`

### 4. Fix Email Template (if needed)

If your email template is different, it should look like this:

```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/auth/verified">Confirm your email</a></p>
```

### 5. Test the Flow

1. Sign up with a new email
2. Check the verification email
3. Click the link in the email
4. You should be redirected to `/auth/verified` instead of the error page

### 6. Debug Info

I've added debug logging to the auth callback. Check your server logs when clicking the email link to see:
- What URL is being accessed
- Whether the code parameter is present
- What error (if any) occurs during session exchange

## Common Issues

1. **Wrong token_hash parameter**: Make sure the email template uses `{{ .TokenHash }}` not `{{ .Token }}`
2. **Wrong type parameter**: Should be `type=email` for email verification
3. **Missing callback URL**: The email link should go to `/auth/callback`, not directly to `/auth/verified`
4. **CORS issues**: Make sure all your domains are added to the redirect URLs list

## Expected Flow

1. User clicks email link → `/auth/callback?token_hash=...&type=email`
2. Callback exchanges the token for a session
3. Callback redirects to `/auth/verified`
4. Verified page shows success message
