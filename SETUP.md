# DIGNEA Setup Guide

**Welcome!** This guide will help you complete the setup of your DIGNEA platform using Makerkit Pro as the foundation.

---

## 📋 What's Been Done So Far

✅ **Repository Cloned**: Makerkit Pro has been cloned to the `dignea` directory
✅ **Dependencies Installed**: All 1478 packages installed with pnpm
✅ **Database Schema Created**: Migration file ready at `apps/web/supabase/migrations/20260114184000_dignea_schema.sql`
✅ **AI Package Created**: `packages/ai/` with Claude API integration structure
✅ **SMS Package Created**: `packages/sms/` with Twilio integration structure
✅ **Environment Template**: `.env.dignea.example` with all required variables

---

## 🚀 Next Steps (In Order)

### Step 1: Set Up Environment Variables

1. **Copy the environment template:**
   ```bash
   cd dignea
   cp .env.dignea.example .env.local
   ```

2. **Get API Keys** (see `.env.dignea.example` for instructions on each):
   - ✅ **Anthropic API Key** (for Claude AI)
   - ✅ **Twilio Credentials** (Account SID, Auth Token, Phone Number)
   - ✅ **Supabase Credentials** (URL, Anon Key, Service Role Key)
   - ⚠️ **Optional but recommended:**
     - Resend API Key (emails)
     - PostHog Key (analytics)
     - Sentry DSN (error monitoring)
     - Stripe Keys (already in Makerkit)

3. **Fill in `.env.local`** with your actual values

### Step 2: Initialize Supabase Locally

1. **Start Supabase** (requires Docker):
   ```bash
   pnpm supabase:web:start
   ```

   This will:
   - Start a local Supabase instance
   - Output your local Supabase URL and keys
   - Create a local PostgreSQL database

2. **Apply DIGNEA migrations**:
   ```bash
   pnpm --filter web supabase migrations up
   ```

3. **Generate TypeScript types**:
   ```bash
   pnpm supabase:web:typegen
   ```

### Step 3: Install New Package Dependencies

Since we added new packages (`@kit/ai` and `@kit/sms`), install their dependencies:

```bash
pnpm install
```

This will install:
- `@anthropic-ai/sdk` (for AI package)
- `twilio` (for SMS package)

### Step 4: Verify the Setup

1. **Run TypeScript check**:
   ```bash
   pnpm typecheck
   ```

2. **Start the development server**:
   ```bash
   pnpm dev
   ```

3. **Access the application**:
   - Main app: http://localhost:3000
   - Supabase Studio: http://localhost:54323

### Step 5: Explore the Database

1. **Open Supabase Studio**: http://localhost:54323

2. **Verify tables were created**:
   - `rpas` - Retirement residence profiles
   - `availability` - Availability tracking
   - `rpa_profiles` - User-to-RPA associations
   - `healthcare_profiles` - Healthcare worker profiles
   - `requests` - Patient search requests
   - `contacts` - Communications
   - `sms_logs` - SMS tracking

3. **Check RLS policies** are enabled on all tables

### Step 6: Add Sample Data (Optional)

To test the system, you can add sample data:

```sql
-- Insert a sample RPA
INSERT INTO public.rpas (
  k10_id, name, city, region, category,
  total_units, pricing_min, pricing_max,
  services, is_active
) VALUES (
  'K10-12345', 'Résidence Bel-Âge', 'Gatineau', 'Outaouais', 2,
  25, 2000, 3500,
  '{"nursing": true, "medication_management": true}'::jsonb,
  true
);

-- Insert sample availability
INSERT INTO public.availability (
  rpa_id, units_available, source, reported_at
) VALUES (
  (SELECT id FROM public.rpas WHERE k10_id = 'K10-12345'),
  3, 'web', NOW()
);
```

---

## 📁 Project Structure Overview

```
dignea/
├── apps/
│   ├── web/                          # Main Next.js application
│   │   ├── app/
│   │   │   ├── (marketing)/          # Public portal (existing from Makerkit)
│   │   │   ├── home/                 # User dashboard (existing)
│   │   │   ├── admin/                # Admin panel (existing)
│   │   │   ├── rpa/                  # 🆕 RPA Portal (TO BE CREATED)
│   │   │   ├── pro/                  # 🆕 Healthcare Portal (TO BE CREATED)
│   │   │   └── api/                  # API routes
│   │   └── supabase/
│   │       └── migrations/
│   │           └── 20260114184000_dignea_schema.sql  # ✅ Created
│   └── e2e/                          # Playwright tests
├── packages/
│   ├── ai/                           # ✅ DIGNEA AI package (Claude integration)
│   ├── sms/                          # ✅ DIGNEA SMS package (Twilio integration)
│   ├── supabase/                     # Existing Supabase package
│   ├── ui/                           # Existing UI components (shadcn/ui)
│   └── ...                           # Other Makerkit packages
└── .env.local                        # ⚠️ TO BE CREATED from .env.dignea.example
```

---

## 🎯 Implementation Roadmap

Based on the approved plan, here's what needs to be built:

### Phase 1: Setup & Foundation (Week 1-2) ✅ DONE
- [x] Clone Makerkit Pro
- [x] Install dependencies
- [x] Create database schema
- [x] Create AI and SMS packages
- [x] Document environment setup

### Phase 2: RPA Portal (Week 3-4) - NEXT
**Goal**: Enable RPA managers to onboard and manage availability

**Files to create:**
- `apps/web/app/rpa/layout.tsx` - RPA-specific layout
- `apps/web/app/rpa/dashboard/page.tsx` - Dashboard with availability widget
- `apps/web/app/rpa/onboarding/page.tsx` - Conversational onboarding
- `apps/web/app/rpa/availability/page.tsx` - Update availability
- `apps/web/app/rpa/inquiries/page.tsx` - View inquiries
- `apps/web/components/portals/rpa/*` - RPA-specific components
- `apps/web/app/api/webhooks/twilio/route.ts` - SMS webhook handler
- `apps/web/app/api/cron/daily-availability-reminder/route.ts` - Daily SMS cron

**Implementation of packages:**
- Complete `packages/sms/src/sms-service.ts`
- Integrate Twilio for daily reminders

### Phase 3: Search Engine & AI (Week 5-7)
**Goal**: Build conversational search with Claude API

**Files to create:**
- Complete `packages/ai/src/nlu-engine.ts` - Entity extraction
- Complete `packages/ai/src/matching-engine.ts` - RPA matching
- `apps/web/app/pro/layout.tsx` - Healthcare portal layout
- `apps/web/app/pro/search/page.tsx` - Conversational search
- `apps/web/app/api/chat/route.ts` - Streaming Claude API

### Phase 4: Public Portal (Week 8-9)
**Goal**: Family-facing search and contact system

**Files to create:**
- Modify `apps/web/app/(marketing)/page.tsx` - Add conversational search
- `apps/web/app/(marketing)/residence/[slug]/page.tsx` - RPA listing pages
- `apps/web/components/portals/public/*` - Public-facing components

### Phase 5: Urgent Mode (Week 10-11)
**Goal**: 48-hour urgent broadcast system

**Files to create:**
- `apps/web/app/pro/urgent/page.tsx` - Urgent mode interface
- `apps/web/app/api/inngest/urgent-broadcast.ts` - Background job

### Phase 6: Testing & Polish (Week 12)
**Goal**: E2E tests, performance, mobile optimization

---

## 🔑 Key Commands Reference

### Development
```bash
pnpm dev                          # Start all apps
pnpm dev --filter web             # Start only web app
```

### Database
```bash
pnpm supabase:web:start           # Start Supabase locally
pnpm supabase:web:reset           # Reset database (clean rebuild)
pnpm --filter web supabase migrations up     # Apply migrations
pnpm supabase:web:typegen         # Generate TypeScript types
pnpm --filter web supabase:db:diff           # Create new migration
```

### Code Quality
```bash
pnpm typecheck                    # Check TypeScript errors
pnpm lint                         # Run ESLint
pnpm lint:fix                     # Fix ESLint errors
pnpm format                       # Check Prettier formatting
pnpm format:fix                   # Fix Prettier formatting
```

### Testing
```bash
pnpm test                         # Run all tests
pnpm test:e2e                     # Run Playwright E2E tests
```

---

## 📚 Important Documentation Links

- **Makerkit Docs**: https://makerkit.dev/docs/next-supabase-turbo/introduction
- **Next.js 15 Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Claude API Docs**: https://docs.anthropic.com/
- **Twilio SMS Docs**: https://www.twilio.com/docs/sms
- **shadcn/ui Components**: https://ui.shadcn.com/

---

## 🆘 Troubleshooting

### Issue: Supabase won't start
**Solution**: Make sure Docker is running. On Windows, start Docker Desktop.

### Issue: TypeScript errors after adding packages
**Solution**: Run `pnpm install` again and restart your IDE/editor.

### Issue: Migration fails
**Solution**:
1. Check Supabase is running: `pnpm supabase:web:start`
2. Reset database: `pnpm supabase:web:reset`
3. Re-apply migrations: `pnpm --filter web supabase migrations up`

### Issue: Environment variables not working
**Solution**:
1. Verify `.env.local` exists (not `.env.dignea.example`)
2. Restart the dev server after changing env vars
3. Check for typos in variable names

### Issue: Port already in use (3000 or 54323)
**Solution**:
```bash
# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use a different port
PORT=3001 pnpm dev
```

---

## 📞 Support & Resources

**Need help?**
- Check [Makerkit documentation](https://makerkit.dev/docs)
- Review the implementation plan: `C:\Users\GabrielBoutin\.claude\plans\elegant-frolicking-hanrahan.md`
- Consult DIGNEA PRD: `docs/dignea-prd-mvp.md`

**Pro Tips:**
1. Use Makerkit's existing patterns (loaders, server actions, RLS)
2. Follow the file organization from `CLAUDE.md`
3. Leverage Makerkit's shadcn/ui components in `packages/ui`
4. Test on mobile early (RPA dashboard is mobile-first!)

---

## ✅ Verification Checklist

Before moving to Phase 2 (RPA Portal), verify:

- [ ] `.env.local` created and filled with API keys
- [ ] Supabase started successfully
- [ ] Migrations applied (7 new tables visible in Supabase Studio)
- [ ] TypeScript types generated
- [ ] `pnpm typecheck` passes without errors
- [ ] Dev server starts at http://localhost:3000
- [ ] Anthropic API key tested (can make a simple API call)
- [ ] Twilio credentials tested (can send a test SMS)

---

## 🎉 You're Ready!

Once you've completed Steps 1-6 and verified everything works, you're ready to start building the RPA Portal (Phase 2).

The foundation is solid:
- ✅ Database schema with RLS policies
- ✅ AI package structure ready for Claude integration
- ✅ SMS package structure ready for Twilio
- ✅ Multi-tenant architecture from Makerkit
- ✅ Authentication, billing, and admin panel included

**Next task**: Build the RPA onboarding and dashboard!

---

*Last updated: 2026-01-14*
*DIGNEA - Connecting patients to available retirement spaces in Quebec*
