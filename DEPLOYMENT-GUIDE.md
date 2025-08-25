# TNT Driver Portal - Production Deployment Guide

## Prerequisites
1. Supabase account (free tier is fine for testing)
2. Vercel account (free tier is fine)
3. Your TNT driver data ready for import

## Step 1: Set up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be created (takes ~2 minutes)
3. Go to the SQL Editor in your Supabase dashboard
4. Copy and paste the contents of `supabase-schema.sql` into the editor
5. Click "Run" to create all tables and sample data

## Step 2: Get Supabase Credentials

1. In your Supabase project, go to Settings > API
2. Copy the following values:
   - Project URL
   - Anon (public) key
   - Service role key (keep this secret!)

## Step 3: Set up Local Environment

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

## Step 4: Import Driver Data

Option A: Manual Import (Recommended)
1. Go to Supabase Dashboard > Table Editor > drivers
2. Click "Insert" and add each driver manually
3. Use the format: name, email, phone, employee_id, license_number, hire_date

Option B: CSV Import
1. Prepare your driver list as CSV with columns: name, email, phone, employee_id, license_number, hire_date
2. Use Supabase's CSV import feature

## Step 5: Test Locally

1. Run `npm install` to install dependencies
2. Run `npm run dev` to start the development server
3. Test login and basic functionality
4. Make sure drivers can only see their own data

## Step 6: Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your GitHub repository
3. Add environment variables in Vercel:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
4. Deploy the project

## Step 7: Set up Custom Domain (Optional)

1. In Vercel, go to your project settings
2. Add custom domain: `drivers.tntlimousine.com`
3. Configure DNS records as instructed by Vercel
4. SSL will be automatically configured

## Step 8: Create Driver Accounts

Since you're creating accounts for drivers:

1. Go to Supabase > Authentication > Users
2. For each driver, click "Add User"
3. Use their email and create a temporary password
4. Send login credentials to each driver
5. Instruct them to change password on first login

## Step 9: Final Testing

1. Test with real driver accounts
2. Verify trip assignments work
3. Check that each driver only sees their data
4. Test on mobile devices

## Security Checklist

- ✅ Row Level Security enabled on all tables
- ✅ Drivers can only access their own data
- ✅ Environment variables properly configured
- ✅ HTTPS enabled (automatic with Vercel)
- ✅ Database connection encrypted

## Support

If you encounter issues:
1. Check Supabase logs for database errors
2. Check Vercel deployment logs
3. Verify environment variables are correct
4. Test database policies in Supabase SQL editor

## Next Steps

- Add driver photo uploads
- Implement push notifications for trip updates
- Add trip history and reporting
- Set up automated backups