#!/bin/bash

# Vercel Deployment Script for Flowbit Analytics Dashboard

echo "🚀 Starting Vercel deployment process..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Please install it with:"
    echo "npm i -g vercel"
    exit 1
fi

# Check if user is logged in to Vercel
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "❌ Not logged in to Vercel. Please run: vercel login"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Build the project
echo "🔨 Building the project..."
cd apps/web
pnpm build
cd ../..

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo ""
echo "📝 Next steps:"
echo "1. Set up your database on Vercel Postgres or external provider"
echo "2. Configure environment variables in Vercel dashboard"
echo "3. Deploy the Vanna AI service separately (see AI_DEPLOYMENT.md)"
echo "4. Update environment variables with your service URLs"
echo ""
echo "🔗 Your app will be available at: https://your-app.vercel.app"
