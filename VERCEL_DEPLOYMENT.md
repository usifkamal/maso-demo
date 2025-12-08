# Vercel Deployment Guide

## Overview

This repository has been restructured from a monorepo (frontend/backend/crawler) into a single unified Next.js application optimized for Vercel deployment.

## Architecture

The build process uses a preparation script (`scripts/prepare_vercel.js`) that:

1. Copies `frontend/app` → root `app/` (all pages, layouts, routes)
2. Merges `backend/app/api` → root `app/api/` (backend API routes)
3. Merges `frontend/components` + `backend/components` → root `components/`
4. Merges `frontend/lib` + `backend/lib` → root `lib/`
5. Copies `frontend/public` → root `public/`
6. Copies `frontend/assets` → root `assets/`
7. Copies `frontend/types` + `backend/types` → root `types/`
8. Copies `frontend/middleware.ts` → root `middleware.ts`
9. Copies `frontend/auth.ts` → root `auth.ts` (if exists)

## Project Structure

```
WhiteLabel-Ai-Chatbot-Platform-MVP-Demo/
├── frontend/              # Source: Frontend application
├── backend/               # Source: Backend API
├── crawler/               # Source: Crawler service (not deployed)
├── scripts/
│   ├── prepare_vercel.js  # Build preparation script (Node.js)
│   └── prepare_vercel.ps1 # Build preparation script (PowerShell - for local dev)
├── package.json           # Root package.json with merged dependencies
├── next.config.js         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── .env.example           # Environment variables template
└── [Generated at build time]
    ├── app/               # ← Generated from frontend/app + backend/app/api
    ├── components/        # ← Generated from frontend/components + backend/components
    ├── lib/               # ← Generated from frontend/lib + backend/lib
    ├── public/            # ← Generated from frontend/public
    ├── assets/            # ← Generated from frontend/assets
    ├── types/             # ← Generated from frontend/types + backend/types
    └── middleware.ts      # ← Generated from frontend/middleware.ts
```

## Local Development

### Prerequisites

- Node.js 18+ or Bun 1.0+
- Supabase account and project

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd WhiteLabel-Ai-Chatbot-Platform-MVP-Demo
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server**
   ```bash
   bun dev
   # or
   npm run dev
   ```
   
   This will:
   - Run `prepare:vercel` script to merge frontend/backend
   - Start Next.js dev server at http://localhost:3000

5. **Build for production (local test)**
   ```bash
   bun run build
   # or
   npm run build
   ```

## Vercel Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Restructure for Vercel deployment"
   git push
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**
   
   In Vercel dashboard, add these environment variables:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will run `bun run build` which executes:
     1. `prepare:vercel` (merges frontend/backend)
     2. `next build` (builds the app)

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts to link your project and deploy.

4. **Add environment variables**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add GOOGLE_GENERATIVE_AI_API_KEY
   ```

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

## Build Process Details

### Build Scripts

The `package.json` contains these key scripts:

```json
{
  "scripts": {
    "prepare:vercel": "node scripts/prepare_vercel.js",
    "dev": "npm run prepare:vercel && next dev",
    "build": "npm run prepare:vercel && next build",
    "start": "next start"
  }
}
```

### What Happens During Build

1. **Preparation Phase** (`prepare:vercel`)
   - Cleans previous generated files
   - Copies and merges frontend/backend code
   - Creates unified structure at root

2. **Build Phase** (`next build`)
   - Type checking disabled (for faster builds)
   - ESLint disabled (for faster builds)
   - Static pages generated where possible
   - API routes compiled as serverless functions

3. **Output**
   - Static pages in `.next/static/`
   - Serverless functions for API routes
   - Edge middleware for authentication

## Environment Variables

### Required Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase Dashboard → Settings → API |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini API key | Google AI Studio |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEMO_MODE` | Enable demo mode (skip auth) | `false` |
| `NEXT_PUBLIC_APP_URL` | Application URL | Auto-detected |

## Troubleshooting

### Build Fails with "powershell: command not found"

**Solution**: Make sure you're using `scripts/prepare_vercel.js` (Node.js version) in `package.json`, not the PowerShell version.

```json
"prepare:vercel": "node scripts/prepare_vercel.js"
```

### TypeScript Errors During Build

The build is configured to skip type checking for faster deployments. If you want to enable it:

```javascript
// next.config.js
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false  // Change to false
  }
};
```

### Environment Variables Not Working

1. Ensure variables are added in Vercel Dashboard
2. Redeploy after adding variables
3. Check variable names match exactly (case-sensitive)

### Pages Not Rendering

Check that:
1. Supabase environment variables are set
2. Middleware is allowing the route (check `middleware.ts`)
3. Check Vercel function logs for errors

## Post-Deployment

### Verify Deployment

1. Check main pages:
   - `/` - Home page
   - `/sign-in` - Sign in page
   - `/dashboard` - Dashboard (requires auth)

2. Check API endpoints:
   - `/api/health` - Health check
   - `/api/chat` - Chat API
   - `/api/tenant-example` - Tenant example

### Set Up Custom Domain

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for DNS propagation (5-60 minutes)

### Monitor Performance

- Use Vercel Analytics to monitor performance
- Check Vercel Function Logs for API errors
- Monitor Supabase usage in Supabase Dashboard

## Development Workflow

### Making Changes

1. Edit files in `frontend/` or `backend/` directories
2. Test locally with `bun dev`
3. Commit and push to trigger Vercel deployment

### Important Notes

- **Do NOT edit** generated files in root `app/`, `components/`, `lib/`, etc.
- **Always edit** source files in `frontend/` or `backend/`
- Generated files are in `.gitignore` and recreated on each build

## Support

For issues related to:
- **Deployment**: Check Vercel documentation or Vercel support
- **Supabase**: Check Supabase documentation
- **Application**: Check repository issues

## Scripts Reference

| Script | Description |
|--------|-------------|
| `bun dev` | Run development server (with hot reload) |
| `bun run build` | Build for production |
| `bun start` | Start production server locally |
| `bun run prepare:vercel` | Manually run prepare script |
| `bun run lint` | Run ESLint |
| `bun run type-check` | Run TypeScript type checking |

## Architecture Decisions

### Why Prepare Script?

Instead of physically moving all files to root permanently, we:
1. Keep original monorepo structure for development
2. Generate unified structure only at build time
3. Allows easy maintenance of separate concerns
4. Reduces merge conflicts

### Why Disable Type Checking?

For faster builds on Vercel (free tier has time limits). Enable locally:
```bash
bun run type-check
```

### Why Node.js Script Instead of PowerShell?

Vercel uses Linux containers, which don't have PowerShell by default. The Node.js script works cross-platform.

## License

[Your License Here]
