# Quick Fix: Upload Feature Not Working

## ✅ What I Fixed

1. **Updated upload form** to send Authorization header with API key
2. **Added better error handling** to show detailed error messages
3. **Created SQL script** to generate tenant with API key
4. **Created comprehensive setup guide** with step-by-step instructions

---

## 🚀 What You Need to Do Now

Follow these steps in order:

### Step 1: Create Tenant & Get API Key

1. Open Supabase Dashboard → **SQL Editor**
2. Run this SQL query:

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

3. **COPY the `api_key` value from the result** (looks like: `dev_api_key_abc123...`)

### Step 2: Add Environment Variables

**Add to `frontend/.env.local`:**

```env
# Tenant API Key (paste the key from Step 1)
NEXT_PUBLIC_TENANT_API_KEY=dev_api_key_YOUR_KEY_HERE

# OpenAI API Key (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-YOUR_OPENAI_KEY_HERE

# GitHub OAuth (optional)
NEXT_PUBLIC_AUTH_GITHUB=false
```

**Add to `backend/.env.local`:**

```env
# OpenAI API Key (same as above)
OPENAI_API_KEY=sk-YOUR_OPENAI_KEY_HERE
```

### Step 3: Start Backend Service

The backend MUST be running on port 3004 for uploads to work.

Open a NEW terminal:

```bash
cd backend
npm install  # if you haven't already
npm run dev
```

You should see:
```
▲ Next.js 15.x.x
- Local:        http://localhost:3004
```

### Step 4: Restart Frontend

In your existing frontend terminal:

```bash
# Press Ctrl+C to stop
cd frontend
npm run dev
```

### Step 5: Test Upload

1. Go to: `http://localhost:3000/sign-in`
2. Sign in with your account
3. Navigate to: `http://localhost:3000/dashboard/upload`
4. Try uploading a PDF or pasting a URL

---

## 📋 Checklist

Before testing, verify:

- [ ] Tenant created in Supabase (check `tenants` table)
- [ ] `NEXT_PUBLIC_TENANT_API_KEY` added to `frontend/.env.local`
- [ ] `OPENAI_API_KEY` added to both `.env.local` files
- [ ] Backend running on port 3004
- [ ] Frontend running on port 3000
- [ ] Signed in to the frontend
- [ ] You're on `/dashboard/upload` page

---

## ❌ Common Errors & Solutions

### "NEXT_PUBLIC_TENANT_API_KEY not configured"

**Problem:** Environment variable missing

**Solution:**
```bash
# Add to frontend/.env.local
NEXT_PUBLIC_TENANT_API_KEY=dev_api_key_YOUR_KEY_FROM_STEP1
```

Then restart frontend server.

### "Missing or invalid authorization header" (401)

**Problem:** API key not being sent or is wrong

**Solution:**
1. Check the API key in Supabase:
   ```sql
   SELECT api_key FROM tenants WHERE domain = 'localhost';
   ```
2. Make sure it matches `NEXT_PUBLIC_TENANT_API_KEY` in `frontend/.env.local`
3. Restart frontend

### "fetch failed" or "Network error"

**Problem:** Backend not running

**Solution:**
```bash
# In a NEW terminal
cd backend
npm run dev
```

Backend must be on port 3004 (check terminal output).

### "Invalid API key" (401)

**Problem:** API key doesn't match database

**Solution:**
1. Get the correct key from Supabase:
   ```sql
   SELECT api_key FROM tenants WHERE domain = 'localhost';
   ```
2. Update `frontend/.env.local`
3. Restart frontend

---

## 🔍 How to Check if Everything is Working

### Check 1: Backend is running

Open: http://localhost:3004

You should NOT get a connection error (might get a route not found, that's OK).

### Check 2: Tenant exists

In Supabase SQL Editor:

```sql
SELECT * FROM tenants WHERE domain = 'localhost';
```

Should return 1 row with an `api_key`.

### Check 3: Environment variables loaded

On `/dashboard/upload`, open browser console (F12):

```javascript
console.log(process.env.NEXT_PUBLIC_TENANT_API_KEY)
```

Should show your API key (not undefined).

### Check 4: Upload test

Try uploading a file or URL. You should see:
- "Uploading file..." or "Crawling URL..."
- Then: "Successfully ingested X sections..."

If you see an error, it will show detailed message.

---

## 📚 Full Documentation

For complete setup guide: See `docs/SETUP-UPLOAD-FEATURE.md`

For troubleshooting auth issues: See `docs/TROUBLESHOOTING-AUTH.md`

---

## 🆘 Still Not Working?

1. Check browser console (F12 → Console tab)
2. Check backend terminal for errors
3. Share the error messages you see

Common issues:
- OpenAI API key missing → Add to both .env.local files
- Backend not running → Start with `cd backend && npm run dev`
- Wrong API key → Re-run SQL query and update .env.local
- Wrong port → Backend must be on 3004

