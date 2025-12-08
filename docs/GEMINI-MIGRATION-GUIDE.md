# Gemini API Migration Guide

Successfully migrated from OpenAI to Google Gemini API! 🎉

---

## ✅ What Was Changed

### **Backend Changes:**
1. ✅ Created `backend/lib/gemini-embeddings.ts` - Gemini embeddings wrapper
2. ✅ Updated `backend/app/api/ingest/url/route.ts` - Now uses Gemini
3. ✅ Updated `backend/app/api/ingest/upload/route.ts` - Now uses Gemini
4. ✅ Added `@google/generative-ai` to `backend/package.json`

### **Frontend Changes:**
1. ✅ Updated `frontend/app/api/chat/route.ts` - Now uses Gemini for chat
2. ✅ Added `@google/generative-ai` to `frontend/package.json`

---

## 🚀 Installation Steps

### **Step 1: Get Your Free Gemini API Key**

1. Go to: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. **Copy the API key** (looks like: `AIzaSy...`)

**Free tier includes:**
- ✅ 15 requests per minute
- ✅ 1,500 requests per day
- ✅ **No credit card required!**

---

### **Step 2: Install Dependencies**

**Backend:**
```powershell
cd "e:\usif codes projects\White-Label AI Chatbot Platform MVP\backend"
npm install
```

**Frontend:**
```powershell
cd "e:\usif codes projects\White-Label AI Chatbot Platform MVP\frontend"
npm install
```

---

### **Step 3: Update Environment Variables**

#### **Backend: `backend/.env.local`**

Replace `OPENAI_API_KEY` with `GEMINI_API_KEY`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://droxpucyskdlgjoxtpsk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Backend URL
BACKEND_URL=http://localhost:3004

# Google Gemini API Key (FREE!)
GEMINI_API_KEY=AIzaSy_YOUR_GEMINI_API_KEY_HERE
```

#### **Frontend: `frontend/.env.local`**

Replace `OPENAI_API_KEY` with `GEMINI_API_KEY`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://droxpucyskdlgjoxtpsk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Backend URL
BACKEND_URL=http://localhost:3004
NEXT_PUBLIC_BACKEND_URL=http://localhost:3004

# Tenant API Key
NEXT_PUBLIC_TENANT_API_KEY=dev_api_key_9fba9af1b48bb09c6c98675f5c80dd433e4f072d9f4602a3fc4721f1602bdbcc

# Google Gemini API Key (FREE!)
GEMINI_API_KEY=AIzaSy_YOUR_GEMINI_API_KEY_HERE

# Authentication
NEXT_PUBLIC_AUTH_GITHUB=false
```

---

### **Step 4: Restart Both Servers**

**Terminal 1 - Backend:**
```powershell
cd "e:\usif codes projects\White-Label AI Chatbot Platform MVP\backend"
npm run dev
```

**Wait for:**
```
✓ Ready in X.Xs
```

**Terminal 2 - Frontend:**
```powershell
cd "e:\usif codes projects\White-Label AI Chatbot Platform MVP\frontend"
npm run dev
```

**Wait for:**
```
✓ Ready in X.Xs
```

---

## 🎯 Test the New Setup

### **Test 1: Chat Feature**
1. Go to: http://localhost:3000
2. Sign in with your account
3. Send a message: "Hello, how are you?"
4. Should get a response from **Gemini 1.5 Flash** model

### **Test 2: Upload Feature**
1. Go to: http://localhost:3000/dashboard/upload
2. **Upload a PDF or TXT file**
3. Should see: "Successfully ingested X sections from file"

### **Test 3: URL Crawl Feature**
1. On the same upload page
2. **Enter a URL:** `https://example.com`
3. Click "Crawl"
4. Should see: "Successfully ingested X sections from URL"

---

## 📊 Gemini vs OpenAI Comparison

| Feature | OpenAI | Gemini |
|---------|--------|--------|
| **Free Tier** | No free tier | ✅ 1,500 requests/day |
| **Cost (if paid)** | ~$0.002/1K tokens | ~$0.00025/1K tokens |
| **Chat Model** | GPT-3.5/4 | Gemini 1.5 Flash/Pro |
| **Embeddings** | text-embedding-ada-002 | text-embedding-004 |
| **Context Window** | 4K-128K tokens | 32K-2M tokens |
| **Speed** | Fast | Very fast |
| **Quality** | Excellent | Excellent |

---

## 🔧 What Changed Under the Hood

### **Embeddings (for upload/crawl):**
- **Before:** OpenAI `text-embedding-ada-002` (1536 dimensions)
- **After:** Gemini `text-embedding-004` (768 dimensions)

### **Chat Model:**
- **Before:** OpenAI `gpt-3.5-turbo`
- **After:** Gemini `gemini-1.5-flash`

### **Streaming:**
- **Before:** OpenAI's streaming API
- **After:** Custom streaming implementation for Gemini

---

## 💡 Benefits of Gemini

1. **✅ Free Tier** - No credit card required
2. **✅ Higher Limits** - 1,500 requests/day vs 0 with OpenAI free
3. **✅ Cheaper** - 8x cheaper than OpenAI when you do need to pay
4. **✅ Larger Context** - Up to 2M tokens context window
5. **✅ Fast** - Optimized for speed with Flash model
6. **✅ Multimodal** - Can handle images, video, audio (if you want to add later)

---

## 🎨 Models Available

### **Chat Models:**
- `gemini-1.5-flash` - Fast, efficient (current setup)
- `gemini-1.5-pro` - More capable, slower
- `gemini-1.0-pro` - Previous generation

### **Embedding Models:**
- `text-embedding-004` - Latest embedding model (current setup)
- `embedding-001` - Previous generation

---

## ⚠️ Rate Limits (Free Tier)

| Limit Type | Value |
|------------|-------|
| Requests per minute | 15 |
| Requests per day | 1,500 |
| Tokens per minute | 1,000,000 |

**For production:**
- Consider adding rate limiting in your app
- Monitor usage at: https://aistudio.google.com/app/apikey

---

## 🐛 Troubleshooting

### **Error: "GEMINI_API_KEY not found"**

**Solution:** Make sure you added `GEMINI_API_KEY` to both `.env.local` files

### **Error: "API key not valid"**

**Solution:**
1. Check that you copied the full API key
2. Make sure there are no extra spaces
3. Try generating a new API key

### **Error: "Quota exceeded"**

**Solution:**
- You've hit the free tier limit (15/min or 1,500/day)
- Wait a minute or until next day
- Consider upgrading to paid tier if needed

### **Chat/Upload still not working**

**Solution:**
1. Check both servers are running
2. Check browser console for errors (F12)
3. Check backend terminal for errors
4. Verify `GEMINI_API_KEY` is set in both `.env.local` files
5. Restart both servers

---

## 📈 Next Steps

### **Optional Improvements:**

1. **Add Rate Limiting:**
   - Implement client-side rate limiting
   - Show user how many requests remaining

2. **Use Gemini Pro for Better Quality:**
   - Change `gemini-1.5-flash` to `gemini-1.5-pro` in chat route
   - Slower but higher quality responses

3. **Add Multimodal Features:**
   - Upload images with questions
   - Analyze PDFs with images
   - Process video/audio content

4. **Implement Caching:**
   - Cache embeddings to reduce API calls
   - Cache common chat responses

---

## 💰 Cost Comparison (if you upgrade to paid)

**Uploading a 10-page PDF:**
- OpenAI: ~$0.02
- Gemini: ~$0.0025 (8x cheaper!)

**100 chat messages:**
- OpenAI: ~$0.20
- Gemini: ~$0.025 (8x cheaper!)

**Monthly cost for 10,000 requests:**
- OpenAI: ~$20
- Gemini: ~$2.50

---

## ✅ Migration Complete!

You've successfully migrated from OpenAI to Gemini. Your chatbot now:
- ✅ Works with **FREE** Gemini API
- ✅ Saves 8x on costs (if you upgrade)
- ✅ Has larger context windows
- ✅ Runs faster with Flash model

Enjoy your free AI-powered chatbot! 🎉

---

## 📚 Additional Resources

- Gemini API Docs: https://ai.google.dev/docs
- API Key Management: https://aistudio.google.com/app/apikey
- Pricing: https://ai.google.dev/pricing
- Models Guide: https://ai.google.dev/models






