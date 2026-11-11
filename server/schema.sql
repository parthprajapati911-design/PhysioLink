-- PhysioLink database schema. Safe to run many times (idempotent).
-- The server runs this automatically on startup.

create table if not exists users (
  id              text primary key,
  email           text not null,
  password_hash   text,
  role            text not null default 'member' check (role in ('member','admin')),
  account_type    text not null default 'clinician',
  verified_status text not null default 'pending' check (verified_status in ('verified','pending','unverified')),
  profile         jsonb not null default '{}'::jsonb,
  is_demo         boolean not null default false,
  created_at      timestamptz not null default now()
);
create unique index if not exists users_email_lower_idx on users (lower(email));
create index if not exists users_reg_idx on users ((profile->>'registrationNumber'));

create table if not exists posts (
  id               text primary key,
  author_id        text not null references users(id) on delete cascade,
  type             text not null,
  title            text not null,
  content          text not null,
  tags             jsonb not null default '[]'::jsonb,
  clinical_metrics jsonb,
  image_url        text,
  document_name    text,
  created_at       timestamptz not null default now()
);
create index if not exists posts_created_idx on posts (created_at desc);

create table if not exists post_likes (
  post_id text not null references posts(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  primary key (post_id, user_id)
);

create table if not exists post_bookmarks (
  post_id text not null references posts(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  primary key (post_id, user_id)
);

create table if not exists post_comments (
  id         text primary key,
  post_id    text not null references posts(id) on delete cascade,
  author_id  text not null references users(id) on delete cascade,
  content    text not null,
  likes      int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists post_comments_post_idx on post_comments (post_id, created_at desc);

create table if not exists connections (
  requester_id text not null references users(id) on delete cascade,
  addressee_id text not null references users(id) on delete cascade,
  status       text not null default 'pending' check (status in ('pending','accepted')),
  created_at   timestamptz not null default now(),
  primary key (requester_id, addressee_id),
  check (requester_id <> addressee_id)
);
create index if not exists connections_addressee_idx on connections (addressee_id);

create table if not exists messages (
  id              text primary key,
  sender_id       text not null references users(id) on delete cascade,
  receiver_id     text not null references users(id) on delete cascade,
  text            text not null,
  attachment_name text,
  is_read         boolean not null default false,
  created_at      timestamptz not null default now()
);
create index if not exists messages_receiver_idx on messages (receiver_id, created_at desc);
create index if not exists messages_sender_idx   on messages (sender_id, created_at desc);

create table if not exists opportunities (
  id                  text primary key,
  created_by          text references users(id) on delete set null,
  title               text not null,
  organization        text not null,
  logo                text not null default '',
  location            text not null default '',
  location_type       text not null default 'On-site Hospital',
  type                text not null default 'Full-Time Clinical',
  specialization      text not null default '',
  stipend_or_salary   text not null default '',
  experience_required text not null default '',
  description         text not null default '',
  requirements        jsonb not null default '[]'::jsonb,
  base_applicants     int not null default 0,
  created_at          timestamptz not null default now()
);

create table if not exists applications (
  opportunity_id text not null references opportunities(id) on delete cascade,
  user_id        text not null references users(id) on delete cascade,
  created_at     timestamptz not null default now(),
  primary key (opportunity_id, user_id)
);

-- Cover note + phone shared with the poster when someone applies.
alter table applications add column if not exists note  text not null default '';
alter table applications add column if not exists phone text not null default '';

create table if not exists verifications (
  id                  text primary key,
  user_id             text not null references users(id) on delete cascade,
  qualification       text not null default '',
  council_name        text not null default '',
  registration_number text not null default '',
  document_type       text not null default 'State Council Certificate',
  document_url        text not null default '',
  status              text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by         text references users(id) on delete set null,
  created_at          timestamptz not null default now()
);
create index if not exists verifications_status_idx on verifications (status, created_at desc);

-- Mobile number (only ever stored once verified) and password-change time (signs out old logins).
alter table users add column if not exists phone              text;
alter table users add column if not exists phone_verified_at  timestamptz;
alter table users add column if not exists password_changed_at timestamptz;
create unique index if not exists users_phone_key on users(phone) where phone is not null;

-- One-time codes sent by SMS (stored hashed, short-lived).
create table if not exists otp_codes (
  id         text primary key,
  phone      text not null,
  purpose    text not null,
  user_id    text references users(id) on delete cascade,
  code_hash  text not null,
  attempts   int  not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);
create index if not exists otp_codes_phone_idx on otp_codes(phone, created_at desc);

-- Lock the tables from Supabase's public REST API (anon key).
-- Only this backend (which connects directly) can read/write them.
alter table users          enable row level security;
alter table posts          enable row level security;
alter table post_likes     enable row level security;
alter table post_bookmarks enable row level security;
alter table post_comments  enable row level security;
alter table connections    enable row level security;
alter table messages       enable row level security;
alter table opportunities  enable row level security;
alter table applications   enable row level security;
alter table verifications  enable row level security;
alter table otp_codes      enable row level security;

-- ===== v2: photos stored in the database (no external storage needed) =====
create table if not exists images (
  id         text primary key,
  owner_id   text references users(id) on delete cascade,
  mime       text not null,
  data       bytea not null,
  created_at timestamptz not null default now()
);
create index if not exists images_owner_idx on images(owner_id);

-- ===== v2: notifications (bell icon) =====
create table if not exists notifications (
  id         text primary key,
  user_id    text not null references users(id) on delete cascade,
  actor_id   text references users(id) on delete cascade,
  type       text not null,
  ref        text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications(user_id, created_at desc);

alter table images        enable row level security;
alter table notifications enable row level security;

-- ===== v3: password reset links sent by email (only a hash of the link token is stored) =====
create table if not exists password_resets (
  token_hash text primary key,
  user_id    text not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  used_at    timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists password_resets_user_idx on password_resets(user_id);
alter table password_resets enable row level security;
