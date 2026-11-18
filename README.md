# کیان اقامت (Kian Otagh) — مرجع معماری و پیادهسازی

نسخه 1.0 — November 2026

## معرفی
پلتفرم رزرو اقامتگاه با سه ویژگی تعیینکننده: UX روان و مینیمال، اتوماسیون ۹۰٪، و زیرساخت Multi-Business برای ۱۰+ مدل کسبوکار.

## اصول حاکم (غیرقابل مذاکره)
- P1: دخالت انسان **فقط** در (a) تأیید پرداخت/فیش و (b) حل اختلاف.
- P2: هر ورودی کاربر یا مدل AI قبل از اثرگذاری اعتبارسنجی و امتیاز اطمینان میگیرد.
- P3: Event-First — تمام تغییرات وضعیت در Event Bus منتشر میشود.
- P4: Plugin Boundary — هیچ کد مخصوص «اقامت» در core نفوذ نکند.
- P5: Idempotency by Default.
- P6: Explainable AI — هر پیشنهاد دارای reason و model_version است.

## ساختار مخزن
```
kian-otagh/
├─ apps/web, apps/mobile, apps/admin
├─ services/core-api (NestJS), services/ai-service (FastAPI)
├─ services/worker, services/notification
├─ packages/contracts, ui, sdk, shared
├─ db/migrations
├─ infra
└─ docs
```

## نقشه مستندات
- `docs/ARCHITECTURE.md` — مرجع کامل ۰ تا ۱۰۰ (همه فازها)
- `db/migrations/0001_init.sql` — اسکریپت اولیه دیتابیس
- `packages/contracts/src/business-module.ts` — قرارداد پلاگین کسبوکار
- `packages/contracts/src/reservation.state.ts` — State Machine رزرو
- `services/ai-service/app/main.py` — Endpointهای AI
- `services/ai-service/app/core/gateway.py` — Model Gateway
- `infra/docker-compose.yml` — محیط لوکال

## شروع سریع
```bash
cd kian-otagh
cp .env.example .env
docker compose -f infra/docker-compose.yml up -d
psql "$DATABASE_URL" -f db/migrations/0001_init.sql
```
