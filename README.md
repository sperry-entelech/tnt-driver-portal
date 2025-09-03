# TNT Driver Portal

## ✅ Modern Cloud-Native Architecture

**This portal exemplifies Entelech's new cloud-native approach - built with modern managed services for optimal cost-effectiveness and reliability.**

A modern, mobile-first driver portal for TNT Limousine Service built with Next.js, TypeScript, and Supabase.

## Features

- **Secure Authentication** - Driver login with email/password
- **Real-time Trip Assignments** - Instant notifications for new trips
- **Trip Management** - View daily schedule, accept/decline assignments
- **Status Updates** - Update trip status (en route, passenger onboard, completed)
- **Mobile Optimized** - Large touch targets, responsive design
- **Real-time Sync** - Live updates across all connected devices

## Tech Stack

**Modern cloud-native architecture delivering 60-80% cost savings vs traditional infrastructure:**

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Radix UI  
- **Backend**: Supabase (managed PostgreSQL + Auth + Real-time)
- **Deployment**: Vercel (serverless, auto-scaling)
- **Integration**: N8N Cloud workflows for business automation

**Monthly Cost**: ~$45 (Supabase Pro $25 + Vercel Pro $20) vs $200-500 traditional cloud infrastructure

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/sperry-entelech/tnt-driver-portal.git
   cd tnt-driver-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Fill in your Supabase credentials
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## Database Setup

1. Create a new Supabase project
2. Run the SQL commands from `supabase-schema.sql`
3. Create driver accounts in Supabase Auth
4. Insert driver profiles in the `drivers` table

## Deployment

See `PRODUCTION-CHECKLIST.md` for detailed deployment instructions.

### Vercel Deployment

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Project Structure

```
├── app/                    # Next.js app directory
├── components/            # React components
│   └── tnt-driver-portal.tsx  # Main portal component
├── hooks/                # Custom React hooks
│   ├── useAuth.ts        # Authentication hook
│   └── useTrips.ts       # Trip management hook
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication service
│   ├── database.ts       # Database service
│   └── supabase.ts       # Supabase client
├── public/               # Static assets
└── styles/               # CSS files
```

## Key Components

### Authentication (`lib/auth.ts`)
- Sign in/out functionality
- Driver profile management  
- Password reset

### Database Service (`lib/database.ts`)
- Trip queries and updates
- Real-time subscriptions
- Vehicle and driver data

### Trip Management (`hooks/useTrips.ts`)
- Today's trips
- Assignment notifications
- Status updates

## Database Schema

- **drivers** - Driver profiles and contact info
- **trips** - Trip details and assignments
- **vehicles** - Fleet vehicle information  
- **driver_shifts** - Shift scheduling

## Security

- Row Level Security (RLS) enabled
- Drivers can only see their own data
- Secure authentication with Supabase Auth
- API keys properly scoped

## Mobile Features

- Touch-friendly interface
- Large buttons and text
- Optimized for portrait mode
- Works offline with cached data

## Real-time Features

- Instant trip assignment notifications
- Live trip status updates
- Automatic data synchronization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For technical issues:
- Check `PRODUCTION-CHECKLIST.md` for troubleshooting
- Review Supabase dashboard for errors
- Check Vercel logs for deployment issues

## License

Private project for TNT Limousine Service.