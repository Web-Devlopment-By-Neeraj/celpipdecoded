# Backups and restore

Supabase Pro keeps daily backups and point-in-time recovery. Retention for this project is the setting `backup.retention_days`, starting at 35 days, which matches the privacy-policy placeholder.

Audio past the retention window is not part of the long-term object copy. The `attempt-audio` bucket stays private.

## Restore drill

1. In the Supabase dashboard, restore a backup into a separate project. Do not restore over production.
2. Compare `select count(*)` for `users`, `purchases`, `entitlements`, and `submissions` with the production counts from the same moment.
3. Open one sample row in each table and one signed audio URL.
4. Record the date, how long the restore took, and who watched it.
5. Repeat every quarter.

This drill has to be run once in the owner's Supabase project before launch. The repo cannot perform that console step.

## Alerts

Watch webhook failures, dead-letter jobs, and spikes of HTTP 429. Scrub email addresses out of error reports.
