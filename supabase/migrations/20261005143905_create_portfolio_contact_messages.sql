create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 100),
  email text not null check (char_length(email) between 3 and 255 and email ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$'),
  message text not null check (char_length(btrim(message)) between 10 and 2000),
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from public, anon, authenticated;
grant insert (name, email, message) on public.contact_messages to anon, authenticated;
grant all on public.contact_messages to service_role;
create policy "Visitors can submit contact messages"
on public.contact_messages for insert to anon, authenticated
with check (
  char_length(btrim(name)) between 1 and 100
  and char_length(email) between 3 and 255
  and char_length(btrim(message)) between 10 and 2000
);
create index contact_messages_created_at_idx on public.contact_messages (created_at desc);
