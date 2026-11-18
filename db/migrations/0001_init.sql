-- کیان اقامت — Migration اولیه
CREATE SCHEMA identity; CREATE SCHEMA catalog; CREATE SCHEMA commerce;
CREATE SCHEMA automation; CREATE SCHEMA ai; CREATE SCHEMA ops;
CREATE SCHEMA analytics; CREATE SCHEMA stays;

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- کاربران
CREATE TABLE identity.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_e164 text UNIQUE NOT NULL,
  email citext UNIQUE,
  role text NOT NULL DEFAULT 'guest',
  kyc_status text NOT NULL DEFAULT 'pending',
  pii_encrypted bytea,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);
CREATE TABLE identity.sessions (
  id uuid PRIMARY KEY, user_id uuid REFERENCES identity.users(id),
  refresh_hash text NOT NULL, expires_at timestamptz NOT NULL
);

-- رجیستری کسبوکار
CREATE TABLE catalog.business_modules (
  type text PRIMARY KEY, version text NOT NULL,
  enabled boolean DEFAULT true, config jsonb DEFAULT '{}'
);

-- لیستینگ عمومی (هسته multi-business)
CREATE TABLE catalog.listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  host_id uuid NOT NULL REFERENCES identity.users(id),
  business_type text NOT NULL REFERENCES catalog.business_modules(type),
  status text NOT NULL DEFAULT 'draft',
  title text, slug text UNIQUE,
  attributes jsonb NOT NULL DEFAULT '{}',
  base_price numeric(12,2) NOT NULL,
  currency char(3) NOT NULL DEFAULT 'IRR',
  geo geography(Point,4326),
  embedding vector(1024),
  ai_confidence numeric(4,3),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX listings_geo_gix ON catalog.listings USING gist(geo);
CREATE INDEX listings_attr_gin ON catalog.listings USING gin(attributes jsonb_path_ops);
CREATE INDEX listings_emb_hnsw ON catalog.listings USING hnsw(embedding vector_cosine_ops);
CREATE INDEX listings_published_idx ON catalog.listings(business_type,status) WHERE status='published';

-- تقویم — جلوگیری از double booking
CREATE TABLE catalog.availability (
  id bigserial PRIMARY KEY,
  listing_id uuid REFERENCES catalog.listings(id) ON DELETE CASCADE,
  slot tstzrange NOT NULL,
  hold_id uuid, status text NOT NULL DEFAULT 'free',
  EXCLUDE USING gist (listing_id WITH =, slot WITH &&)
);

-- رزرو
CREATE TABLE commerce.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text UNIQUE NOT NULL,
  guest_id uuid REFERENCES identity.users(id),
  listing_id uuid REFERENCES catalog.listings(id),
  status text NOT NULL DEFAULT 'initiated',
  slot tstzrange NOT NULL,
  quote jsonb NOT NULL,
  total numeric(12,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);
CREATE INDEX res_guest_idx ON commerce.reservations(guest_id, created_at DESC);
CREATE INDEX res_active_idx ON commerce.reservations(listing_id) WHERE status IN ('held','confirmed');

-- پرداخت
CREATE TABLE commerce.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES commerce.reservations(id),
  gateway text NOT NULL, gateway_ref text UNIQUE,
  amount numeric(12,2) NOT NULL, status text NOT NULL,
  receipt_url text, verification text NOT NULL DEFAULT 'auto',
  verified_by uuid REFERENCES identity.users(id),
  created_at timestamptz DEFAULT now()
);

-- دو نقطه انسانی
CREATE TABLE ops.review_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL, ref_id uuid NOT NULL,
  ai_summary jsonb NOT NULL, ai_confidence numeric(4,3),
  status text NOT NULL DEFAULT 'open',
  sla_due_at timestamptz NOT NULL,
  assignee uuid REFERENCES identity.users(id),
  decision jsonb, created_at timestamptz DEFAULT now()
);
CREATE INDEX review_open_idx ON ops.review_tasks(kind,status,sla_due_at);

CREATE TABLE ops.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id uuid REFERENCES commerce.reservations(id),
  opened_by uuid REFERENCES identity.users(id),
  reason text, ai_suggestion jsonb, status text DEFAULT 'open',
  resolution jsonb, resolved_by uuid REFERENCES identity.users(id)
);

-- لاگ AI
CREATE TABLE ai.model_calls (
  id bigserial PRIMARY KEY,
  kind text NOT NULL, model text NOT NULL, model_version text NOT NULL,
  input_hash text, output jsonb, confidence numeric(4,3),
  latency_ms int, tokens_in int, tokens_out int, cost_usd numeric(10,6),
  entity_type text, entity_id uuid, created_at timestamptz DEFAULT now()
);
CREATE INDEX ai_calls_entity ON ai.model_calls(entity_type, entity_id, created_at DESC);

CREATE TABLE ai.pricing_runs (
  id bigserial PRIMARY KEY, listing_id uuid,
  features jsonb NOT NULL, suggested numeric(12,2),
  floor numeric(12,2), ceiling numeric(12,2),
  reason text, confidence numeric(4,3), applied boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE ai.document_verifications (
  id bigserial PRIMARY KEY, host_id uuid,
  doc_type text, extracted jsonb, confidence numeric(4,3),
  checks jsonb, decision text, retries int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Outbox
CREATE TABLE analytics.outbox_events (
  id bigserial PRIMARY KEY,
  aggregate text, aggregate_id uuid, event_type text,
  payload jsonb NOT NULL, published_at timestamptz,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX outbox_unpublished ON analytics.outbox_events(published_at) WHERE published_at IS NULL;

-- RLS
ALTER TABLE catalog.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON catalog.listings
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
