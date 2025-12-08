# Commands to Push to GitHub

## Step-by-Step Commands

Run these commands in PowerShell from the `WhiteLabel-Demo` directory:

### Step 1: Navigate to Project Directory
```powershell
cd "E:\usif codes projects\AI Chatbot Platform MVP\WhiteLabel-Demo"
```

### Step 2: Initialize Git (if not already done)
```powershell
git init
```

### Step 3: Verify .gitignore is Working
```powershell
# Check that .env.local files are ignored
git status
# Should NOT show any .env.local files
```

### Step 4: Add All Files
```powershell
git add .
```

### Step 5: Verify What Will Be Committed
```powershell
# Review the files (make sure no .env.local files are included)
git status

# Check for any .env files that might be committed
git ls-files | Select-String "\.env"
# Should only show .env.example files, NOT .env.local
```

### Step 6: Create Initial Commit
```powershell
git commit -m "Initial commit: Demo version with demo mode support

- Added demo mode functionality
- Mock data for tenant, chats, and analytics
- Authentication disabled in demo mode
- Demo banner indicator
- Updated embed code generation
- Comprehensive documentation
- Fixed widget settings embed code
- Added .gitignore for security"
```

### Step 7: Add Remote Repository
```powershell
git remote add origin https://github.com/usifkamal/WhiteLabel-Ai-Chatbot-Platform-MVP-Demo.git
```

### Step 8: Set Main Branch
```powershell
git branch -M main
```

### Step 9: Push to GitHub
```powershell
git push -u origin main
```

## Complete Command Sequence (Copy & Paste)

```powershell
# Navigate to project
cd "E:\usif codes projects\AI Chatbot Platform MVP\WhiteLabel-Demo"

# Initialize git (if needed)
git init

# Add remote
git remote add origin https://github.com/usifkamal/WhiteLabel-Ai-Chatbot-Platform-MVP-Demo.git

# Add all files
git add .

# Commit
git commit -m "Initial commit: Demo version with demo mode support"

# Set main branch and push
git branch -M main
git push -u origin main
```

## If Remote Already Exists

If you get an error that the remote already exists, use:

```powershell
git remote set-url origin https://github.com/usifkamal/WhiteLabel-Ai-Chatbot-Platform-MVP-Demo.git
```

## If You Need to Authenticate

GitHub may ask for authentication. Options:

1. **Personal Access Token** (Recommended):
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Create a token with `repo` permissions
   - Use token as password when prompted

2. **GitHub CLI**:
   ```powershell
   gh auth login
   ```

3. **SSH** (Alternative):
   ```powershell
   git remote set-url origin git@github.com:usifkamal/WhiteLabel-Ai-Chatbot-Platform-MVP-Demo.git
   ```

## Verify After Pushing

After pushing, verify on GitHub:
- ✅ All files are uploaded
- ✅ No `.env.local` files are visible
- ✅ README.md displays correctly
- ✅ Documentation files are present



