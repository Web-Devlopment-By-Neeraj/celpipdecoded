# LANDING-01 - CELPIP Early Access Landing Page

## Goal

Build the first public landing page for Georgo Academy CELPIP Speaking Practice.

This page is for validation before the full app is built. It should explain the product clearly, make it look credible, and collect early access responses from people preparing for CELPIP.

Do not build the full app yet. Do not build login, dashboard, recording, transcription, scoring, payment, or practice screens in this ticket.

## Brand direction

Parent brand: Georgo Academy  
Product name: CELPIP Speaking Practice  
Positioning: Practice CELPIP speaking like the real test, with timed tasks and AI feedback.

The landing page should feel clean, modern, trustworthy, and test-prep focused. It should not feel like a generic AI tool.

Use a professional education style:
- Light background
- Dark navy or charcoal text
- Blue accent
- Clean cards
- Strong hero section
- Smooth section flow
- Mobile responsive
- No long hyphens or em dashes in UI copy

## Page route

Use the homepage route:

src/app/page.tsx

## Required sections

1. Hero section

Headline:
Walk into your CELPIP speaking test knowing exactly what to expect.

Subheadline:
Practice CELPIP-style speaking tasks on a timer, get instant AI feedback, and see what is costing you points before test day.

Primary CTA:
Get early access

Secondary text:
Built for CELPIP test-takers who want realistic speaking practice between classes, tutoring, or self-study.

2. Trust strip

Include 3 short value cards:
- Real test-style practice
- Timed speaking tasks
- AI feedback after each answer

3. Problem section

Explain:
- Speaking is one of the most stressful CELPIP sections.
- Tutors can be expensive.
- Generic speaking apps do not feel like the real CELPIP test.

4. Solution section

Explain:
- Same task-style flow
- Timer-based practice
- Record your answer
- Get AI feedback on what to improve

5. How it works

Use 3 steps:
1. Pick a speaking task
2. Record your answer on a timer
3. Get feedback and improve your next attempt

6. Feature preview section

Show cards for:
- CELPIP speaking task library
- Realistic timer flow
- Audio recording
- AI scoring estimate
- Feedback by skill area
- Attempt history later

Mention that this is an early access preview and the full practice app is coming soon.

7. Pricing preview

Use this pricing copy:
- 3 free attempts to test it
- Then planned pricing: $5 for 10 attempts or $20/month unlimited
- Early users may receive founding-user access

Do not connect Stripe or payment yet.

8. Early access form

The form must collect:
- full_name
- email
- preparing_status
- test_date
- current_practice_method
- hardest_part
- willingness_to_pay
- notes

Use these labels:
- Your name
- Email address
- Are you currently preparing for CELPIP?
- When is your test?
- How do you currently practice speaking?
- What is the hardest part of CELPIP speaking for you?
- Would you pay around $20/month for realistic speaking practice with AI feedback?
- Anything else you want to share?

For willingness_to_pay, use options:
- Yes
- Maybe
- No

After submit, show a success message:
Thank you. You are on the early access list.

9. Footer

Footer text:
Georgo Academy CELPIP Speaking Practice
Practice tool only. Not affiliated with CELPIP and not an official score provider.

## API route

Create:

src/app/api/early-access/route.ts

The route should:
- Accept POST requests
- Validate the form with zod
- Insert the response into Supabase table public.early_access_leads
- Return clear JSON success or error
- Never expose the Supabase service role key to the browser

## Supabase helper

Create:

src/lib/supabase/admin.ts

Use:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

Do not use NEXT_PUBLIC for the service role key.

## Environment file

Create:

.env.example

With:

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000

## UX requirements

- Fully responsive
- Good desktop and mobile layout
- Smooth anchor scroll from CTA to form
- Loading state on submit
- Error state on submit failure
- Success state after submit
- Do not use fake testimonials
- Do not use official CELPIP logos
- Do not claim official CELPIP scoring
- Add disclaimer in footer

## Technical requirements

- Use Next.js App Router
- Use TypeScript
- Use Tailwind CSS
- Use zod for validation
- Use @supabase/supabase-js for database insert
- Keep components clean and simple
- Create reusable landing components if helpful
- No authentication in this ticket
- No payment in this ticket

## Suggested files

src/app/page.tsx
src/app/api/early-access/route.ts
src/lib/supabase/admin.ts
src/components/landing/HeroSection.tsx
src/components/landing/TrustStrip.tsx
src/components/landing/ProblemSection.tsx
src/components/landing/SolutionSection.tsx
src/components/landing/HowItWorksSection.tsx
src/components/landing/FeaturePreviewSection.tsx
src/components/landing/PricingPreviewSection.tsx
src/components/landing/EarlyAccessForm.tsx
src/components/landing/Footer.tsx

## Done criteria

- Homepage loads at /
- Landing page looks polished
- Early access form submits successfully
- Lead appears in Supabase table
- npm run lint passes
- npm run build passes
- No app features beyond the landing page are built
EOF