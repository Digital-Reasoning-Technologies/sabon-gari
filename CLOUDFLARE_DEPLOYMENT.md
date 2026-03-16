# Cloudflare Pages Deployment Guide with Wrangler

This guide will help you deploy your Next.js application to Cloudflare Pages using Wrangler.

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com) (free tier available)
2. **Git Repository**: Your code should be in GitHub, GitLab, or Bitbucket
3. **MongoDB Database**: MongoDB Atlas (free tier available) or your own MongoDB instance
4. **Cloudinary Account**: For image uploads (free tier available)
5. **Node.js**: Version 18.x or higher

## Step 1: Install Wrangler

Install Wrangler CLI globally or as a dev dependency:

```bash
npm install -D wrangler
# or
npm install -g wrangler
```

## Step 2: Authenticate with Cloudflare

Login to Cloudflare using Wrangler:

```bash
npx wrangler login
```

This will open your browser to authenticate with Cloudflare.

## Step 3: Configure Wrangler

The `wrangler.toml` file has been created with basic configuration. You can customize it based on your needs.

### Important Notes for Next.js on Cloudflare Pages:

**Option A: Use Cloudflare's Native Next.js Support (Recommended)**
- Cloudflare Pages now has native support for Next.js
- No additional adapter needed
- Supports API routes and server-side rendering

**Option B: Use @cloudflare/next-on-pages Adapter**
- If you need more control or specific features
- Requires additional setup

For this guide, we'll use Cloudflare's native Next.js support.

## Step 4: Set Up Environment Variables

### Using Wrangler CLI:

Set secrets (sensitive data) using Wrangler:

```bash
# Set MongoDB URI
npx wrangler secret put MONGODB_URI
# Paste your MongoDB connection string when prompted

# Set JWT Secret
npx wrangler secret put JWT_SECRET
# Paste your JWT secret when prompted

# Set Cloudinary URL
npx wrangler secret put CLOUDINARY_URL
# Paste your Cloudinary URL when prompted

# Optional: Set superadmin credentials
npx wrangler secret put SUPERADMIN_EMAIL
npx wrangler secret put SUPERADMIN_PASSWORD
```

### Using Cloudflare Dashboard:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select your account
3. Go to **Workers & Pages** → **Pages**
4. Select your project
5. Go to **Settings** → **Environment Variables**
6. Add your environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_URL` (or individual Cloudinary variables)
   - `SUPERADMIN_EMAIL` (optional)
   - `SUPERADMIN_PASSWORD` (optional)

## Step 5: Deploy to Cloudflare Pages

### Option A: Deploy via Wrangler CLI

1. **Build your Next.js app:**
   ```bash
   npm run build
   ```

2. **Deploy to Cloudflare Pages:**
   ```bash
   npx wrangler pages deploy .next --project-name=kudan-landing-page
   ```

   Or use the npm script:
   ```bash
   npm run pages:deploy
   ```

3. **Follow the prompts** to create a new project or link to an existing one

### Option B: Deploy via Cloudflare Dashboard (Recommended)

1. **Go to Cloudflare Dashboard**
   - Visit [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to **Workers & Pages** → **Pages**

2. **Create a New Project**
   - Click **Create a project**
   - Select **Connect to Git**
   - Choose your Git provider (GitHub, GitLab, or Bitbucket)
   - Select your repository

3. **Configure Build Settings**
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `/` (or your project root)

4. **Add Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Add all required variables (see Step 4)

5. **Deploy**
   - Click **Save and Deploy**
   - Wait for the build to complete (usually 3-5 minutes)
   - Your app will be live at `https://your-project.pages.dev`

## Step 6: Connect Custom Domain

Since your domain is already on Cloudflare, this is straightforward:

1. **In Cloudflare Pages Dashboard:**
   - Go to your project → **Custom domains**
   - Click **Set up a custom domain**
   - Enter your domain (e.g., `example.com`)

2. **DNS Configuration:**
   - Cloudflare will automatically configure DNS records
   - Or manually add:
     - **Type**: `CNAME`
     - **Name**: `@` (for root) or `www` (for www subdomain)
     - **Target**: `your-project.pages.dev`
     - **Proxy status**: Proxied (orange cloud)

3. **SSL/TLS:**
   - Cloudflare automatically provisions SSL certificates
   - Ensure SSL/TLS mode is set to **"Full (strict)"** in Cloudflare Dashboard

## Step 7: Local Development with Wrangler

Test your deployment locally:

```bash
# Build first
npm run build

# Run local Pages dev server
npm run pages:dev
```

Or directly:
```bash
npx wrangler pages dev .next
```

## Step 8: View Logs

Monitor your deployment:

```bash
npm run pages:tail
```

Or:
```bash
npx wrangler pages deployment tail
```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `JWT_SECRET` | Secret key for JWT tokens (min 32 chars) | `your-super-secret-key-here` |

### Cloudinary Variables (Choose one method)

**Method 1 - Single URL:**
| Variable | Description | Example |
|----------|-------------|---------|
| `CLOUDINARY_URL` | Complete Cloudinary URL | `cloudinary://123456:abcdef@mycloud` |

**Method 2 - Individual Variables:**
| Variable | Description |
|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SUPERADMIN_EMAIL` | Email for auto-created superadmin | None |
| `SUPERADMIN_PASSWORD` | Password for auto-created superadmin | None |

## Troubleshooting

### Build Fails
- Check build logs in Cloudflare Dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Cloudflare Pages uses Node 18.x by default)
- Make sure `MONGODB_URI` is set (the check is now lazy, so build should succeed)

### Database Connection Issues
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist includes Cloudflare IPs (or use `0.0.0.0/0`)
- Ensure database user has proper permissions

### Image Upload Fails
- Verify Cloudinary credentials are correct
- Check Cloudinary account limits (free tier has limits)

### Authentication Issues
- Verify `JWT_SECRET` is set and is at least 32 characters
- Check that cookies are working (Cloudflare handles HTTPS automatically)

### Domain Not Connecting
- Verify DNS records are correct in Cloudflare
- Check that proxy is enabled (orange cloud)
- Wait up to 24 hours for full DNS propagation
- Check Cloudflare Pages dashboard for specific error messages

## Useful Wrangler Commands

```bash
# Login to Cloudflare
npx wrangler login

# List all Pages projects
npx wrangler pages project list

# View project details
npx wrangler pages project get <project-name>

# Deploy to Pages
npx wrangler pages deploy <directory> --project-name=<name>

# View deployment logs
npx wrangler pages deployment tail

# Set a secret
npx wrangler secret put <SECRET_NAME>

# List secrets
npx wrangler secret list

# Delete a secret
npx wrangler secret delete <SECRET_NAME>
```

## Cloudflare Pages Features

### Automatic Deployments
- Every push to `main` branch = Production deployment
- Every pull request = Preview deployment
- Automatic SSL certificates
- Global CDN distribution

### Environment Variables
- Set different values for Production, Preview, and Branch deployments
- Encrypted and secure storage
- Secrets are never exposed in build logs

### Analytics & Monitoring
- Built-in analytics (available in dashboard)
- Function logs available in dashboard
- Real-time deployment status
- Performance insights

## Comparison: Vercel vs Cloudflare Pages

### Vercel
- ✅ Excellent Next.js integration
- ✅ Easy setup
- ✅ Great developer experience
- ⚠️ Requires separate domain configuration

### Cloudflare Pages
- ✅ Native integration with Cloudflare (your domain is already there)
- ✅ Global CDN included
- ✅ Free tier is generous
- ✅ Integrated with Cloudflare Workers, KV, D1, R2
- ⚠️ Next.js support is newer (but fully functional)

## Next Steps

1. ✅ Set up Wrangler
2. ✅ Configure environment variables
3. ✅ Deploy to Cloudflare Pages
4. ✅ Connect custom domain
5. ⬜ Test all functionality
6. ⬜ Set up monitoring and alerts (optional)
7. ⬜ Configure CI/CD workflows (optional)

## Support

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Next.js on Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/getting-started/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---

**Note**: Your first deployment might take a few minutes. Subsequent deployments are usually faster (1-2 minutes) thanks to Cloudflare's caching and CDN.

