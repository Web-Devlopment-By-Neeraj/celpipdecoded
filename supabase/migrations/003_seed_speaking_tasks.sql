-- SPEAKING-01: Seed the 8 CELPIP speaking task types.
-- Inserts one Toronto Academy practice prompt per task type under the
-- celpip-speaking module and upserts the matching timing rows in
-- speaking_task_details. Safe to run more than once.
--
-- These are original Toronto Academy practice prompts. They are not
-- official CELPIP content.

-- Reruns must update rather than duplicate, so give tasks a stable
-- natural key of (module_id, task_type).
create unique index if not exists tasks_module_id_task_type_key
  on public.tasks (module_id, task_type);

with speaking_module as (
  select id
  from public.modules
  where slug = 'celpip-speaking'
),
seed (task_type, task_number, title, prompt, prep_seconds, speaking_seconds) as (
  values
    (
      'giving_advice',
      1,
      'Giving Advice',
      'Your friend recently moved to Toronto and wants to make new friends in the city. Give your friend some advice about how to meet new people and build friendships in a new city.',
      30,
      90
    ),
    (
      'personal_experience',
      2,
      'Talking about a Personal Experience',
      'Talk about a time when you tried something new for the first time. Describe what it was, how you felt before and after, and what you learned from the experience.',
      30,
      60
    ),
    (
      'describing_scene',
      3,
      'Describing a Scene',
      'Imagine you are looking at a busy outdoor market on a Saturday morning. Describe the scene to someone who cannot see it. Talk about the people, the stalls, and what is happening around you.',
      30,
      60
    ),
    (
      'making_predictions',
      4,
      'Making Predictions',
      'A family is packing their car for a weekend camping trip while dark clouds gather in the sky. Predict what you think will happen next on their trip and explain your reasons.',
      30,
      60
    ),
    (
      'comparing_persuading',
      5,
      'Comparing and Persuading',
      'Your cousin is deciding between renting an apartment downtown or renting a house in the suburbs. Compare the two options and persuade your cousin to choose the one you think is better.',
      60,
      60
    ),
    (
      'difficult_situation',
      6,
      'Dealing with a Difficult Situation',
      'You promised to help your friend move to a new apartment on Saturday, but your manager just asked you to work an extra shift on the same day. Choose one person to speak to, either your friend or your manager, and explain the situation to them.',
      60,
      60
    ),
    (
      'expressing_opinions',
      7,
      'Expressing Opinions',
      'Some people think children should start learning a second language in elementary school. Do you agree or disagree? Give your opinion and support it with reasons and examples.',
      30,
      90
    ),
    (
      'unusual_situation',
      8,
      'Describing an Unusual Situation',
      'You ordered a winter jacket online, but the package that arrived contains a strange kitchen gadget you have never seen before. Call the company and describe the object clearly so they can identify it and correct your order.',
      30,
      60
    )
),
upserted_tasks as (
  insert into public.tasks (module_id, task_type, title, prompt, difficulty, status, sort_order)
  select m.id, s.task_type, s.title, s.prompt, 'starter', 'active', s.task_number
  from seed s
  cross join speaking_module m
  on conflict (module_id, task_type) do update
    set title = excluded.title,
        prompt = excluded.prompt,
        status = excluded.status,
        sort_order = excluded.sort_order
  returning id, task_type
)
insert into public.speaking_task_details (task_id, task_number, prep_seconds, speaking_seconds, scoring_focus)
select
  t.id,
  s.task_number,
  s.prep_seconds,
  s.speaking_seconds,
  '["Content and coherence", "Vocabulary", "Listenability", "Task fulfillment"]'::jsonb
from upserted_tasks t
join seed s on s.task_type = t.task_type
on conflict (task_id) do update
  set task_number = excluded.task_number,
      prep_seconds = excluded.prep_seconds,
      speaking_seconds = excluded.speaking_seconds,
      scoring_focus = excluded.scoring_focus;
