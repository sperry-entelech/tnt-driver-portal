@echo off
echo.
echo ====================================================
echo TNT Driver Portal - Vercel Environment Setup
echo ====================================================
echo.
echo This will help you set up environment variables in Vercel
echo.
echo Step 1: Login to Vercel
echo ----------------------
vercel login
echo.
echo Step 2: Link to your project
echo ----------------------------
vercel link
echo.
echo Step 3: Add environment variables
echo ---------------------------------
echo Adding NEXT_PUBLIC_SUPABASE_URL...
echo https://bkqffdiqbtcyzicsyiea.supabase.co | vercel env add NEXT_PUBLIC_SUPABASE_URL
echo.
echo Adding NEXT_PUBLIC_SUPABASE_ANON_KEY...
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJrcWZmZGlxYnRjeXppY3N5aWVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MjU4MzYsImV4cCI6MjA3MTIwMTgzNn0.ptKIYMkW8AlHO4TnJzrb3rrghy1e_TaI5UacU7gPw4w | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
echo.
echo Step 4: Deploy to production
echo ----------------------------
vercel --prod
echo.
echo ====================================================
echo Setup complete! Your deployment should work now.
echo ====================================================
echo.
echo Test login at: https://tnt-driver-portal.vercel.app
echo Email: ready@tntlimousine.com  
echo Password: password123
echo.
pause