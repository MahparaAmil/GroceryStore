# GitHub Setup Guide for GroceryStore

## Current Status
- ✅ Git repository already initialized
- ✅ Connected to remote: `origin/ror/main`
- ⚠️ Changes pending: Docker files, API fix, and .env.example

## Step 1: Verify Remote Repository

```bash
cd /home/mahpara/Documents/GroceryStore

# Check remote
git remote -v

# Expected output:
# origin  https://github.com/YOUR_USERNAME/GroceryStore.git (fetch)
# origin  https://github.com/YOUR_USERNAME/GroceryStore.git (push)
```

## Step 2: Stage Changes

Add all new Docker and configuration files:

```bash
# Stage Docker files
git add Dockerfile.backend
git add frontend/Dockerfile
git add docker-compose.yml
git add nginx.Dockerfile
git add nginx.conf

# Stage configuration example
git add .env.example

# Stage API fix
git add frontend/src/services/api.js

# Update .gitignore
git add .gitignore

# View staged changes
git status
```

## Step 3: Create Commit

```bash
git commit -m "feat: Add Docker setup with Nginx reverse proxy

- Add Dockerfile.backend for Rails API
- Add frontend/Dockerfile for React/Vite
- Add nginx.Dockerfile and nginx.conf for reverse proxy
- Add docker-compose.yml for orchestration
- Add .env.example for environment template
- Fix frontend API URL: localhost:5001 -> localhost:5000
- Update .gitignore with Docker and build outputs"
```

## Step 4: Push to GitHub

```bash
# Push to main branch
git push origin ror/main
```

## Step 5: Verify on GitHub

1. Go to: https://github.com/YOUR_USERNAME/GroceryStore
2. Switch to `ror/main` branch
3. Verify new files appear in the repository

## Important: Environment Variables

⚠️ **NEVER commit `.env` file** - it contains secrets

The `.env.example` file is committed as a template. To use:

```bash
# Copy example to actual .env (NOT committed)
cp .env.example .env

# Edit with your actual credentials
nano .env
```

## Branches

Your project uses: **`ror/main`** branch
- Main development branch
- Contains Rails + React setup

## Quick Commands Reference

```bash
# Check status
git status

# See changes
git diff

# View commit history
git log --oneline -10

# Undo unstaged changes
git restore <file>

# Undo staged changes
git reset HEAD <file>
```

## Next Steps

1. ✅ Commit Docker setup
2. ✅ Push to GitHub
3. Create a README.md with Docker setup instructions
4. Add GitHub Actions for CI/CD (optional)
5. Set up branch protection rules

## Useful Links

- Repository: https://github.com/YOUR_USERNAME/GroceryStore
- Commits: https://github.com/YOUR_USERNAME/GroceryStore/commits/ror/main
- Issues: https://github.com/YOUR_USERNAME/GroceryStore/issues
