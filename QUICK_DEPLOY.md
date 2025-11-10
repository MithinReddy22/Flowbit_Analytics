# Quick Vercel Deployment Guide

## 🚀 One-Click Deployment Setup

### Prerequisites
- GitHub account with your code pushed
- Vercel account (free)
- Railway/Render account (for AI service)

### Step 1: Deploy Frontend + API to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "New Project" → Import your GitHub repo
- Vercel will auto-detect Next.js
- Click "Deploy"

3. **Set Environment Variables in Vercel**
```bash
DATABASE_URL=your_postgres_connection_string
NEXT_PUBLIC_API_BASE_URL=https://your-app-name.vercel.app/api
```

### Step 2: Set Up Database

**Option A: Vercel Postgres (Easiest)**
1. In Vercel project → "Storage" → "Create Database"
2. Choose "Postgres"
3. Copy the connection string
4. Add to environment variables

**Option B: External Database**
- Use Railway, Render, or Supabase
- Get connection string
- Add to Vercel environment variables

### Step 3: Run Database Migration

1. **Locally with production DB:**
```bash
cd apps/api
DATABASE_URL=your_production_db_url pnpm prisma db push
DATABASE_URL=your_production_db_url pnpm seed:dev
```

### Step 4: Deploy AI Service

**Using Railway (Recommended):**
1. Go to [railway.app](https://railway.app)
2. "New Project" → Deploy from GitHub repo
3. Set root directory: `services/vanna`
4. Add environment variables:
```bash
DATABASE_URL=your_production_db_url
GROQ_API_KEY=your_groq_key
VANNA_API_KEY=vanna-secret-key
```

### Step 5: Update Environment Variables

In your Vercel project settings, add:
```bash
# Frontend vars
NEXT_PUBLIC_API_BASE_URL=https://your-app-name.vercel.app/api

# API vars
DATABASE_URL=your_production_db_url
VANNA_API_BASE_URL=https://your-ai-service-url.railway.app
VANNA_API_KEY=vanna-secret-key
```

### Step 6: Test Your App

1. Visit `https://your-app-name.vercel.app`
2. Check dashboard loads with data
3. Test the chat feature

## 📁 Files Created for Deployment

- `vercel.json` - Vercel configuration
- `api/index.ts` - Serverless API functions
- `api/package.json` - API dependencies
- `api/tsconfig.json` - API TypeScript config
- `deploy-vercel.sh` - Deployment script
- `VERCEL_DEPLOYMENT.md` - Detailed guide

## 🛠️ What's Configured

✅ Frontend (Next.js) - Auto-deploys on git push
✅ Backend API - Serverless functions on Vercel
✅ Database - Vercel Postgres or external
✅ Basic Chat - Mock responses (upgrade to AI service later)

## 🔧 Custom Domain (Optional)

1. In Vercel project → "Settings" → "Domains"
2. Add your domain
3. Update DNS records
4. Update environment variables with custom domain

## 💡 Pro Tips

- **Database**: Start with Vercel Postgres (free tier)
- **AI Service**: Deploy to Railway for better Python support
- **Monitoring**: Vercel provides built-in analytics
- **Environment**: Use Vercel's encrypted env vars

## 🆘 Troubleshooting

**API not working?**
- Check function logs in Vercel dashboard
- Verify DATABASE_URL is correct
- Ensure CORS allows your domain

**Database errors?**
- Test connection locally first
- Check if SSL is required
- Verify IP whitelisting

**Chat not working?**
- Deploy AI service to Railway
- Update VANNA_API_BASE_URL
- Check API key configuration

## 📞 Need Help?

1. Check `VERCEL_DEPLOYMENT.md` for detailed guide
2. Review Vercel deployment logs
3. Check environment variables
4. Verify database connection

---

**Your app will be live at: `https://your-app-name.vercel.app`** 🎉
