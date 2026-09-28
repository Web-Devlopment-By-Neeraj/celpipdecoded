# Platform schema

The diagram matches `supabase/migrations/015_platform_schema.sql`. Mock content remains on the existing `mock_tests` builder tables.

```mermaid
erDiagram
  users ||--o{ entitlements : has
  purchases ||--o{ entitlements : grants
  products ||--o{ purchases : prices
  users ||--o{ submissions : writes
  submissions ||--o| evaluations : receives
  evaluations ||--|{ criterion_scores : splits
  users ||--o{ prescriptions : receives
  mini_courses ||--o{ prescriptions : teaches
  mini_courses ||--o{ mini_events : reports
  batches ||--|{ batch_seats : holds
  users ||--o{ user_roles : has
```

Money is integer cents. Currency defaults to CAD.

Coach reads of `notes.body` and `users.whatsapp_e164` go through `redactStudentRecord` in `src/features/platform/roles.ts`. The database stores the fields. The query layer removes them unless the permission is on.
