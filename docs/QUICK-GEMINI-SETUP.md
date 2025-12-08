# Quick Gemini Setup (2 Minutes)

## ✅ Migration Complete!

All code has been updated to use Google Gemini instead of OpenAI.

---

## 🚀 What You Need to Do:

### **1. Get Free Gemini API Key** (30 seconds)

Visit: https://makersuite.google.com/app/apikey

Click "Create API Key" → Copy the key

---

### **2. Install Packages** (1 minute)

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

### **3. Update Environment Variables** (30 seconds)

**Add to `backend/.env.local`:**
```env
GEMINI_API_KEY=AIzaSy_YOUR_API_KEY_HERE
```

**Add to `frontend/.env.local`:**
```env
GEMINI_API_KEY=AIzaSy_YOUR_API_KEY_HERE
```

*(Remove or comment out `OPENAI_API_KEY` if present)*

---

### **4. Restart Servers**

**Backend Terminal:**
```powershell
cd backend
npm run dev
```

**Frontend Terminal:**
```powershell
cd frontend
npm run dev
```

---

## ✅ Test It Works:

1. **Chat:** http://localhost:3000 - Send a message
2. **Upload:** http://localhost:3000/dashboard/upload - Upload a PDF

---

## 🎉 Benefits:

- ✅ **FREE** - No credit card needed
- ✅ **1,500 requests/day** free tier
- ✅ **8x cheaper** than OpenAI (if you upgrade)
- ✅ **Faster** responses
- ✅ **Larger** context windows

---

## 📚 Full Documentation:

See `docs/GEMINI-MIGRATION-GUIDE.md` for complete details.

---

## ⚡ That's It!

Your chatbot now runs on **FREE** Gemini API! 🚀








