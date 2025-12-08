# 🚀 Widget Quick Start Guide

Get your embeddable chat widget up and running in **5 minutes**!

## Step 1: Database Setup (2 minutes)

Open your **Supabase SQL Editor** and run:

```sql
-- Add settings column to tenants table
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;

-- Verify it worked
SELECT id, name, domain, settings FROM public.tenants;
```

Copy your **Tenant ID** from the output - you'll need it!

## Step 2: Customize Your Widget (2 minutes)

1. Go to: `http://localhost:3000/dashboard/widget`
2. Set your brand colors, logo, and greeting
3. Click **"Save Settings"**
4. Copy the embed code that appears

## Step 3: Add to Your Website (1 minute)

Paste this code before the `</body>` tag on your website:

```html
<script 
  src="http://localhost:3000/widget-loader.js" 
  data-bot-id="YOUR_TENANT_ID_HERE"
></script>
```

## Step 4: Test It! ✨

1. Open your website
2. Look for the chat button in the bottom-right corner
3. Click it and start chatting!

---

## Quick Test Without a Website

Don't have a website yet? Test it instantly:

1. Open: `http://localhost:3000/widget-demo.html`
2. Edit the file and replace `YOUR_TENANT_ID`
3. Refresh the page
4. Click the chat button!

---

## Customization Options

Add these attributes to customize:

```html
<script 
  src="http://localhost:3000/widget-loader.js" 
  data-bot-id="YOUR_TENANT_ID"
  data-position="bottom-right"    <!-- or bottom-left -->
  data-color="#4F46E5"            <!-- any hex color -->
  data-button-text="💬"           <!-- emoji or text -->
></script>
```

---

## Troubleshooting

### Widget not appearing?
- Check browser console for errors
- Verify tenant ID is correct
- Make sure frontend is running on port 3000

### Widget appears but no greeting?
- Go to Dashboard → Widget Settings
- Make sure you clicked "Save Settings"
- Check that settings column exists in database

### Chat not responding?
- Verify you uploaded some documents
- Check that Gemini API key is set
- Look for errors in the terminal

---

## What's Next?

- 📖 Read the full guide: `docs/WIDGET-SETUP-GUIDE.md`
- 🎨 Explore advanced customization options
- 📊 Monitor widget usage in your analytics
- 🚀 Deploy to production!

---

**That's it!** Your widget is ready to use. 🎉

Need help? Check `docs/WIDGET-SETUP-GUIDE.md` for detailed documentation.







