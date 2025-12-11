# 🧪 Quick Widget Testing Guide

## ⚡ 3-Step Quick Test

### Step 1: Get Your Tenant ID

**Option A: From Dashboard Widget Page** (Easiest)
1. Go to: `http://localhost:3000/dashboard/widget`
2. Copy the tenant ID from the embed code preview
3. It looks like: `f8aa1a1a-436c-4faf-8807-2f341d16b38d`

**Option B: From Dashboard Profile Page**
1. Go to: `http://localhost:3000/dashboard/profile`
2. Copy the "Tenant ID" shown at the top

### Step 2: Update Test File

1. Open: `frontend/public/widget-test.html`
2. Find line ~210 (the script tag)
3. Replace `YOUR_TENANT_ID` with your actual tenant ID:
   ```html
   <script 
     src="http://localhost:3000/embed.js?v=1.0.0" 
     data-bot-id="f8aa1a1a-436c-4faf-8807-2f341d16b38d"  <!-- YOUR ID HERE -->
     ...
   ></script>
   ```

### Step 3: Open Test File

1. Navigate to: `http://localhost:3000/widget-test.html`
2. Or open the file directly: Double-click `widget-test.html`
3. You should see the chat button appear!

---

## 🔧 If You Get "Tenant Not Found"

### Create Tenant via Supabase Dashboard

1. **Open Supabase Dashboard** → SQL Editor
2. **Run this SQL** (replace with YOUR tenant ID):

```sql
-- Ensure columns exist
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE;

-- Create your tenant (REPLACE THE UUID BELOW)
INSERT INTO public.tenants (
  id, name, api_key, settings, is_onboarded
)
VALUES (
  'f8aa1a1a-436c-4faf-8807-2f341d16b38d', -- YOUR TENANT ID
  'My Test Tenant',
  'api_key_' || gen_random_uuid()::text,
  '{"primaryColor": "#4F46E5", "position": "bottom-right", "buttonText": "💬", "greeting": "Hello! How can I help you today?"}'::jsonb,
  false
)
ON CONFLICT (id) DO UPDATE SET
  name = COALESCE(EXCLUDED.name, tenants.name),
  settings = COALESCE(EXCLUDED.settings, tenants.settings);
```

3. **Verify** it was created:
```sql
SELECT id, name, settings FROM public.tenants WHERE id = 'f8aa1a1a-436c-4faf-8807-2f341d16b38d';
```

4. **Refresh** your test page - widget should work!

---

## ✅ Testing Checklist

Once the widget loads:

- [ ] Widget button appears (bottom-right corner)
- [ ] Button has your configured color (#4F46E5)
- [ ] Click button → Chat iframe opens
- [ ] Greeting message displays
- [ ] Can type and send a message
- [ ] AI responds (if documents uploaded)
- [ ] ESC key closes chat
- [ ] ✕ button closes chat
- [ ] No errors in browser console (F12)

---

## 🐛 Common Issues

**Error: "invalid input syntax for type uuid"**
- ✅ Fix: Replace `YOUR_TENANT_ID` in the script tag with actual UUID

**Error: "Tenant not found" (404)**
- ✅ Fix: Create tenant using SQL above

**Widget button doesn't appear**
- ✅ Check browser console for errors
- ✅ Verify frontend is running on port 3000
- ✅ Check Network tab → `/api/tenant/[id]` should return 200

**Chat doesn't open**
- ✅ Check iframe in DevTools → Elements
- ✅ Verify `/embed/[id]` works when opened directly

---

## 📊 Expected Network Requests

Open DevTools → Network tab → Filter by "Fetch/XHR":

1. `GET /api/tenant/[your-tenant-id]` → 200 OK
2. `GET /embed/[your-tenant-id]` → 200 OK (when chat opens)
3. `POST /api/chat` → 200 OK (when sending message)

All should return 200 status codes!

---

## 🎯 Quick Test Script

Want to test programmatically? Open browser console and run:

```javascript
// Check if widget loaded
const widget = document.getElementById('chat-widget-container');
const button = document.getElementById('chat-widget-toggle');
console.log('Widget:', widget ? '✅ Loaded' : '❌ Not found');
console.log('Button:', button ? '✅ Loaded' : '❌ Not found');

// Open widget
if (button) button.click();

// Check API
fetch('/api/tenant/f8aa1a1a-436c-4faf-8807-2f341d16b38d')
  .then(r => r.json())
  .then(d => console.log('Tenant Config:', d));
```

---

**Need more help?** See `docs/WIDGET-TESTING-GUIDE.md` for comprehensive testing instructions.






