# Enable Demo Mode

To enable demo mode, you need to set the environment variables. Follow these steps:

## Quick Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Create or edit `.env.local` file:**
   ```bash
   # If file doesn't exist, create it
   # If it exists, add these lines to it
   ```

3. **Add these lines to `frontend/.env.local`:**
   ```bash
   DEMO_MODE=true
   NEXT_PUBLIC_DEMO_MODE=true
   ```

4. **Restart your development server:**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart it
   npm run dev
   # or
   pnpm dev
   # or
   yarn dev
   ```

## Verify Demo Mode is Active

After restarting, you should see:
- ✅ A glassy banner at the top: "🔒 You're in Demo Mode — No real data is stored."
- ✅ Console log: "🚀 Running in DEMO MODE" (in server console)
- ✅ Mock data in chats, analytics, and tenant info
- ✅ Authentication actions disabled
- ✅ Upload/write operations disabled

## Disable Demo Mode

To return to normal mode:
1. Set the variables to `false` or remove them:
   ```bash
   DEMO_MODE=false
   NEXT_PUBLIC_DEMO_MODE=false
   ```
2. Restart the development server

## Important Notes

- **Environment variables require a server restart** - Changes to `.env.local` only take effect after restarting the dev server
- **Both variables are needed** - `DEMO_MODE` for server-side, `NEXT_PUBLIC_DEMO_MODE` for client-side
- **`.env.local` is gitignored** - Your local environment variables won't be committed to git

