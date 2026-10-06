-- Instructional clips used by the practice-test intro screens.
-- Public read so the player can use a normal video URL.
-- Uploads go through the service role in scripts/upload-instructional-videos.mjs.
-- The speaking clip is about 84 MB, so the bucket limit is 100 MB.
-- Raise the project upload limit in the Supabase dashboard if an upload is rejected.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'instructional-videos',
  'instructional-videos',
  true,
  104857600,
  array['video/mp4']
)
on conflict (id) do update
set
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = array['video/mp4'];

drop policy if exists "instructional_videos_public_read" on storage.objects;
create policy "instructional_videos_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'instructional-videos');
