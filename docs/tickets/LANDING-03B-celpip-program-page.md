# LANDING-03B - Full CELPIP Program Landing Page Redesign

## Goal

Redesign only the public landing page so it presents the full Toronto Academy of Education CELPIP Preparation Program.

LANDING-03A already cleaned up the main branding across the app. Do not repeat that work.

This ticket is only for the homepage and landing page components.

## Do not touch

Do not modify:

- dashboard logic
- auth logic
- speaking practice logic
- recording flow
- transcription flow
- AI feedback flow
- result pages
- usage limits
- payment
- Supabase schema

Do not rename app-wide branding again unless the homepage specifically needs it.

## Main brand

Use the full name consistently:

Toronto Academy of Education

Program name:

CELPIP Preparation Program

AI feature name:

AI-supported speaking practice

Georgo should only appear subtly as:

Powered by Georgo Analytics and Automation

## Assets

Use images from public:

- taelogo.jpg
- favicon.png
- georgo.png if available
- img1.jpg
- img2.jpg
- img3.jpg
- img4.jpg
- onlineclass.jpg

Use next/image.

Do not stretch images.

For logos:
- object-contain
- natural aspect ratio
- do not force oversized display

For student and classroom photos:
- object-cover inside photo cards
- rounded corners
- soft shadows
- responsive layout

Do not use Cloudinary in this ticket.

## Landing page sections

Update the homepage route:

src/app/page.tsx

The page should include:

1. Header

- Toronto Academy of Education logo
- Navigation links:
  - Program
  - AI Practice
  - Live Classes
  - Pricing
  - Get Started
  - Sign in
- Mobile responsive layout

2. Hero section

Headline:

Prepare for CELPIP with Toronto Academy of Education.

Subheadline:

Build confidence with live classes, guided practice, and AI-supported speaking feedback designed for CELPIP test-takers.

Primary CTA:

Get CELPIP program information

Secondary CTA:

Try AI speaking practice

Use college/student photos in a smooth collage or floating image layout.

3. What is included section

Cards:

- AI-supported speaking practice
- Live CELPIP classes
- Timed practice experience
- Feedback and progress
- Practice badges
- Pathway support

4. Live classes section

Use:

public/onlineclass.jpg

Content:

Live CELPIP classes are available through Toronto Academy of Education for students who want structured support alongside the AI speaking practice tool.

Include:

- Weekday classes
- Tuesday and Thursday options
- Weekend classes
- Morning and evening availability
- $299 per month

CTA:

Request class schedule

5. AI speaking practice section

Position the web app as part of the full program.

Mention:

- timed prompts
- in-browser recording
- transcript reference
- skill-based feedback
- estimated practice level
- not an official CELPIP score

CTA:

Start speaking practice

Link to:

/signup

6. College moments section

Use:

- img1.jpg
- img2.jpg
- img3.jpg
- img4.jpg

Design:

- smooth collage
- floating photo cards
- rounded corners
- soft shadows
- college community feel
- mobile responsive

Do not identify people by name.

Do not claim the people shown are CELPIP students unless confirmed.

7. Program options section

Cards:

AI Speaking Practice Preview:
- 1 free scored speaking attempt planned
- Practice report after submission
- Upgrade options coming soon

Live CELPIP Classes:
- $299/month
- Weekday and weekend options
- Morning and evening availability
- Schedule confirmation required

AI Practice Packages:
- Starter Pack: $5 for 5 scored attempts
- Practice Pack: $10 for 12 scored attempts
- Monthly Practice Plan: $20/month for up to 40 scored attempts

Use premium wording. Do not make the pricing feel cheap.

8. Inquiry form section

Keep the existing form submission working.

Do not change the API route.

Use heading:

Get CELPIP program information

Subtext:

Share your CELPIP goal and our team will use your answers to guide the next step.

Keep the existing fields and database mapping unless changing labels only.

Success message:

Thank you. Your information has been received.

9. Footer

Include:

Toronto Academy of Education

Toronto Academy CELPIP Preparation Program

Practice estimates and AI feedback are for preparation only and are not official CELPIP scores.

Powered by Georgo Analytics and Automation

## Copy rules

Do not say:

- official CELPIP score
- guaranteed result
- pass CELPIP fast
- unlimited free scoring
- official CELPIP program

Use:

- CELPIP preparation
- AI-supported practice feedback
- estimated practice level
- practice report
- live class options

## Photo consent note

Create or update:

docs/product/photo-consent-note.md

Add:

Before publishing student photos publicly, Toronto Academy of Education should confirm that photo and video consent is on file for all identifiable individuals.

Do not display this warning on the public landing page.

## Required updates

Update only landing-related files, such as:

- src/app/page.tsx
- src/components/landing/*

Create new landing components if useful:

- LandingHeader.tsx
- ProgramHeroSection.tsx
- IncludedSection.tsx
- LiveClassesSection.tsx
- AiPracticeSection.tsx
- CollegeMomentsSection.tsx
- ProgramOptionsSection.tsx
- LandingFooter.tsx

## Manual Supabase steps

No Supabase changes.

Do not create migrations.

## Security requirements

- Do not expose service role key in client components
- Do not expose OpenAI keys in client components
- Keep .env.local ignored
- Do not print real environment values

## Mobile UX requirements

- Header must be mobile responsive
- Photo collage must stack cleanly
- No horizontal overflow
- CTAs must be easy to tap
- Inquiry form must remain easy to complete
- Logos and photos must not be stretched

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, comments, docs, or prompts. Use normal hyphens only.

## Done criteria

- Homepage promotes full CELPIP Preparation Program
- Toronto Academy of Education full name is used consistently
- Live classes section shows $299/month
- Weekday, Tuesday and Thursday, weekend, morning, and evening options are shown
- AI speaking practice is shown as one part of the program
- College photos are used smoothly
- onlineclass image is used in the live classes section
- Inquiry form still submits
- Georgo appears only as powered-by
- No dashboard or speaking logic is changed
- Mobile layout works
- npm run lint passes
- npm run build passes
- No secrets are committed
