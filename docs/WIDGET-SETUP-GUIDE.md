# 🎨 Embeddable Chat Widget Setup Guide

This guide will help you set up and customize the embeddable chat widget for your white-label AI chatbot platform.

## 📋 Overview

The widget system consists of:
1. **Widget Loader Script** (`/public/widget-loader.js`) - JavaScript that creates and manages the chat widget
2. **Embed Page** (`/app/embed/[botId]/page.tsx`) - The actual chat interface loaded in an iframe
3. **Widget Settings** (`/dashboard/widget`) - Admin interface for customization
4. **Tenant API** (`/api/tenant/[botId]`) - Endpoint that provides widget configuration

## 🚀 Quick Start

### Step 1: Add Settings Column to Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Add settings column to tenants table
ALTER TABLE public.tenants 
ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb;

-- Set default settings for existing tenants
UPDATE public.tenants
SET settings = jsonb_build_object(
  'primaryColor', '#4F46E5',
  'logo', null,
  'greeting', 'Hello! How can I help you today?'
)
WHERE settings IS NULL OR settings = '{}'::jsonb;
```

Or use the provided SQL file:
```bash
# Run in Supabase SQL Editor
cat docs/ADD-WIDGET-SETTINGS.sql
```

### Step 2: Customize Your Widget

1. Navigate to **Dashboard → Widget Settings**
2. Configure:
   - **Primary Color**: Brand color for buttons and headers
   - **Logo URL**: Your company logo (optional)
   - **Greeting Message**: First message users see

3. Click **Save Settings**

### Step 3: Get Your Embed Code

Copy the embed code from the Widget Settings page:

```html
<script src="https://yourdomain.com/widget-loader.js" data-bot-id="YOUR_TENANT_ID"></script>
```

### Step 4: Add to Your Website

Paste the embed code just before the closing `</body>` tag on any page where you want the chat widget to appear.

## 🎨 Customization Options

### Basic Configuration

```html
<script 
  src="https://yourdomain.com/widget-loader.js" 
  data-bot-id="YOUR_TENANT_ID"
  data-position="bottom-right"
  data-color="#4F46E5"
  data-button-text="💬"
></script>
```

### Available Attributes

| Attribute | Description | Default | Example |
|-----------|-------------|---------|---------|
| `data-bot-id` | **Required**. Your tenant/bot ID | - | `data-bot-id="abc123"` |
| `data-position` | Widget position on screen | `bottom-right` | `bottom-left`, `bottom-right` |
| `data-color` | Primary color (hex code) | `#4F46E5` | `data-color="#FF5733"` |
| `data-button-text` | Chat button text/emoji | `💬` | `data-button-text="Chat"` |

## 🎭 Widget Features

### For Users
- **Floating Button**: Click to open/close chat
- **Responsive Design**: Works on mobile and desktop
- **Keyboard Support**: Press ESC to close
- **Smooth Animations**: Professional transitions
- **Message History**: Maintains conversation context

### For Developers
- **Zero Dependencies**: Pure JavaScript, no jQuery required
- **Iframe Isolation**: Widget doesn't interfere with host page
- **PostMessage API**: Secure communication between widget and page
- **Easy Integration**: Just one script tag

## 🔧 Advanced Usage

### Programmatic Control

You can control the widget from your website's JavaScript:

```javascript
// Open the widget
window.postMessage({ type: 'CHAT_WIDGET_OPEN' }, '*');

// Close the widget
window.postMessage({ type: 'CHAT_WIDGET_CLOSE' }, '*');

// Listen for widget events
window.addEventListener('message', (event) => {
  if (event.data.type === 'CHAT_WIDGET_OPENED') {
    console.log('Chat widget was opened');
  }
  if (event.data.type === 'CHAT_WIDGET_CLOSED') {
    console.log('Chat widget was closed');
  }
});
```

### Custom Styling

The widget respects your tenant settings but you can override with CSS:

```css
/* Target the widget container */
#chat-widget-container {
  /* Custom styles here */
}

/* Target the iframe container */
#chat-widget-iframe-container {
  width: 450px !important;
  height: 700px !important;
}
```

## 🧪 Testing

### Test in New Tab

1. Go to **Dashboard → Widget Settings**
2. Click **"Open widget in new tab →"**
3. Test the chat interface directly

### Test on Your Site

Create a test HTML file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Widget Test</title>
</head>
<body>
  <h1>My Website</h1>
  <p>The chat widget should appear in the bottom-right corner.</p>

  <!-- Widget Code -->
  <script 
    src="http://localhost:3000/widget-loader.js" 
    data-bot-id="YOUR_TENANT_ID"
  ></script>
</body>
</html>
```

## 📱 Mobile Optimization

The widget automatically adapts to mobile screens:
- **Responsive sizing**: Fills most of the screen on small devices
- **Touch-friendly**: Large tap targets
- **Keyboard handling**: Works with mobile keyboards

## 🔒 Security Considerations

### CORS Configuration

The widget uses `postMessage` for secure cross-origin communication. The API endpoints include:

```typescript
// CORS headers are set automatically
'Access-Control-Allow-Origin': '*'
```

### Content Security Policy

If your site uses CSP, you may need to add:

```html
<meta http-equiv="Content-Security-Policy" 
  content="
    default-src 'self';
    script-src 'self' https://yourdomain.com;
    frame-src https://yourdomain.com;
    connect-src https://yourdomain.com;
  ">
```

## 🐛 Troubleshooting

### Widget Not Appearing

1. **Check browser console** for errors
2. **Verify bot ID** is correct
3. **Check network tab** - ensure script loads
4. **Test in incognito mode** to rule out extensions

### Widget Appears but No Messages

1. **Check tenant settings** - verify greeting is set
2. **Test API endpoint**: `GET /api/tenant/YOUR_BOT_ID`
3. **Check browser console** for API errors

### Styling Issues

1. **Check z-index** - widget uses `z-index: 9999`
2. **Check for CSS conflicts** with host page
3. **Test on different browsers**

## 📊 Analytics Integration

Track widget usage by listening to events:

```javascript
window.addEventListener('message', (event) => {
  if (event.data.type === 'CHAT_WIDGET_OPENED') {
    // Track with your analytics
    gtag('event', 'chat_opened');
  }
});
```

## 🚢 Production Deployment

### Before Going Live

1. ✅ Test widget on staging environment
2. ✅ Verify all customizations work correctly
3. ✅ Test on multiple devices and browsers
4. ✅ Check page load performance
5. ✅ Update `widget-loader.js` origin to production domain

### Performance Tips

- Widget loads **asynchronously** - won't block page load
- Iframe is **lazy-loaded** - only loads when clicked
- Total widget size: **~15KB** (script + styles)

## 📚 API Reference

### GET `/api/tenant/[botId]`

Returns tenant configuration:

```json
{
  "name": "My Company",
  "domain": "example.com",
  "primaryColor": "#4F46E5",
  "logo": "https://example.com/logo.png",
  "greeting": "Hello! How can I help you today?"
}
```

### POST `/api/chat`

Handles chat messages (same endpoint as main chat):

```json
{
  "messages": [...],
  "botId": "tenant-id-here"
}
```

## 🎉 Next Steps

1. **Customize the appearance** in Dashboard → Widget Settings
2. **Test thoroughly** on your website
3. **Deploy to production** when ready
4. **Monitor usage** through analytics

## 💡 Tips

- Use a **CDN** for `widget-loader.js` in production
- **Cache the script** with appropriate headers
- **Monitor performance** with Real User Monitoring
- **A/B test** different colors and greetings

## 🆘 Need Help?

- Check the browser console for errors
- Review the Network tab for failed requests
- Test the `/api/tenant/[botId]` endpoint directly
- Verify your database has the `settings` column

---

**Happy embedding!** 🚀







