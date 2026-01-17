# GitHub Secrets Setup Guide

## Step 1: Access GitHub Secrets

1. Go to your GitHub repository: https://github.com/YOUR_USERNAME/GroceryStore
2. Click **Settings** (top menu)
3. Left sidebar → **Secrets and variables** → **Actions**
4. Click **New repository secret** for each secret below

## Step 2: Add Secrets

### SSH Secrets (for EC2 Deployment)

**1. EC2_SSH_KEY**
- Name: `EC2_SSH_KEY`
- Value: Contents of your `grocery.pem` file
- Where to find:
  ```bash
  cat ~/grocery.pem
  ```
- Copy the entire private key (including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`)

**2. EC2_HOST**
- Name: `EC2_HOST`
- Value: Your EC2 public IP address
- Example: `54.90.91.72`
- Where to find: AWS Console → EC2 Instances → Your instance public IP

**3. EC2_USER**
- Name: `EC2_USER`
- Value: `ubuntu`
- (This is the default user for Ubuntu EC2 instances)

### Environment Secrets (Supabase & Rails)

**4. SUPABASE_URL**
- Name: `SUPABASE_URL`
- Value: `https://ktqdfwludqkijgrnrfxm.supabase.co`

**5. SUPABASE_KEY**
- Name: `SUPABASE_KEY`
- Value: Your Supabase anon/public key
- Where to find: Supabase Dashboard → Settings → API → anon (public)
- Looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**6. SUPABASE_SERVICE_ROLE_KEY**
- Name: `SUPABASE_SERVICE_ROLE_KEY`
- Value: Your Supabase service role key
- Where to find: Supabase Dashboard → Settings → API → service_role (secret)
- ⚠️ Keep this secret!

**7. SECRET_KEY_BASE**
- Name: `SECRET_KEY_BASE`
- Value: Generate with: `bundle exec rails secret`
- Generate a new one specifically for production

**8. DATABASE_URL**
- Name: `DATABASE_URL`
- Value: Your Supabase connection string
- Format: `postgresql://postgres:PASSWORD@db.ktqdfwludqkijgrnrfxm.supabase.co:5432/postgres?sslmode=require&ipv6=false`

## Step 3: Quick Setup Command (Terminal)

Instead of adding manually, you can use the GitHub CLI:

```bash
# Install GitHub CLI if not already installed
# Then authenticate
gh auth login

# Add all secrets at once
gh secret set EC2_SSH_KEY < ~/grocery.pem
gh secret set EC2_HOST --body "54.90.91.72"
gh secret set EC2_USER --body "ubuntu"
gh secret set SUPABASE_URL --body "https://ktqdfwludqkijgrnrfxm.supabase.co"
gh secret set SUPABASE_KEY --body "YOUR_ANON_KEY"
gh secret set SUPABASE_SERVICE_ROLE_KEY --body "YOUR_SERVICE_ROLE_KEY"
gh secret set SECRET_KEY_BASE --body "$(bundle exec rails secret)"
gh secret set DATABASE_URL --body "postgresql://..."
```

## Step 4: Verify Secrets Added

Go to GitHub repo → Settings → Secrets and you should see all 8 secrets listed.

## Step 5: Using Secrets in GitHub Actions

In your `.github/workflows/*.yml` files, reference secrets like:

```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
  EC2_HOST: ${{ secrets.EC2_HOST }}
  EC2_USER: ${{ secrets.EC2_USER }}
```

For SSH:
```yaml
- name: Deploy to EC2
  env:
    SSH_PRIVATE_KEY: ${{ secrets.EC2_SSH_KEY }}
  run: |
    echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
    chmod 600 ~/.ssh/id_sa
    ssh -i ~/.ssh/id_rsa ${{ secrets.EC2_USER }}@${{ secrets.EC2_HOST }} "cd /app && git pull && docker-compose up -d"
```

## Security Best Practices

✅ DO:
- Regenerate secrets regularly
- Use environment-specific secrets (dev, staging, prod)
- Rotate SSH keys periodically
- Keep private keys secure

❌ DON'T:
- Commit secrets to GitHub
- Share secret values in issues/PRs
- Use same secrets across environments
- Store secrets in comments

## Reference: All Secrets List

| Secret Name | Value | Where From |
|------------|-------|-----------|
| `EC2_SSH_KEY` | Private key content | `~/grocery.pem` |
| `EC2_HOST` | IP address | AWS Console |
| `EC2_USER` | `ubuntu` | Default |
| `SUPABASE_URL` | Project URL | Supabase Dashboard |
| `SUPABASE_KEY` | Anon key | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role | Supabase → Settings → API |
| `SECRET_KEY_BASE` | Generated | `bundle exec rails secret` |
| `DATABASE_URL` | Connection string | `.env` file |
