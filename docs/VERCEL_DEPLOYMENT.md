# Vercel Deployment Guide

This guide explains how to deploy the backend service to Vercel from this monorepo.

## Quick Setup (Easiest Method)

### Step 1: Import Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository: `usifkamal/WhiteLabel-Ai-Chatbot-Platform-MVP-Demo`

### Step 2: Configure Project Settings

In the project settings, set:

- **Root Directory**: Leave as `.` (root) - **DO NOT change this**
- **Framework Preset**: Next.js (auto-detected)
- **Build Command**: Leave empty (handled by `vercel.json`)
- **Output Directory**: Leave empty (handled by `vercel.json`)
- **Install Command**: Leave empty (handled by `vercel.json`)

**Important**: The `vercel.json` file in the root already handles everything automatically. You don't need to set any custom commands!

### Step 3: Add Environment Variables

Click **"Environment Variables"** and add:

- `NEXT_PUBLIC_SUPABASE_URL` = your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` = your Supabase service role key
- `GEMINI_API_KEY` = your Gemini API key (optional, for embeddings)
- `OPENAI_API_KEY` = your OpenAI API key (optional, for chat)
- `NEXT_TELEMETRY_DISABLED` = `1`

### Step 4: Deploy

Click **"Deploy"** and wait for the build to complete!

---

## Alternative Method (If you prefer manual configuration)

If you want to set Root Directory to `backend` instead:

1. **Root Directory**: Set to `backend`
2. **Install Command**: `cd .. && pnpm install` (goes up one level to monorepo root)
3. **Build Command**: Leave empty (auto-detected)
4. **Output Directory**: Leave empty (auto-detected)

**Note**: The `vercel.json` method above is simpler and recommended.

## Troubleshooting

### Error: "Cannot find module 'next/dist/compiled/next-server/server.runtime.prod.js'"

This error typically occurs when:
1. Dependencies aren't installed correctly
2. The build is running from the wrong directory
3. Next.js installation is incomplete

**Solution**: 
- Ensure Root Directory is set to `backend` in Vercel project settings
- Ensure Install Command installs from monorepo root: `cd ../.. && pnpm install`
- Check that `pnpm-lock.yaml` is committed to the repository

### Build Fails with "Module not found"

If you see module resolution errors:
- Make sure all workspace dependencies are installed
- Verify `pnpm-workspace.yaml` is in the repository root
- Check that `package.json` files in both root and backend are correct

## Notes

- The `outputFileTracingRoot` in `backend/next.config.js` is only used for Docker builds, not Vercel
- Vercel automatically handles Next.js optimizations
- For production, ensure all environment variables are set in Vercel dashboard

