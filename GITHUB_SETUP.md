# GitHub Setup Guide for Demo Version

## ✅ Updates Applied

The following updates have been made to prepare the demo version for GitHub:

### 1. Root `.gitignore` Created
- Excludes all `.env*` files (except `.env*.example`)
- Excludes `node_modules/`, build artifacts, and IDE files
- Protects sensitive data from being committed

### 2. README.md Updated
- Added "Demo Version" notice at the top
- Added demo mode features section
- Clear instructions for enabling demo mode
- Links to demo mode documentation

### 3. Pre-Commit Checklist Created
- `PRE_COMMIT_CHECKLIST.md` with comprehensive checklist
- Security checks
- Code quality verification
- Git configuration validation

## 🚀 Next Steps to Push to GitHub

### Step 1: Initialize Git Repository (if not already done)

```bash
cd WhiteLabel-Demo
git init
```

### Step 2: Verify .gitignore is Working

```bash
# Check that .env.local files are ignored
git status
# Should NOT show any .env.local files

# Verify .gitignore
git check-ignore -v frontend/.env.local
# Should show that .env.local is ignored
```

### Step 3: Add Files to Git

```bash
# Add all files (respecting .gitignore)
git add .

# Review what will be committed
git status
```

**Important:** Verify that NO `.env.local` files are being added!

### Step 4: Create Initial Commit

```bash
git commit -m "Initial commit: Demo version with demo mode support

- Added demo mode functionality
- Mock data for tenant, chats, and analytics
- Authentication disabled in demo mode
- Demo banner indicator
- Updated embed code generation
- Comprehensive documentation"
```

### Step 5: Create GitHub Repository

1. Go to GitHub and create a new repository
2. Name it something like: `white-label-chatbot-demo` or `ai-chatbot-platform-demo`
3. **DO NOT** initialize with README, .gitignore, or license (we already have these)

### Step 6: Connect and Push

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🔒 Security Checklist (CRITICAL)

Before pushing, verify:

- [ ] **No `.env.local` files** in the repository
- [ ] **No API keys** hardcoded in source code
- [ ] **No real Supabase credentials** in any files
- [ ] **No production database URLs**
- [ ] **Only `.env.example` files** are committed
- [ ] **All sensitive data** is in `.gitignore`

## 📝 Recommended Repository Settings

After creating the repository on GitHub:

1. **Add repository description**: "Demo version of White-Label AI Chatbot Platform with demo mode enabled"
2. **Add topics/tags**: `demo`, `chatbot`, `ai`, `nextjs`, `supabase`, `white-label`
3. **Set visibility**: Public (for demo) or Private (if you prefer)
4. **Add license**: MIT License (if you have LICENSE file)

## 📚 Documentation Files Included

The following documentation is ready for GitHub:

- ✅ `README.md` - Main documentation with demo mode instructions
- ✅ `PRE_COMMIT_CHECKLIST.md` - Pre-commit verification checklist
- ✅ `frontend/ENABLE_DEMO_MODE.md` - How to enable demo mode
- ✅ `frontend/DEMO_MODE.md` - Demo mode implementation details
- ✅ `docs/` - All documentation files

## 🎯 What's Safe to Commit

✅ **Safe to commit:**
- Source code
- Configuration files (without secrets)
- Documentation
- Example environment files (`.env.example`)
- Test files
- Package files (`package.json`, `pnpm-lock.yaml`)

❌ **Never commit:**
- `.env.local` files
- `.env` files (without `.example`)
- API keys or secrets
- Real database credentials
- `node_modules/`
- Build artifacts

## 🐛 Troubleshooting

### If you accidentally committed sensitive data:

```bash
# Remove file from git history (use with caution!)
git rm --cached frontend/.env.local
git commit -m "Remove sensitive .env.local file"

# If already pushed, you may need to:
# 1. Rotate all exposed credentials
# 2. Use git filter-branch or BFG Repo-Cleaner
# 3. Force push (warns all collaborators)
```

### If .gitignore isn't working:

```bash
# Remove cached files
git rm -r --cached .
git add .
git commit -m "Update .gitignore"
```

## ✨ Final Verification

Before pushing, run:

```bash
# 1. Check for sensitive files
git ls-files | grep -E "\.env$|\.env\.local$"
# Should return nothing

# 2. Check for large files
find . -size +1M -not -path "./node_modules/*" -not -path "./.git/*"
# Review any large files

# 3. Review what will be committed
git status
git diff --cached

# 4. Test locally
# Ensure demo mode works before pushing
```

## 🎉 You're Ready!

Once you've completed these steps, your demo version is ready for GitHub!

The repository will be safe, well-documented, and ready for clients to explore.



