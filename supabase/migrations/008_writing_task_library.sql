-- WRITING-01: Writing module and task library
-- Toronto Academy of Education CELPIP Writing Practice
-- Safe to run more than once.
--
-- This migration:
-- 1. Repairs an older attempt_scores policy without table aliases
-- 2. Creates writing_task_details
-- 3. Activates the CELPIP Writing module
-- 4. Allows multiple prompts per writing task type using sort_order
-- 5. Seeds 10 original Toronto Academy of Education practice prompts

-- =========================================================
-- 1. Repair older attempt_scores policy if present
-- =========================================================

drop policy if exists "attempt_scores_select_own"
on public.attempt_scores;

create policy "attempt_scores_select_own"
on public.attempt_scores
for select
to authenticated
using (
  exists (
    select 1
    from public.attempts
    where public.attempts.id = public.attempt_scores.attempt_id
      and public.attempts.user_id = auth.uid()
  )
);

-- =========================================================
-- 2. Activate writing module
-- =========================================================

update public.modules
set status = 'active'
where slug = 'celpip-writing';

do $$
begin
  if not exists (
    select 1
    from public.modules
    where slug = 'celpip-writing'
  ) then
    raise exception 'Module celpip-writing does not exist in public.modules';
  end if;
end $$;

-- =========================================================
-- 3. Create writing_task_details table
-- =========================================================

create table if not exists public.writing_task_details (
  task_id uuid primary key references public.tasks (id) on delete cascade,
  task_number integer not null,
  time_seconds integer not null,
  word_min integer,
  word_max integer,
  evaluation_focus jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.writing_task_details enable row level security;

drop policy if exists "writing_task_details_select_active"
on public.writing_task_details;

create policy "writing_task_details_select_active"
on public.writing_task_details
for select
to authenticated
using (
  exists (
    select 1
    from public.tasks
    where public.tasks.id = public.writing_task_details.task_id
      and public.tasks.status = 'active'
  )
);

-- =========================================================
-- 4. Update task natural key for multiple prompts
-- =========================================================

alter table public.tasks
drop constraint if exists tasks_module_id_task_type_key;

alter table public.tasks
drop constraint if exists tasks_module_id_task_type_unique;

drop index if exists tasks_module_id_task_type_key;
drop index if exists tasks_module_id_task_type_unique;

create unique index if not exists tasks_module_type_sort_key
on public.tasks (module_id, task_type, sort_order);

-- =========================================================
-- 5. Seed writing tasks
-- =========================================================

with seed (
  task_type,
  task_number,
  sort_order,
  title,
  prompt,
  time_seconds,
  word_min,
  word_max
) as (
  values
    (
      'writing_email',
      1,
      1,
      'Email About a Repair in Your Apartment',
      'The heating system in your apartment stopped working three days ago, and the weather is getting colder. Write an email to your building manager. In your email, describe the problem, explain how it is affecting your daily life, and ask when the repair will be done.',
      1620,
      150,
      200
    ),
    (
      'writing_email',
      1,
      2,
      'Email to a Community Centre About Swimming Lessons',
      'You want to register your child for swimming lessons at your local community centre, but the website does not show the schedule for the next session. Write an email to the program coordinator. In your email, introduce yourself, ask about class times and fees, and request information about how to register.',
      1620,
      150,
      200
    ),
    (
      'writing_email',
      1,
      3,
      'Email to Your Manager About a Schedule Change',
      'You have enrolled in an evening college course that starts next month, and two of your weekly work shifts conflict with the class time. Write an email to your manager. In your email, explain your situation, suggest a possible change to your schedule, and describe how you will make sure your work is still completed.',
      1620,
      150,
      200
    ),
    (
      'writing_email',
      1,
      4,
      'Email About a Damaged Furniture Delivery',
      'You ordered a bookshelf from an online furniture store, but it arrived with a cracked shelf and a missing part. Write an email to the customer service team. In your email, describe the damage, explain what you expected when you placed the order, and state clearly what you would like the company to do.',
      1620,
      150,
      200
    ),
    (
      'writing_email',
      1,
      5,
      'Email Inviting Neighbours to a Street Cleanup',
      'You are organizing a volunteer cleanup day for your street next month, and you want your neighbours to join. Write an email to your neighbourhood association. In your email, describe your plan for the cleanup day, explain why you think it will help the community, and ask the association to share the invitation with other residents.',
      1620,
      150,
      200
    ),
    (
      'writing_survey_response',
      2,
      6,
      'Survey: Improving the Local Park',
      'Your city is planning to upgrade a large park in your neighbourhood and is asking residents for their opinion. Option A: build new sports facilities, including a basketball court and a soccer field. Option B: create a quiet garden area with walking paths and more trees. Choose the option you prefer and explain your reasons.',
      1560,
      150,
      200
    ),
    (
      'writing_survey_response',
      2,
      7,
      'Survey: Working from Home or the Office',
      'Your company is reviewing its work policy and is asking employees for feedback. Option A: allow employees to work from home three days per week. Option B: have all employees work in the office full time with a shorter Friday. Choose the option you prefer and explain your reasons.',
      1560,
      150,
      200
    ),
    (
      'writing_survey_response',
      2,
      8,
      'Survey: Spending the Library Budget',
      'Your public library has received extra funding for next year and is asking members how it should be used. Option A: extend evening and weekend opening hours. Option B: buy more computers and offer free technology classes. Choose the option you prefer and explain your reasons.',
      1560,
      150,
      200
    ),
    (
      'writing_survey_response',
      2,
      9,
      'Survey: A New Shared Space in Your Building',
      'The management of your apartment building plans to turn an empty room on the ground floor into a shared space for residents. Option A: a small fitness room with basic exercise equipment. Option B: a playroom where children can play safely indoors. Choose the option you prefer and explain your reasons.',
      1560,
      150,
      200
    ),
    (
      'writing_survey_response',
      2,
      10,
      'Survey: Improving Transportation in Your City',
      'Your city wants to make it easier for people to get around and is collecting opinions from residents. Option A: add more protected bike lanes on major streets. Option B: increase the number of buses during morning and evening rush hours. Choose the option you prefer and explain your reasons.',
      1560,
      150,
      200
    )
)
insert into public.tasks (
  module_id,
  task_type,
  title,
  prompt,
  difficulty,
  status,
  sort_order
)
select
  public.modules.id,
  seed.task_type,
  seed.title,
  seed.prompt,
  'starter',
  'active',
  seed.sort_order
from seed
join public.modules
  on public.modules.slug = 'celpip-writing'
on conflict (module_id, task_type, sort_order)
do update set
  title = excluded.title,
  prompt = excluded.prompt,
  difficulty = excluded.difficulty,
  status = excluded.status,
  sort_order = excluded.sort_order;

-- =========================================================
-- 6. Seed writing task details
-- =========================================================
-- The seed CTE is repeated because a CTE only exists for one SQL statement.

with seed (
  task_type,
  task_number,
  sort_order,
  time_seconds,
  word_min,
  word_max
) as (
  values
    ('writing_email', 1, 1, 1620, 150, 200),
    ('writing_email', 1, 2, 1620, 150, 200),
    ('writing_email', 1, 3, 1620, 150, 200),
    ('writing_email', 1, 4, 1620, 150, 200),
    ('writing_email', 1, 5, 1620, 150, 200),
    ('writing_survey_response', 2, 6, 1560, 150, 200),
    ('writing_survey_response', 2, 7, 1560, 150, 200),
    ('writing_survey_response', 2, 8, 1560, 150, 200),
    ('writing_survey_response', 2, 9, 1560, 150, 200),
    ('writing_survey_response', 2, 10, 1560, 150, 200)
)
insert into public.writing_task_details (
  task_id,
  task_number,
  time_seconds,
  word_min,
  word_max,
  evaluation_focus
)
select
  public.tasks.id,
  seed.task_number,
  seed.time_seconds,
  seed.word_min,
  seed.word_max,
  jsonb_build_array(
    'Task fulfillment',
    'Organization and coherence',
    'Vocabulary',
    'Grammar and sentence control',
    'Tone and clarity'
  )
from seed
join public.modules
  on public.modules.slug = 'celpip-writing'
join public.tasks
  on public.tasks.module_id = public.modules.id
 and public.tasks.task_type = seed.task_type
 and public.tasks.sort_order = seed.sort_order
on conflict (task_id)
do update set
  task_number = excluded.task_number,
  time_seconds = excluded.time_seconds,
  word_min = excluded.word_min,
  word_max = excluded.word_max,
  evaluation_focus = excluded.evaluation_focus;

-- =========================================================
-- 7. Verification
-- =========================================================

select slug, status
from public.modules
where slug = 'celpip-writing';

select task_type, count(*) as task_count
from public.tasks
where module_id = (
  select id
  from public.modules
  where slug = 'celpip-writing'
)
group by task_type
order by task_type;

select
  public.tasks.task_type,
  public.tasks.title,
  public.tasks.sort_order,
  public.writing_task_details.time_seconds,
  public.writing_task_details.word_min,
  public.writing_task_details.word_max
from public.tasks
join public.writing_task_details
  on public.writing_task_details.task_id = public.tasks.id
where public.tasks.module_id = (
  select id
  from public.modules
  where slug = 'celpip-writing'
)
order by public.tasks.sort_order;