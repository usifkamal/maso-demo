# Widget Embed Testing Guide

Complete step-by-step guide to test the chat widget embed functionality.

## 🎯 Quick Start

1. **Get Your Tenant ID**
2. **Update Test File**
3. **Open in Browser**
4. **Test Widget Functionality**

---

## Step 1: Get Your Tenant ID

### Option A: From Dashboard Widget Page
1. Start the frontend: `cd frontend && pnpm dev`
2. Navigate to: `http://localhost:3000/dashboard/widget`
3. Sign in if needed
4. Your tenant ID is shown in the embed code: `data-bot-id="YOUR_TENANT_ID_HERE"`

### Option B: From Dashboard Profile Page
1. Navigate to: `http://localhost:3000/dashboard/profile`
2. Your Tenant ID is displayed at the top

### Option C: From Browser Console (if already logged in)
```javascript
// Open browser console on any dashboard page
fetch('/api/tenant/[your-user-id]')
  .then(r => r.json())
  .then(d => console.log('Tenant ID:', d.tenantId))
```

---

## Step 2: Prepare Test File

### Method 1: Use Provided Test File (Recommended)

1. **Open the test file**: `frontend/public/widget-test.html`
2. **Edit the script tag** (near the bottom):
   ```html
   <script 
     src="http://localhost:3000/embed.js?v=1.0.0" 
     data-bot-id="YOUR_TENANT_ID"  <!-- Replace this -->
     data-position="bottom-right"
     data-color="#4F46E5"
     data-button-text="💬"
   ></script>
   ```
3. **Replace `YOUR_TENANT_ID`** with your actual tenant ID
4. **Save the file**

### Method 2: Create Your Own Test File

Create a new HTML file anywhere (e.g., `test-widget.html`):

```html
<!DOCTYPE html>
<html>
<head>
  <title>Widget Test</title>
  <style>
    body {
      font-family: sans-serif;
      padding: 40px;
      background: #f0f0f0;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>My Website</h1>
    <p>This is a test page for the chat widget.</p>
    <p>The chat button should appear in the bottom-right corner.</p>
  </div>

  <!-- Embed Widget Script -->
  <script 
    src="http://localhost:3000/embed.js?v=1.0.0" 
    data-bot-id="YOUR_TENANT_ID"
    data-position="bottom-right"
    data-color="#4F46E5"
    data-button-text="💬"
  ></script>
</body>
</html>
```

---

## Step 3: Start Required Services

### Start Frontend
```bash
cd frontend
pnpm dev
```
Frontend should be running on: `http://localhost:3000`

### Start Backend (if separate)
```bash
cd backend
pnpm dev
```
Backend should be running on: `http://localhost:3004`

### Verify Services
- Frontend API: `http://localhost:3000/api/health` → Should return `{"status":"ok"}`
- Backend API: `http://localhost:3004/api/health` → Should return `{"status":"ok"}`

---

## Step 4: Open Test File in Browser

### Using the Provided Test File
1. Navigate to: `http://localhost:3000/widget-test.html`
2. The page will automatically load and show widget status

### Using Your Own HTML File
1. **Double-click** the HTML file to open in default browser
2. Or **drag and drop** into browser window
3. Or use **File → Open** in browser

---

## Step 5: Test Widget Functionality

### ✅ Basic Functionality Tests

1. **Widget Button Appears**
   - Look for floating button in bottom-right corner
   - Should show your configured button text (💬 by default)
   - Button should have your configured color

2. **Open Chat**
   - Click the button
   - Chat iframe should appear above the button
   - Button should change to ✕ (close icon)

3. **Chat Interface**
   - Should show header with tenant name/logo
   - Should display greeting message
   - Input field should be visible at bottom

4. **Send Message**
   - Type a message in the input
   - Click Send or press Enter
   - Message should appear in chat
   - AI response should appear (if documents are uploaded)

5. **Close Chat**
   - Click ✕ button → Chat should close
   - Press ESC key → Chat should close
   - Button should return to original emoji

### ✅ Advanced Tests

6. **Theme Adaptation**
   - Change page background to light color
   - Widget colors should automatically adjust for contrast

7. **Offline Fallback**
   - Open DevTools → Network tab
   - Enable "Offline" mode
   - Reload page
   - Should show offline fallback UI with retry button

8. **Multiple Widgets**
   - Try adding two script tags
   - Only one widget should load (duplicate prevention)

9. **Customization**
   - Modify `data-color`, `data-button-text`, `data-position` in script tag
   - Reload page
   - Widget should reflect changes

---

## Step 6: Check Browser Console

Open DevTools (F12) → Console tab

### ✅ Expected Logs
```
[Chat Widget] Loaded successfully {botId: "...", version: "1.0.0"}
```

### ❌ Error Troubleshooting

**Error: "data-bot-id is required"**
- Solution: Make sure `data-bot-id` attribute is set in script tag

**Error: "Tenant not found" (404)**
- Solution: Verify tenant ID is correct
- Check: `http://localhost:3000/dashboard/widget` for correct ID

**Error: "Failed to fetch widget config"**
- Solution: 
  1. Check backend/frontend is running
  2. Check Network tab for API call: `/api/tenant/[botId]`
  3. Verify CORS is enabled
  4. Check Supabase connection

**Error: "Widget already initialized"**
- Solution: This is normal if script loads twice, ignore

---

## Step 7: Check Network Requests

Open DevTools → Network tab → Filter by "Fetch/XHR"

### Expected API Calls:

1. **Widget Config Request**
   ```
   GET /api/tenant/[tenant-id]
   Status: 200 OK
   Response: { tenantId, name, settings: {...} }
   ```

2. **Embed Page Load** (when chat opens)
   ```
   GET /embed/[tenant-id]?v=1.0.0
   Status: 200 OK
   ```

3. **Chat API** (when sending message)
   ```
   POST /api/chat
   Status: 200 OK
   ```

---

## Step 8: Verify Database Logging

1. Go to Supabase Dashboard
2. Navigate to Table Editor → `widget_events`
3. You should see new rows with:
   - `event_type`: `widget_load`
   - `tenant_id`: Your tenant ID
   - `referrer_origin`: `null` (local file) or your domain
   - `created_at`: Current timestamp

---

## Step 9: Test Different Scenarios

### Test Light Background Theme
```html
<style>
  body {
    background: #ffffff; /* Light background */
  }
</style>
```
Widget should automatically darken colors for contrast.

### Test Dark Background Theme
```html
<style>
  body {
    background: #1f2937; /* Dark background */
  }
</style>
```
Widget should use original colors.

### Test Different Positions
```html
<!-- Bottom Left -->
<script ... data-position="bottom-left"></script>

<!-- Top Right -->
<script ... data-position="top-right"></script>

<!-- Top Left -->
<script ... data-position="top-left"></script>
```

### Test Custom Colors
```html
<script ... data-color="#10B981"></script> <!-- Green -->
<script ... data-color="#EF4444"></script> <!-- Red -->
<script ... data-color="#F59E0B"></script> <!-- Orange -->
```

---

## Step 10: Production Testing (Optional)

### Test with Production URL
1. Deploy frontend to Vercel/Render
2. Update script `src` to production URL:
   ```html
   <script src="https://your-app.vercel.app/embed.js?v=1.0.0" ...></script>
   ```
3. Test on actual website or staging environment

### Test SRI Hash
1. In dashboard widget page, check if SRI integrity is shown
2. Copy embed code which includes `integrity="sha384-..."`
3. Verify script loads with SRI validation

---

## 🐛 Common Issues & Solutions

### Widget Not Appearing
1. ✅ Check browser console for errors
2. ✅ Verify tenant ID is correct
3. ✅ Check frontend is running on port 3000
4. ✅ Verify `/api/tenant/[id]` returns 200
5. ✅ Check Network tab for failed requests

### Widget Appears But Doesn't Open
1. ✅ Check iframe is created in DOM (DevTools → Elements)
2. ✅ Verify `/embed/[id]` route works independently
3. ✅ Check CORS headers in Network response
4. ✅ Verify sandbox attributes are set

### Messages Not Sending
1. ✅ Check `/api/chat` endpoint is accessible
2. ✅ Verify documents are uploaded (for RAG)
3. ✅ Check browser console for API errors
4. ✅ Verify Supabase connection

### Styling Issues
1. ✅ Check widget container z-index (should be 9999)
2. ✅ Verify no CSS conflicts with host page
3. ✅ Check iframe is transparent/rendering correctly

---

## 📊 Success Criteria

Your widget is working correctly if:

- ✅ Button appears on page load
- ✅ Button opens chat iframe on click
- ✅ Greeting message displays
- ✅ Can send and receive messages
- ✅ ESC key closes widget
- ✅ Close button works
- ✅ Custom colors/position work
- ✅ No console errors
- ✅ Widget events logged in database
- ✅ Offline fallback shows on network error

---

## 🔗 Quick Reference

- **Dashboard Widget Page**: `http://localhost:3000/dashboard/widget`
- **Test HTML File**: `frontend/public/widget-test.html`
- **Embed Endpoint**: `http://localhost:3000/embed/[tenant-id]`
- **Widget Config API**: `http://localhost:3000/api/tenant/[tenant-id]`
- **Health Check**: `http://localhost:3000/api/health`

---

## 📝 Next Steps

After successful testing:

1. **Deploy to Production**
   - Update script URLs to production domain
   - Test on actual website
   - Verify SRI hash is included

2. **Monitor Analytics**
   - Check `widget_events` table for load counts
   - Monitor error rates
   - Track widget usage per tenant

3. **Optimize**
   - Cache widget config responses
   - Monitor bundle size
   - Optimize API response times






