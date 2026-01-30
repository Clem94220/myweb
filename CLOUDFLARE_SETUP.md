# Deploying to Cloudflare Pages

This guide explains how to deploy your site to Cloudflare Pages and set up the View Counter.

## Prerequisites
- A Cloudflare account
- `npm` installed (optional, for local testing)

## Step 1: Push to GitHub/GitLab
Ensure your project is in a Git repository and pushed to a provider like GitHub.

## Step 2: Create a Cloudflare Pages Project
1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Go to **Workers & Pages** > **Create Application** > **Pages** > **Connect to Git**.
3. Select your repository (`mon-site-main`).
4. **Build Settings**:
   - **Framework Preset**: None (Static HTML)
   - **Build Command**: (Leave empty)
   - **Build Output Directory**: `mon-site-main` (or the root folder if you moved files)
5. Click **Save and Deploy**.

## Step 3: Configure View Counter (KV)
The view counter requires a database (KV) to store the count.

1. Go to your Pages project settings in the Cloudflare Dashboard.
2. Go to **Settings** > **Functions** > **KV Namespace Bindings`.
3. Click **Add binding**.
4. **Variable name**: `VIEWS_KV` (Must be exactly this).
5. **KV Namespace**: Select "Create new namespace" and name it `views-counter` (or similar).
6. Click **Save**.
7. **Redeploy** your project for the changes to take effect (go to Deployments > All Deployments > Retry latest deployment, or push a new commit).

## Step 4: Verification
- Visit your deployed URL (e.g., `https://crystal-solution.pages.dev`).
- Scroll down to the view counter (bottom left).
- You should see the view count incrementing.
- If it says `---` or falls back to local storage (check Console), verify the KV binding is named `VIEWS_KV`.

## Local Development (Optional)
To test Cloudflare Functions locally, you need `wrangler`:
```bash
npm install -g wrangler
wrangler pages dev . --kv=VIEWS_KV
```
