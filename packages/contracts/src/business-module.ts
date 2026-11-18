// قرارداد پلاگین کسبوکار — هسته Multi-Business
export interface Listing {
  id: string;
  tenantId: string;
  businessType: string;
  attributes: Record<string, unknown>;
  basePrice: number;
}
export interface Slot { from: Date; to: Date }
export interface Hold { id: string; expiresAt: Date }
export interface QuoteContext { slot: Slot; guestId?: string; demandScore?: number }
export interface ReservationConfirmed { reservationId: string; listingId: string }
export interface ReservationCancelled { reservationId: string; reason: string }
export interface Connector { sync(): Promise<void> }

export interface BusinessModule {
  readonly type: string;        // 'stays' | 'cars' | 'tours' ...
  readonly version: string;

  availability(l: Listing, from: Date, to: Date): Promise<Slot[]>;
  hold(l: Listing, slot: Slot, ttlSec: number): Promise<Hold>;
  quote(l: Listing, ctx: QuoteContext): Promise<number>;

  onConfirmed(e: ReservationConfirmed): Promise<void>;
  onCancelled(e: ReservationCancelled): Promise<void>;

  connectors?: Connector[];
  schema: import('zod').ZodType;  // اعتبارسنجی فیلدهای اختصاصی
}

// ثبت پلاگین — بدون تغییر core
export class Registry {
  private modules = new Map<string, BusinessModule>();
  register(m: BusinessModule) { this.modules.set(m.type, m); }
  get(type: string) {
    const m = this.modules.get(type);
    if (!m) throw new Error(`Unknown business module: ${type}`);
    return m;
  }
}
