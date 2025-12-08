# Demo Mode Implementation

This document describes the demo mode feature that allows the application to run in a read-only, mock data mode for demonstrations.

## Overview

Demo mode is controlled by the `DEMO_MODE` environment variable. When set to `'true'`, the application:
- Disables all authentication actions (sign up, sign in, sign out)
- Prevents writes to Supabase (files, URLs, docs, chats)
- Returns mock data for tenants, chats, and analytics
- Displays a "Demo Mode Enabled" banner on all pages
- Still allows UI navigation and fake interactions (no errors)

## Environment Variables

### Server-side (API routes, server actions)
- `DEMO_MODE=true` - Enables demo mode on the server

### Client-side (React components)
- `NEXT_PUBLIC_DEMO_MODE=true` - Enables demo mode on the client

**Note:** For full demo mode functionality, set both variables to `'true'`.

## Usage

### Local Development

Add to your `.env.local`:
```bash
DEMO_MODE=true
NEXT_PUBLIC_DEMO_MODE=true
```

### Vercel Deployment

Add to your Vercel environment variables:
- `DEMO_MODE` = `true`
- `NEXT_PUBLIC_DEMO_MODE` = `true`

## Features

### Mock Data

The following mock data is provided:
- **Tenant**: Demo Business (demo-tenant-1)
- **Chats**: 2 pre-seeded demo chat sessions
- **Analytics**: Generated mock analytics data for the last 30 days
- **Documents**: 3 sample documents

### Disabled Features

In demo mode, the following actions are disabled:
- Sign up / Sign in
- Sign out
- File uploads
- URL crawling
- Chat deletion
- Settings updates
- Any database writes

### Enabled Features

The following features still work (with mock data):
- Viewing chats
- Chatting with AI (returns mock responses)
- Viewing analytics
- Navigating the UI
- Viewing tenant/widget settings

## Implementation Details

### Files Modified

1. **`lib/env.ts`** - Utility function to check demo mode status
2. **`lib/demo.ts`** - Mock data definitions
3. **`app/api/chat/route.ts`** - Returns mock AI responses
4. **`app/api/analytics/route.ts`** - Returns mock analytics
5. **`app/api/tenant/[botId]/route.ts`** - Returns mock tenant data
6. **`app/actions.ts`** - Server actions return mock data or skip writes
7. **`components/login-form.tsx`** - Disables authentication
8. **`components/logout-button.tsx`** - Disables logout
9. **`components/dashboard/Navbar.tsx`** - Disables logout
10. **`components/user-menu.tsx`** - Disables logout
11. **`app/dashboard/upload/upload-form.tsx`** - Disables uploads
12. **`app/dashboard/onboarding/page.tsx`** - Disables onboarding writes
13. **`components/demo-banner.tsx`** - Displays demo mode banner
14. **`app/layout.tsx`** - Includes demo banner

### Console Logging

When demo mode is enabled, the server logs:
```
🚀 Running in DEMO MODE
```

This appears in the server console on application startup.

## Testing

### Test Demo Mode
1. Set `DEMO_MODE=true` and `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local`
2. Restart the development server
3. Verify the demo banner appears at the top
4. Try to sign in/up - should show error message
5. Try to upload a file - should show "Demo mode — no writes allowed"
6. Try to chat - should return mock responses
7. Check analytics - should show mock data

### Test Normal Mode
1. Remove or set `DEMO_MODE=false` and `NEXT_PUBLIC_DEMO_MODE=false`
2. Restart the development server
3. Verify no demo banner appears
4. All features should work normally

## Build Verification

The application builds successfully with and without demo mode enabled. The demo mode checks are runtime-only and don't affect the build process.

## Notes

- Demo mode does not modify production `.env.local` files
- Demo mode does not break normal mode when disabled
- All demo mode checks are conditional and don't affect performance when disabled
- Mock data is static and doesn't persist between sessions

