# Authentication Troubleshooting Guide

## Issue: Sign-in Page Redirecting to Home & Login Button Not Responding

### Root Causes

1. **Missing Environment Variable**: `NEXT_PUBLIC_AUTH_GITHUB` was not defined in `.env.local`
2. **Stale Session Cookies**: Old authentication session cookies were causing automatic redirects

---

## Solutions

### 1. Add Missing Environment Variable

Add the following to your `frontend/.env.local` file:

```env
# Authentication Configuration
# Set to 'true' to enable GitHub OAuth login (requires GitHub OAuth app setup)
# Set to 'false' to use email/password only
NEXT_PUBLIC_AUTH_GITHUB=false
```

> **Note**: The GitHub login button only appears when `NEXT_PUBLIC_AUTH_GITHUB=true`. If you want to enable GitHub OAuth:
> 1. Create a GitHub OAuth App at https://github.com/settings/developers
> 2. Set the callback URL to: `http://localhost:3000/api/auth/callback`
> 3. Add your Client ID and Secret to Supabase Auth settings
> 4. Set `NEXT_PUBLIC_AUTH_GITHUB=true` in `.env.local`

### 2. Clear Stale Sessions

**Option A: Use the Clear Session Utility**

Navigate to: `http://localhost:3000/clear-session`

This utility page will:
- Sign you out from Supabase
- Clear all localStorage and sessionStorage
- Provide buttons to navigate to sign-in or home

**Option B: Manual Browser Cleanup**

1. Open Browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Clear:
   - All Cookies for `localhost:3000`
   - Local Storage
   - Session Storage
4. Refresh the page

### 3. Restart Development Server

After making changes to `.env.local`:

```bash
# Stop the current server (Ctrl+C)
cd frontend
pnpm dev
# or
npm run dev
```

---

## Testing Authentication

### Create a Test User

1. Navigate to: `http://localhost:3000/sign-up`
2. Enter an email and password
3. Check your email for confirmation (if email confirmation is enabled)
4. Or check Supabase Dashboard → Authentication → Users to manually confirm

### Test Sign In

1. Clear any existing sessions: `http://localhost:3000/clear-session`
2. Navigate to: `http://localhost:3000/sign-in`
3. Enter your credentials
4. Click "Sign In"
5. You should be redirected to the home page with your session active

### Test Sign Out

1. Once logged in, click your user avatar/menu
2. Select "Log Out"
3. You should be redirected to `/sign-in`

---

## Common Issues & Fixes

### Issue: "Invalid login credentials" error

**Solution**: 
- Verify the user exists in Supabase Dashboard → Authentication → Users
- Check if email confirmation is required
- Ensure password meets requirements (min 6 characters by default)

### Issue: Sign-in page still redirects to home

**Solution**:
1. Use the clear-session utility: `http://localhost:3000/clear-session`
2. Check browser DevTools Console for any auth errors
3. Verify `auth.ts` is getting the correct session state

### Issue: GitHub login button not showing

**Solution**:
- Ensure `NEXT_PUBLIC_AUTH_GITHUB=true` in `.env.local`
- Restart dev server after changing environment variables
- Check browser console for any errors

### Issue: Session persists after sign-out

**Solution**:
- The sign-out function uses `window.location.href` for full page reload
- If sessions still persist, use the clear-session utility
- Check for multiple browser tabs that might be sharing session state

---

## Development Tips

### Quick Session Reset

Bookmark this URL for quick session clearing during development:
```
http://localhost:3000/clear-session
```

### Environment Variables Checklist

Required variables in `frontend/.env.local`:
- ✓ `NEXT_PUBLIC_SUPABASE_URL`
- ✓ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✓ `SUPABASE_SERVICE_ROLE_KEY`
- ✓ `NEXT_PUBLIC_AUTH_GITHUB` (set to 'true' or 'false')

### Debug Auth State

Check the browser console when navigating to pages. The auth system logs:
```
Auth check - has session: true/false, user: user@example.com
```

### Middleware Behavior

The middleware (`frontend/middleware.ts`):
- Redirects unauthenticated users to `/sign-in` for protected routes
- Allows access to `/sign-in`, `/sign-up`, and `/api/auth/*` without authentication
- Refreshes session on each request

---

## Architecture Overview

### Authentication Flow

1. **Sign Up**: 
   - User submits email/password → Supabase creates account
   - Confirmation email sent (if enabled)
   - User can sign in after confirmation

2. **Sign In**:
   - User submits credentials → Supabase validates
   - Session cookie set → Middleware allows access
   - Redirected to home page

3. **Protected Routes**:
   - Middleware checks session on each request
   - No session → Redirect to `/sign-in`
   - Valid session → Allow access

4. **Sign Out**:
   - Supabase clears session
   - Full page reload to clear state
   - Redirect to `/sign-in`

### Key Files

- `frontend/app/sign-in/page.tsx` - Sign-in page component
- `frontend/app/sign-up/page.tsx` - Sign-up page component
- `frontend/components/login-form.tsx` - Email/password form
- `frontend/components/login-button.tsx` - GitHub OAuth button
- `frontend/middleware.ts` - Route protection
- `frontend/auth.ts` - Session helper
- `frontend/app/clear-session/page.tsx` - Session clearing utility

---

## Support

If issues persist:
1. Check Supabase logs in the dashboard
2. Verify environment variables are loaded (check `process.env` in browser console)
3. Ensure Supabase project is active and not paused
4. Check network tab in DevTools for API errors

