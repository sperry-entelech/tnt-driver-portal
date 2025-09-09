# Vercel Environment Variables Setup Guide

## 🚀 Quick Fix - Set Environment Variables in Vercel Dashboard

### Method 1: Via Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Find your project**: `tnt-driver-portal` (or similar)
3. **Go to Settings**: Click on your project → Settings → Environment Variables
4. **Add these variables**:

   | Variable Name | Value | Environment |
   |---------------|-------|-------------|
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://bkqffdiqbtcyzicsyiea.supabase.co` | All (Production, Preview, Development) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcWZmZGlxYnRjeXppY3N5aWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MjU4MzYsImV4cCI6MjA3MTIwMTgzNn0.ptKIYMkW8AlHO4TnJzrb3rrghy1e_TaI5UacU7gPw4w` | All (Production, Preview, Development) |

5. **Save**: Click "Save" for each variable
6. **Redeploy**: Go to Deployments → Click "..." on latest → Redeploy

### Method 2: Via Vercel CLI (Alternative)

If you prefer command line:

```bash
# 1. Login to Vercel (choose GitHub when prompted)
vercel login

# 2. Link to your project
vercel link

# 3. Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
# When prompted, enter: https://bkqffdiqbtcyzicsyiea.supabase.co
# Choose: All environments

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# When prompted, enter the anon key (see above)
# Choose: All environments

# 4. Redeploy
vercel --prod
```

## 📋 Environment Variables Needed

These are the exact values from your working local .env.local:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://bkqffdiqbtcyzicsyiea.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcWZmZGlxYnRjeXppY3N5aWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MjU4MzYsImV4cCI6MjA3MTIwMTgzNn0.ptKIYMkW8AlHO4TnJzrb3rrghy1e_TaI5UacU7gPw4w
```

## ✅ After Setting Environment Variables

1. **Wait for automatic redeploy** (usually 30-60 seconds)
2. **Test login** at: https://tnt-driver-portal.vercel.app
3. **Use credentials**:
   - Email: `ready@tntlimousine.com`
   - Password: `password123`

## 🔧 If Still Having Issues

1. **Check deployment logs** in Vercel dashboard
2. **Verify environment variables** are set correctly
3. **Force a new deployment** by making a small code change and pushing to GitHub

## 🎯 What This Fixes

- **Eliminates 404/loading errors** on Vercel
- **Enables proper Supabase connection** in production
- **Makes login functional** with the fixed headers configuration
- **Activates all enhanced UX features** (voice commands, swipe gestures, etc.)