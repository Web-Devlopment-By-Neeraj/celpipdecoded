# LANDING-02 - Canva Inspired One Page Redesign

## Goal

Redesign the current Georgo Academy CELPIP Speaking Practice landing page to visually imitate the Canva reference design in `_reference/canva-design`.

The page should become a polished one-page landing experience. It should feel premium, editorial, modern, and memorable, while still keeping the early access form and Supabase submission working.

Do not build the full app yet. This ticket is only for the public landing page.

## References

Use the Canva design screenshots in:

_reference/canva-design/

Use the Canva design as visual inspiration only. Do not embed Canva. Do not paste Canva HTML. Do not use iframe embeds. Recreate the design using clean Next.js, React, and Tailwind CSS.

Use the generated Canadian city image as a real website asset. Copy or rename it to:

public/canada-city-hero.jpg

Use the Georgo logo from the public folder. If needed, copy or rename it to:

public/georgo-logo.png

## Brand

Parent brand:
Georgo Academy

Product:
CELPIP Speaking Practice

Positioning:
A realistic CELPIP speaking preparation experience for test-takers who want to practice with confidence before test day.

## Design direction

Imitate the structure and feel of the Canva reference:

- Large visual hero section
- Strong editorial typography
- Big section headings
- Alternating light and dark sections
- Warm premium accent blocks
- Image-led storytelling
- Short punchy copy
- Form section integrated into the page
- One page only
- Fancy but still clean
- Responsive for mobile

The design should feel more like a premium launch page than a basic SaaS page.

## Page structure

Use this one-page structure:

1. Hero

Use the Canadian city image as the hero background or split hero visual.

Include:
- Georgo logo
- Small label: CELPIP Speaking Practice
- Main headline:
  Walk into CELPIP speaking with more confidence.

- Subheadline:
  Answer a few quick questions and get early access to a timed CELPIP speaking practice experience with AI feedback.

- CTA button:
  Start the quick form

- Small pricing note:
  3 free practice attempts planned. Then expected pricing: $5 for 10 attempts or $20/month unlimited.

2. Story section

Inspired by the "My story" section from the Canva design.

Heading:
Why this practice tool exists

Body copy:
CELPIP speaking can feel stressful because you have limited time, unfamiliar prompts, and pressure to organize your answer quickly. This early access page helps us understand what test-takers actually need before the full practice app is released.

Short quote style line:
Practice the format. Build confidence. Know what to improve.

3. Experience section

Inspired by the dark "What I can do for you" section.

Heading:
What the practice experience will include

Use 3 feature rows:
- Timed CELPIP-style prompts
  Practice with the pressure and flow of the real speaking section.

- AI feedback after each answer
  See what may be affecting clarity, structure, vocabulary, and task response.

- Simple improvement guidance
  Get practical next steps before your next attempt.

4. Pricing and early access section

Use a warm accent background or card section inspired by the Canva orange section.

Heading:
Early access plan

Cards:
- 3 free practice attempts planned
- $5 for 10 attempts expected
- $20/month unlimited expected

Supporting text:
Early users may receive founding-user access while the practice experience is being tested.

5. Form section

Inspired by the final contact section in the Canva design.

Use the city image, a dark overlay, or a split background.

Heading:
Tell us your CELPIP speaking goal

Subtext:
Your answers will help shape the first version of the practice tool.

Keep the existing fields and Supabase submission:

- full_name
- email
- preparing_status
- test_date
- current_practice_method
- hardest_part
- willingness_to_pay
- notes

Friendly labels:
Your name
Email address
Are you preparing for CELPIP now?
When is your test?
How are you practicing speaking right now?
What feels hardest in CELPIP speaking?
Would you pay around $20/month for realistic CELPIP speaking practice with feedback?
Anything else you want to share?

Options for preparing_status:
- Yes, I am preparing now
- I plan to prepare soon
- I am only exploring
- Not sure yet

Options for current_practice_method:
- Tutor or class
- YouTube
- Apps
- Friends or family
- I do not practice speaking yet
- Other

Options for willingness_to_pay:
- Yes
- Maybe
- No

Success message:
Thank you. You are on the early access list.

6. Footer

Footer text:
Georgo Academy CELPIP Speaking Practice is a practice tool only. It is not affiliated with CELPIP and does not provide official CELPIP scores.

## Technical requirements

- Keep the existing `/api/early-access` route working
- Keep the existing Supabase insert working
- Keep zod validation
- Use local images from public
- Use next/image where appropriate
- Add metadata title and description
- Add favicon or app icon using the Georgo logo if possible
- Keep the page fully responsive
- Use Tailwind CSS
- No official CELPIP logos
- No fake testimonials
- No login
- No dashboard
- No payment
- No recording
- No transcription
- No AI scoring
- No practice screens

## Visual requirements

- The page should feel inspired by the Canva reference, not copied word for word.
- Use large typography.
- Use strong spacing.
- Use dark and light contrast.
- Use rounded form card styling.
- Use the Canadian city image as the main visual identity.
- Keep the form easy to complete.
- Make the page shorter than a full SaaS website but richer than a plain form.

## Important UI copy rule

Do not use long hyphens or em dashes anywhere in UI copy, comments, docs, or prompts. Use normal hyphens only.

## Done criteria

- Page visually resembles the Canva reference style
- Logo appears clearly
- Canadian city image appears in the design
- Form appears as part of the page experience
- Form still stores responses in Supabase
- Pricing is clearly visible
- Page is mobile responsive
- npm run lint passes
- npm run build passes
- No long hyphens or em dashes are introduced
EOF