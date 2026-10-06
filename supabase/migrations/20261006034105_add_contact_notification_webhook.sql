create extension if not exists pg_net with schema extensions;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create function private.notify_portfolio_contact()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare webhook_secret text;
begin
  select decrypted_secret into webhook_secret
    from vault.decrypted_secrets where name = 'portfolio_contact_webhook_secret';
  if webhook_secret is null then
    raise warning 'Portfolio webhook secret is not configured';
    return new;
  end if;
  perform net.http_post(
    url := 'https://chfwwlkdkzwvqtajsmby.supabase.co/functions/v1/notify-contact',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-webhook-secret', webhook_secret),
    body := jsonb_build_object('type', 'INSERT', 'schema', 'public', 'table', 'contact_messages', 'record', to_jsonb(new)),
    timeout_milliseconds := 15000
  );
  return new;
exception when others then
  raise warning 'Portfolio email notification could not be queued';
  return new;
end;
$$;
revoke all on function private.notify_portfolio_contact() from public, anon, authenticated;
create trigger notify_portfolio_contact after insert on public.contact_messages
for each row execute function private.notify_portfolio_contact();
