# Pre-Commit Checklist for GitHub

Before pushing the demo version to GitHub, ensure the following:

## ✅ Security Checks

- [ ] **No sensitive data in code**: 
  - No API keys, secrets, or tokens hardcoded
  - No real Supabase credentials
  - No production database URLs

- [ ] **Environment files excluded**:
  - `.env.local` files are in `.gitignore`
  - `.env` files are in `.gitignore`
  - Only `.env.example` files are committed

- [ ] **No personal information**:
  - No real email addresses
  - No personal credentials
  - No production URLs

## ✅ Code Quality

- [ ] **Demo mode properly configured**:
  - `DEMO_MODE=true` and `NEXT_PUBLIC_DEMO_MODE=true` documented
  - Demo mode clearly explained in README
  - Mock data properly labeled

- [ ] **Documentation updated**:
  - README explains this is a demo version
  - Setup instructions are clear
  - Demo mode instructions included

- [ ] **Test files ready**:
  - `test-widget.html` uses demo tenant ID
  - All example URLs use localhost (appropriate for demo)

## ✅ Git Configuration

- [ ] **Root .gitignore exists** and includes:
  - `.env*` files (except `.env*.example`)
  - `node_modules/`
  - `.next/`, `build/`, `dist/`
  - IDE files (`.vscode/`, `.idea/`)

- [ ] **No large files**:
  - No binary files in repo
  - No node_modules committed
  - No build artifacts

## ✅ Demo-Specific Items

- [ ] **Demo tenant ID**: `demo-tenant-1` is used consistently
- [ ] **Mock data**: All mock data is clearly labeled
- [ ] **Demo banner**: Shows "Demo Mode" indicator
- [ ] **Authentication**: Disabled in demo mode (documented)

## ✅ Documentation Files

- [ ] **README.md**: 
  - Mentions this is a demo version
  - Includes demo mode setup instructions
  - Links to demo mode documentation

- [ ] **ENABLE_DEMO_MODE.md**: Present and accurate
- [ ] **DEMO_MODE.md**: Present and explains features

## ✅ Before Pushing

Run these commands to verify:

```bash
# Check for sensitive files
git status
# Should NOT show any .env.local files

# Check for large files
find . -size +1M -not -path "./node_modules/*" -not -path "./.git/*"

# Verify .gitignore is working
git check-ignore -v .env.local
# Should show .env.local is ignored

# Check what will be committed
git diff --cached --name-only
```

## 🚨 Critical: Never Commit

- ❌ `.env.local` files
- ❌ `.env` files (without .example)
- ❌ Real API keys or secrets
- ❌ Production database credentials
- ❌ Personal information
- ❌ `node_modules/` directory
- ❌ Build artifacts (`.next/`, `build/`, `dist/`)

## 📝 Recommended: Add to README

Add a section at the top of README.md:

```markdown
## 🎭 Demo Version

This is a **demo version** of the White-Label AI Chatbot Platform. 

**Key Features:**
- ✅ Demo mode enabled by default
- ✅ Mock data instead of real database
- ✅ Authentication disabled
- ✅ Perfect for showcasing to clients

**To enable demo mode:**
1. Set `DEMO_MODE=true` and `NEXT_PUBLIC_DEMO_MODE=true` in `frontend/.env.local`
2. Restart the development server
3. See [ENABLE_DEMO_MODE.md](frontend/ENABLE_DEMO_MODE.md) for details

**Note:** This demo version does not connect to real databases or store real data.
```

## ✅ Final Steps

1. Review all changes: `git diff`
2. Check for secrets: `git log -p` (review recent commits)
3. Test locally: Ensure demo mode works
4. Update README: Add demo version notice
5. Commit with clear message: "Add demo version with demo mode support"
6. Push to GitHub



