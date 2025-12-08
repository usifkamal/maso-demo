# Upload & Crawl Feature Setup Guide

This guide will help you set up the file upload and URL crawling functionality in the dashboard.

## Prerequisites

1. Supabase project configured
2. OpenAI API key
3. Both frontend and backend services configured

---

## Step-by-Step Setup

### 1. Create Tenant with API Key

The upload/crawl endpoints require tenant authentication via API key.

**Option A: Using Supabase SQL Editor (Recommended)**

1. Go to your Supabase Dashboard
2. Navigate to: **SQL Editor** → **New Query**
3. Copy and paste this SQL:

```sql
-- Create a tenant with API key
INSERT INTO tenants (name, domain, api_key)
VALUES (
  'Default Tenant',
  'localhost',
  'dev_api_key_' || encode(gen_random_bytes(32), 'hex')
)
ON CONFLICT (domain) DO UPDATE SET
  name = EXCLUDED.name,
  api_key = 'dev_api_key_' || encode(gen_random_bytes(32), 'hex')
RETURNING id, name, domain, api_key, created_at;
```

4. Run the query
5. **Copy the `api_key` from the result** - you'll need it in the next steps

**Option B: Using the seed file**

```bash
cd backend
npx supabase db seed backend/supabase/seed-tenant-api-key.sql
```

Then query for the API key:

```sql
SELECT api_key FROM tenants WHERE domain = 'localhost';
```

---

### 2. Configure Environment Variables

#### **Frontend (`frontend/.env.local`)**

Add these lines to your `frontend/.env.local`:

```env
# Tenant API Key (from Step 1)
NEXT_PUBLIC_TENANT_API_KEY=dev_api_key_YOUR_GENERATED_KEY_HERE

# OpenAI API Key
OPENAI_API_KEY=sk-YOUR_OPENAI_API_KEY_HERE

# GitHub OAuth (optional, set to false if not using)
NEXT_PUBLIC_AUTH_GITHUB=false
```

Your complete `frontend/.env.local` should look like:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://droxpucyskdlgjoxtpsk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Backend URL
BACKEND_URL=http://localhost:3004
NEXT_PUBLIC_BACKEND_URL=http://localhost:3004

# Tenant API Key (REQUIRED for upload/crawl features)
NEXT_PUBLIC_TENANT_API_KEY=dev_api_key_YOUR_GENERATED_KEY_HERE

# OpenAI API Key (REQUIRED for embeddings)
OPENAI_API_KEY=sk-YOUR_OPENAI_API_KEY_HERE

# Authentication
NEXT_PUBLIC_AUTH_GITHUB=false
```

#### **Backend (`backend/.env.local`)**

Add the OpenAI API key to your `backend/.env.local`:

```env
# OpenAI API Key (REQUIRED for embeddings)
OPENAI_API_KEY=sk-YOUR_OPENAI_API_KEY_HERE
```

Your complete `backend/.env.local` should look like:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://droxpucyskdlgjoxtpsk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Backend URL
BACKEND_URL=http://localhost:3004

# OpenAI API Key (REQUIRED for embeddings)
OPENAI_API_KEY=sk-YOUR_OPENAI_API_KEY_HERE
```

---

### 3. Ensure Database Tables Exist

Make sure these tables exist in your Supabase database:

- `tenants` - Stores tenant information and API keys
- `documents` - Stores uploaded/crawled documents
- `document_sections` - Stores document chunks with embeddings

If they don't exist, run the migrations:

```bash
cd backend
npx supabase db reset
# or
npx supabase db push
```

---

### 4. Start Both Services

You need BOTH services running:

**Terminal 1 - Frontend (Port 3000):**
```bash
cd frontend
npm run dev
# or
pnpm dev
```

**Terminal 2 - Backend (Port 3004):**
```bash
cd backend
npm run dev
# or
pnpm dev
```

**Important:** The backend MUST run on port 3004 (or update `NEXT_PUBLIC_BACKEND_URL` if using a different port)

---

### 5. Test the Upload Feature

1. **Sign in** to your account at `http://localhost:3000/sign-in`
2. Navigate to **Dashboard** → **Upload** at `http://localhost:3000/dashboard/upload`
3. Try one of these:

#### **Test URL Crawling:**
- Enter a URL: `https://example.com`
- Click "Crawl"
- You should see: "Successfully ingested X sections from URL"

#### **Test File Upload:**
- Select a PDF, TXT, or DOCX file (max 10MB)
- Click "Upload"
- You should see: "Successfully ingested X sections from file"

---

## Troubleshooting

### Error: "NEXT_PUBLIC_TENANT_API_KEY not configured"

**Solution:** You forgot to add the tenant API key to `frontend/.env.local`

1. Go back to Step 1 and get the API key
2. Add it to `frontend/.env.local` as `NEXT_PUBLIC_TENANT_API_KEY`
3. Restart the frontend dev server

### Error: "Missing or invalid authorization header" (401)

**Solution:** The API key is not being sent or is incorrect

1. Check that `NEXT_PUBLIC_TENANT_API_KEY` is in `frontend/.env.local`
2. Verify the API key matches what's in your Supabase `tenants` table:
   ```sql
   SELECT api_key FROM tenants WHERE domain = 'localhost';
   ```
3. Restart the frontend server after making changes

### Error: "Invalid API key" (401)

**Solution:** The API key doesn't match any tenant in the database

1. Run this query to check your tenant:
   ```sql
   SELECT id, name, domain, api_key FROM tenants WHERE domain = 'localhost';
   ```
2. Copy the `api_key` value
3. Update `NEXT_PUBLIC_TENANT_API_KEY` in `frontend/.env.local`
4. Restart frontend server

### Error: "fetch failed" or "Network error"

**Solution:** The backend service is not running

1. Check if backend is running on port 3004
2. Start backend: `cd backend && npm run dev`
3. Verify backend URL in `frontend/.env.local`: `NEXT_PUBLIC_BACKEND_URL=http://localhost:3004`

### Error: "OpenAI API key missing" or embedding errors

**Solution:** OpenAI API key not configured

1. Get your API key from https://platform.openai.com/api-keys
2. Add to both `frontend/.env.local` and `backend/.env.local`:
   ```env
   OPENAI_API_KEY=sk-YOUR_KEY_HERE
   ```
3. Restart both servers

### Error: "No content found at the provided URL"

**Solution:** The URL might be blocking scrapers or has no content

1. Try a different URL
2. Make sure the URL is publicly accessible
3. Check backend console for detailed error messages

### Error: "Unsupported file type"

**Solution:** Only certain file types are supported

Supported formats:
- PDF (`.pdf`)
- Plain Text (`.txt`)
- Word Documents (`.docx`, `.doc`)

Max file size: 10MB

---

## How It Works

### Architecture

```
User → Frontend Upload Form → Backend API (with API Key) → Process & Store → Supabase
```

1. **Frontend** (`/dashboard/upload`):
   - User uploads file or enters URL
   - Form sends request to backend with `Authorization: Bearer <API_KEY>` header

2. **Backend** (`/api/ingest/*`):
   - Validates API key against `tenants` table
   - Extracts text from file/URL
   - Splits text into chunks
   - Generates embeddings using OpenAI
   - Stores in Supabase (`documents` and `document_sections` tables)

3. **Chat** (when querying):
   - User sends message
   - System finds relevant document sections using vector similarity
   - Passes context to AI for response

### Security

- API keys authenticate tenants
- Each tenant's data is isolated
- File size and type restrictions prevent abuse
- Service role key used server-side only

---

## Next Steps

Once upload is working:

1. **Test Chat with Uploaded Documents:**
   - Go to chat: `http://localhost:3000`
   - Ask questions about your uploaded content
   - The AI should use the document context in responses

2. **View Uploaded Documents:**
   - Check Supabase Dashboard → Table Editor → `documents`
   - View document sections → `document_sections`

3. **Monitor Usage:**
   - Go to `/dashboard/usage` to see usage statistics

---

## Quick Reference

### Required Environment Variables

**Frontend:**
- `NEXT_PUBLIC_SUPABASE_URL` ✓
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓
- `SUPABASE_SERVICE_ROLE_KEY` ✓
- `NEXT_PUBLIC_BACKEND_URL` ✓
- `NEXT_PUBLIC_TENANT_API_KEY` ← **ADD THIS**
- `OPENAI_API_KEY` ← **ADD THIS**
- `NEXT_PUBLIC_AUTH_GITHUB` ← **ADD THIS**

**Backend:**
- `NEXT_PUBLIC_SUPABASE_URL` ✓
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓
- `SUPABASE_SERVICE_ROLE_KEY` ✓
- `OPENAI_API_KEY` ← **ADD THIS**

### Common Commands

```bash
# Start frontend
cd frontend && npm run dev

# Start backend
cd backend && npm run dev

# Check if backend is running
curl http://localhost:3004/api/tenant-example

# Query tenant API key
# (In Supabase SQL Editor)
SELECT api_key FROM tenants WHERE domain = 'localhost';
```

---

## Support

If you're still having issues:

1. Check browser console (F12) for errors
2. Check backend terminal for errors
3. Verify all environment variables are set
4. Ensure both servers are running
5. Verify tenant exists in database

