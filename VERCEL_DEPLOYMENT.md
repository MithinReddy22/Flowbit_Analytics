# Vercel Deployment Guide

## Overview

This guide will help you deploy the Flowbit Analytics Dashboard to Vercel. Since this is a full-stack application with multiple services, we'll need to deploy each component separately.

## Architecture for Vercel Deployment

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   AI Service    │
│   (Vercel)      │◄──►│   (Vercel)      │◄──►│   (Railway/     │
│                 │    │   Functions)    │    │   Render/       │
│ - Next.js       │    │ - Serverless    │    │   DigitalOcean) │
│ - Static Assets │    │ - Express       │    │ - FastAPI       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Database      │
                       │   (Vercel       │
                       │   Postgres/     │
                       │   External)     │
                       └─────────────────┘
```

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install with `npm i -g vercel`
3. **GitHub Repository**: Push your code to GitHub
4. **Database**: Vercel Postgres or external PostgreSQL

## Step 1: Deploy Frontend to Vercel

### 1.1 Connect Your GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will automatically detect it as a Next.js project

### 1.2 Configure Frontend Settings

In the Vercel project settings:

```bash
# Build Settings
Framework Preset: Next.js
Build Command: cd apps/web && npm run build
Output Directory: apps/web/.next
Install Command: pnpm install
```

### 1.3 Set Environment Variables

Add these environment variables in Vercel dashboard:

```bash
# Frontend Environment Variables
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_API_BASE_URL=https://your-api.vercel.app
```

### 1.4 Deploy

Click "Deploy" to deploy your frontend.

## Step 2: Set Up Database

### Option A: Vercel Postgres (Recommended)

1. In your Vercel project, go to "Storage" tab
2. Click "Create Database"
3. Choose "Postgres"
4. Select region and plan
5. Create database

### Option B: External PostgreSQL

Use any external PostgreSQL provider like:
- Railway
- Render
- DigitalOcean
- AWS RDS
- Supabase

### Configure Database

1. Get your database connection string
2. Add to environment variables:
```bash
DATABASE_URL=postgresql://username:password@host:port/database
```

## Step 3: Deploy Backend API as Vercel Functions

### 3.1 Update API Structure

The backend has been restructured to work with Vercel functions:

```
api/
├── index.ts              # Main serverless function
├── package.json          # API dependencies
└── tsconfig.json         # TypeScript configuration
```

### 3.2 Create API Project in Vercel

1. Go to Vercel Dashboard
2. Create new project from same repository
3. Configure as "Other" (not Next.js)
4. Root directory: `/api`

### 3.3 Configure API Settings

```bash
# Build Settings
Build Command: npm install
Output Directory: .
Install Command: npm install
```

### 3.4 Set API Environment Variables

```bash
# API Environment Variables
DATABASE_URL=your_postgres_connection_string
VANNA_API_BASE_URL=https://your-ai-service-url.com
VANNA_API_KEY=your_vanna_api_key
```

### 3.5 Deploy API

Click "Deploy" to deploy your API functions.

## Step 4: Deploy AI Service

Since Vercel doesn't support Python serverless functions well, we have several options:

### Option A: Railway (Recommended)

1. Create account at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Deploy the `services/vanna` directory
4. Set environment variables:
```bash
DATABASE_URL=your_postgres_connection_string
GROQ_API_KEY=your_groq_api_key
VANNA_API_KEY=your_vanna_api_key
PORT=8000
```

### Option B: Render

1. Create account at [render.com](https://render.com)
2. Create new "Web Service"
3. Connect GitHub repository
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Option C: DigitalOcean App Platform

1. Create account at [digitalocean.com](https://digitalocean.com)
2. Create new App
3. Connect GitHub repository
4. Set build and run commands

## Step 5: Configure Cross-Origin Communication

### Update CORS Settings

In your AI service, ensure CORS allows your Vercel domains:

```python
# main.py in AI service
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app.vercel.app",
        "https://your-api.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Update API Client

Ensure your frontend API client uses the correct URLs:

```typescript
// apps/web/src/lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
```

## Step 6: Database Migration and Seeding

### 6.1 Run Migrations

1. Locally, with your production DATABASE_URL:
```bash
cd apps/api
DATABASE_URL=your_production_db_url pnpm prisma db push
```

### 6.2 Seed Production Database

```bash
DATABASE_URL=your_production_db_url pnpm seed:dev
```

### 6.3 Alternative: Use Vercel CLI

```bash
# Set production database URL
vercel env add DATABASE_URL

# Run migrations
vercel env pull .env.production
pnpm prisma db push
```

## Step 7: Test Your Deployment

### 7.1 Check Frontend

Visit `https://your-app.vercel.app` and verify:
- Dashboard loads
- Charts display data
- No console errors

### 7.2 Check API

Test API endpoints:
```bash
curl https://your-api.vercel.app/health
curl https://your-api.vercel.app/stats
```

### 7.3 Check AI Service

Test AI service:
```bash
curl https://your-ai-service-url.com/health
```

### 7.4 Test Full Integration

Try the chat feature in your deployed app to ensure all services communicate properly.

## Environment Variables Summary

### Frontend (Vercel)
```bash
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_API_BASE_URL=https://your-api.vercel.app
```

### Backend API (Vercel Functions)
```bash
DATABASE_URL=your_postgres_connection_string
VANNA_API_BASE_URL=https://your-ai-service-url.com
VANNA_API_KEY=your_vanna_api_key
```

### AI Service (Railway/Render)
```bash
DATABASE_URL=your_postgres_connection_string
GROQ_API_KEY=your_groq_api_key
VANNA_API_KEY=your_vanna_api_key
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-api.vercel.app
PORT=8000
```

## Custom Domain Setup (Optional)

### 1. Configure Domain in Vercel

1. Go to project settings
2. Click "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

### 2. Update Environment Variables

Update all environment variables to use your custom domain:
```bash
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

## Monitoring and Logs

### Vercel Monitoring

1. Go to your Vercel project
2. Click "Functions" tab
3. View logs and performance metrics
4. Set up alerts for errors

### Database Monitoring

If using Vercel Postgres:
1. Go to "Storage" tab
2. Click on your database
3. View connection metrics and query logs

### AI Service Monitoring

Check your hosting provider's dashboard for:
- CPU/memory usage
- Request logs
- Error rates

## Troubleshooting Common Issues

### Issue: API Functions Time Out

**Solution**: 
- Optimize database queries
- Increase function timeout in vercel.json
- Consider edge functions for faster responses

### Issue: Database Connection Failed

**Solution**:
- Verify DATABASE_URL is correct
- Check if IP is whitelisted (for external databases)
- Ensure SSL is properly configured

### Issue: CORS Errors

**Solution**:
- Update CORS settings in AI service
- Ensure all domains are included in ALLOWED_ORIGINS
- Check that API calls use HTTPS in production

### Issue: Chat Not Working

**Solution**:
- Verify VANNA_API_BASE_URL is accessible
- Check API key configuration
- Review AI service logs for errors

## Performance Optimization

### 1. Enable Edge Functions

For frequently accessed endpoints:
```json
// vercel.json
{
  "functions": {
    "api/health.ts": {
      "runtime": "edge"
    }
  }
}
```

### 2. Database Optimization

- Add proper indexes
- Use connection pooling
- Enable query caching

### 3. CDN and Caching

- Vercel automatically provides CDN
- Set appropriate cache headers
- Consider Redis for session storage

## Scaling Considerations

### Horizontal Scaling

- Vercel automatically scales functions
- Use load balancer for AI service
- Consider read replicas for database

### Vertical Scaling

- Monitor resource usage
- Upgrade database plan as needed
- Optimize queries for better performance

## Security Best Practices

### 1. Environment Variables

- Never commit secrets to Git
- Use Vercel's encrypted environment variables
- Rotate API keys regularly

### 2. Database Security

- Use SSL connections
- Implement proper access controls
- Regular security updates

### 3. API Security

- Implement rate limiting
- Validate all inputs
- Use HTTPS everywhere

## Backup and Recovery

### Database Backups

If using Vercel Postgres:
- Automatic daily backups
- Point-in-time recovery
- Export functionality

For external databases:
- Configure automated backups
- Test restore procedures
- Document recovery process

## Cost Optimization

### Vercel Costs

- Monitor usage in dashboard
- Optimize function execution time
- Use edge functions when possible

### Database Costs

- Choose appropriate plan
- Optimize query performance
- Archive old data

### AI Service Costs

- Monitor API usage
- Implement caching
- Consider serverless options

## Conclusion

Your Flowbit Analytics Dashboard is now running on Vercel! You have:

✅ Frontend deployed to Vercel CDN
✅ Backend API as serverless functions
✅ Database on Vercel Postgres or external provider
✅ AI service on Railway/Render
✅ Custom domain configured (optional)
✅ Monitoring and logging set up

For ongoing maintenance:
- Monitor performance and costs
- Keep dependencies updated
- Regular security reviews
- Backup your data regularly

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review this troubleshooting guide
3. Consult Vercel documentation
4. Contact support if needed

Happy deploying! 🚀
