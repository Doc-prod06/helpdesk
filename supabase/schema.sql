-- Helpdesk database schema for Supabase.
-- Run this whole file once in the Supabase dashboard: SQL Editor > New query > paste > Run.
--
-- Security model:
--   * The public (anon key) can NOT read or write the tables directly.
--   * Customers go through three functions: submit_ticket, get_ticket, add_customer_reply.
--     Looking up a ticket requires its reference number plus the submitter's email,
--     except for tickets filed without an email (e.g. toner orders), which need only the number.
--   * Staff sign in with Supabase Auth; anyone listed in public.staff gets full access.

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists public.staff (
  user_id      uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Support',
  created_at   timestamptz not null default now()
);

create table if not exists public.tickets (
  id               bigint generated always as identity primary key,
  ref              text not null unique,
  name             text not null check (char_length(name) between 1 and 120),
  email            text check (char_length(email) between 3 and 254),  -- null for quick forms
  phone            text check (char_length(phone) <= 40),
  category         text not null check (char_length(category) <= 60),
  priority         text not null default 'normal'
                   check (priority in ('low', 'normal', 'high', 'urgent')),
  subject          text not null check (char_length(subject) between 1 and 200),
  description      text not null check (char_length(description) between 1 and 10000),
  reference_number text check (char_length(reference_number) <= 100),
  status           text not null default 'open'
                   check (status in ('open', 'in_progress', 'waiting_on_customer', 'resolved', 'closed')),
  assigned_to      uuid references public.staff (user_id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Projects created before email became optional.
alter table public.tickets alter column email drop not null;

create index if not exists tickets_status_idx on public.tickets (status);
create index if not exists tickets_email_idx on public.tickets (lower(email));

create table if not exists public.ticket_messages (
  id          bigint generated always as identity primary key,
  ticket_id   bigint not null references public.tickets (id) on delete cascade,
  author_type text not null check (author_type in ('customer', 'staff')),
  author_name text,
  body        text not null check (char_length(body) between 1 and 10000),
  is_internal boolean not null default false,  -- internal notes are never shown to customers
  created_at  timestamptz not null default now()
);

create index if not exists ticket_messages_ticket_idx on public.ticket_messages (ticket_id);

-- Keep tickets.updated_at current.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists tickets_touch on public.tickets;
create trigger tickets_touch before update on public.tickets
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security: staff only
-- ---------------------------------------------------------------------------

alter table public.staff           enable row level security;
alter table public.tickets         enable row level security;
alter table public.ticket_messages enable row level security;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;

drop policy if exists staff_read_staff on public.staff;
create policy staff_read_staff on public.staff
  for select to authenticated using (public.is_staff());

drop policy if exists staff_all_tickets on public.tickets;
create policy staff_all_tickets on public.tickets
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

drop policy if exists staff_all_messages on public.ticket_messages;
create policy staff_all_messages on public.ticket_messages
  for all to authenticated using (public.is_staff()) with check (public.is_staff());

revoke all on public.staff, public.tickets, public.ticket_messages from anon;

-- ---------------------------------------------------------------------------
-- Customer-facing functions (callable with the public anon key)
-- ---------------------------------------------------------------------------

create or replace function public.submit_ticket(
  p_name text,
  p_email text,
  p_phone text,
  p_category text,
  p_priority text,
  p_subject text,
  p_description text,
  p_reference_number text default null
) returns text
language plpgsql security definer set search_path = public as $$
declare
  v_ref   text;
  v_email text := nullif(lower(trim(coalesce(p_email, ''))), '');
begin
  if v_email is not null and v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Please enter a valid email address.';
  end if;

  -- Basic abuse protection: at most 5 tickets per email per hour,
  -- and at most 60 tickets per hour across everyone who leaves email blank.
  if v_email is not null and (select count(*) from public.tickets
      where lower(email) = v_email and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many tickets submitted recently. Please try again later.';
  end if;
  if v_email is null and (select count(*) from public.tickets
      where email is null and created_at > now() - interval '1 hour') >= 60 then
    raise exception 'Too many requests right now. Please try again later.';
  end if;

  loop
    v_ref := 'HD-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (select 1 from public.tickets where ref = v_ref);
  end loop;

  insert into public.tickets (ref, name, email, phone, category, priority, subject, description, reference_number)
  values (
    v_ref,
    trim(p_name),
    v_email,
    nullif(trim(coalesce(p_phone, '')), ''),
    p_category,
    case when p_priority in ('low', 'normal', 'high', 'urgent') then p_priority else 'normal' end,
    trim(p_subject),
    trim(p_description),
    nullif(trim(coalesce(p_reference_number, '')), '')
  );

  return v_ref;
end $$;

create or replace function public.get_ticket(p_ref text, p_email text)
returns json
language sql stable security definer set search_path = public as $$
  select json_build_object(
    'ref', t.ref,
    'name', t.name,
    'category', t.category,
    'priority', t.priority,
    'subject', t.subject,
    'description', t.description,
    'reference_number', t.reference_number,
    'status', t.status,
    'created_at', t.created_at,
    'updated_at', t.updated_at,
    'messages', coalesce((
      select json_agg(json_build_object(
               'author_type', m.author_type,
               'author_name', m.author_name,
               'body', m.body,
               'created_at', m.created_at) order by m.created_at)
      from public.ticket_messages m
      where m.ticket_id = t.id and not m.is_internal
    ), '[]'::json)
  )
  from public.tickets t
  where t.ref = upper(trim(p_ref))
    and (t.email is null or lower(t.email) = lower(trim(coalesce(p_email, ''))));
$$;

create or replace function public.add_customer_reply(p_ref text, p_email text, p_body text)
returns void
language plpgsql security definer set search_path = public as $$
declare
  t public.tickets;
begin
  select * into t from public.tickets
  where ref = upper(trim(p_ref))
    and (email is null or lower(email) = lower(trim(coalesce(p_email, ''))));

  if t.id is null then
    raise exception 'Ticket not found.';
  end if;
  if t.status = 'closed' then
    raise exception 'This ticket is closed. Please open a new ticket.';
  end if;
  if (select count(*) from public.ticket_messages
      where ticket_id = t.id and author_type = 'customer'
        and created_at > now() - interval '1 hour') >= 20 then
    raise exception 'Too many replies recently. Please try again later.';
  end if;

  insert into public.ticket_messages (ticket_id, author_type, author_name, body)
  values (t.id, 'customer', t.name, trim(p_body));

  -- A customer reply puts the ticket back in the queue.
  update public.tickets
     set status = case when status in ('waiting_on_customer', 'resolved') then 'open' else status end
   where id = t.id;
end $$;

revoke execute on function public.submit_ticket(text, text, text, text, text, text, text, text) from public;
revoke execute on function public.get_ticket(text, text) from public;
revoke execute on function public.add_customer_reply(text, text, text) from public;

grant execute on function public.submit_ticket(text, text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.get_ticket(text, text) to anon, authenticated;
grant execute on function public.add_customer_reply(text, text, text) to anon, authenticated;
grant execute on function public.is_staff() to authenticated;
